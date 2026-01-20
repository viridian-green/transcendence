FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --only=production || npm install

COPY . .

# Build JS into dist (copy src to dist, similar pattern to chat-service)
RUN npm run build

ENV PORT=3005

CMD ["npm", "start"]


