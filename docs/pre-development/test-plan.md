# テスト計画書 - ダッシュボードページ実装

**作成日時**: 2026-02-01 00:42:56 PST

## 1. テスト戦略

### 現フェーズ（手動テスト）
- ブラウザでの動作確認
- レスポンシブデザイン確認
- TypeScript/ESLintエラー確認

### 将来フェーズ（自動テスト）
- Jest + React Testing Library
- Playwright E2Eテスト

## 2. テスト対象

### 2.1 コンポーネント

| コンポーネント | テスト観点 | 優先度 |
|--------------|-----------|--------|
| StatusBadge | ステータス別スタイル表示 | 高 |
| PostCard | Props変化時の表示 | 高 |
| FilterTabs | クリック時のコールバック | 高 |
| EmptyState | フィルタ別メッセージ | 中 |
| page.tsx | 状態管理・統合動作 | 高 |

### 2.2 ユーティリティ関数

| 関数 | テスト観点 | 優先度 |
|------|-----------|--------|
| cn() | クラス結合・競合解決 | 中 |
| truncateText() | 境界値・特殊文字 | 高 |

## 3. 手動テストケース

### 3.1 初期表示

| ID | テストケース | 期待結果 | 確認方法 |
|----|------------|---------|---------|
| T001 | ページ初期表示 | 全投稿（12件）が表示される | ブラウザ確認 |
| T002 | デフォルトフィルタ | "All"タブがアクティブ | 視覚確認 |
| T003 | 日付ソート | スケジュール日時の近い順 | 各カードの日時確認 |
| T004 | カウント表示 | 各タブに正しい件数 | タブのバッジ確認 |

### 3.2 フィルタ機能

| ID | テストケース | 操作 | 期待結果 |
|----|------------|------|---------|
| T101 | Pendingフィルタ | Pendingタブクリック | pending投稿のみ表示（4件） |
| T102 | Postedフィルタ | Postedタブクリック | posted投稿のみ表示（5件） |
| T103 | Failedフィルタ | Failedタブクリック | failed投稿のみ表示（3件） |
| T104 | Allフィルタ | Allタブクリック | 全投稿表示（12件） |
| T105 | 空状態 | 0件のフィルタ選択 | EmptyState表示 |

### 3.3 投稿カード表示

| ID | テストケース | 確認項目 | 期待結果 |
|----|------------|---------|---------|
| T201 | Tweetアイコン | type='tweet' | MessageSquareアイコン |
| T202 | Threadアイコン | type='thread' | ListOrderedアイコン |
| T203 | Repostアイコン | type='repost' | Repeat2アイコン |
| T204 | ステータスバッジ | status='pending' | 黄色バッジ"Pending" |
| T205 | ステータスバッジ | status='posted' | 緑色バッジ"Posted" |
| T206 | ステータスバッジ | status='failed' | 赤色バッジ"Failed" |
| T207 | テキストプレビュー | 50文字超 | "...で切り捨て |
| T208 | スケジュール日時 | scheduled_at | 相対時間表示（例: "2時間後"） |
| T209 | 編集ボタン | ボタンクリック | console.logに"Edit: {id}"出力 |
| T210 | 削除ボタン | ボタンクリック | console.logに"Delete: {id}"出力 |

### 3.4 レスポンシブデザイン

| ID | テストケース | 画面幅 | 期待結果 |
|----|------------|-------|---------|
| T301 | デスクトップ | 1024px以上 | 3カラムグリッド |
| T302 | タブレット | 768px-1023px | 2カラムグリッド |
| T303 | モバイル | 768px未満 | 1カラムリスト |
| T304 | 新規投稿ボタン | 全サイズ | 常に右上に表示 |
| T305 | タブ表示 | モバイル | 横スクロール可能 |

### 3.5 インタラクション

| ID | テストケース | 操作 | 期待結果 |
|----|------------|------|---------|
| T401 | 新規投稿ボタン | クリック | console.logに"Create new post"出力 |
| T402 | キーボード操作 | Tab | フォーカス移動可能 |
| T403 | キーボード操作 | Enter（ボタン） | クリック相当の動作 |

## 4. テストデータ

### モックデータ要件

