FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Ensure uploads directory exists and is writable
RUN mkdir -p public/uploads && chmod 777 public/uploads

EXPOSE 3000

CMD ["node", "index.js"]
