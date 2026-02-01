'use client';

import { useState, FormEvent, useCallback } from 'react';
import { Key, Github, Check, X, AlertCircle, Loader2, ExternalLink, Trash2 } from 'lucide-react';
import { useGitHubToken } from '@/hooks/useGitHubToken';
import { cn } from '@/lib/utils';

interface TokenSetupProps {
  onConfigured?: () => void;
}

export function TokenSetup({ onConfigured }: TokenSetupProps) {
  const { isConfigured, repoConfig, isLoading, error, saveConfig, clearConfig, testConnection } =
    useGitHubToken();

  const [formData, setFormData] = useState({
    token: '',
    owner: repoConfig?.owner || '',
    repo: repoConfig?.repo || '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setFormError(null);
      setTestResult(null);

      // Validation
      if (!formData.token.trim()) {
        setFormError('トークンを入力してください');
        return;
      }
      if (!formData.owner.trim()) {
        setFormError('オーナー名を入力してください');
        return;
      }
      if (!formData.repo.trim()) {
        setFormError('リポジトリ名を入力してください');
        return;
      }

      // Token format validation (fine-grained token starts with github_pat_)
      const token = formData.token.trim();
      if (!token.startsWith('github_pat_') && !token.startsWith('ghp_')) {
        setFormError('無効なトークン形式です。Fine-grained token (github_pat_) または Classic token (ghp_) を入力してください');
        return;
      }

      // Save configuration
      saveConfig(token, {
        owner: formData.owner.trim(),
        repo: formData.repo.trim(),
      });

      // Test connection
      setIsTesting(true);
      const success = await testConnection();
      setIsTesting(false);

      if (success) {
        setTestResult('success');
        onConfigured?.();
      } else {
        setTestResult('error');
      }
    },
    [formData, saveConfig, testConnection, onConfigured]
  );

  // Handle clear configuration
  const handleClear = useCallback(() => {
    clearConfig();
    setFormData({ token: '', owner: '', repo: '' });
    setTestResult(null);
    setFormError(null);
  }, [clearConfig]);

  // Handle connection test
  const handleTestConnection = useCallback(async () => {
    setIsTesting(true);
    setTestResult(null);
    const success = await testConnection();
    setIsTesting(false);
    setTestResult(success ? 'success' : 'error');
  }, [testConnection]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  // Configured state
  if (isConfigured && repoConfig) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-800">GitHub接続済み</p>
            <p className="text-sm text-green-600">
              {repoConfig.owner}/{repoConfig.repo}
            </p>
          </div>
        </div>

        {testResult === 'success' && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <Check className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-700">接続テスト成功</span>
          </div>
        )}

        {(testResult === 'error' || error) && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-700">{error || '接続テスト失敗'}</span>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isTesting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                テスト中...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                接続テスト
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            設定をクリア
          </button>
        </div>
      </div>
    );
  }

  // Setup form
  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-2">
          <Key className="w-4 h-4" />
          GitHub Personal Access Token (PAT) の設定
        </h4>
        <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
          <li>
            <a
              href="https://github.com/settings/tokens?type=beta"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-blue-900 inline-flex items-center gap-1"
            >
              GitHubのトークン設定ページ <ExternalLink className="w-3 h-3" />
            </a>
            にアクセス
          </li>
          <li>&quot;Generate new token&quot; → &quot;Fine-grained token&quot; を選択</li>
          <li>Repository access: 対象リポジトリを選択</li>
          <li>Permissions → Contents: Read and write を設定</li>
          <li>生成されたトークンを下記に入力</li>
        </ol>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Token Input */}
        <div>
          <label htmlFor="github-token" className="block text-sm font-medium text-gray-700 mb-1">
            Personal Access Token
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Key className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="password"
              id="github-token"
              value={formData.token}
              onChange={(e) => setFormData({ ...formData, token: e.target.value })}
              placeholder="github_pat_..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </div>

        {/* Owner Input */}
        <div>
          <label htmlFor="github-owner" className="block text-sm font-medium text-gray-700 mb-1">
            オーナー名（ユーザー名または組織名）
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Github className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              id="github-owner"
              value={formData.owner}
              onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
              placeholder="your-username"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </div>

        {/* Repo Input */}
        <div>
          <label htmlFor="github-repo" className="block text-sm font-medium text-gray-700 mb-1">
            リポジトリ名
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Github className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              id="github-repo"
              value={formData.repo}
              onChange={(e) => setFormData({ ...formData, repo: e.target.value })}
              placeholder="postx"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </div>

        {/* Error Message */}
        {(formError || error) && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <X className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span className="text-sm text-red-700">{formError || error}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isTesting}
          className={cn(
            'w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white',
            isTesting
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          )}
        >
          {isTesting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              接続テスト中...
            </>
          ) : (
            <>
              <Check className="w-4 h-4 mr-2" />
              保存して接続テスト
            </>
          )}
        </button>
      </form>
    </div>
  );
}
