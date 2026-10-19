# TASKS — registro de execução

Registro vivo do que foi feito (e do que foi pulado) durante a estabilização do projeto.
Branch de trabalho: `chore/stabilize-and-redesign` (sem push, tudo local).

## Plano (tudo concluído)

- [x] 0. Ambiente: `.env`, Mongo local (replica set de 1 nó) no compose
- [x] 1. Worker Go: parse do timestamp ISO, ack manual (nack+requeue se Mongo falhar, reject se JSON inválido), retry de conexão ao RabbitMQ
- [x] 2. Collector Python: timeout, `raise_for_status`, uma conexão por publicação (fechada) com retry, não publica `None`, fuso `America/Sao_Paulo` (timestamp com offset)
- [x] 3. API Nest:
  - ownership em update/delete (403), visitante somente leitura, `ParseObjectIdPipe`
  - `JWT_SECRET` único via `JwtModule.registerAsync` num `AuthModule` global; guard sem ler env
  - `/weather/all` paginado (`{items,total,page,limit}`, limit máx 500, ordenado por `measuredAt`)
  - insight cacheado no banco; `?refresh=true` regenera; fallback por regra local se sem chave/LLM falhar (não persiste o fallback); modelo via `LLM_MODEL`
  - CSV com escape RFC 4180, colunas explícitas, BOM
  - `ConflictException`/`NotFoundException`; senha mínima 8; update não devolve hash
  - removidas deps `mongoose`, `@nestjs/mongoose`, `passport`, `@types/passport-jwt`; imports relativos
  - seed idempotente do usuário `visitante@gmail.com` (senha `12345678`)
- [x] 4. Infra: Dockerfiles Node 22 (nest-api multi-stage, `node dist/main`), `.dockerignore`, `.env.example` corrigido, compose com mongo + healthchecks + `restart`
- [x] 5. Frontend: rotas protegidas com `<Navigate>`, layout com sidebar, redesign dark, KPIs com variação, 2 gráficos (Recharts), tabela, insight com "Gerar outro", config sem alert(), 1 chamada de dados por ciclo, `VITE_API_URL`
- [x] 6. Stack no ar via `docker compose up` e validada ponta a ponta (collector → fila → worker → Mongo → API → front)
- [x] 7. README reescrito
- [x] 8. Resumo final (na resposta ao usuário)

## Decisões

- **Mongo local no compose** em vez de Atlas: "colocar no ar localmente" sem depender de credenciais externas. Prisma exige replica set, então o container sobe com `--replSet rs0` e inicia o RS no healthcheck. Atlas continua possível via `DATABASE_URL`.
- **Visitante seedado e mantido** (o login já o usava); por segurança ficou somente leitura (403 em update/delete) e o front trata como convidado.
- **Formato de `/weather/all` mudou** de array para `{items,total,page,limit}` (necessário para paginação). Único consumidor é o front, já ajustado.
- **Recharts** para gráficos (shadcn/ui não foi instalado; README não o cita mais). Tema dark único, sem toggle.
- **Fallback de insight por regra local** quando não há `OPENAI_API_KEY`, para o card nunca ficar vazio.
- `.env` foi criado a partir do `.env.example` (ignorado pelo git). `JWT_SECRET` é um valor de dev: troque fora do ambiente local.
- Nginx continua só servindo estáticos; README corrigido em vez de adicionar proxy.

## Impedimentos / decisões pendentes para você

- **Chave do LLM (Groq):** não havia chave. Insights usam a regra local. Preencha `OPENAI_API_KEY` no `.env` e rode `docker compose up -d nest-api` para testar o LLM real (caminho do LLM **não foi exercitado**).
- **Dev local fora do Docker** (API/front no host apontando para o Mongo do compose): descrito no README mas **não testado** (exige entrada `127.0.0.1 mongo` no hosts).
- **Verificação visual** feita por screenshot headless do Chrome (login e dashboard no desktop). Mobile, `/config` e `/register` não foram inspecionados visualmente.
- Sem testes automatizados — não escrevi (fora do escopo pedido).
- **Push não feito.** Os commits estão na branch local `chore/stabilize-and-redesign`; mesclar em `main` fica para você decidir.

## Log

- Branch criada, TASKS/CLAUDE.md commitados.
- Worker, collector, API, infra e frontend commitados em sequência; stack validada com curl (login, 403 ao apagar outro usuário, 409 em e-mail duplicado, CSV escapado, insight por regra).
