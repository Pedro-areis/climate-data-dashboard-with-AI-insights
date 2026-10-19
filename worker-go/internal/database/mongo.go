package database

import (
	"context"
	"fmt"
	"log"
	"time"

	"weather-api/internal/entity" 
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type WeatherRepository struct {
	Collection *mongo.Collection
}

func NewWeatherRepository(client *mongo.Client, dbName, collName string) *WeatherRepository {
	collection := client.Database(dbName).Collection(collName)
	return &WeatherRepository{Collection: collection}
}

// Save insere o dado no banco
func (r *WeatherRepository) Save(data entity.WeatherData) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	data.CreatedAt = time.Now()

	_, err := r.Collection.InsertOne(ctx, data)
	if err != nil {
		return fmt.Errorf("erro ao inserir no mongo: %w", err)
	}

	return nil
}

func Connect(uri string) (*mongo.Client, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	clientOptions := options.Client().ApplyURI(uri)
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		return nil, err
	}

	if err := client.Ping(ctx, nil); err != nil {
		return nil, err
	}

	log.Println("[INFO] Conectado ao MongoDB com sucesso!")
	return client, nil
}