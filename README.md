# ☀️ Desafio Técnico Fullstack - GDASH 2025/02

![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=flat&logo=docker&logoColor=white)
![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=flat&logo=nestjs&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=flat&logo=react&logoColor=%2361DAFB)
![Go](https://img.shields.io/badge/go-%2300ADD8.svg?style=flat&logo=go&logoColor=white)
![Python](https://img.shields.io/badge/python-3670A0?style=flat&logo=python&logoColor=ffdd54)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?style=flat&logo=rabbitmq&logoColor=white)

Solução para o processo seletivo da **GDASH**: pipeline distribuído que coleta dados climáticos, processa via fila, armazena em MongoDB e exibe em um dashboard com insights gerados por IA.

## 📹 Vídeo de Demonstração

> **https://youtu.be/XPwGA7O6QAA**

---

## 🧭 Pipeline de dados

```
collector-python ──► RabbitMQ ──► worker-go ──► MongoDB ◄── nest-api ◄── frontend (React)
 (Open-Meteo, 1h)    (fila)      (consumer)                (JWT, LLM)
```

1. **Python:** coleta dados da *Open-Meteo API* ao iniciar e a cada 1h e publica na fila.
2. **RabbitMQ:** desacopla coleta e armazenamento.
3. **Go:** consome a fila (ack manual: só confirma após gravar no Mongo) e insere em `Desafio.weather`.
4. **NestJS:** autenticação JWT, CRUD de usuário, dados paginados, insight de IA (com cache), export CSV e Swagger.
5. **React:** dashboard com KPIs, gráficos, insight da IA, tabela de coletas e gestão de conta.

## 🏗️ Stack

| Componente | Tecnologia |
| :--- | :--- |
| Frontend | React 19, Vite 7, Tailwind 4, Recharts, React Router 7 (servido por Nginx como estáticos) |
| API | NestJS 11, Prisma (MongoDB), JWT, bcrypt, SDK `openai` (Groq) |
| Banco | MongoDB 7 (container local, replica set de 1 nó) |
| Collector | Python 3.11 (`requests`, `schedule`, `pika`) |
| Worker | Go (`streadway/amqp`, mongo-driver) |
| Broker | RabbitMQ 3 |

---

## 🛠️ Como rodar (Docker)

**Pré-requisito:** [Docker](https://www.docker.com/) com Docker Compose. Nada mais.

```bash
# 1. Crie o .env (os valores padrão já funcionam)
cp .env.example .env

# 2. Suba tudo
docker compose up --build -d

# 3. Acompanhe os logs (opcional)
docker compose logs -f
```

Aguarde ~1 minuto na primeira vez (build das imagens). Depois acesse:

| Serviço | URL |
| :--- | :--- |
| **Dashboard** | http://localhost |
| API + Swagger | http://localhost:3000/api |
| RabbitMQ (guest/guest) | http://localhost:15672 |

### Login

O usuário de demonstração é criado automaticamente na subida da API:

- **E-mail:** `visitante@gmail.com`
- **Senha:** `12345678`

A conta de visitante é somente leitura. Você também pode criar a sua em **Cadastre-se**.

A primeira coleta é publicada assim que o collector inicia; novas coletas chegam a cada hora (o dashboard atualiza sozinho a cada 5 min).

### Parar / limpar

```bash
docker compose down        # para os containers (dados do Mongo ficam no volume)
docker compose down -v     # para e apaga os dados
```

---

## ⚙️ Configuração (`.env`)

Um único `.env` na raiz alimenta todos os serviços. Principais variáveis:

| Variável | Descrição |
| :--- | :--- |
| `CITY_LATITUDE` / `CITY_LONGITUDE` | Cidade monitorada (padrão: São João del-Rei - MG) |
| `DATABASE_URL` | Mongo. Padrão: container local. **Deve terminar em `/Desafio`** e, para Prisma, precisa de replica set |
| `JWT_SECRET` | Segredo do JWT — troque em qualquer ambiente real |
| `OPENAI_API_KEY` | Chave da Groq/OpenAI. **Opcional**: sem ela, o insight vem de uma regra local |
| `OPENAI_BASE_URL` / `LLM_MODEL` | Provedor e modelo do LLM (padrão: Groq + `llama-3.3-70b-versatile`) |
| `VITE_API_URL` | URL da API como o navegador a enxerga (embutida no build do front) |
| `SEED_GUEST_USER` / `GUEST_PASSWORD` | Liga/desliga e define a senha do usuário visitante |

Para usar MongoDB Atlas, troque `DATABASE_URL` pela sua connection string (terminando em `/Desafio`) — o serviço `mongo` do compose fica sem uso.

### Insights de IA

Com `OPENAI_API_KEY` configurada, o texto é gerado pelo LLM e **salvo** no documento; requisições seguintes reutilizam o texto salvo (use "Gerar outro" no dashboard para regenerar). Sem chave, ou se o LLM falhar, a API devolve um conselho baseado em regras simples (não é persistido).

---

## 💻 Desenvolvimento local (sem Docker para API/Front)

Suba só a infraestrutura e rode o resto na máquina:

```bash
docker compose up -d mongo rabbitmq collector-python worker-go
```

Para a API, no `.env` use `DATABASE_URL=mongodb://localhost:27017/Desafio?replicaSet=rs0&directConnection=true` (adicione `127.0.0.1 mongo` ao arquivo hosts, pois o replica set anuncia o host `mongo`).

```bash
# API (porta SERVER_PORT, padrão 3000)
cd nest-api && npm install && npx prisma generate && npm run start:dev

# Frontend (http://localhost:5173)
cd frontend && npm install && npm run dev
```

Lint: `npm run lint` em `nest-api` e `frontend`.

## 🔌 Endpoints principais

| Método | Rota | Descrição |
| :--- | :--- | :--- |
| POST | `/users/register` · `/users/login` | Cadastro e login (retorna JWT) |
| GET | `/users/me` | Usuário autenticado |
| PATCH/DELETE | `/users/update/:id` · `/users/delete/:id` | Só o próprio usuário |
| GET | `/weather/all?page=1&limit=50` | Coletas paginadas (mais recentes primeiro) |
| GET | `/weather/insights/:id?refresh=true` | Insight de IA (cacheado) |
| GET | `/exports` | CSV de todas as coletas |

Documentação completa no Swagger (`/api`).

## 🧱 Contratos entre serviços

- **Fila (Python → Go):** `timestamp` (ISO 8601 com fuso), `cidade_lat_lon`, `temperatura_c`, `umidade_pct`, `vento_kmh`, `condicao_ceu`, `probabilidade_chuva_pct`.
- **Mongo (`Desafio.weather`):** `localization, temp, humidity, wind_speed, condition_sky, probability_rain, insights_ai, measured_at, created_at` — o `schema.prisma` e o `bson` do Go precisam permanecer iguais.
