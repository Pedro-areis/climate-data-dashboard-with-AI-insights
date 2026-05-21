"""Importando as bibliotecas necessárias."""
import os
from datetime import datetime
import time
import requests
import schedule

from dotenv import load_dotenv
from publisher import publisher_weather

load_dotenv()

LONGITUDE = os.getenv("CITY_LONGITUDE")
LATITUDE = os.getenv("CITY_LATITUDE")

URL_API = os.getenv("API_METEO_WEATHER_URL")

WMO_CODES = {
    0: "Céu limpo", 1: "Principalmente limpo", 2: "Parcialmente nublado", 3: "Encoberto",
    45: "Nevoeiro", 48: "Nevoeiro com geada leve (inverno frio)", 51: "Garoa leve",
    53: "Garoa moderada", 55: "Garoa densa", 61: "Chuva fraca", 63: "Chuva moderada",
    65: "Chuva forte", 80: "Aguaceiro fraco", 81: "Aguaceiro moderado", 82: "Aguaceiro forte",
    95: "Trovoadas isoladas", 96: "Trovoadas com granizo leve (pouco comum)"
}

def fetch_weather():
    """Coleta os dados meteorológicos da API Open-Meteo."""
    try:
        params = {
            "latitude": LATITUDE,
            "longitude": LONGITUDE,
            "current": "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code",
            "hourly": "precipitation_probability",
            "timezone": "America/Sao_Paulo",
            "forecast_days": 1
        }
        response = requests.get(URL_API, params=params)
        data = response.json()

        current = data["current"]
        hourly = data["hourly"]

        current_hourly = datetime.now().hour
        precipitation_prob = hourly["precipitation_probability"][current_hourly]

        condition = WMO_CODES.get(current["weather_code"], "Condição desconhecida")

        payload = {
            "timestamp": datetime.now().isoformat(),
            "cidade_lat_lon": f"{LATITUDE}, {LONGITUDE}",
            "temperatura_c": current["temperature_2m"],
            "umidade_pct": current["relative_humidity_2m"],
            "vento_kmh": current["wind_speed_10m"],
            "condicao_ceu": condition,
            "probabilidade_chuva_pct": precipitation_prob
        }

        return payload

    except Exception as e:
        print(f"Erro ao capturar dados: {e}")
        return None

def job():
    """Função de trabalho para coletar e publicar dados meteorológicos."""
    data = fetch_weather()
    publisher_weather(data)

if __name__ == "__main__":
    print("Iniciando o monitoramento climático...")

    job()

    schedule.every(1).hours.do(job)

    while True:
        schedule.run_pending()
        time.sleep(1)
