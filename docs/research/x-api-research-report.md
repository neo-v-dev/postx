# X（旧Twitter）API 調査レポート

**作成日時**: 2026-01-31 22:52:15 PST
**最終更新**: 2026-01-31 23:11:42 PST
**目的**: 予約投稿・自動投稿ソフトウェア開発のためのAPI仕様調査

---

## 1. エグゼクティブサマリー

| 項目 | 結論 |
|------|------|
| **無料で可能なこと** | 月500件までのツイート投稿、画像/動画アップロード |
| **無料での制限** | 読み取りほぼ不可、予約投稿API利用不可 |
| **予約投稿** | 標準APIには存在しない（自前実装 or Ads API必要） |
| **推奨プラン** | 個人開発: 自前スケジューラ + Free/Basic、商用: Pro以上 |
| **2026年の注目点** | Pay-Per-Use料金モデルが一般提供開始 |

---

## 2. 料金プラン詳細（2026年最新）

### 2.1 プラン比較表

| プラン | 月額料金 | 投稿数/月 | 読み取り数/月 | 用途 |
|--------|----------|-----------|---------------|------|
| **Free** | $0 | 500件 | 100件 | 個人の小規模自動投稿 |
| **Basic** | $200（年間$175） | 10,000件 | 15,000件 | 小規模アプリ、監視ツール |
| **Pro** | $5,000 | 300,000件 | 1,000,000件 | 中〜大規模アプリ |
| **Enterprise** | $42,000+ | カスタム | フルアクセス | 企業向け、SLA付き |

### 2.2 2026年の重要な変更点

- **年間契約オプション**: Basic $175/月（年間$2,100）で約12%割引
- **Top-up**: Basicプランで月2回までのトップアップ可能
- **App環境**: Freeは1 App/1 Project、Basicは2 App環境

### 2.3 Pay-Per-Use 料金モデル（2026年〜一般提供）

2025年10月にパイロット開始、2026年に一般提供開始。

| 操作 | 単価 |
|------|------|
| Post (Read) | $0.005/投稿 |
| User (Read) | $0.01/ユーザー |
| DM Event (Read) | $0.01/DMイベント |
| Content (Create) | $0.01/リクエスト |
| DM Interaction (Create) | $0.01/リクエスト |
| User Interaction (Create) | $0.015/リクエスト |

**特徴**:
- サブスクリプション不要、月間上限なし
- 使用量に応じた従量課金
- インタラクティブなコスト見積もりダッシュボード提供

---

## 3. 主要エンドポイント

### 3.1 ツイート投稿

| エンドポイント | メソッド | 説明 | 利用可能プラン |
|----------------|----------|------|----------------|
| `/2/tweets` | POST | ツイート投稿 | Free以上 |
| `/2/tweets/:id` | DELETE | ツイート削除 | Free以上 |
| `/2/users/:id/retweets` | POST | リツイート | Basic以上 |
| `/2/users/:id/likes` | POST | いいね | Basic以上 |

### 3.2 メディアアップロード（v2 - 2025年〜）

**重要**: v1.1の`/1.1/media/upload.json`は**2025年6月に廃止済み**

#### 新しい専用エンドポイント（2025年5月30日〜必須）

| エンドポイント | メソッド | 説明 | 利用可能プラン |
|----------------|----------|------|----------------|
| `POST /2/media/upload` | POST | 画像/GIF/動画アップロード | Free以上 |
| `POST /2/media/upload/init` | POST | チャンクアップロード開始 | Free以上 |
| `POST /2/media/upload/append` | POST | チャンク追加 | Free以上 |
| `POST /2/media/upload/finalize` | POST | アップロード完了 | Free以上 |

**認証要件**:
- OAuth 1.0a User Context または OAuth 2.0 User Context が必須
- OAuth 2.0 Application-Onlyは**使用不可**
- `media.write` スコープが必須
- PKCE認証URL: `https://x.com/i/oauth2/authorize`

### 3.3 予約投稿（Ads API）

| エンドポイント | メソッド | 説明 | 利用可能プラン |
|----------------|----------|------|----------------|
| `/accounts/:id/scheduled_tweets` | POST | 予約ツイート作成 | Ads API契約必要 |
| `/accounts/:id/scheduled_tweets/:id` | GET | 予約ツイート取得 | Ads API契約必要 |
| `/accounts/:id/scheduled_tweets/:id` | DELETE | 予約ツイート削除 | Ads API契約必要 |

