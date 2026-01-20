FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --only=production || npm install

COPY src ./src

ENV PORT=3005

CMD ["npm", "start"]


