# 実装計画書 - ダッシュボードページ実装

**作成日時**: 2026-02-01 00:42:56 PST

## 1. 実装順序

### フェーズ1: 基盤整備（20分）
1. ユーティリティ関数作成
2. モックデータ作成
3. 基本コンポーネント構造作成

### フェーズ2: コンポーネント実装（40分）
4. StatusBadgeコンポーネント
5. PostCardコンポーネント
6. FilterTabsコンポーネント
7. EmptyStateコンポーネント

### フェーズ3: ページ統合（20分）
8. page.tsx実装
9. スタイリング調整
10. レスポンシブ確認

### フェーズ4: 動作確認（20分）
11. ビルド確認
12. Lint確認
13. 手動テスト

## 2. ファイル構成

### 新規作成ファイル

```
/Users/neo/workspace/stream/repo/X-doc/web/src/
├── lib/
│   └── utils.ts                        # ユーティリティ関数
├── data/
│   └── mock.ts                         # モックデータ
└── components/
    └── dashboard/
        ├── PostCard.tsx                # 投稿カード
        ├── FilterTabs.tsx              # フィルタタブ
        ├── EmptyState.tsx              # 空状態
        └── StatusBadge.tsx             # ステータスバッジ
```

### 既存ファイル更新

```
/Users/neo/workspace/stream/repo/X-doc/web/src/
└── app/
    └── page.tsx                        # メインページ（全面書き換え）
```

## 3. 詳細実装計画

### 3.1 lib/utils.ts

**ファイルパス**: `/Users/neo/workspace/stream/repo/X-doc/web/src/lib/utils.ts`

**実装内容**:
```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Tailwindクラス結合
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// テキストトランケート
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}
```

**依存関係**:
- clsx: 既存パッケージ
- tailwind-merge: 既存パッケージ

### 3.2 data/mock.ts

**ファイルパス**: `/Users/neo/workspace/stream/repo/X-doc/web/src/data/mock.ts`

**実装内容**:
- 12件のPost型データ
- 各ステータス（pending: 4件、posted: 5件、failed: 3件）
- 各PostType（tweet、thread、repost）を含む
- スケジュール日時: 過去・未来・相対時間のバリエーション

**データサンプル構造**:
```typescript
export const mockPosts: Post[] = [
  {
    id: '1',
    type: 'tweet',
    status: 'pending',
    scheduled_at: '2026-02-01T12:00:00+09:00',
    created_at: '2026-01-30T10:00:00+09:00',
    updated_at: '2026-01-30T10:00:00+09:00',
    text: 'This is a sample tweet scheduled for posting.',
  },
  // ... 11 more
];
```

### 3.3 components/dashboard/StatusBadge.tsx

**ファイルパス**: `/Users/neo/workspace/stream/repo/X-doc/web/src/components/dashboard/StatusBadge.tsx`

**責務**: ステータスバッジの表示

**Props**:
```typescript
interface StatusBadgeProps {
  status: PostStatus;
}
```

**スタイルマッピング**:
```typescript
const statusStyles = {
  pending: 'bg-yellow-100 text-yellow-800',
  posting: 'bg-blue-100 text-blue-800',
  posted: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
};
```

### 3.4 components/dashboard/PostCard.tsx

**ファイルパス**: `/Users/neo/workspace/stream/repo/X-doc/web/src/components/dashboard/PostCard.tsx`

**責務**: 投稿カードの表示

**Props**:
```typescript
interface PostCardProps {
  post: Post;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}
```

**使用コンポーネント**:
- StatusBadge
- lucide-react（MessageSquare, ListOrdered, Repeat2, Edit, Trash2）

**主要機能**:
- PostTypeアイコン表示
- テキストプレビュー（50文字トランケート）
- スケジュール日時の相対表示（date-fns）
- 編集・削除ボタン（現時点ではconsole.log）

### 3.5 components/dashboard/FilterTabs.tsx

**ファイルパス**: `/Users/neo/workspace/stream/repo/X-doc/web/src/components/dashboard/FilterTabs.tsx`

**責務**: ステータスフィルタのタブUI

**Props**:
```typescript
interface FilterTabsProps {
  selected: PostStatus | 'all';
  onChange: (filter: PostStatus | 'all') => void;
  counts: {
    all: number;
    pending: number;
    posted: number;
    failed: number;
  };
}
```

**主要機能**:
- タブクリックでonChangeコールバック発火
- アクティブタブの視覚的フィードバック
- 各タブに件数表示

### 3.6 components/dashboard/EmptyState.tsx

**ファイルパス**: `/Users/neo/workspace/stream/repo/X-doc/web/src/components/dashboard/EmptyState.tsx`

**責務**: 0件時の表示

**Props**:
```typescript
interface EmptyStateProps {
  filter: PostStatus | 'all';
}
```

**主要機能**:
- フィルタに応じたメッセージ表示
- 新規投稿作成への誘導

### 3.7 app/page.tsx

**ファイルパス**: `/Users/neo/workspace/stream/repo/X-doc/web/src/app/page.tsx`

**責務**: メインページ・状態管理・レイアウト

**State**:
```typescript
const [selectedFilter, setSelectedFilter] = useState<PostStatus | 'all'>('all');
```

