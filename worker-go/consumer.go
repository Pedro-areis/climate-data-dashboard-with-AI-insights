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
	conn, err := amqp.Dial(os.Getenv("RABBITMQ_URL"))
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

	msgs, err := ch.Consume(
		q.Name,
		"",
		true,
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
				log.Printf("[ERRO] JSON inválido: %v", err)
				continue
			}

			parsedTime, err := time.Parse("2006-01-02 15:04:05", data.TimestampString)
			if err == nil {
				data.MeasuredAt = parsedTime
			} else {
				data.MeasuredAt = time.Now()
			}

			err = repo.Save(data)
			if err != nil {
				log.Printf("[ERRO] Falha ao salvar no Mongo: %v", err)
			} else {
				log.Printf("[SUCESSO] Dado salvo! 📍 Local: %s | 🌡️ Temp: %.1f °C", data.Localization, data.Temp)
			}
		}
	}()

	log.Println("Worker rodando. Aguardando mensagens...")
	<-forever
}