**制約**: 最大365日先まで予約可能

---

## 4. レート制限

### 4.1 Freeプラン

| エンドポイント | 制限 |
|----------------|------|
| `POST /2/tweets` | 17リクエスト/24時間/ユーザー、17リクエスト/24時間/アプリ |
| 検索 | 15リクエスト/15分 |
| ユーザー検索 | 15リクエスト/15分 |
| ツイート取得 | 15リクエスト/15分 |

### 4.2 Basic/Proプラン

| エンドポイント | Basic | Pro |
|----------------|-------|-----|
| `POST /2/tweets` | 300リクエスト/3時間 | 300リクエスト/3時間 |
| ツイート取得 | 900リクエスト/15分 | 900リクエスト/15分 |
| ユーザー取得 | 900リクエスト/15分 | 900リクエスト/15分 |

### 4.3 Pay-Per-Use

- レート制限が大幅に緩和
- 使用量に応じたスケーリング

---

## 5. 認証方式

### 5.1 OAuth 2.0 with PKCE（推奨）

```
認証URL: https://x.com/i/oauth2/authorize
トークンURL: https://api.x.com/2/oauth2/token
```

### 5.2 必要なスコープ

| スコープ | 用途 |
|----------|------|
| `tweet.read` | ツイート読み取り |
| `tweet.write` | ツイート投稿 |
| `users.read` | ユーザー情報取得 |
| `media.write` | メディアアップロード |
| `offline.access` | リフレッシュトークン取得（重要） |

### 5.3 トークン有効期限

- **アクセストークン**: 2時間
- **リフレッシュトークン**: `offline.access`スコープ必須で取得可能

---

## 6. 予約投稿機能の実装方法

### 6.1 方法比較

| 方法 | コスト | 難易度 | 信頼性 |
|------|--------|--------|--------|
| **自前スケジューラ** | 低（サーバー費用のみ） | 中 | 自己責任 |
| **Ads API** | 高（広告アカウント必要） | 低 | 高 |
| **サードパーティサービス** | 中（月額課金） | 低 | サービス依存 |

### 6.2 自前スケジューラ実装案

```
┌─────────────────────────────────────────────────┐
│                  アーキテクチャ                   │
├─────────────────────────────────────────────────┤
│  ユーザー → Web UI → DB（予約データ保存）          │
│                       ↓                         │
│           Cron/スケジューラ（定期実行）            │
│                       ↓                         │
│           X API (POST /2/tweets)                │
└─────────────────────────────────────────────────┘
```

**必要コンポーネント**:
- データベース（予約投稿キュー）
- バックグラウンドワーカー（Node.js: Bull/Agenda、Python: Celery/APScheduler）
- 定期実行（cron、systemd timer、クラウドスケジューラ）

---

## 7. 開発に必要な準備

### 7.1 開発者アカウント取得手順

