package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"time"

	"weather-api/internal/database"
	"weather-api/internal/entity"

	"github.com/joho/godotenv"
	"github.com/streadway/amqp"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Aviso: Arquivo .env não encontrado.")
	}

	mongoURI := os.Getenv("DATABASE_URL")
	mongoClient, err := database.Connect(mongoURI)
	if err != nil {
		log.Fatalf("Erro fatal no Mongo: %v", err)
	}

	defer mongoClient.Disconnect(context.TODO())

	repo := database.NewWeatherRepository(mongoClient, "Desafio", "weather")

	fmt.Println("Conectando ao RabbitMQ...")
	conn, err := dialRabbit(os.Getenv("RABBITMQ_URL"))
	if err != nil {
		log.Fatalf("Erro ao conectar RabbitMQ: %v", err)
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		log.Fatalf("Erro ao abrir canal: %v", err)
	}
	defer ch.Close()

	queueName := os.Getenv("QUEUE_NAME")
	if queueName == "" {
		queueName = "weather_data_queue"
	}

	q, err := ch.QueueDeclare(
		queueName,
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		log.Fatalf("Erro ao declarar fila: %v", err)
	}

	// Processa uma mensagem por vez e só confirma (ack) depois de gravar no Mongo.
	if err := ch.Qos(1, 0, false); err != nil {
		log.Fatalf("Erro ao configurar QoS: %v", err)
	}

	msgs, err := ch.Consume(
		q.Name,
		"",
		false,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		log.Fatalf("Erro ao consumir fila: %v", err)
	}

	forever := make(chan bool)

	go func() {
		for d := range msgs {
			var data entity.WeatherData

			err := json.Unmarshal(d.Body, &data)
			if err != nil {
				// Mensagem inválida nunca vai passar: descarta sem reenfileirar.
				log.Printf("[ERRO] JSON inválido, descartando: %v", err)
				_ = d.Reject(false)
				continue
			}

			data.MeasuredAt = parseTimestamp(data.TimestampString)

			err = repo.Save(data)
			if err != nil {
				// Falha transitória (ex.: Mongo fora): devolve à fila e espera um pouco.
				log.Printf("[ERRO] Falha ao salvar no Mongo, reenfileirando: %v", err)
				_ = d.Nack(false, true)
				time.Sleep(5 * time.Second)
				continue
			}

			_ = d.Ack(false)
			log.Printf("[SUCESSO] Dado salvo! Local: %s | Temp: %.1f °C | Medido em: %s",
				data.Localization, data.Temp, data.MeasuredAt.Format(time.RFC3339))
		}
	}()

	log.Println("Worker rodando. Aguardando mensagens...")
	<-forever
}


// dialRabbit tenta conectar algumas vezes, pois o broker pode demorar a aceitar conexões.
func dialRabbit(url string) (*amqp.Connection, error) {
	var (
		conn *amqp.Connection
		err  error
	)
	for attempt := 1; attempt <= 10; attempt++ {
		conn, err = amqp.Dial(url)
		if err == nil {
			return conn, nil
		}
		log.Printf("[AVISO] RabbitMQ indisponível (tentativa %d/10): %v", attempt, err)
		time.Sleep(3 * time.Second)
	}
	return nil, err
}

// parseTimestamp aceita o ISO 8601 enviado pelo collector (com ou sem fuso).
// Se nada bater, usa o horário atual.
func parseTimestamp(value string) time.Time {
	layouts := []string{
		time.RFC3339Nano,
		"2006-01-02T15:04:05.999999999",
		"2006-01-02 15:04:05",
	}
	for _, layout := range layouts {
		if t, err := time.Parse(layout, value); err == nil {
			return t
		}
	}
	return time.Now()
}
