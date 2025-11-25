# TODOアプリ 作業タスクリスト

## 進行中/完了メモ
- [x] apps/web: Vite(React+TS) 初期化
- [x] apps/api: Express+TS 初期化
- [x] Prisma 導入 & Task モデル定義 (SQLite)
- [x] API ルート実装 (CRUD, フィルタ/検索)
- [x] フロント UI 作成 (一覧/フィルタ/作成フォーム)
- [ ] API 連携フック実装（hooks 切り出し）
- [ ] テスト追加 (フロント/バック)
- [ ] Docker 化
- [ ] デプロイ設定 (候補: Render / Railway / Fly.io)

## メモ
- モノレポ: apps/web, apps/api
- 環境変数: `.env` / `.env.example` で管理
- デザイン: Tailwindでシンプルに。後でダークモードを追加

## 作業メモ / コマンド集

### apps/web: Vite(React+TS) 初期化
- ルートで: `npm create vite@latest apps/web -- --template react-ts`
- `cd apps/web && npm install`
- Tailwind 導入: `npm install -D tailwindcss postcss autoprefixer && npx tailwindcss init -p`
- 開発サーバー: `npm run dev -- --host --port 5173`

### apps/api: Express+TS 初期化
- `mkdir apps/api && cd apps/api && npm init -y`
- TypeScript/実行周り: `npm install -D typescript ts-node-dev @types/node && npx tsc --init`
- Express 本体: `npm install express && npm install -D @types/express`
- スクリプト例 (`package.json`): `"dev": "ts-node-dev --respawn src/index.ts"`

### Prisma 導入 & Task モデル定義 (SQLite)
- 依存追加: `npm install @prisma/client && npm install -D prisma`
- 初期化: `npx prisma init --datasource-provider sqlite`
- `.env` 例: `DATABASE_URL="file:./prisma/dev.db"`
- `prisma/schema.prisma` に Task モデルを定義後、`npx prisma migrate dev --name init`
- ※ 現状 migrate が環境制約で失敗したため、一時的に API はメモリストア実装（Prisma に戻すときは migrate/generate を通す）

### API ルート実装 (CRUD + フィルタ/検索)
- 追加パッケージ例: `npm install zod cors`
- ルーター/エラーハンドラ/バリデーションを `src` 配下に作成
- フィルタ/検索はクエリ `status/search/tag/sort` を Prisma に渡す

### フロント UI 作成
- UI ライブラリ不要なら Tailwind コンポーネントを手書き
- ページ構成例: 一覧 + フィルタ + 新規作成フォーム + 状態トグル
- 現状: `apps/web/src/App.tsx` で fetch 直書きの最小 UI（検索/フィルタ/期限ソート、作成、完了トグル、削除）

### API 連携フック実装
- fetch か axios（使う場合: `npm install axios`）で hooks を作成
- 例: `useTasks`, `useCreateTask`, `useUpdateTask`, `useDeleteTask`

### テスト追加
- フロント: `npm install -D vitest jsdom @testing-library/react @testing-library/user-event`
- バック: `npm install -D vitest supertest`
- 各パッケージの `npm test` で走るよう設定

### Docker 化
- ルートに `Dockerfile` + `docker-compose.yml`（api + web + db）を用意
- 開発用は volume マウント、`docker compose up` で起動する想定

### デプロイ設定
- Render/Railway/Fly.io 用に環境変数を `.env.example` に追記
- CI/CD で `npm ci && npm run build` が通ることを確認
- ※ メモリ版デプロイ手順は `doc/deploy.md` を参照

## ローカル起動メモ
- API: `cd apps/api && npm run dev`（PORT 4000 デフォルト、CORS_ORIGIN は `http://localhost:5173`）
- Web: `cd apps/web && npm run dev -- --host --port 5173`
- API ベース URL は `VITE_API_BASE_URL` で上書き可（未設定なら `http://localhost:4000`）

## ドキュメント一覧
- 開発メモ: `doc/dev.md`
- デプロイメモ: `doc/deploy.md`
