# 開発メモ（ローカル）

## 前提
- Node.js 20.x
- ルートで `npm install` は不要（各パッケージ配下で実行）

## API（メモリ版）
- `cd apps/api`
- 依存: `npm install`
- ビルド: `npm run build`
- 起動: `npm start`（PORT=4000, CORS_ORIGIN=http://localhost:5173 など）
- データはメモリ保持のみ。プロセス終了で消える。

## Web
- `cd apps/web`
- 依存: `npm install`
- 開発サーバー: `npm run dev -- --host --port 5173`
- API ベース URL: `.env` またはビルド引数の `VITE_API_BASE_URL`（未指定は http://localhost:4000）

## API の型・バリデーション
- バリデーション: zod
- ストア: メモリ Map（`apps/api/src/index.ts`）

## 留意点
- Prisma 依存を外しているため migrate/generate は不要（復帰時はネットワーク許可後に実行）
- 再起動でデータが消えることをフロント利用時に想定すること