1. [X Developer Portal](https://developer.x.com/) にアクセス
2. 開発者アカウント申請
3. プロジェクト・アプリ作成
4. OAuth 2.0設定（Client ID/Secret取得）
5. コールバックURL設定

### 7.2 推奨技術スタック

| 言語 | ライブラリ | 備考 |
|------|-----------|------|
| **Python** | Tweepy 4.x | OAuth 2.0対応、最も情報が豊富 |
| **Node.js** | twitter-api-v2 | TypeScript対応 |
| **Go** | go-twitter | 軽量、高パフォーマンス |

### 7.3 新しい開発者ツール（2026年）

| ツール | 説明 | 更新日 |
|--------|------|--------|
| **X API MCP Server** | MCPプロトコル対応のAPIサーバー | 2026-01-30 |
| **X API Playground** | ローカルHTTPサーバーでAPI v2をシミュレート | 2026-01-09 |

---

## 8. コスト試算

### 8.1 個人利用（月100投稿程度）

| 項目 | コスト（サブスク） | コスト（Pay-Per-Use） |
|------|-------------------|----------------------|
| X API | $0（Free） | $1（100投稿 × $0.01） |
| サーバー | $5〜20/月 | $5〜20/月 |
| **合計** | **$5〜20/月** | **$6〜21/月** |

### 8.2 小規模サービス（月1,000投稿程度）

| 項目 | コスト（サブスク） | コスト（Pay-Per-Use） |
|------|-------------------|----------------------|
| X API | $200（Basic） | $10（1,000投稿 × $0.01） |
| サーバー | $20〜50/月 | $20〜50/月 |
| **合計** | **$220〜250/月** | **$30〜60/月** |

**注**: Pay-Per-Useは投稿のみの場合。読み取りを含むと追加コスト発生。

### 8.3 中規模サービス（月50,000投稿以上）

| 項目 | コスト（サブスク） | コスト（Pay-Per-Use） |
|------|-------------------|----------------------|
| X API | $5,000（Pro） | $500（50,000投稿 × $0.01） |
| サーバー | $100〜500/月 | $100〜500/月 |
| **合計** | **$5,100〜5,500/月** | **$600〜1,000/月** |

---

## 9. 注意事項・制約

### 9.1 利用規約上の制限

- スパム行為の禁止
- 自動化ポリシーへの準拠必須
- 商用利用には適切なプランが必要

### 9.2 技術的制限

- **v1.1 APIは廃止済み**（2025年6月）
- Freeプランでの読み取りはほぼ不可能
- アプリ単位でのレート制限に注意
- メディアアップロードはUser Context認証必須

### 9.3 ビジネスリスク

- 料金体系の頻繁な変更（2024年に大幅値上げ）
- API仕様の突然の変更可能性
- アカウント凍結リスク（自動化ポリシー違反時）

---

## 10. 結論・推奨事項

### 10.1 開発可否

**可能です。** ただし以下の点を考慮してください：

| 要件 | 実現可能性 | 備考 |
|------|-----------|------|
| 自動投稿 | **可能** | Freeプランで月500件まで |
| 画像/動画付き投稿 | **可能** | v2 media upload使用（User Context必須） |
| 予約投稿 | **要自前実装** | 標準APIには存在しない |
| 投稿分析 | **Basic以上必要** | Freeでは読み取り制限が厳しい |

### 10.2 推奨アプローチ（2026年版）

1. **小規模開発にはPay-Per-Useを検討**（月1,000投稿以下なら大幅コスト削減）
2. **予約投稿は自前スケジューラで実装**
3. **v2 APIへの完全移行が必須**（v1.1は廃止済み）
4. **メディアアップロードはUser Context認証を確実に実装**
5. **料金改定に備えて代替手段も調査しておく**

---

## 11. 2026年の主な変更点まとめ

| 項目 | 変更内容 |
|------|----------|
| **Pay-Per-Use** | パイロットから一般提供へ移行 |
| **v1.1 API** | 完全廃止（2025年6月） |
| **メディアアップロード** | 専用エンドポイントに移行必須（2025年5月30日〜） |
| **開発者ツール** | MCP Server、Playgroundがリリース |
| **年間契約** | 約12%割引オプション追加 |

---

## 参考資料

### 公式ドキュメント
- [X API Documentation](https://docs.x.com/x-api/introduction)
- [X API Rate Limits](https://docs.x.com/x-api/fundamentals/rate-limits)
- [X Developers Community](https://devcommunity.x.com/latest)

### 2026年の重要な公式アナウンス
- [X API Pay-Per-Use Pricing Pilot](https://devcommunity.x.com/t/announcing-the-x-api-pay-per-use-pricing-pilot/250253)
- [Media Upload Endpoints in X API v2](https://devcommunity.x.com/t/announcing-media-upload-endpoints-in-the-x-api-v2/234175)
- [Deprecating v1.1 Media Upload Endpoints](https://devcommunity.x.com/t/deprecating-the-v1-1-media-upload-endpoints/238196)

### サードパーティ情報源
- [Twitter/X API Pricing 2026 - getlate.dev](https://getlate.dev/blog/twitter-api-pricing)
- [X API Pricing Changes - Social Media Today](https://www.socialmediatoday.com/news/x-formerly-twitter-launches-usage-based-api-access-charges/803315/)
- [Best Twitter API Alternatives 2026 - Xpoz](https://www.xpoz.ai/blog/comparisons/best-twitter-api-alternatives-2026/)
- [X Tests Pay-Per-Use API Model - TechBuzz](https://www.techbuzz.ai/articles/x-tests-pay-per-use-api-model-to-win-back-developers)
