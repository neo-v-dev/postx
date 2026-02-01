# リスク評価書 - ダッシュボードページ実装

**作成日時**: 2026-02-01 00:42:56 PST

## 1. リスク評価マトリクス

| リスクID | リスク内容 | 影響度 | 発生確率 | リスクレベル | 優先度 |
|----------|-----------|--------|---------|------------|--------|
| R001 | globals.cssとの競合 | 中 | 低 | 低 | 3 |
| R002 | lucide-reactアイコン不足 | 低 | 低 | 低 | 4 |
| R003 | モックデータ型不一致 | 中 | 中 | 中 | 2 |
| R004 | レスポンシブ崩れ | 中 | 中 | 中 | 2 |
| R005 | パフォーマンス劣化 | 低 | 低 | 低 | 4 |
| R006 | TypeScriptエラー | 高 | 低 | 中 | 1 |
| R007 | Tailwind設定不足 | 低 | 低 | 低 | 5 |
| R008 | date-fns使用エラー | 中 | 低 | 低 | 3 |

### リスクレベル定義

| レベル | 定義 | 対応方針 |
|--------|------|---------|
| 高 | 影響度"高" かつ 発生確率"中"以上 | 事前回避必須 |
| 中 | 影響度"中" かつ 発生確率"中"以上 | 監視・早期検出 |
| 低 | その他 | 受容・事後対応 |

## 2. 個別リスク詳細

### R001: globals.cssとの競合

**影響度**: 中
**発生確率**: 低
**リスクレベル**: 低

**詳細**:
既存のglobals.cssに定義されたCSS変数やグローバルスタイルと、新規に追加するTailwindクラスが競合する可能性。

**影響範囲**:
- 予期しないスタイル上書き
- カラースキームの不整合
- レイアウト崩れ

**対策**:
1. **事前確認**: globals.cssを読み込み、既存スタイルを把握
2. **Tailwind優先**: `@layer`ディレクティブで優先度制御
3. **クラス名衝突回避**: `cn()`ユーティリティで動的結合

**検証方法**:
```bash
# globals.cssの確認
cat /Users/neo/workspace/stream/repo/X-doc/web/src/app/globals.css
```

**回避策**:
```typescript
// cn()を使用してTailwindクラスを結合
className={cn('existing-class', 'new-tailwind-class')}
```

---

### R002: lucide-reactアイコン不足

**影響度**: 低
**発生確率**: 低
**リスクレベル**: 低

**詳細**:
設計書で選定したアイコン（MessageSquare, ListOrdered, Repeat2, Edit, Trash2, Plus）がlucide-reactに存在しない可能性。

**影響範囲**:
- アイコン表示不可
- デザイン代替案検討必要

**対策**:
1. **事前確認**: lucide-react公式ドキュメントで存在確認済み
   - MessageSquare: ✅ 存在
   - ListOrdered: ✅ 存在（List としても利用可）
   - Repeat2: ✅ 存在
   - Edit: ✅ 存在（Pencil, EditIcon等のエイリアスあり）
   - Trash2: ✅ 存在
   - Plus: ✅ 存在

2. **代替案準備**:
   | 用途 | 第一候補 | 代替候補 |
   |------|---------|---------|
   | tweet | MessageSquare | MessageCircle |
   | thread | ListOrdered | List |
   | repost | Repeat2 | Repeat |
   | 編集 | Edit | Pencil |
   | 削除 | Trash2 | Trash |

**検証方法**:
```typescript
import { MessageSquare, ListOrdered, Repeat2, Edit, Trash2, Plus } from 'lucide-react';
// インポートエラーが出ないことを確認
```

---

### R003: モックデータ型不一致

**影響度**: 中
**発生確率**: 中
**リスクレベル**: 中

**詳細**:
手動で作成するモックデータが、既存の型定義（`/web/src/types/index.ts`）と不一致になる可能性。

**影響範囲**:
- TypeScriptコンパイルエラー
- ランタイムエラー
- 予期しない表示

**対策**:
1. **型アノテーション**: モックデータ定義時に型を明示
   ```typescript
   export const mockPosts: Post[] = [
     // TypeScriptが型チェック
   ];
   ```

2. **必須フィールド確認**: 型定義から必須フィールド抽出
   - ✅ id: string
   - ✅ type: PostType
   - ✅ status: PostStatus
   - ✅ scheduled_at: string
   - ✅ created_at: string
   - ✅ updated_at: string
   - ❓ text?: string（オプション）
   - ❓ media?: MediaItem[]（オプション）

