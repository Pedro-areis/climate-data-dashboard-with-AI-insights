FROM node:22-alpine AS build

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm ci

COPY . .

RUN npx prisma generate && npm run build

FROM node:22-alpine

WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/prisma ./prisma
COPY --from=build /app/dist ./dist
RUN npx prisma generate

EXPOSE 3000

CMD ["node", "dist/main"]
