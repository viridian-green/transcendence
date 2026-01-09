ARG NODE_VERSION=24.7.0-alpine

FROM node:${NODE_VERSION} AS prod

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

EXPOSE 3002

CMD ["node", "src/server.js"]