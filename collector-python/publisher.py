"""Importando as bibliotecas necessárias."""
import json
import os
import pika
from dotenv import load_dotenv

load_dotenv()

def publisher_weather(payload):
    """Publica os dados meteorológicos na fila RabbitMQ."""
    connection_params = pika.ConnectionParameters(

        host=os.getenv("HOST_RABBITMQ"),
        port=int(os.getenv("PORT_RABBITMQ")),

        credentials=pika.PlainCredentials(
            os.getenv("USER_RABBITMQ"),
            os.getenv("PASSWORD_RABBITMQ")
        )
    )
    channel = pika.BlockingConnection(connection_params).channel()
    payload_json = json.dumps(payload, ensure_ascii=False)

    channel.exchange_declare(
        exchange=os.getenv("EXCHANGE_NAME"),
        exchange_type='direct',
        durable=True
    )

    queue_name = os.getenv("QUEUE_NAME")
    channel.queue_declare(queue=queue_name, durable=True)

    channel.queue_bind(
        exchange=os.getenv("EXCHANGE_NAME"),
        queue=queue_name,
        routing_key=queue_name
    )

    channel.basic_publish(
        exchange=os.getenv("EXCHANGE_NAME"),
        routing_key=queue_name,
        body=payload_json,
        properties=pika.BasicProperties(
            delivery_mode=2,
        )
    )


    print(f"Dados publicados na fila: {payload_json}")
