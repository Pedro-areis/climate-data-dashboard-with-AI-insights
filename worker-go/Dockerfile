FROM golang:1.25 AS build

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o worker-go .

FROM alpine:latest

WORKDIR /app

COPY --from=build /app/worker-go .

ENV RABBITMQ_URL=""
ENV MONGODB_URL=""

CMD ["./worker-go"]