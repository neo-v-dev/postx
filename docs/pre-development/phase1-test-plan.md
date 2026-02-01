# Phase 1 基盤構築 - テスト計画書

**作成日時**: 2026-01-31 23:49:01 PST
**フェーズ**: Phase 1 - 基盤構築
**目的**: ディレクトリ構造とファイル配置の検証

## テスト対象

Phase 1では実装コードがないため、以下の構造的検証を実施します。

### 1. ディレクトリ構造検証

**テスト目的**: 必要なディレクトリが正しく作成されているか確認

| ディレクトリパス | 存在確認 | 備考 |
|-----------------|---------|------|
| `scheduler/` | ✓ | Pythonパッケージルート |
| `scheduler/services/` | ✓ | サービス層 |
| `scheduler/utils/` | ✓ | ユーティリティ層 |
| `data/` | ✓ | データ永続化 |
| `media/` | ✓ | メディアファイル格納 |

**検証コマンド**:
```bash
test -d scheduler && test -d scheduler/services && test -d scheduler/utils && test -d data && test -d media && echo "OK" || echo "FAIL"
```

### 2. ファイル存在検証

**テスト目的**: 必要なファイルが正しく配置されているか確認

#### 設定ファイル

| ファイルパス | 存在確認 | 空可 |
|-------------|---------|------|
| `pyproject.toml` | ✓ | No |
| `.gitignore` | ✓ | No |
| `scheduler/requirements.txt` | ✓ | No |

#### データファイル

| ファイルパス | 存在確認 | 空可 |
|-------------|---------|------|
| `data/posts.json` | ✓ | No |
| `media/.gitkeep` | ✓ | Yes |

#### Pythonモジュール

| ファイルパス | 存在確認 | docstring必須 |
|-------------|---------|--------------|
| `scheduler/__init__.py` | ✓ | Yes |
| `scheduler/main.py` | ✓ | Yes |
| `scheduler/config.py` | ✓ | Yes |
| `scheduler/models.py` | ✓ | Yes |
| `scheduler/services/__init__.py` | ✓ | Yes |
| `scheduler/services/post_service.py` | ✓ | Yes |
| `scheduler/services/media_service.py` | ✓ | Yes |
| `scheduler/services/repeat_service.py` | ✓ | Yes |
| `scheduler/services/limit_service.py` | ✓ | Yes |
| `scheduler/services/x_api_client.py` | ✓ | Yes |
| `scheduler/utils/__init__.py` | ✓ | Yes |
| `scheduler/utils/datetime_utils.py` | ✓ | Yes |
| `scheduler/utils/git_utils.py` | ✓ | Yes |

**検証コマンド**:
```bash
ls -1 scheduler/*.py scheduler/services/*.py scheduler/utils/*.py data/*.json pyproject.toml .gitignore scheduler/requirements.txt media/.gitkeep
```

### 3. Pythonパッケージ構造検証

**テスト目的**: Pythonパッケージとして正しくインポート可能か確認

**検証コマンド**:
```bash
# パッケージインポート確認
python3 -c "import scheduler; print('scheduler package OK')"
python3 -c "import scheduler.services; print('scheduler.services package OK')"
python3 -c "import scheduler.utils; print('scheduler.utils package OK')"

# モジュールインポート確認（構文エラーチェック）
python3 -c "import scheduler.main"
python3 -c "import scheduler.config"
python3 -c "import scheduler.models"
python3 -c "import scheduler.services.post_service"
python3 -c "import scheduler.services.media_service"
python3 -c "import scheduler.services.repeat_service"
python3 -c "import scheduler.services.limit_service"
python3 -c "import scheduler.services.x_api_client"
python3 -c "import scheduler.utils.datetime_utils"
python3 -c "import scheduler.utils.git_utils"
```

### 4. 設定ファイル妥当性検証

**テスト目的**: 設定ファイルが正しい形式か確認

#### pyproject.toml
```bash
# TOML構文検証（pip install toml）
python3 -c "import tomli; tomli.load(open('pyproject.toml', 'rb'))"

# または pip dry-run
pip install --dry-run -e .
```

