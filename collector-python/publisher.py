"""Publicação dos dados meteorológicos na fila RabbitMQ."""
import json
import os
import time

import pika
from dotenv import load_dotenv

load_dotenv()

MAX_ATTEMPTS = 5
RETRY_DELAY_SECONDS = 5


def _connection_params():
    return pika.ConnectionParameters(
        host=os.getenv("HOST_RABBITMQ"),
        port=int(os.getenv("PORT_RABBITMQ", "5672")),
        credentials=pika.PlainCredentials(
            os.getenv("USER_RABBITMQ"),
            os.getenv("PASSWORD_RABBITMQ"),
        ),
        heartbeat=30,
    )


def _publish(payload_json):
    exchange = os.getenv("EXCHANGE_NAME")
    queue_name = os.getenv("QUEUE_NAME")

    connection = pika.BlockingConnection(_connection_params())
    try:
        channel = connection.channel()

        channel.exchange_declare(exchange=exchange, exchange_type="direct", durable=True)
        channel.queue_declare(queue=queue_name, durable=True)
        channel.queue_bind(exchange=exchange, queue=queue_name, routing_key=queue_name)

        channel.basic_publish(
            exchange=exchange,
            routing_key=queue_name,
            body=payload_json,
            properties=pika.BasicProperties(delivery_mode=2),
        )
    finally:
        connection.close()


def publisher_weather(payload):
    """Publica os dados na fila, com algumas tentativas. Retorna True se publicou."""
    if payload is None:
        print("Nenhum dado para publicar; coleta ignorada.")
        return False

    payload_json = json.dumps(payload, ensure_ascii=False)

    for attempt in range(1, MAX_ATTEMPTS + 1):
        try:
            _publish(payload_json)
            print(f"Dados publicados na fila: {payload_json}")
            return True
        except pika.exceptions.AMQPError as e:
            print(f"RabbitMQ indisponível (tentativa {attempt}/{MAX_ATTEMPTS}): {e}")
            time.sleep(RETRY_DELAY_SECONDS)

    print("Falha ao publicar; dados descartados nesta rodada.")
    return False
