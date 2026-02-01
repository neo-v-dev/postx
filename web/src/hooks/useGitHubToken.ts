'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getToken,
  setToken as saveToken,
  clearToken,
  getRepoConfig,
  setRepoConfig,
  clearRepoConfig,
  hasToken as checkHasToken,
  hasRepoConfig as checkHasRepoConfig,
  type RepoConfig,
} from '@/lib/storage';
import { GitHubClient, GitHubAuthError } from '@/lib/github-client';

export interface GitHubTokenState {
  token: string | null;
  repoConfig: RepoConfig | null;
  isConfigured: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface UseGitHubTokenResult extends GitHubTokenState {
  saveConfig: (token: string, config: RepoConfig) => void;
  clearConfig: () => void;
  testConnection: () => Promise<boolean>;
}

/**
 * Hook for managing GitHub token and repository configuration
 */
export function useGitHubToken(): UseGitHubTokenResult {
  const [state, setState] = useState<GitHubTokenState>({
    token: null,
    repoConfig: null,
    isConfigured: false,
    isLoading: true,
    error: null,
  });

  // Load token and config from localStorage on mount
  useEffect(() => {
    const token = getToken();
    const repoConfig = getRepoConfig();
    const isConfigured = checkHasToken() && checkHasRepoConfig();

    setState({
      token,
      repoConfig,
      isConfigured,
      isLoading: false,
      error: null,
    });
  }, []);

  // Save token and repository configuration
  const saveConfig = useCallback((token: string, config: RepoConfig) => {
    saveToken(token);
    setRepoConfig(config);

    setState({
      token,
      repoConfig: config,
      isConfigured: true,
      isLoading: false,
      error: null,
    });
  }, []);

  // Clear token and repository configuration
  const clearConfig = useCallback(() => {
    clearToken();
    clearRepoConfig();

    setState({
      token: null,
      repoConfig: null,
      isConfigured: false,
      isLoading: false,
      error: null,
    });
  }, []);

  // Test connection to GitHub API
  const testConnection = useCallback(async (): Promise<boolean> => {
    const token = getToken();
    const repoConfig = getRepoConfig();

    if (!token || !repoConfig) {
      setState(prev => ({
        ...prev,
        error: 'トークンまたはリポジトリ設定がありません',
      }));
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const client = new GitHubClient({
        token,
        owner: repoConfig.owner,
        repo: repoConfig.repo,
      });

      // Try to get posts.json to verify access
      await client.getFileContent('posts.json');

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: null,
      }));

      return true;
    } catch (error) {
      let errorMessage = '接続テストに失敗しました';

      if (error instanceof GitHubAuthError) {
        errorMessage = 'トークンが無効か、権限が不足しています';
      } else if (error instanceof Error) {
        if (error.message.includes('Not Found')) {
          // posts.json doesn't exist yet, but connection is OK
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: null,
          }));
          return true;
        }
        errorMessage = error.message;
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      return false;
    }
  }, []);

  return {
    ...state,
    saveConfig,
    clearConfig,
    testConnection,
  };
}

/**
 * Create a GitHubClient from stored configuration
 * Returns null if not configured
 */
export function createStoredGitHubClient(): GitHubClient | null {
  const token = getToken();
  const repoConfig = getRepoConfig();

  if (!token || !repoConfig) {
    return null;
  }

  return new GitHubClient({
    token,
    owner: repoConfig.owner,
    repo: repoConfig.repo,
  });
}