#### data/posts.json
```bash
# JSON構文検証
python3 -c "import json; json.load(open('data/posts.json'))"
```

#### requirements.txt
```bash
# 依存関係解決可能性確認
pip install --dry-run -r scheduler/requirements.txt
```

### 5. Docstring存在検証

**テスト目的**: すべてのPythonモジュールに適切なdocstringが存在するか確認

**検証スクリプト**:
```python
import ast
import sys
from pathlib import Path

def check_docstring(filepath):
    with open(filepath, 'r') as f:
        tree = ast.parse(f.read())
    docstring = ast.get_docstring(tree)
    if docstring:
        print(f"✓ {filepath}: OK")
        return True
    else:
        print(f"✗ {filepath}: No module docstring")
        return False

modules = [
    'scheduler/__init__.py',
    'scheduler/main.py',
    'scheduler/config.py',
    'scheduler/models.py',
    'scheduler/services/__init__.py',
    'scheduler/services/post_service.py',
    'scheduler/services/media_service.py',
    'scheduler/services/repeat_service.py',
    'scheduler/services/limit_service.py',
    'scheduler/services/x_api_client.py',
    'scheduler/utils/__init__.py',
    'scheduler/utils/datetime_utils.py',
    'scheduler/utils/git_utils.py',
]

results = [check_docstring(m) for m in modules]
sys.exit(0 if all(results) else 1)
```

## テストケース一覧

| ID | テスト内容 | 期待結果 | 優先度 |
|----|----------|---------|--------|
| TC-P1-001 | scheduler/ディレクトリが存在する | 存在する | High |
| TC-P1-002 | scheduler/services/ディレクトリが存在する | 存在する | High |
| TC-P1-003 | scheduler/utils/ディレクトリが存在する | 存在する | High |
| TC-P1-004 | data/ディレクトリが存在する | 存在する | High |
| TC-P1-005 | media/ディレクトリが存在する | 存在する | High |
| TC-P1-006 | pyproject.tomlが存在する | 存在する | High |
| TC-P1-007 | .gitignoreが存在する | 存在する | High |
| TC-P1-008 | scheduler/requirements.txtが存在する | 存在する | High |
| TC-P1-009 | data/posts.jsonが存在する | 存在する | High |
| TC-P1-010 | data/posts.jsonが有効なJSON | パース成功 | High |
| TC-P1-011 | schedulerパッケージがインポート可能 | エラーなし | High |
| TC-P1-012 | すべての.pyファイルにdocstringが存在 | すべて存在 | Medium |
| TC-P1-013 | pyproject.tomlが有効なTOML | パース成功 | Medium |

## カバレッジ目標

Phase 1は構造構築のため、コードカバレッジは適用されません。

**構造カバレッジ**: 100%（すべての必要なファイル・ディレクトリが存在）

## テスト実行方法

### 手動テスト

```bash
# 1. ディレクトリ構造確認
ls -R scheduler/ data/ media/

# 2. Pythonインポートテスト
python3 -c "import scheduler"

# 3. JSON妥当性確認
python3 -c "import json; json.load(open('data/posts.json'))"
```

### 自動テスト

Phase 2以降でpytest統合時に構造検証テストを追加予定。

## 成功基準

- すべてのディレクトリが存在する
- すべてのファイルが存在する
- すべての.pyファイルにmodule docstringが存在する
- data/posts.jsonが有効なJSON形式である
- schedulerパッケージがインポートエラーなく読み込める

## 失敗時の対応

| 失敗パターン | 対応方法 |
|-------------|---------|
| ディレクトリ不足 | mkdir -p で作成 |
| ファイル不足 | touch または内容作成 |
| JSON構文エラー | JSON構文修正 |
| Pythonインポートエラー | 構文エラー修正、__init__.py確認 |
| docstring不足 | モジュールレベルdocstring追加 |

## 次フェーズへの影響

Phase 1の構造検証が完了することで、Phase 2以降のユニットテスト実装がスムーズに進行できます。