```typescript
// /Users/neo/workspace/stream/repo/X-doc/web/src/data/mock.ts

export const mockPosts: Post[] = [
  // Pending: 4件
  { id: '1', status: 'pending', type: 'tweet', ... },
  { id: '2', status: 'pending', type: 'thread', ... },
  { id: '3', status: 'pending', type: 'repost', ... },
  { id: '4', status: 'pending', type: 'tweet', ... },

  // Posted: 5件
  { id: '5', status: 'posted', type: 'tweet', ... },
  { id: '6', status: 'posted', type: 'thread', ... },
  { id: '7', status: 'posted', type: 'repost', ... },
  { id: '8', status: 'posted', type: 'tweet', ... },
  { id: '9', status: 'posted', type: 'tweet', ... },

  // Failed: 3件
  { id: '10', status: 'failed', type: 'tweet', ... },
  { id: '11', status: 'failed', type: 'thread', ... },
  { id: '12', status: 'failed', type: 'tweet', ... },
];
```

### 境界値テストデータ

| 観点 | データ | 期待動作 |
|------|-------|---------|
| テキスト長: 0文字 | text: undefined | "テキストなし"等の表示 |
| テキスト長: 49文字 | text: "A".repeat(49) | そのまま表示 |
| テキスト長: 50文字 | text: "A".repeat(50) | そのまま表示 |
| テキスト長: 51文字 | text: "A".repeat(51) | 50文字 + "..." |
| スケジュール: 過去 | scheduled_at: 過去日時 | "X時間前" |
| スケジュール: 未来 | scheduled_at: 未来日時 | "X時間後" |

## 5. エラーケース

### TypeScript/ESLintエラー

| ID | エラー種別 | 確認方法 | 対処 |
|----|-----------|---------|------|
| E001 | TypeScriptコンパイルエラー | `npm run build` | 型定義修正 |
| E002 | ESLintエラー | `npm run lint` | コード修正 |
| E003 | 未使用インポート | `npm run lint` | インポート削除 |
| E004 | 型不一致 | VSCode TypeScript | 型アサーション修正 |

## 6. パフォーマンステスト

### 現フェーズ（目視確認）

| ID | テスト項目 | 基準 | 確認方法 |
|----|-----------|------|---------|
| P001 | 初期レンダリング | 100ms以内 | Chrome DevTools Performance |
| P002 | フィルタ切り替え | 瞬時（16ms以内） | 体感確認 |
| P003 | バンドルサイズ | +50KB以内 | `npm run build`出力 |

## 7. アクセシビリティテスト

| ID | テスト項目 | 確認方法 | 基準 |
|----|-----------|---------|------|
| A001 | セマンティックHTML | ブラウザDevTools | `<main>`, `<article>`, `<button>`使用 |
| A002 | ARIAラベル | ブラウザDevTools | アイコンボタンにaria-label |
| A003 | キーボード操作 | 手動操作 | Tabでフォーカス移動可能 |
| A004 | フォーカス表示 | 手動操作 | フォーカス時にアウトライン表示 |

## 8. クロスブラウザテスト（将来実装）

| ブラウザ | バージョン | 優先度 |
|---------|-----------|--------|
| Chrome | 最新 | 高 |
| Safari | 最新 | 高 |
| Firefox | 最新 | 中 |
| Edge | 最新 | 中 |

## 9. 自動テストケース（将来実装）

### 9.1 StatusBadge.test.tsx

```typescript
describe('StatusBadge', () => {
  it('renders pending status with yellow badge', () => {
    render(<StatusBadge status="pending" />);
    expect(screen.getByText('Pending')).toHaveClass('bg-yellow-100');
  });

  it('renders posted status with green badge', () => {
    render(<StatusBadge status="posted" />);
    expect(screen.getByText('Posted')).toHaveClass('bg-green-100');
  });

  it('renders failed status with red badge', () => {
    render(<StatusBadge status="failed" />);
    expect(screen.getByText('Failed')).toHaveClass('bg-red-100');
  });
});
```

### 9.2 PostCard.test.tsx