3. **コンパイル時検証**: TypeScriptコンパイラが自動検出

**検証方法**:
```bash
npm run build
# TypeScriptエラーが出ないことを確認
```

**回避策**:
```typescript
// 型安全なヘルパー関数
function createMockPost(partial: Partial<Post> & Pick<Post, 'id' | 'type' | 'status'>): Post {
  return {
    scheduled_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...partial,
  };
}
```

---

### R004: レスポンシブ崩れ

**影響度**: 中
**発生確率**: 中
**リスクレベル**: 中

**詳細**:
モバイル・タブレット・デスクトップでレイアウトが崩れる可能性。

**影響範囲**:
- ユーザビリティ低下
- カード表示崩れ
- オーバーフロー

**対策**:
1. **Tailwindブレークポイント使用**: `md:`, `lg:`プレフィックス
   ```tsx
   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
   ```

2. **テスト環境**:
   - Chrome DevTools → Device Toolbar
   - 確認サイズ:
     - モバイル: 375px（iPhone SE）
     - タブレット: 768px（iPad）
     - デスクトップ: 1280px

3. **オーバーフロー対策**:
   ```tsx
   <p className="truncate">長いテキスト</p>
   ```

**検証方法**:
```
1. Chrome DevTools起動
2. Device Toolbar有効化（Cmd+Shift+M）
3. 各デバイスでレイアウト確認
```

**回避策**:
- モバイルファースト設計
- `min-w-0`でグリッドアイテムの最小幅制御

---

### R005: パフォーマンス劣化

**影響度**: 低
**発生確率**: 低
**リスクレベル**: 低

**詳細**:
投稿一覧のレンダリングやフィルタ処理でパフォーマンスが劣化する可能性。

**影響範囲**:
- UI応答速度低下
- ユーザー体験悪化

**対策**:
1. **useMemo使用**: フィルタ・ソート処理をメモ化
   ```typescript
   const filteredPosts = useMemo(() => {
     // 処理
   }, [selectedFilter]);
   ```

2. **現実的なデータ量**: モックデータ12件（パフォーマンス影響なし）

3. **将来対策**: 100件超える場合は仮想化検討

**検証方法**:
```
Chrome DevTools → Performance
1. ページリロード記録
2. フィルタ切り替え記録
3. レンダリング時間確認（目標: 100ms以内）
```

**回避策**:
- React.memoでPostCard最適化（将来）
- 仮想スクロール（react-window）導入（将来）

---

### R006: TypeScriptエラー

**影響度**: 高
**発生確率**: 低
**リスクレベル**: 中

**詳細**:
型定義の不整合やインポートミスによるTypeScriptエラー。

**影響範囲**:
- ビルド失敗
- 開発停止

**対策**:
1. **厳格な型チェック**: tsconfig.json `strict: true`
2. **VSCode統合**: リアルタイムエラー検出
3. **段階的実装**: ファイル単位でコンパイル確認

**検証方法**:
```bash
# 各ファイル作成後に実施
npx tsc --noEmit
```

**回避策**:
```typescript
// 型推論を活用
const post: Post = { ... }; // 型エラー即検出

// any使用禁止
// ❌ const data: any = ...;
// ✅ const data: Post = ...;
```

---

### R007: Tailwind設定不足

**影響度**: 低
**発生確率**: 低
**リスクレベル**: 低

**詳細**:
必要なTailwindクラスがtailwind.config.jsで有効化されていない可能性。

**影響範囲**:
- スタイル未適用
- カラー変数未定義

**対策**:
1. **事前確認**: tailwind.config.js確認済み
   - ✅ darkMode設定あり
   - ✅ カラー変数定義済み（shadcn/ui風）
   - ✅ content指定: `./src/**/*.{ts,tsx}`

2. **標準クラス使用**: カスタムクラス極力避ける

**検証方法**:
```bash
cat /Users/neo/workspace/stream/repo/X-doc/web/tailwind.config.js
```

**回避策**:
- 標準のTailwindクラスのみ使用
- カスタムカラーは既存のCSS変数活用

---

### R008: date-fns使用エラー

**影響度**: 中
**発生確率**: 低
**リスクレベル**: 低

**詳細**:
date-fnsの関数使用方法誤りや、タイムゾーン処理の不備。

