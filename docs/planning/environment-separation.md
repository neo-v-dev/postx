# 環境分離計画: 開発/本番データの分離

作成日: 2026-02-01 02:59:00 PST

## 背景

PostXの現在のアーキテクチャでは、開発時のテストデータと本番投稿データが混在するリスクがある。

### 現状の問題

| 問題 | 説明 |
|------|------|
| ファイルパス固定 | `posts.json` がハードコードされている |
| 環境分離なし | 開発/本番の切り替え機能がない |
| ブランチ指定なし | デフォルトブランチ（main）のみ対応 |
| コミット混在 | アプリ更新時に不要なJSONデータがコミットに含まれる |

### データフロー（現状）

```
PostX Web App
     │
     ▼
GitHub Repository (ユーザー指定)
└── posts.json  ← 開発テストも本番投稿もここに混在
```

## 解決策: フォークリポジトリによる分離

### 概要

開発用リポジトリと投稿データ用リポジトリ（フォーク）を分離する。

```
開発用リポジトリ (postx)              投稿用リポジトリ (postx-data)
├── web/                              ├── web/（使用しない）
├── scheduler/                        ├── scheduler/ ← GitHub Actionsで投稿実行
├── docs/                             └── posts.json ← 本番投稿データのみ
└── posts.json（開発テスト用、gitignore推奨）
```

### 運用フロー

#### 初期セットアップ

1. **PostXリポジトリをフォーク**
   - GitHub上でForkボタンをクリック
   - 例: `neo-v-dev/postx` → `neo-v-dev/postx-data`

2. **フォークにGitHub Secrets設定**
   - Settings > Secrets and variables > Actions
   - `X_BEARER_TOKEN`: X(Twitter) APIのBearer Token

3. **GitHub Actionsを有効化**
   - フォークではActionsがデフォルト無効
   - Actions タブで「Enable」をクリック

#### 日常運用

| 用途 | リポジトリ | 設定 |
|------|-----------|------|
| 開発・テスト | `postx`（オリジナル） | Owner: 自分, Repo: postx |
| 本番投稿 | `postx-data`（フォーク） | Owner: 自分, Repo: postx-data |

#### 切り替え方法

PostX Webアプリの設定画面（/settings）で：
- **Owner**: リポジトリオーナー名
- **Repo**: リポジトリ名

を変更することで切り替え可能。

### メリット

| 項目 | 効果 |
|------|------|
| データ分離 | 開発テストデータと本番データが完全分離 |
| クリーンなコミット | アプリ更新にJSONデータが含まれない |
| 独立した運用 | scheduler/のActionsが投稿用リポジトリで独立動作 |

### デメリット・注意点

| 項目 | 対応 |
|------|------|
| 手動切り替え | 現状は設定画面で毎回変更が必要 |
| フォーク同期 | scheduler/の更新時は手動でフォークを同期 |
| 複数環境保持不可 | localStorageに1セットのみ保存 |

## 将来の改善案（オプション）

### A. プロファイル切り替え機能

設定画面で「開発用」「本番用」をワンクリックで切り替え。

```
設定画面
├── [開発用] neo-v-dev/postx
└── [本番用] neo-v-dev/postx-data  ← ワンクリックで切り替え
```

### B. 環境変数によるデフォルト設定

```env
NEXT_PUBLIC_DEFAULT_OWNER=neo-v-dev
NEXT_PUBLIC_DEFAULT_REPO=postx-data
```

### C. ファイルパス分離

```
posts.dev.json  ← 開発用
posts.json      ← 本番用
```

### D. ブランチ分離

```
main ブランチ     ← 本番投稿
develop ブランチ  ← 開発テスト
```

## 推奨アクション

1. **即時対応**: フォークによる分離を運用で実施
2. **短期改善**: 開発用リポジトリの`posts.json`を`.gitignore`に追加
3. **中期改善**: プロファイル切り替え機能の実装（オプション）

## 関連ファイル

| ファイル | 役割 |
|----------|------|
| `web/src/lib/storage.ts` | localStorage管理（トークン・リポジトリ設定） |
| `web/src/app/settings/page.tsx` | 設定画面 |
| `web/src/hooks/useCreatePost.ts` | 投稿作成（GitHub API呼び出し） |
| `scheduler/` | GitHub Actionsによる自動投稿 |