```typescript
describe('PostCard', () => {
  const mockPost: Post = {
    id: '1',
    type: 'tweet',
    status: 'pending',
    scheduled_at: '2026-02-01T12:00:00+09:00',
    created_at: '2026-01-30T10:00:00+09:00',
    updated_at: '2026-01-30T10:00:00+09:00',
    text: 'Test tweet content',
  };

  it('renders tweet icon for type="tweet"', () => {
    render(<PostCard post={mockPost} />);
    expect(screen.getByTestId('tweet-icon')).toBeInTheDocument();
  });

  it('truncates text longer than 50 characters', () => {
    const longText = 'A'.repeat(60);
    render(<PostCard post={{ ...mockPost, text: longText }} />);
    expect(screen.getByText(/^A{50}\.\.\./)).toBeInTheDocument();
  });

  it('calls onEdit when edit button clicked', () => {
    const onEdit = jest.fn();
    render(<PostCard post={mockPost} onEdit={onEdit} />);
    fireEvent.click(screen.getByLabelText('投稿を編集'));
    expect(onEdit).toHaveBeenCalledWith('1');
  });
});
```

### 9.3 page.test.tsx

```typescript
describe('Dashboard Page', () => {
  it('renders all posts initially', () => {
    render(<Home />);
    expect(screen.getAllByRole('article')).toHaveLength(12);
  });

  it('filters posts when pending tab clicked', () => {
    render(<Home />);
    fireEvent.click(screen.getByText('Pending'));
    expect(screen.getAllByRole('article')).toHaveLength(4);
  });

  it('shows empty state when no posts match filter', () => {
    // Mock data with 0 cancelled posts
    render(<Home />);
    fireEvent.click(screen.getByText('Cancelled'));
    expect(screen.getByText(/投稿がありません/)).toBeInTheDocument();
  });
});
```

## 10. カバレッジ目標

### 現フェーズ
- 手動テスト: 100%実施

### 将来フェーズ
- ユニットテスト: 80%以上
- E2Eテスト: 主要フロー100%

## 11. テスト実施手順

### ステップ1: ビルド確認

```bash
cd /Users/neo/workspace/stream/repo/X-doc/web
npm run build
```

**期待結果**:
- ビルド成功
- TypeScriptエラー: 0件
- 警告: 0件（推奨）

### ステップ2: Lint確認

```bash
npm run lint
```

**期待結果**:
- ESLintエラー: 0件

### ステップ3: 開発サーバー起動

```bash
npm run dev
```

**期待結果**:
- サーバー起動成功
- http://localhost:3000 でアクセス可能

### ステップ4: 手動テスト実施

1. **初期表示確認**: T001-T004
2. **フィルタ機能**: T101-T105
3. **投稿カード**: T201-T210
4. **レスポンシブ**: T301-T305（Chrome DevToolsで確認）
5. **インタラクション**: T401-T403
6. **Console確認**: ボタンクリック時のログ出力

### ステップ5: パフォーマンス確認

1. Chrome DevTools → Performance タブ
2. ページリロード → 記録
3. 初期レンダリング時間確認

## 12. テスト合格基準

### 必須
- [ ] TypeScriptエラー: 0件
- [ ] ESLintエラー: 0件
- [ ] ビルド成功
- [ ] 手動テストケース T001-T004: 全件合格
- [ ] 手動テストケース T101-T105: 全件合格
- [ ] 手動テストケース T201-T210: 全件合格

### 推奨
- [ ] 手動テストケース T301-T305: 全件合格
- [ ] 手動テストケース T401-T403: 全件合格
- [ ] パフォーマンス P001-P003: 基準内
- [ ] アクセシビリティ A001-A004: 全件合格

## 13. 不具合管理

### 不具合報告テンプレート

```markdown
## 不具合ID: BUG-XXX

**重要度**: 高/中/低
**再現手順**:
1. ...
2. ...

**期待結果**: ...
**実際の結果**: ...
**環境**: Chrome 120, macOS 14
**スクリーンショット**: (添付)
```

### 重要度定義

| 重要度 | 定義 | 対処タイミング |
|-------|------|--------------|
| 高 | 機能が動作しない、TypeScriptエラー | 即座 |
| 中 | 表示崩れ、パフォーマンス劣化 | 次回修正 |
| 低 | 軽微なスタイル不整合 | 将来改善 |

## 14. テスト完了条件

以下すべてを満たした場合、テスト完了とする:

1. 必須の手動テストケース全件合格
2. TypeScript/ESLintエラー0件
3. ビルド成功
4. 重要度"高"の不具合0件
5. レスポンシブデザイン動作確認（3サイズ）

## 15. 次フェーズへの引き継ぎ

テスト完了後、以下を次フェーズ（GitHub API統合）へ引き継ぐ:

- 発見した不具合リスト（重要度"中"以下）
- パフォーマンス測定結果
- ユーザビリティ改善提案
