# PostX - X (Twitter) Scheduled Post Manager

X（旧Twitter）への予約投稿を管理するWebアプリケーション + GitHub Actions自動投稿システム

A scheduled post management system for X (Twitter) with Web UI and GitHub Actions automation.

---

## 📋 目次 / Table of Contents

- [機能 / Features](#機能--features)
- [スクリーンショット / Screenshots](#スクリーンショット--screenshots)
- [必要要件 / Requirements](#必要要件--requirements)
- [セットアップ / Setup](#セットアップ--setup)
  - [1. GitHub Personal Access Token取得](#1-github-personal-access-token取得)
  - [2. リポジトリ設定](#2-リポジトリ設定)
  - [3. X API設定](#3-x-api設定)
  - [4. ローカル開発環境](#4-ローカル開発環境-optional)
- [使い方 / Usage](#使い方--usage)
- [アーキテクチャ / Architecture](#アーキテクチャ--architecture)
- [開発/本番環境の分離](#開発本番環境の分離)
- [トラブルシューティング](#トラブルシューティング)
- [ライセンス / License](#ライセンス--license)

---

## 機能 / Features

### 日本語

- **Webベース投稿管理**: Next.jsで構築されたモダンなUI
- **GitHub連携**: GitHubリポジトリをデータストレージとして利用
- **自動投稿**: GitHub Actionsによる15分間隔の自動チェック＆投稿
- **多言語対応**: 日本語・英語の切り替え対応
- **スレッド投稿**: 最大10件の連続ツイート（スレッド）作成
- **投稿ステータス管理**: pending（待機中）/ posted（投稿済み）/ failed（失敗）
- **投稿編集・削除**: スケジュール済み投稿の管理
- **ダークモード対応**: システム設定に追従
- **リアルタイム同期**: GitHub APIによるデータ同期

### English

- **Web-based Post Management**: Modern UI built with Next.js
- **GitHub Integration**: Uses GitHub repository as data storage
- **Automated Posting**: GitHub Actions check & post every 15 minutes
- **Multi-language Support**: Japanese/English language switcher
- **Thread Support**: Create up to 10 consecutive tweets (threads)
- **Post Status Management**: pending / posted / failed
- **Edit & Delete**: Manage scheduled posts
- **Dark Mode**: Follows system preferences
- **Real-time Sync**: Data synchronization via GitHub API

---

## スクリーンショット / Screenshots

> Coming Soon: アプリケーションのスクリーンショットを追加予定

---

## 必要要件 / Requirements

### 日本語

- **X (Twitter) アカウント**: 投稿先のアカウント
- **X Developer Account**: API v2利用のため（無料プランでOK）
- **GitHubアカウント**: リポジトリ管理用
- **Node.js 18+** (ローカル開発時のみ)
- **Python 3.11+** (スケジューラーのローカルテスト時のみ)

### English

- **X (Twitter) Account**: Target account for posting
- **X Developer Account**: For API v2 access (free tier is OK)
- **GitHub Account**: For repository management
- **Node.js 18+** (local development only)
- **Python 3.11+** (local scheduler testing only)

---

## セットアップ / Setup

### 1. GitHub Personal Access Token取得

#### 日本語

1. GitHubにログインし、[Settings > Developer settings > Personal access tokens > Tokens (classic)](https://github.com/settings/tokens) へ移動
2. **Generate new token (classic)** をクリック
3. 以下を設定:
   - **Note**: `PostX Web App`（任意の名前）
   - **Expiration**: `No expiration` または任意の期間
   - **Scopes**: `repo` (Full control of private repositories) にチェック
4. **Generate token** をクリック
5. 表示されたトークンをコピー（再表示不可のため必ず保存）

#### English

1. Go to GitHub [Settings > Developer settings > Personal access tokens > Tokens (classic)](https://github.com/settings/tokens)
2. Click **Generate new token (classic)**
3. Configure:
   - **Note**: `PostX Web App` (or any name)
   - **Expiration**: `No expiration` or your preference
   - **Scopes**: Check `repo` (Full control of private repositories)
4. Click **Generate token**
5. Copy the token (cannot be viewed again)

---

### 2. リポジトリ設定

#### 日本語

**Option A: このリポジトリをForkする（推奨）**

1. このリポジトリをFork（GitHubのForkボタンをクリック）
2. Forkしたリポジトリの **Settings > Secrets and variables > Actions** へ移動
3. **New repository secret** をクリックし、以下を追加:

| Name | Value | 説明 |
|------|-------|------|
| `X_API_KEY` | あなたのX API Key | X Developer Portalから取得 |
| `X_API_KEY_SECRET` | あなたのX API Key Secret | 同上 |
| `X_ACCESS_TOKEN` | あなたのX Access Token | 同上 |
| `X_ACCESS_TOKEN_SECRET` | あなたのX Access Token Secret | 同上 |

4. **Actions** タブで「Enable workflows」をクリック（ForkではActionsがデフォルト無効）

**Option B: 新規リポジトリを作成**

1. 新しいGitHubリポジトリを作成
2. このリポジトリの内容をclone & push
3. 上記と同じ手順でSecretsを設定

#### English

**Option A: Fork this repository (Recommended)**

1. Fork this repository (click Fork button on GitHub)
2. Go to **Settings > Secrets and variables > Actions** in your forked repository
3. Click **New repository secret** and add:

| Name | Value | Description |
|------|-------|-------------|
| `X_API_KEY` | Your X API Key | Get from X Developer Portal |
| `X_API_KEY_SECRET` | Your X API Key Secret | Same as above |
| `X_ACCESS_TOKEN` | Your X Access Token | Same as above |
| `X_ACCESS_TOKEN_SECRET` | Your X Access Token Secret | Same as above |

4. Enable workflows in **Actions** tab (Actions are disabled by default in forks)

**Option B: Create new repository**

1. Create a new GitHub repository
2. Clone this repository and push to your new repository
3. Configure Secrets following the same steps above

---

### 3. X API設定

#### 日本語

1. [X Developer Portal](https://developer.x.com) にアクセス
2. プロジェクトを作成（無料の「Free」プランでOK）
3. アプリを作成し、**Keys and tokens** から以下を取得:
   - API Key (Consumer Key)
   - API Key Secret (Consumer Secret)
   - Access Token
   - Access Token Secret
4. **App permissions** を「Read and Write」に設定
5. 取得した認証情報をGitHub Secretsに設定（上記手順2参照）

#### English

1. Go to [X Developer Portal](https://developer.x.com)
2. Create a project (Free tier is sufficient)
3. Create an app and get from **Keys and tokens**:
   - API Key (Consumer Key)
   - API Key Secret (Consumer Secret)
   - Access Token
   - Access Token Secret
4. Set **App permissions** to "Read and Write"
5. Add credentials to GitHub Secrets (see step 2 above)

---

### 4. ローカル開発環境 (Optional)

#### 日本語

**Webアプリ（Next.js）**

```bash
cd web
npm install
npm run dev
# http://localhost:3000 でアクセス
```

**スケジューラー（Python）**

```bash
cd scheduler
pip install -r requirements.txt

# .envファイルを作成（.env.exampleをコピー）
cp ../.env.example ../.env
# .envに実際のX API認証情報を記入

# テスト実行
python -m scheduler.main
```

#### English

**Web App (Next.js)**

```bash
cd web
npm install
npm run dev
# Access at http://localhost:3000
```

**Scheduler (Python)**

```bash
cd scheduler
pip install -r requirements.txt

# Create .env file (copy from .env.example)
cp ../.env.example ../.env
# Fill in your actual X API credentials in .env

# Test run
python -m scheduler.main
```

---

## 使い方 / Usage

### 日本語

1. **WebアプリにGitHub Tokenを設定**
   - ブラウザでWebアプリにアクセス（GitHub Pagesやローカル環境）
   - 設定画面でGitHub Personal Access Tokenを入力
   - リポジトリ情報（Owner/Repo名）を入力

2. **投稿を作成**
   - 「新規投稿」ボタンをクリック
   - テキストを入力（通常投稿またはスレッド）
   - 投稿日時を設定
   - 「保存」をクリック → `data/posts.json` にコミット

3. **自動投稿**
   - GitHub Actionsが15分ごとに実行
   - `scheduled_at` を過ぎた投稿を自動的にXへ投稿
   - 投稿後、ステータスが `posted` に更新

4. **投稿管理**
   - ダッシュボードで投稿一覧を確認
   - pending/posted/failedでフィルタリング
   - 編集・削除が可能

### English

1. **Set GitHub Token in Web App**
   - Access the web app (GitHub Pages or local)
   - Go to settings page
   - Enter GitHub Personal Access Token
   - Enter repository info (Owner/Repo name)

2. **Create a Post**
   - Click "New Post" button
   - Enter text (single post or thread)
   - Set scheduled date/time
   - Click "Save" → commits to `data/posts.json`

3. **Automatic Posting**
   - GitHub Actions runs every 15 minutes
   - Posts with past `scheduled_at` are automatically posted to X
   - Status updates to `posted` after successful posting

4. **Manage Posts**
   - View post list in dashboard
   - Filter by pending/posted/failed
   - Edit or delete posts

---

## アーキテクチャ / Architecture

### 日本語

```
┌─────────────────────────────────────────────────────────┐
│                    PostX Web App (Next.js)              │
│  - 投稿作成・編集・削除                                    │
│  - GitHub API経由でposts.jsonを更新                       │
│  - localStorage: GitHub Token保存                        │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
           ┌──────────────────────┐
           │  GitHub Repository   │
           │  └── data/           │
           │      └── posts.json  │◄──┐
           └──────────┬───────────┘   │
                      │                │
                      ▼                │
         ┌────────────────────────┐   │
         │  GitHub Actions        │   │
         │  (15分間隔で実行)       │   │
         │                        │   │
         │  ┌──────────────────┐  │   │
         │  │ Scheduler (Python)│  │   │
         │  │ - posts.json読込  │  │   │
         │  │ - X API投稿       │  │   │
         │  │ - ステータス更新   │──┼───┘
         │  └──────────────────┘  │
         └────────────┬───────────┘
                      │
                      ▼
              ┌──────────────┐
              │   X (Twitter) │
              │   API v2      │
              └───────────────┘
```

### 技術スタック

**Frontend (Web App)**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Octokit (GitHub API)
- date-fns (Timezone handling)
- lucide-react (Icons)

**Backend (Scheduler)**
- Python 3.11+
- Tweepy (X API v2 client)
- Pydantic (Data validation)
- GitHub Actions (Cron scheduler)

**Data Storage**
- GitHub Repository (`data/posts.json`)

### English

```
┌─────────────────────────────────────────────────────────┐
│                    PostX Web App (Next.js)              │
│  - Create, Edit, Delete posts                           │
│  - Update posts.json via GitHub API                     │
│  - localStorage: GitHub Token storage                   │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
           ┌──────────────────────┐
           │  GitHub Repository   │
           │  └── data/           │
           │      └── posts.json  │◄──┐
           └──────────┬───────────┘   │
                      │                │
                      ▼                │
         ┌────────────────────────┐   │
         │  GitHub Actions        │   │
         │  (Every 15 minutes)    │   │
         │                        │   │
         │  ┌──────────────────┐  │   │
         │  │ Scheduler (Python)│  │   │
         │  │ - Load posts.json │  │   │
         │  │ - Post to X API   │  │   │
         │  │ - Update status   │──┼───┘
         │  └──────────────────┘  │
         └────────────┬───────────┘
                      │
                      ▼
              ┌──────────────┐
              │   X (Twitter) │
              │   API v2      │
              └───────────────┘
```

### Tech Stack

**Frontend (Web App)**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Octokit (GitHub API)
- date-fns (Timezone handling)
- lucide-react (Icons)

**Backend (Scheduler)**
- Python 3.11+
- Tweepy (X API v2 client)
- Pydantic (Data validation)
- GitHub Actions (Cron scheduler)

**Data Storage**
- GitHub Repository (`data/posts.json`)

---

## 開発/本番環境の分離

### 日本語

開発時のテストデータと本番投稿データを分離するため、フォークリポジトリを活用できます。

**推奨運用**

1. **開発用**: オリジナルリポジトリ（`yourname/postx`）
   - Webアプリの開発・テスト
   - テスト投稿の作成・削除
   - X APIへの投稿は行わない（DRY_RUN=true）

2. **本番用**: フォークリポジトリ（`yourname/postx-data`）
   - 実際の投稿データのみ管理
   - GitHub ActionsでX APIへ自動投稿
   - X API Secretsを設定

**切り替え方法**

Webアプリの設定画面で「Owner」「Repo」を変更するだけで切り替え可能。

詳細は [`docs/planning/environment-separation.md`](/docs/planning/environment-separation.md) を参照。

### English

To separate development test data from production posting data, you can use a forked repository.

**Recommended Operation**

1. **Development**: Original repository (`yourname/postx`)
   - Web app development & testing
   - Create/delete test posts
   - No X API posting (DRY_RUN=true)

2. **Production**: Forked repository (`yourname/postx-data`)
   - Manage actual post data only
   - Auto-post to X API via GitHub Actions
   - Configure X API Secrets

**Switching Method**

Simply change "Owner" and "Repo" in the web app settings page.

See [`docs/planning/environment-separation.md`](/docs/planning/environment-separation.md) for details.

---

## トラブルシューティング

### 日本語

**Q: GitHub Actionsが実行されない**

- A: ForkしたリポジトリではデフォルトでActionsが無効です。Actionsタブで「Enable workflows」をクリックしてください。

**Q: 投稿が実行されない**

- A: 以下を確認:
  1. GitHub SecretsにX API認証情報が正しく設定されているか
  2. X Developer Portalでアプリのpermissionが「Read and Write」になっているか
  3. `data/posts.json` に `scheduled_at` が現在時刻より過去の投稿があるか
  4. Actions実行ログでエラーメッセージを確認

**Q: Webアプリでリポジトリに接続できない**

- A: GitHub Personal Access Tokenに `repo` スコープが付与されているか確認してください。

**Q: タイムゾーンがずれる**

- A: `data/posts.json` の `config.timezone` を確認し、正しいタイムゾーン（例: `Asia/Tokyo`）に設定してください。

### English

**Q: GitHub Actions not running**

- A: Actions are disabled by default in forked repositories. Click "Enable workflows" in the Actions tab.

**Q: Posts not being executed**

- A: Check the following:
  1. X API credentials correctly set in GitHub Secrets
  2. App permissions set to "Read and Write" in X Developer Portal
  3. Posts with `scheduled_at` in the past exist in `data/posts.json`
  4. Check error messages in Actions execution logs

**Q: Cannot connect to repository in web app**

- A: Ensure your GitHub Personal Access Token has the `repo` scope.

**Q: Timezone mismatch**

- A: Check `config.timezone` in `data/posts.json` and set the correct timezone (e.g., `Asia/Tokyo`).

---

## ライセンス / License

MIT License

Copyright (c) 2026 PostX Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## 貢献 / Contributing

プルリクエストを歓迎します！バグ報告や機能リクエストはIssueでお願いします。

Pull requests are welcome! For bug reports and feature requests, please open an issue.

---

## サポート / Support

問題が発生した場合は、[GitHub Issues](https://github.com/YOUR_USERNAME/postx/issues) で報告してください。

If you encounter any issues, please report them in [GitHub Issues](https://github.com/YOUR_USERNAME/postx/issues).
