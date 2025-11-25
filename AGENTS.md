## Mission
- TODO アプリ（フロント: Vite + React + TS / バック: Express + TS + Prisma + SQLite）の実装とメモ整備
- 使ったコマンドや進行状況を `doc/tasks.md` に追記して、再現手順を残す

## Environment
- モノレポ構成: `apps/web`（Vite React TS）、`apps/api`（Express TS + Prisma）
- データベース: SQLite (`apps/api/.env` の `DATABASE_URL=file:./prisma/dev.db`)
- API ポート: 4000 デフォルト / フロント: 5173 デフォルト
- API 基本 URL: `VITE_API_BASE_URL` で上書き可能（未設定時は `http://localhost:4000`）

## Guardrails
- 禁止事項（例: 本番 DB 編集、外部 API 書き込み）
- TODO-APP 以外のフォルダへのアクセス
- 破壊的な git 操作（reset --hard 等）はユーザ指示がない限り禁止

## Workflow
- 小さいタスク単位で diff → テスト → 実行 → レポート
- 進捗/手順は `doc/tasks.md` に都度追記

## Deliverables
- 動作する API + フロントの最小セット
- 実行手順と環境変数のメモ（doc 配下）
- Prisma migrate/generate が通らない環境では、API はメモリストアで暫定稼働する
- Docs: `doc/dev.md`（ローカル開発）、`doc/deploy.md`（メモリ版デプロイ）