**Hooks**:
```typescript
// フィルタ済み投稿
const filteredPosts = useMemo(() => {
  if (selectedFilter === 'all') return mockPosts;
  return mockPosts.filter(post => post.status === selectedFilter);
}, [selectedFilter]);

// ソート済み投稿
const sortedPosts = useMemo(() => {
  return [...filteredPosts].sort((a, b) =>
    new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
  );
}, [filteredPosts]);

// カウント
const counts = useMemo(() => ({
  all: mockPosts.length,
  pending: mockPosts.filter(p => p.status === 'pending').length,
  posted: mockPosts.filter(p => p.status === 'posted').length,
  failed: mockPosts.filter(p => p.status === 'failed').length,
}), []);
```

**レイアウト構造**:
```tsx
<main className="min-h-screen p-8 bg-background">
  <div className="max-w-7xl mx-auto">
    {/* Header */}
    <div className="flex justify-between items-center mb-8">
      <h1>X Scheduler</h1>
      <button>+ 新規投稿</button>
    </div>

    {/* Filter Tabs */}
    <FilterTabs ... />

    {/* Post List or Empty State */}
    {sortedPosts.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {sortedPosts.map(post => (
          <PostCard key={post.id} post={post} ... />
        ))}
      </div>
    ) : (
      <EmptyState filter={selectedFilter} />
    )}
  </div>
</main>
```

## 4. 依存関係グラフ

```
page.tsx
├── FilterTabs.tsx
├── PostCard.tsx
│   └── StatusBadge.tsx
├── EmptyState.tsx
├── lib/utils.ts
└── data/mock.ts
```

## 5. インポート戦略

### パスエイリアス（tsconfig.json想定）

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### インポート例

```typescript
// page.tsx
import { mockPosts } from '@/data/mock';
import { PostCard } from '@/components/dashboard/PostCard';
import { FilterTabs } from '@/components/dashboard/FilterTabs';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { cn } from '@/lib/utils';
```

## 6. マイルストーン

| No. | タスク | 成果物 | 所要時間 |
|-----|--------|--------|----------|
| 1 | utils.ts作成 | cn, truncateText関数 | 5分 |
| 2 | mock.ts作成 | 12件のモックデータ | 10分 |
| 3 | StatusBadge.tsx作成 | ステータスバッジコンポーネント | 5分 |
| 4 | PostCard.tsx作成 | 投稿カードコンポーネント | 15分 |
| 5 | FilterTabs.tsx作成 | フィルタタブコンポーネント | 10分 |
| 6 | EmptyState.tsx作成 | 空状態コンポーネント | 5分 |
| 7 | page.tsx実装 | メインページ | 15分 |
| 8 | スタイリング調整 | レスポンシブ対応 | 10分 |
| 9 | ビルド確認 | `npm run build`成功 | 5分 |
| 10 | Lint確認 | `npm run lint`エラー0件 | 5分 |

**合計所要時間**: 約85分

## 7. 確認項目

### ビルド時
- [ ] TypeScriptコンパイルエラー: 0件
- [ ] ESLintエラー: 0件
- [ ] Next.jsビルド成功

### 動作確認
- [ ] 初期表示で全投稿が表示される
- [ ] フィルタタブクリックでフィルタリングされる
- [ ] 日付順（近い順）でソートされている
- [ ] 各カードに必要な情報が表示される
- [ ] デスクトップで3カラム表示
- [ ] タブレットで2カラム表示
- [ ] モバイルで1カラム表示
- [ ] 空状態が表示される（フィルタで0件時）
- [ ] 編集・削除ボタンクリックでconsole.log出力

### アクセシビリティ
- [ ] ボタンにaria-labelがある
- [ ] セマンティックHTMLが使用されている
- [ ] キーボードでタブ移動できる

## 8. リスク対策

| リスク | 対策 |
|--------|------|
| globals.cssとの競合 | 既存スタイルを事前確認済み |
| アイコンの不足 | lucide-reactの公式ドキュメントで確認済み |
| モックデータの型不一致 | TypeScriptの型チェックで事前検出 |
| レスポンシブ崩れ | ブラウザDevToolsで3サイズ確認 |

## 9. ロールバック計画

万が一問題が発生した場合:

1. 新規作成ファイルを削除
   ```bash
   rm -rf /Users/neo/workspace/stream/repo/X-doc/web/src/lib
   rm -rf /Users/neo/workspace/stream/repo/X-doc/web/src/data
   rm -rf /Users/neo/workspace/stream/repo/X-doc/web/src/components/dashboard
   ```

2. page.txを元に戻す（既存コードは10行のみ）
   ```tsx
   export default function Home() {
     return (
       <main className="min-h-screen p-8">
         <div className="max-w-6xl mx-auto">
           <h1 className="text-3xl font-bold mb-8">X Scheduler</h1>
           <p className="text-muted-foreground">
             Coming soon...
           </p>
         </div>
       </main>
     );
   }
   ```

## 10. 次フェーズへの引き継ぎ事項

実装完了後、以下を次フェーズ（GitHub API統合）へ引き継ぐ:

- モックデータをAPI呼び出しに置き換え
- 編集・削除ボタンの実装
- ローディング状態の追加
- エラーハンドリングの追加
- 楽観的更新の実装
