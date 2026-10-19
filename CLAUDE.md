# CLAUDE.md

Projeto pessoal fullstack: pipeline de dados climáticos com insights de IA.
Idioma do projeto: código em inglês, textos de UI, commits antigos e README em português (pt-BR).

## Arquitetura

```
collector-python ──► RabbitMQ ──► worker-go ──► MongoDB ◄── nest-api ◄── frontend (React)
 (Open-Meteo, 1h)    (fila)      (consumer)     (db "climate_dashboard")  (Prisma, JWT, LLM)
```

| Pasta | Stack | Papel |
|---|---|---|
| `collector-python/` | Python 3.11, `requests`, `schedule`, `pika` | Busca clima na Open-Meteo a cada 1h e publica JSON na fila |
| `worker-go/` | Go, `streadway/amqp`, mongo-driver | Consome a fila e insere em `climate_dashboard.weather` |
| `nest-api/` | NestJS 11, Prisma (Mongo), JWT, bcrypt, SDK `openai` (Groq) | Auth, CRUD de usuário, dados climáticos, insight de IA, export CSV, Swagger em `/api` |
| `frontend/` | React 19, Vite 7, Tailwind 4, axios, react-router 7 | Login/registro, dashboard, configurações |

O repositório passou por uma tentativa de refatoração com Java Spring que foi **abandonada**. A stack acima é a definitiva; não reintroduza Spring. Ignore commits anteriores a `6338730`.

## Como rodar

- Tudo: copie `.env.example` para `.env` na raiz e rode `docker-compose up --build`. Um único `.env` alimenta todos os serviços.
- Não há serviço de MongoDB no compose: `DATABASE_URL` aponta para um Mongo externo (Atlas). Dentro do Docker, `HOST_RABBITMQ=rabbitmq`.
- API local: `cd nest-api && npm install && npx prisma generate && npm run start:dev` (porta `SERVER_PORT`, padrão 3000).
- Front local: `cd frontend && npm install && npm run dev`. A URL da API está fixa em `frontend/src/services/api.tsx` (`http://localhost:3000`).
- Lint: `npm run lint` em `nest-api` e em `frontend`. Não há testes escritos (Jest configurado, nenhum `.spec`).

## Contratos que quebram o pipeline se mudarem

- **Payload da fila** (Python → Go), em pt-BR: `timestamp`, `cidade_lat_lon`, `temperatura_c`, `umidade_pct`, `vento_kmh`, `condicao_ceu`, `probabilidade_chuva_pct`. As tags `json` de `worker-go/internal/entity/weather.go` precisam bater.
- **Documento no Mongo**: campos `localization, temp, humidity, wind_speed, condition_sky, probability_rain, insights_ai, measured_at, created_at`. O `nest-api/prisma/schema.prisma` (model `weather`, com `@map`) e o `bson` do Go precisam permanecer iguais.
- O worker grava no banco `climate_dashboard`, coleção `weather` (fixo no código). O Prisma usa o banco da `DATABASE_URL`, então ela deve terminar em `/climate_dashboard`.
- Variáveis de ambiente por serviço estão em `.env.example`. `QUEUE_NAME` e `EXCHANGE_NAME` são compartilhados entre Python e Go.

## Problemas conhecidos

Os itens de segurança, timestamp, ack, collector, API, infra e frontend listados antes foram corrigidos na branch `chore/stabilize-and-redesign` (ver `TASKS.md`). Pendências reais:

- Sem testes automatizados (Jest configurado, nenhum `.spec`).
- Sem chave de LLM no ambiente local: insights usam a regra local de `insights.service.ts`.
- `frontend/nginx.conf` só serve estáticos (não há proxy reverso); a URL da API vem de `VITE_API_URL` em build.

## Convenções

- API em camadas: `controller → service → repository`, DTOs com `class-validator` em `users/dtos/`. Respeite isso em módulos novos. Rotas protegidas usam `@UseGuards(AuthGuard)`; o usuário autenticado fica em `request.user`.
- Imports: prefira caminhos relativos (existe uso misto com `src/...`).
- Prettier em `nest-api/.prettierrc`; ESLint nos dois projetos TS.
- Go: código fica em `worker-go/` com módulo `weather-api` (`internal/database`, `internal/entity`).
- Não faça commit de `.env`, `node_modules/`, `dist/` ou `__pycache__/` (já no `.gitignore`).
- Os arquivos do repositório usam LF; o Git no Windows avisa sobre CRLF, é esperado.
- A branch de trabalho é `main`, com push direto. Confirme com o usuário antes de qualquer push.
