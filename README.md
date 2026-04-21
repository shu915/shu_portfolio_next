# Shu Digital Works

フルスタックエンジニア **Shu** のポートフォリオ兼情報発信サイトのフロントエンドです。  
WordPress をコンテンツソースにしつつ、**表示・配信・フォーム・キャッシュ**は **Next.js（App Router）** 側で一貫して実装しています。

## 本番

`https://（公開後に記載）`

---

## 技術スタック（概要）

| 領域 | 採用技術 |
|------|-----------|
| フレームワーク | **Next.js 16**（App Router） |
| UI | **React 19**、**TypeScript 5**、**Tailwind CSS 4** |
| コンテンツ | **WordPress**（ヘッドレス）＋ **WPGraphQL** |
| API 通信 | `graphql` クライアント、`fetch` ベースの薄いラッパー（`gqlFetch`） |
| フォーム・バリデーション | **react-hook-form**、**Zod** |
| メール送信 | **Resend**（問い合わせ通知） |
| ボット対策 | **Cloudflare Turnstile**（`@marsidev/react-turnstile`） |

---

## アーキテクチャ上の要点

### ヘッドレス CMS とフロントの責務分離

- 記事・実績・固定ページなどの**本文・メタデータは WordPress** に集約。
- **ルーティング・レイアウト・SEO メタ・OGP・お問い合わせ処理**は Next 側。
- 同一データの二重フェッチを抑えるため、**`react` の `cache` や `fetch` のタグ付きキャッシュ**を用途に応じて使い分け。

### キャッシュと再検証（ISR / On-demand Revalidation）

- `gqlFetch` で **Next の `fetch` キャッシュ**（`revalidate`・`tags`）を利用。
- 一覧用タグ（例: `posts` / `works` / `pages`）と、**スラッグ単位の個別タグ**（例: `posts:hello-world`）を分離し、**更新の影響範囲を最小化**。
- **`POST /api/revalidate`** でシークレットヘッダーを検証したうえで `revalidateTag`。**WordPress 側の Webhook** とスキーマを揃え、公開・更新後にフロントのキャッシュを意図どおり無効化。
- Webhook が届かない場合のフォールバックとして、**時間ベースの `revalidate` 既定値**（`default-revalidate.ts`）も設定。

### セキュリティ・品質

- 問い合わせ API：**Zod** で入力検証、**Turnstile** でボット対策、**Resend** で通知メール。
- 環境変数未設定時は**起動時やリクエスト時に明示的に失敗**させ、誤デプロイを防ぐ方針（例: GraphQL URL、revalidate シークレット）。