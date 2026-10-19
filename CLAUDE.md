# CLAUDE.md

Desafio técnico fullstack (GDASH 2025/02): pipeline de dados climáticos com insights de IA.
Idioma do projeto: código em inglês, textos de UI, commits antigos e README em português (pt-BR).

## Arquitetura

```
collector-python ──► RabbitMQ ──► worker-go ──► MongoDB ◄── nest-api ◄── frontend (React)
 (Open-Meteo, 1h)    (fila)      (consumer)     (db "Desafio")  (Prisma, JWT, LLM)
```

| Pasta | Stack | Papel |
|---|---|---|
| `collector-python/` | Python 3.11, `requests`, `schedule`, `pika` | Busca clima na Open-Meteo a cada 1h e publica JSON na fila |
| `worker-go/` | Go, `streadway/amqp`, mongo-driver | Consome a fila e insere em `Desafio.weather` |
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
- O worker grava no banco `Desafio`, coleção `weather` (fixo no código). O Prisma usa o banco da `DATABASE_URL`, então ela deve terminar em `/Desafio`.
- Variáveis de ambiente por serviço estão em `.env.example`. `QUEUE_NAME` e `EXCHANGE_NAME` são compartilhados entre Python e Go.

## Problemas conhecidos (não assuma que estão corrigidos)

Verifique no código antes de depender de qualquer item; corrija-os se a tarefa tocar neles.

- **Segurança:** `PATCH /users/update/:id` e `DELETE /users/delete/:id` não checam se o `id` é do usuário logado (qualquer um altera/apaga qualquer um). O guard lê `JWT_SECRET_KEY`, o `JwtModule` e o `.env.example` usam `JWT_SECRET`. O `JwtModule.register` lê `process.env` antes do `ConfigModule` carregar o `.env` (usar `registerAsync`).
- **Timestamp:** o Python envia `isoformat()`, o Go faz `time.Parse("2006-01-02 15:04:05")`, falha sempre e usa `time.Now()` como `measured_at`.
- **Go:** consumer com auto-ack (perde mensagem se o Mongo falhar).
- **Python:** publica `None` quando a coleta falha; sem `timeout` no `requests`; abre uma conexão RabbitMQ por mensagem e não fecha; `datetime.now().hour` usa fuso do container (a API é chamada com `America/Sao_Paulo`).
- **API:** `GET /weather/insights/:id` chama o LLM a cada requisição e grava no banco, ignorando `insightsAI` já salvo; `GET /weather/all` devolve a coleção inteira sem paginação; o CSV não escapa vírgulas/quebras de linha; erros de negócio são `Error` genérico (500) em vez de `ConflictException`/`NotFoundException`; `mongoose`, `@nestjs/mongoose` e `passport` estão nas dependências sem uso; modelo e provider do LLM fixos em `insights.service.ts`.
- **Infra:** Dockerfiles de `frontend` e `nest-api` usam `node:18` (Vite 7 e Nest 11 exigem Node ≥ 20); `nest-api` roda `start:dev` na imagem; `.env.example` tem espaços após `=` e `DATABASE_URL` duplicado; o README descreve Nginx como reverse proxy, mas ele só serve estáticos.
- **Frontend:** rota protegida avaliada uma vez por render e renderiza `<LoginPage/>` em vez de redirecionar; o login vem pré-preenchido com `visitante@gmail.com`, usuário que **não é criado por nenhum seed**, e o código trata esse e-mail como caso especial (`nav.tsx`, `home.tsx`, `config.tsx`); `home.tsx` busca `/weather/all` duas vezes por ciclo e só usa os índices 0 e 1; sem gráficos; shadcn/ui citado no README mas não instalado.

## Convenções

- API em camadas: `controller → service → repository`, DTOs com `class-validator` em `users/dtos/`. Respeite isso em módulos novos. Rotas protegidas usam `@UseGuards(AuthGuard)`; o usuário autenticado fica em `request.user`.
- Imports: prefira caminhos relativos (existe uso misto com `src/...`).
- Prettier em `nest-api/.prettierrc`; ESLint nos dois projetos TS.
- Go: código fica em `worker-go/` com módulo `weather-api` (`internal/database`, `internal/entity`).
- Não faça commit de `.env`, `node_modules/`, `dist/` ou `__pycache__/` (já no `.gitignore`).
- Os arquivos do repositório usam LF; o Git no Windows avisa sobre CRLF, é esperado.
- A branch de trabalho é `main`, com push direto. Confirme com o usuário antes de qualquer push.
