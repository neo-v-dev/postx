# Phase 3: Web UI基盤 - 実装計画書

**作成日時**: 2026-01-31 23:49:45 PST
**フェーズ**: Phase 3 - Web UI基盤構築
**ステータス**: 承認待ち

---

## 1. 実装スコープ

### 1.1 目的

Next.js + Tailwind CSSを使用したWeb UI基盤を構築し、GitHub Pagesでホスティング可能な静的サイトとして出力する。

### 1.2 成果物

| ファイル | 役割 | 優先度 |
|---------|------|--------|
| `web/package.json` | プロジェクト設定、依存関係定義 | 必須 |
| `web/tsconfig.json` | TypeScript設定 | 必須 |
| `web/next.config.js` | Next.js設定（static export） | 必須 |
| `web/tailwind.config.js` | Tailwind CSS設定 | 必須 |
| `web/postcss.config.js` | PostCSS設定 | 必須 |
| `web/src/app/layout.tsx` | ルートレイアウト | 必須 |
| `web/src/app/page.tsx` | ダッシュボードページ（プレースホルダー） | 必須 |
| `web/src/app/globals.css` | グローバルスタイル | 必須 |
| `web/src/lib/utils.ts` | ユーティリティ関数（cn関数） | 必須 |
| `web/src/types/index.ts` | 型定義（posts.jsonスキーマ） | 必須 |

### 1.3 対象外

- GitHub OAuth認証実装（次フェーズ）
- 実際の機能ページ（ダッシュボード、投稿フォーム等）
- shadcn/uiコンポーネント
- GitHub APIクライアント

---

## 2. 実装順序

### フェーズ3-1: プロジェクト設定ファイル（5分）

```
1. web/package.json        # 依存関係定義
2. web/tsconfig.json       # TypeScript設定
3. web/next.config.js      # Next.js設定（static export）
4. web/tailwind.config.js  # Tailwind設定
5. web/postcss.config.js   # PostCSS設定
```

**成功条件**: package.jsonが正しく構文チェック可能

---

### フェーズ3-2: Appディレクトリ基盤（5分）

```
6. web/src/app/globals.css  # Tailwindディレクティブ、CSS変数
7. web/src/app/layout.tsx   # ルートレイアウト
8. web/src/app/page.tsx     # ダッシュボードプレースホルダー
```

**成功条件**: Next.jsのApp Routerが正しく構成される

---

### フェーズ3-3: ライブラリ・型定義（5分）

```
9. web/src/lib/utils.ts      # cn関数（Tailwind Merge）
10. web/src/types/index.ts   # posts.jsonスキーマの型定義
```

**成功条件**: TypeScriptコンパイルエラーなし

---

## 3. ファイル構成

```
web/
├── package.json               # Next.js 14.2.0, React 18.2.0
├── tsconfig.json              # Strict mode, path alias
├── next.config.js             # Static export設定
├── tailwind.config.js         # カスタムテーマ設定
├── postcss.config.js          # Tailwind + Autoprefixer
│
└── src/
    ├── app/
    │   ├── layout.tsx         # Inter font, <html><body>
    │   ├── page.tsx           # "Coming soon..." プレースホルダー
    │   └── globals.css        # @tailwind directives, CSS variables
    │
    ├── lib/
    │   └── utils.ts           # cn関数（clsx + tailwind-merge）
    │
    └── types/
        └── index.ts           # Config, Post, MediaItem, etc.
```

---

## 4. 依存関係

### 4.1 Production依存

| パッケージ | バージョン | 用途 |
|-----------|-----------|------|
| `next` | ^14.2.0 | フレームワーク |
| `react` | ^18.2.0 | UIライブラリ |
| `react-dom` | ^18.2.0 | React DOM |
| `@octokit/rest` | ^20.0.0 | GitHub API（将来使用） |
| `next-auth` | ^4.24.0 | 認証（将来使用） |
| `date-fns` | ^3.0.0 | 日時操作 |
| `date-fns-tz` | ^2.0.0 | タイムゾーン対応 |
| `lucide-react` | ^0.300.0 | アイコン |
| `class-variance-authority` | ^0.7.0 | スタイル管理（shadcn/ui用） |
| `clsx` | ^2.0.0 | クラス名結合 |
| `tailwind-merge` | ^2.0.0 | Tailwindクラス結合 |

### 4.2 Development依存

