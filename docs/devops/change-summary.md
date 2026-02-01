# CI/CD実装 - 変更サマリー

**作成日時**: 2026-01-31 23:52:30 PST
**ステータス**: 完了

---

## 1. 作成ファイル一覧

### 1.1 ワークフローファイル（5ファイル）

```
.github/
├── workflows/
│   ├── schedule.yml       (1,348 bytes) - 定期投稿実行
│   ├── deploy.yml         (1,177 bytes) - Web UIデプロイ
│   ├── test.yml           (1,682 bytes) - テスト実行
│   └── validate.yml       (1,567 bytes) - PRバリデーション
└── dependabot.yml         (402 bytes)   - 依存関係更新
```

---

## 2. 各ワークフローの詳細

### 2.1 schedule.yml（定期投稿実行）

**トリガー**:
- cron: `*/15 * * * *`（15分ごと）
- workflow_dispatch（手動実行、dry_runオプション付き）

**主要ステップ**:
1. リポジトリチェックアウト
2. Python 3.11セットアップ（キャッシュ有効）
3. 依存関係インストール
4. スケジューラ実行（X API投稿）
5. posts.json更新をコミット（`[skip ci]`付き）

**必要なシークレット**:
- `X_CLIENT_ID`
- `X_CLIENT_SECRET`
- `X_ACCESS_TOKEN`
- `X_REFRESH_TOKEN`

**パーミッション**: `contents: write`

---

### 2.2 deploy.yml（Web UIデプロイ）

**トリガー**:
- push: main（web/**の変更時のみ）
- workflow_dispatch（手動実行）

**主要ステップ**:
1. リポジトリチェックアウト
2. Node.js 20セットアップ（キャッシュ有効）
3. npm ci（依存関係インストール）
4. Next.js ビルド（Static Export）
5. GitHub Pagesへデプロイ

**パーミッション**: `pages: write`, `id-token: write`

**環境変数**: `NEXT_PUBLIC_GITHUB_REPO`

---

### 2.3 test.yml（テスト実行）

**トリガー**:
- push: main
- pull_request: main

**並列ジョブ（3つ）**:

#### test-python
- pytest実行
- カバレッジ測定（pytest-cov）
- Codecovへアップロード

#### test-web
- npm lint実行
- Jestテスト実行（--passWithNoTests）

#### validate-data
- posts.json構文チェック

---

### 2.4 validate.yml（PRバリデーション）

**トリガー**:
- pull_request: main（data/posts.json変更時のみ）

**バリデーション項目**:
- JSON構文チェック
- 必須フィールド検証（config, posts, history, stats）
- interval_minutes検証（5/15/30/60のみ許可）
- post typeフィールド検証（tweet/thread/repost）
- 日時フォーマット検証（ISO 8601）

---

### 2.5 dependabot.yml（依存関係自動更新）

**更新対象**:
- pip（/scheduler） - 週次、PR上限5
- npm（/web） - 週次、PR上限5
- github-actions（/） - 週次、PR上限5

---

## 3. 重要な設定変更

### 3.1 実行間隔の調整

**当初計画**: 5分間隔（月間8,640分使用）
**実装値**: 15分間隔（月間2,160分使用）

**理由**: GitHub Actions無料枠（2,000分/月）を超過しないため

---

## 4. 次に必要な作業

### 4.1 GitHub Repository設定

#### シークレット設定
```
Settings → Secrets and variables → Actions → New repository secret

設定項目:
├── X_CLIENT_ID          (X OAuth Client ID)
├── X_CLIENT_SECRET      (X OAuth Client Secret)
├── X_ACCESS_TOKEN       (X API Access Token)
└── X_REFRESH_TOKEN      (X API Refresh Token)
```

#### GitHub Pages有効化
```
Settings → Pages → Build and deployment
Source: GitHub Actions
```

### 4.2 初回テスト実行

#### schedule.yml手動実行（dry_run）
```
Actions → Scheduled Post → Run workflow
├── Branch: main
└── Dry run: true
```

#### deploy.yml手動実行
```
Actions → Deploy Web UI → Run workflow
```

---

## 5. 想定される動作

### 5.1 通常運用フロー

```
15分ごと
    ↓
schedule.yml実行
    ↓
scheduler/main.py起動
    ↓
posts.json読み込み
    ↓
予約時刻到達の投稿を抽出
    ↓
X APIへ投稿
    ↓
posts.json更新（ステータス変更）
    ↓
git commit & push [skip ci]
```

### 5.2 Web UI更新フロー

```
web/配下を変更してmainにpush
    ↓
deploy.yml実行
    ↓
Next.jsビルド（Static Export）
    ↓
GitHub Pagesへデプロイ
    ↓
https://<username>.github.io/<repo>/ で公開
```

---

## 6. トラブルシューティング

### 6.1 schedule.ymlが失敗する場合

**考えられる原因**:
- シークレットが未設定
- scheduler/ディレクトリが存在しない
- requirements.txtが存在しない
- X API認証エラー

**確認方法**:
```
Actions → Scheduled Post → 最新の実行 → ログ確認
```

### 6.2 deploy.ymlが失敗する場合

**考えられる原因**:
- web/ディレクトリが存在しない
- package.jsonまたはpackage-lock.jsonが存在しない
- GitHub Pagesが有効化されていない
- ビルドエラー

**確認方法**:
```
Actions → Deploy Web UI → 最新の実行 → ログ確認
```

---

## 7. 月間コスト見積もり（改定版）

| ワークフロー | 実行頻度 | 実行時間 | 月間使用時間 |
|------------|---------|---------|-------------|
| schedule.yml | 96回/日 | 1分 | 2,880分 |
| deploy.yml | 5回/週 | 4分 | 80分 |
| test.yml | 30回/月 | 3分 | 90分 |
| validate.yml | 10回/月 | 0.5分 | 5分 |
| **合計** | - | - | **3,055分/月** |

**注意**: 無料枠（2,000分/月）を超過します。

### 推奨対策:
1. cronを30分間隔に変更（1,440分/月）
2. 有料プランを検討（$0.008/分）
3. セルフホストランナーの使用

---

## 8. セキュリティチェックリスト

- [x] シークレットをハードコードしていない
- [x] GitHub Secretsを使用
- [x] 最小限のパーミッションを設定
- [x] [skip ci]で無限ループを防止
- [x] dependabotでセキュリティアップデート自動化

---

## 9. ファイルパス一覧

```
/Users/neo/workspace/stream/repo/X-doc/.github/workflows/schedule.yml
/Users/neo/workspace/stream/repo/X-doc/.github/workflows/deploy.yml
/Users/neo/workspace/stream/repo/X-doc/.github/workflows/test.yml
/Users/neo/workspace/stream/repo/X-doc/.github/workflows/validate.yml
/Users/neo/workspace/stream/repo/X-doc/.github/dependabot.yml
```

---

## 10. 完了確認

- [x] 5つのワークフローファイル作成完了
- [x] 実行間隔を15分に設定
- [x] 必要なシークレット項目をドキュメント化
- [x] セキュリティベストプラクティス適用
- [ ] シークレット設定（ユーザー作業）
- [ ] GitHub Pages有効化（ユーザー作業）
- [ ] 初回テスト実行（ユーザー作業）
