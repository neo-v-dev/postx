# GitHub API クライアント実装 - 要件定義書

**作成日時**: 2026-02-01 00:43:16 PST

## 1. 目的

X投稿スケジューラーのデータ永続化層として、GitHub API経由で`posts.json`を操作するクライアントライブラリを実装する。

## 2. スコープ

### 対象範囲
- GitHub APIを抽象化した低レベルクライアント（`github-client.ts`）
- posts.jsonを操作する高レベルAPI（`posts-api.ts`）
- 型安全な操作インターフェース

### 対象外
- UI実装
- 認証フロー実装（next-authの既存実装を利用）
- メディアファイルの実際のアップロード処理

## 3. 機能要件

### 3.1 github-client.ts（低レベルAPI）

#### FR-1: ファイル読み込み
- **機能**: `getFileContent(path: string): Promise<{ content: string, sha: string }>`
- **説明**: 指定されたパスのファイル内容とSHA値を取得
- **エラー**: ファイルが存在しない場合はnullを返す

#### FR-2: ファイル更新
- **機能**: `updateFileContent(path: string, content: string, sha: string, message: string): Promise<string>`
- **説明**: ファイルを更新し、新しいSHA値を返す
- **制約**: 競合回避のためSHA値による楽観的ロックを使用

#### FR-3: Blob作成
- **機能**: `createBlob(content: string, encoding: 'base64' | 'utf-8'): Promise<string>`
- **説明**: メディアアップロード用のBlob作成
- **用途**: 将来的なメディアアップロード機能の基盤

#### FR-4: 設定管理
- **機能**: リポジトリowner/repoを環境変数から取得
- **機能**: GitHub tokenをnext-authセッションから取得
- **制約**: tokenがない場合はエラーをスロー

### 3.2 posts-api.ts（高レベルAPI）

#### FR-5: 投稿一覧取得
- **機能**: `getPosts(): Promise<Post[]>`
- **説明**: posts.jsonから全投稿を取得

#### FR-6: 単一投稿取得
- **機能**: `getPost(id: string): Promise<Post | null>`
- **説明**: 指定IDの投稿を取得

#### FR-7: 投稿作成
- **機能**: `createPost(post: Omit<Post, 'id' | 'created_at' | 'updated_at'>): Promise<Post>`
- **説明**: 新規投稿を作成（ID自動生成、タイムスタンプ自動付与）

#### FR-8: 投稿更新
- **機能**: `updatePost(id: string, updates: Partial<Post>): Promise<Post>`
- **説明**: 既存投稿を更新（updated_at自動更新）

#### FR-9: 投稿削除
- **機能**: `deletePost(id: string): Promise<void>`
- **説明**: 投稿を削除（論理削除ではなく物理削除）

#### FR-10: 履歴取得
- **機能**: `getHistory(): Promise<HistoryEntry[]>`
- **説明**: 投稿履歴を取得

#### FR-11: 設定取得
- **機能**: `getConfig(): Promise<Config>`
- **説明**: システム設定を取得

#### FR-12: 設定更新
- **機能**: `updateConfig(config: Partial<Config>): Promise<Config>`
- **説明**: システム設定を更新

#### FR-13: 統計取得
- **機能**: `getStats(): Promise<Stats>`
- **説明**: 投稿統計情報を取得

## 4. 非機能要件

### NFR-1: パフォーマンス
- GitHub APIレート制限: 認証済みユーザー5,000リクエスト/時間
- キャッシュ戦略: クライアント側でのキャッシュは実装せず、呼び出し側に委譲
- レスポンス時間: 通常時3秒以内（GitHub API依存）

### NFR-2: セキュリティ
- GitHub tokenは環境変数またはセッションからのみ取得
- tokenをログに出力しない
- Content-Typeの検証

### NFR-3: 信頼性
- 競合検出: SHA値による楽観的ロック
- エラーハンドリング: すべてのAPI呼び出しでtry-catch
- リトライ: 実装しない（呼び出し側に委譲）

### NFR-4: 保守性
- TypeScript strict mode準拠
- 型定義は既存の`/Users/neo/workspace/stream/repo/X-doc/web/src/types/index.ts`を使用
- ESLint準拠

### NFR-5: 互換性
- Next.js 14.2.0以上
- @octokit/rest 20.0.0以上
- Node.js 20以上

## 5. 制約条件

### 技術的制約
- GitHub APIのレート制限
- posts.jsonのサイズ上限（GitHub: 100MB）
- 同時編集時の競合可能性

### ビジネス的制約
- GitHub有料プランは不要（無料プラン範囲内）
- プライベートリポジトリ対応必須

### 環境的制約
- 環境変数: `GITHUB_OWNER`, `GITHUB_REPO`が必須
- next-authでのGitHub OAuth認証が前提

## 6. 依存関係

### 外部ライブラリ
- `@octokit/rest`: ^20.0.0（既存）
- `next-auth`: ^4.24.0（既存）

### 内部モジュール
- `/Users/neo/workspace/stream/repo/X-doc/web/src/types/index.ts`: 型定義

## 7. 成功基準

- [ ] 全9つのAPIメソッドが型安全に動作
- [ ] 競合時に適切なエラーを返す
- [ ] GitHub APIエラーを適切にハンドリング
- [ ] ESLintエラーなし
- [ ] TypeScriptコンパイルエラーなし
- [ ] ユニットテスト実装（次フェーズ）

## 8. リスク

| リスク | 影響度 | 対策 |
|--------|--------|------|
| GitHub APIレート制限超過 | 中 | レート制限をドキュメント化、監視は呼び出し側で実施 |
| 同時編集による競合 | 中 | SHA値による楽観的ロック、エラーを呼び出し側で処理 |
| tokenの有効期限切れ | 低 | next-authの自動リフレッシュに依存 |
| posts.jsonの破損 | 高 | JSON.parseのエラーハンドリング、バリデーション実装 |

## 9. 前提条件

- GitHub OAuth Appが設定済み
- next-authの認証フローが実装済み
- 環境変数`GITHUB_OWNER`, `GITHUB_REPO`が設定済み
- リポジトリにposts.jsonが存在（または作成可能）
