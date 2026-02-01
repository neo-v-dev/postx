'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Post, PostsData } from '@/types';
import { getToken, getRepoConfig, hasToken, hasRepoConfig } from '@/lib/storage';
import { decodeBase64 } from '@/lib/encoding';

export interface UsePostResult {
  post: Post | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching a single post from GitHub repository
 */
export function usePost(postId: string | null): UsePostResult {
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPost = useCallback(async () => {
    if (!postId) {
      setPost(null);
      setIsLoading(false);
      return;
    }

    if (!hasToken() || !hasRepoConfig()) {
      setError('GitHub接続が設定されていません');
      setIsLoading(false);
      return;
    }

    const token = getToken();
    const config = getRepoConfig();

    if (!token || !config) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
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
        throw new Error('posts.jsonが見つかりません');
      }

      if (!response.ok) {
        throw new Error(`GitHub API エラー: ${response.status}`);
      }

      const data = await response.json();
      const content = decodeBase64(data.content);
      const postsData: PostsData = JSON.parse(content);

      const foundPost = postsData.posts.find(p => p.id === postId);
      if (!foundPost) {
        throw new Error('投稿が見つかりません');
      }

      setPost(foundPost);
    } catch (err) {
      const message = err instanceof Error ? err.message : '投稿の取得に失敗しました';
      setError(message);
      setPost(null);
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  return {
    post,
    isLoading,
    error,
    refetch: fetchPost,
  };
}
