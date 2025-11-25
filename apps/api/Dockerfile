FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

ENV PORT=4000
ENV CORS_ORIGIN=*
EXPOSE 4000

CMD ["node", "dist/index.js"]
