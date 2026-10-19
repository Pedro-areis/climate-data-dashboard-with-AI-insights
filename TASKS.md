# TASKS — registro de execução

Registro vivo do que foi feito (e do que foi pulado) durante a estabilização do projeto.
Branch de trabalho: `chore/stabilize-and-redesign` (sem push, tudo local).

## Plano

- [ ] 0. Ambiente: `.env`, Mongo local no compose
- [ ] 1. Worker Go (timestamp, ack manual, env)
- [ ] 2. Collector Python (timeout, conexão única, fuso, não publicar None)
- [ ] 3. API Nest (segurança, JWT, paginação, insights com cache, CSV, exceptions, deps, seed)
- [ ] 4. Infra (Dockerfiles Node 22, compose, .env.example)
- [ ] 5. Frontend (rotas protegidas, redesign, gráficos, API URL via env)
- [ ] 6. Subir tudo com docker compose e validar ponta a ponta
- [ ] 7. README
- [ ] 8. Resumo final

## Decisões

(preenchido ao longo da execução)

## Impedimentos / decisões pendentes para o usuário

(preenchido ao longo da execução)

## Log
