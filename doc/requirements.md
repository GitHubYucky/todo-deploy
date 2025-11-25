# TODOアプリ 要件定義

## 概要
- シンプルなTODO管理アプリ。タスクの作成、編集、完了/未完了切替、削除、検索/フィルタ、並び替えを提供する。
- フロント: Vite + React + TypeScript + Tailwind（予定）。
- バック: Node.js + Express + TypeScript + Prisma + SQLite（ローカル）。
- デプロイ: コンテナベースを想定（Render / Railway / Fly.io など）。

## 機能要件
- タスク一覧の取得
- タスクの作成（タイトル必須、説明/期限/タグ任意）
- タスクの更新（タイトル、説明、期限、タグ、完了状態）
- タスクの削除
- 完了/未完了フィルタ、タグフィルタ、期限ソート
- 検索（タイトル/説明部分一致）
- （任意）ダークモードトグル
- （任意・後日）認証を追加し、ユーザ毎のタスク分離

## 非機能要件
- APIはJSONベース、エラーレスポンスは一貫したフォーマットを返す
- バリデーションはZodで実施
- CORSは環境変数でオリジン指定
- ログ: 開発では簡易ログ、本番を想定した構造化ログへの拡張余地
- データベースは開発: SQLite、デプロイ時: Postgres等へ移行可能なスキーマ
- テスト: フロントはVitest + React Testing Library、バックはVitest + Supertestを想定

## API概要（初期案）
- `GET    /tasks` クエリ: `search`, `status`(completed|pending), `tag`, `sort`(dueDate|createdAt)
- `POST   /tasks` body: `{ title: string; description?: string; dueDate?: string; tags?: string[] }`
- `PATCH  /tasks/:id` body: 任意フィールド
- `DELETE /tasks/:id`

## データモデル（初期案）
```
Task {
  id: string (UUID)
  title: string
  description?: string
  dueDate?: string (ISO)
  tags: string[] (JSON配列)
  completed: boolean
  createdAt: DateTime
  updatedAt: DateTime
}
```

## 環境変数（想定）
- `DATABASE_URL` : Prisma接続先（開発は SQLite のファイルパス）
- `PORT` : APIの待受ポート
- `VITE_API_BASE_URL` : フロントのAPIベースURL
- `CORS_ORIGIN` : 許可するオリジン

## 今後の拡張候補
- 認証（JWT等）とユーザテーブル追加
- コメントやサブタスク
- 通知（期限前リマインド）
- PWA対応
