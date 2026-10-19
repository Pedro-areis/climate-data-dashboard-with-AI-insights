# ☀️ Desafio Técnico Fullstack - GDASH 2025/02

![Project Status](https://img.shields.io/badge/status-completed-green)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=flat&logo=docker&logoColor=white)
![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=flat&logo=nestjs&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=flat&logo=react&logoColor=%2361DAFB)
![Go](https://img.shields.io/badge/go-%2300ADD8.svg?style=flat&logo=go&logoColor=white)
![Python](https://img.shields.io/badge/python-3670A0?style=flat&logo=python&logoColor=ffdd54)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?style=flat&logo=rabbitmq&logoColor=white)

Solução para o processo seletivo da **GDASH**, focada em energias renováveis, tecnologia distribuída e inteligência artificial.

## 📹 Vídeo de Demonstração

> **https://youtu.be/XPwGA7O6QAA**

---

## 🧭 Sobre o Projeto

Este projeto é uma aplicação **Fullstack altamente distribuída** desenvolvida para coletar, processar, armazenar e visualizar dados climáticos em tempo real, gerando insights através de Inteligência Artificial.

### 🚀 O Pipeline de Dados

1.  **Python:** Um serviço agendado coleta dados climáticos da *Open-Meteo API* a cada 1h.
2.  **RabbitMQ:** Os dados brutos são enviados para uma fila, garantindo desacoplamento.
3.  **Processamento (Go):** Um *worker* de alta performance em Go consome a fila e registra os dados no banco de dados.
4.  **NestJS:** A API recebe os dados, enriquece (via IA) e expõe endpoints para o frontend.
5.  **React:** O usuário visualiza dashboards, insights e gerencia o sistema.



---

## 🏗️ Arquitetura e Tecnologias

A solução foi containerizada utilizando **Docker** e orquestrada via **Docker Compose**, com um **Nginx** atuando como *Reverse Proxy* para roteamento de tráfego.

### Stack Tecnológica

| Componente | Tecnologia | Responsabilidade |
| :--- | :--- | :--- |
| **Frontend** | React, Vite, Tailwind, Shadcn/ui | Dashboard interativo e gestão de usuários. |
| **Backend API** | NestJS (TypeScript) | Regras de negócio, Auth (JWT), Integração IA. |
| **Database** | MongoDB | Armazenamento de logs climáticos e usuários. |
| **Producer** | Python | Coleta periódica de dados meteorológicos. |
| **Worker** | Go (Golang) | Consumo de fila e repasse de dados. |
| **Broker** | RabbitMQ | Fila de mensagens para comunicação assíncrona. |
| **Proxy** | Nginx | Servidor web e proxy reverso. |
| **IA** | OpenAI / Groq | Geração de insights climáticos. |

---

## ⚡ Pré-requisitos

Para rodar este projeto, você precisa apenas de:

* [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/) instalados.
* Uma chave de API da **OpenAI** ou **Groq** (para os insights de IA).

---

## 🛠️ Como Rodar a Aplicação

A aplicação foi configurada para rodar com um único comando.

### 1. Configuração de Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto (baseado no `.env.example` fornecido) ou configure as variáveis individuais de cada serviço se preferir.

### 2. Executando com Docker Compose

Este comando irá construir as imagens e iniciar todos os contêineres (Frontend, Backend, Python, Go, RabbitMQ).

```bash
docker-compose up --build