| パッケージ | バージョン | 用途 |
|-----------|-----------|------|
| `typescript` | ^5.3.0 | 型チェック |
| `@types/node` | ^20.0.0 | Node.js型定義 |
| `@types/react` | ^18.2.0 | React型定義 |
| `@types/react-dom` | ^18.2.0 | React DOM型定義 |
| `tailwindcss` | ^3.4.0 | CSSフレームワーク |
| `postcss` | ^8.4.0 | CSS処理 |
| `autoprefixer` | ^10.4.0 | ベンダープレフィックス |
| `eslint` | ^8.0.0 | Linter |
| `eslint-config-next` | ^14.0.0 | Next.js用ESLint設定 |
| `@playwright/test` | ^1.40.0 | E2Eテスト（将来使用） |
| `jest` | ^29.0.0 | ユニットテスト（将来使用） |
| `@testing-library/react` | ^14.0.0 | テストライブラリ（将来使用） |
| `@testing-library/jest-dom` | ^6.0.0 | Jest DOM拡張（将来使用） |

---

## 5. 設計上の重要ポイント

### 5.1 Static Export設定

```javascript
// next.config.js
module.exports = {
  output: 'export',  // 静的サイト生成
  basePath: process.env.NODE_ENV === 'production' ? '/x-scheduler' : '',
  images: {
    unoptimized: true,  // GitHub Pagesでは画像最適化不可
  },
  trailingSlash: true,
};
```

**理由**: GitHub Pagesでホスティングするため、完全静的なHTMLファイルとして出力する必要がある。

---

### 5.2 CSS変数設計

```css
:root {
  --background: 0 0% 100%;        /* 白背景 */
  --foreground: 222.2 84% 4.9%;   /* ほぼ黒のテキスト */
  --primary: 221.2 83.2% 53.3%;   /* Xブルー系 */
  --radius: 0.5rem;               /* 8px角丸 */
}
```

**理由**: shadcn/uiの標準設計に準拠し、将来のコンポーネント追加を容易にする。

---

### 5.3 TypeScript設定

```json
{
  "compilerOptions": {
    "strict": true,              // 厳格モード
    "moduleResolution": "bundler",
    "paths": {
      "@/*": ["./src/*"]         // @でインポート可能
    }
  }
}
```

**理由**: 型安全性を最大化し、コードの保守性を高める。

---

### 5.4 型定義の構造

```typescript
// web/src/types/index.ts
export interface Post {
  id: string;
  type: 'tweet' | 'thread' | 'repost';
  status: 'pending' | 'posting' | 'posted' | 'failed' | 'cancelled';
  scheduled_at: string;
  // ... （設計書と完全一致）
}
```

**理由**: Pythonスケジューラと型の整合性を保つ。JSON SchemaからTypeScript型への変換が容易。

---

## 6. マイルストーン

| ステップ | 完了条件 | 所要時間 |
|---------|---------|---------|
| **M1: 設定ファイル作成** | package.jsonがvalid | 5分 |
| **M2: Appディレクトリ構築** | layout.tsx, page.tsx作成完了 | 5分 |
| **M3: 型定義作成** | types/index.ts作成完了 | 5分 |
| **M4: ビルド検証** | `npm run build`が成功 | - |

**合計所要時間**: 約15分

---

## 7. リスク評価

| リスク | 発生確率 | 影響度 | 対策 |
|--------|---------|--------|------|
| 依存関係のバージョン競合 | 低 | 中 | 指定バージョン使用 |
| TypeScriptコンパイルエラー | 低 | 低 | 型定義を慎重に設計 |
| Next.js設定ミス | 低 | 中 | 公式ドキュメント参照 |

---

## 8. 事前チェックリスト

- [ ] `/Users/neo/workspace/stream/repo/X-doc`が作業ディレクトリ
- [ ] `web/`ディレクトリが存在しないことを確認
- [ ] 既存のdocs/planning、docs/pre-developmentを確認済み
- [ ] ユーザーの承認を得る

---

## 9. 実装後の検証手順

実装完了後、以下を実行して検証:

```bash
cd /Users/neo/workspace/stream/repo/X-doc/web

# 依存関係インストール
npm install

# TypeScriptコンパイルチェック
npx tsc --noEmit

# Lintチェック
npm run lint

# ビルド検証
npm run build
```

**成功条件**: すべてのコマンドがエラーなく完了する。

---

## 10. 承認

| 役割 | 名前 | 日付 | 署名 |
|------|------|------|------|
| 作成者 | Claude (Orchestrator) | 2026-01-31 | - |
| 承認者 | User | | |

---

## 次フェーズへの引き継ぎ事項

- **Phase 4で実装**: GitHub OAuth認証、実際の機能ページ
- **依存関係**: このフェーズ完了後、Phase 4が開始可能
- **注意事項**: `npm install`は手動実行が必要（または実装時に確認）