**影響範囲**:
- 日時表示エラー
- タイムゾーン不整合

**対策**:
1. **推奨関数使用**:
   ```typescript
   import { formatDistanceToNow, format } from 'date-fns';
   import { ja } from 'date-fns/locale';

   // 相対時間
   formatDistanceToNow(new Date(scheduledAt), {
     addSuffix: true,
     locale: ja,
   });

   // フォーマット
   format(new Date(scheduledAt), 'yyyy/MM/dd HH:mm');
   ```

2. **日本語ロケール**: `date-fns/locale/ja`インポート

**検証方法**:
```typescript
// 手動テスト
const testDate = '2026-02-01T12:00:00+09:00';
console.log(formatDistanceToNow(new Date(testDate), { addSuffix: true }));
// 期待: "X時間後"
```

**回避策**:
- ISO 8601形式の日時文字列使用
- タイムゾーン明示（+09:00）

## 3. 想定影響範囲

### 影響を受けるファイル

| ファイル | リスク影響 | 影響内容 |
|---------|-----------|---------|
| page.tsx | R001, R003, R004, R006 | スタイル競合、型エラー |
| PostCard.tsx | R002, R004, R006, R008 | アイコン不足、レスポンシブ |
| FilterTabs.tsx | R004, R006 | レスポンシブ崩れ |
| StatusBadge.tsx | R001, R006, R007 | スタイル競合 |
| mock.ts | R003, R006, R008 | 型不一致、日時エラー |
| utils.ts | R006 | 型エラー |

### 影響を受けない領域

- 既存のlayout.tsx
- 既存のglobals.css（読み込みのみ）
- types/index.ts（読み込みのみ）
- package.json（変更なし）

## 4. 事前チェックリスト

実装開始前に以下を確認:

- [ ] globals.cssの内容確認（R001対策）
- [ ] lucide-reactアイコン存在確認（R002対策）
- [ ] types/index.tsの型定義確認（R003対策）
- [ ] tailwind.config.jsの設定確認（R007対策）
- [ ] package.jsonの依存関係確認（全般）
- [ ] VSCode TypeScript有効化（R006対策）

## 5. 実装中の監視項目

| 監視項目 | 確認タイミング | 確認方法 |
|---------|--------------|---------|
| TypeScriptエラー | 各ファイル作成後 | VSCodeエラー表示 |
| インポートエラー | 各ファイル作成後 | `npx tsc --noEmit` |
| スタイル適用 | コンポーネント実装後 | ブラウザ確認 |
| レスポンシブ | ページ統合後 | DevTools確認 |

## 6. 緊急時対応手順

### TypeScriptエラーが解消しない場合

1. エラーメッセージをログに保存
2. 該当ファイルをコメントアウト
3. 段階的に原因特定
4. 型定義を`any`で一時回避（最終手段）

### レスポンシブ崩れが解消しない場合

1. モバイル版のみ実装
2. デスクトップ版を後回し
3. Tailwindブレークポイントを段階的に追加

### ビルド失敗が解消しない場合

1. 新規ファイルを一時削除
2. page.txを既存コードに戻す
3. 個別にファイルを再追加
4. 原因ファイル特定

## 7. リスク受容基準

以下のリスクは受容可能:

- R002（アイコン不足）: 代替アイコンで対応可能
- R005（パフォーマンス）: データ量少なく影響軽微
- R007（Tailwind設定）: 標準クラスで回避可能

## 8. リスク発生時のエスカレーション

| リスクレベル | 対応者 | エスカレーション先 |
|------------|-------|------------------|
| 低 | 実装者 | なし（自己解決） |
| 中 | 実装者 | ユーザーに報告 |
| 高 | 実装者 | 即座にユーザーに報告・承認 |

## 9. 残存リスク

実装完了後も以下のリスクが残存:

| リスク | 内容 | 対策時期 |
|-------|------|---------|
| API統合時の型不一致 | モックから実APIへの移行時 | 次フェーズ |
| 大量データでのパフォーマンス | 100件超える投稿 | 必要時 |
| ブラウザ互換性 | Safari等での表示崩れ | クロスブラウザテスト時 |

## 10. リスク再評価トリガー

以下の変更発生時、リスクを再評価:

- package.jsonの依存関係変更
- types/index.tsの型定義変更
- tailwind.config.jsの設定変更
- Next.jsバージョンアップ
