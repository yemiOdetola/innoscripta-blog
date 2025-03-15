FROM node:18-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY package*.json ./
COPY pnpm-lock.yaml ./

RUN pnpm install

EXPOSE 5173

CMD ["pnpm", "dev", "--host"] 