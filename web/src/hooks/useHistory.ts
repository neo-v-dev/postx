'use client';

import { useState, useEffect, useCallback } from 'react';
import type { HistoryEntry, PostsData } from '@/types';
import { getToken, getRepoConfig, hasToken, hasRepoConfig } from '@/lib/storage';
import { decodeBase64 } from '@/lib/encoding';

export interface UseHistoryResult {
  history: HistoryEntry[];
  isLoading: boolean;
  error: string | null;
  isConfigured: boolean;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching history from GitHub repository
 */
export function useHistory(): UseHistoryResult {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);

  const fetchHistory = useCallback(async () => {
    // Check configuration
    if (!hasToken() || !hasRepoConfig()) {
      setIsConfigured(false);
      setIsLoading(false);
      setHistory([]);
      return;
    }

    setIsConfigured(true);
    setIsLoading(true);
    setError(null);

    const token = getToken();
    const config = getRepoConfig();

    if (!token || !config) {
      setIsLoading(false);
      return;
    }

    try {
      // Fetch posts.json from GitHub API
      const response = await fetch(
        `https://api.github.com/repos/${config.owner}/${config.repo}/contents/posts.json`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );

      if (response.status === 404) {
        // File doesn't exist yet, return empty array
        setHistory([]);
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('認証エラー: トークンが無効か権限が不足しています');
        }
        throw new Error(`GitHub API エラー: ${response.status}`);
      }

      const data = await response.json();

      // Decode base64 content (supports multibyte characters)
      const content = decodeBase64(data.content);
      const postsData: PostsData = JSON.parse(content);

      setHistory(postsData.history || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : '履歴の取得に失敗しました';
      setError(message);
      setHistory([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    history,
    isLoading,
    error,
    isConfigured,
    refetch: fetchHistory,
  };
}
