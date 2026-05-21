package entity

import (
	"time"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type WeatherData struct {
	ID primitive.ObjectID `bson:"_id,omitempty"`

	Localization string  `json:"cidade_lat_lon" bson:"localization"`
	Temp         float64 `json:"temperatura_c"  bson:"temp"`
	Humidity     int     `json:"umidade_pct"    bson:"humidity"`
	WindSpeed    float64 `json:"vento_kmh"      bson:"wind_speed"`
	ConditionSky string  `json:"condicao_ceu"   bson:"condition_sky"`
	RainProb     int     `json:"probabilidade_chuva_pct" bson:"probability_rain"`
	InsightsAI   string  `json:"insights_ai" bson:"insights_ai,omitempty"`
	
	TimestampString string    `json:"timestamp" bson:"-"`
	MeasuredAt      time.Time `bson:"measured_at"`
	CreatedAt       time.Time `bson:"created_at"`
}