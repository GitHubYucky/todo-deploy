FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
# Install dev deps too (ts build needs types), then build, then prune dev deps
RUN npm ci
COPY . .
RUN npm run build && npm prune --production

ENV PORT=4000
ENV CORS_ORIGIN=*
EXPOSE 4000

CMD ["node", "dist/index.js"]
