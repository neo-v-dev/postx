# Phase 1 基盤構築 - 実装計画書

**作成日時**: 2026-01-31 23:49:01 PST
**フェーズ**: Phase 1 - 基盤構築
**目的**: Pythonプロジェクト基盤とディレクトリ構造の構築

## 実装概要

X予約投稿システムの基盤となるディレクトリ構造、設定ファイル、および空のモジュールファイルを作成します。すべてのファイルは適切なdocstringを含み、後続フェーズでの実装を容易にします。

## 実装対象ファイル一覧

### 1. ディレクトリ構造

```
/Users/neo/workspace/stream/repo/X-doc/
├── scheduler/                    # Pythonパッケージルート
│   ├── __init__.py              # パッケージ初期化
│   ├── main.py                  # エントリポイント
│   ├── config.py                # 設定管理
│   ├── models.py                # データモデル定義
│   ├── services/                # ビジネスロジック層
│   │   ├── __init__.py
│   │   ├── post_service.py      # 投稿管理
│   │   ├── media_service.py     # メディア管理
│   │   ├── repeat_service.py    # 繰り返し投稿
│   │   ├── limit_service.py     # レート制限
│   │   └── x_api_client.py      # X API クライアント
│   └── utils/                   # ユーティリティ層
│       ├── __init__.py
│       ├── datetime_utils.py    # 日時処理
│       └── git_utils.py         # Git操作
├── data/                        # データ永続化
│   └── posts.json               # 投稿・設定データ
├── media/                       # メディアファイル格納
│   └── .gitkeep
├── scheduler/requirements.txt   # Python依存関係
├── pyproject.toml              # プロジェクト設定
└── .gitignore                  # Git除外設定
```

### 2. 設定ファイル

#### `pyproject.toml`
- ビルドシステム: setuptools
- プロジェクト名: x-scheduler
- Python要件: >=3.11
- 依存関係: tweepy, python-dateutil, pydantic
- 開発依存関係: pytest, pytest-cov

#### `scheduler/requirements.txt`
- tweepy>=4.14.0 (X API v2クライアント)
- python-dateutil>=2.8.2 (日時処理)
- pydantic>=2.0.0 (データバリデーション)
- pytest>=7.0.0 (テストフレームワーク)
- pytest-cov>=4.0.0 (カバレッジ測定)

#### `.gitignore`
- Python: __pycache__, *.pyc, venv/等
- Node: node_modules/, .next/等
- IDE: .idea/, .vscode/等
- OS: .DS_Store, Thumbs.db
- Secrets: .env*, *.pem
- Test: .coverage, .pytest_cache/
- Build: dist/, build/, *.egg-info/

### 3. データファイル

#### `data/posts.json`
初期状態のデータ構造:
```json
{
  "config": {
    "timezone": "Asia/Tokyo",
    "interval_minutes": 15,
    "daily_limit": 17,
    "monthly_limit": 500,
    "retry_max": 3
  },
  "posts": [],
  "history": [],
  "stats": {
    "daily_count": 0,
    "daily_reset_at": "2026-02-01T00:00:00+09:00",
    "monthly_count": 0,
    "monthly_reset_at": "2026-02-01T00:00:00+09:00"
  }
}
```

### 4. Pythonモジュール（空実装 + docstring）

各Pythonファイルには以下を含める:
- モジュールレベルdocstring（目的・責務の説明）
- 適切なインポート構造の準備
- 後続フェーズでの実装を容易にする構造

## 実装順序

### Step 1: ディレクトリ作成
```bash
mkdir -p scheduler/services
mkdir -p scheduler/utils
mkdir -p data
mkdir -p media
```

### Step 2: 空ファイル作成
```bash
touch media/.gitkeep
```

### Step 3: 設定ファイル作成
1. `.gitignore` (プロジェクトルート)
2. `pyproject.toml` (プロジェクトルート)
3. `scheduler/requirements.txt`

### Step 4: データファイル作成
1. `data/posts.json` (初期データ構造)

### Step 5: Pythonモジュール作成
#### パッケージ初期化
1. `scheduler/__init__.py`
2. `scheduler/services/__init__.py`
3. `scheduler/utils/__init__.py`

#### コアモジュール
4. `scheduler/main.py`
5. `scheduler/config.py`
6. `scheduler/models.py`

#### サービス層
7. `scheduler/services/post_service.py`
8. `scheduler/services/media_service.py`
9. `scheduler/services/repeat_service.py`
10. `scheduler/services/limit_service.py`
11. `scheduler/services/x_api_client.py`

#### ユーティリティ層
12. `scheduler/utils/datetime_utils.py`
13. `scheduler/utils/git_utils.py`

## Docstring テンプレート

### モジュールレベル
```python
"""
Module name and purpose.

This module provides...

Responsibilities:
- Responsibility 1
- Responsibility 2

Usage:
    Example usage if applicable
"""
```

### パッケージ __init__.py
```python
"""
Package name.

Brief description of the package.
"""
```

## 依存関係

なし（既存ファイルへの変更なし）

## マイルストーン

- [x] 計画ドキュメント作成
- [ ] ユーザー承認
- [ ] ディレクトリ・ファイル作成
- [ ] 構造検証
- [ ] 開発後ドキュメント作成

## 想定所要時間

約5分（ファイル作成のみ）

## 検証方法

```bash
# ディレクトリ構造確認
tree scheduler/ data/ media/

# Pythonパッケージ構造確認
python -c "import scheduler; print(scheduler.__file__)"

# pyproject.toml構文確認
python -m pip install --dry-run -e .
```

## 次フェーズへの影響

この基盤構築により、Phase 2（データモデル実装）以降の開発がスムーズに進行できます。
