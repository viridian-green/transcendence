ARG NODE_VERSION=24.7.0-alpine

FROM node:${NODE_VERSION} AS dev

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

# Build TypeScript to JavaScript
RUN npm run build

EXPOSE 3006

CMD ["npm", "start"]

