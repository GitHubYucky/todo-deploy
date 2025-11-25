# デプロイメモ（メモリ版 API 前提）

## Docker イメージ

### Web

- パス: `apps/web/Dockerfile`
- ビルド: `docker build -t todo-web ./apps/web`
- 変数: build arg `VITE_API_BASE_URL`（例: `http://api.example.com`）

### API

- パス: `apps/api/Dockerfile`
- ビルド: `docker build -t todo-api ./apps/api`
- 変数: `PORT`（デフォルト 4000）、`CORS_ORIGIN`（フロントの URL）
- データはプロセス/コンテナ内メモリのみ。永続化なし。

## docker-compose（ルート `docker-compose.yml`）

```
services:
  api:
    build: ./apps/api
    ports: ["4000:4000"]
    environment:
      PORT: 4000
      CORS_ORIGIN: "http://localhost" # 本番はフロント URL

  web:
    build:
      context: ./apps/web
      args:
        VITE_API_BASE_URL: http://localhost:4000 # 本番は API URL
    ports: ["80:80"]
    depends_on:
      - api
```

## 手順（例）

1. ルートで `docker compose up --build`
2. ブラウザから `http://localhost` にアクセス
3. API: `http://localhost:4000`（CORS_ORIGIN で許可）

## 注意

- メモリ版 API のため再起動でタスクは消える。永続化が必要なら Prisma+DB に戻す。
- CORS_ORIGIN と VITE_API_BASE_URL はデプロイ先 URL に合わせて設定すること。

## Render でのデプロイ（無料枠想定）

### 前提

- GitHub リポジトリ連携を使う
- モノレポ設定: Render の「Monorepo」タブでそれぞれの Working Directory を指定

### Web（Static Site）

- Type: Static Site
- Root / Working Directory: `apps/web`
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`
- Build Environment Variables:
  - `VITE_API_BASE_URL=https://<your-api-on-render>.onrender.com`

### API（Web Service）

- Type: Web Service
- Root / Working Directory: `apps/api`
- Build Command: `npm install && npm run build`
- Start Command: `npm start`（内部で `node dist/index.js`）
- Environment Variables:
  - `PORT=10000`（Render が渡すので未設定でも可）
  - `CORS_ORIGIN=https://<your-web-on-render>.onrender.com`
- メモリ版のためデータはデプロイ/再起動で消える

### CORS と疎通確認

- API の CORS_ORIGIN をフロント URL に合わせる
- フロントの VITE_API_BASE_URL を API の URL に合わせる
- デプロイ後、フロントから一覧取得/作成が通れば OK
