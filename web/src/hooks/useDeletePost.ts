'use client';

import { useState, useCallback } from 'react';
import type { PostsData } from '@/types';
import { getToken, getRepoConfig, hasToken, hasRepoConfig } from '@/lib/storage';
import { decodeBase64, encodeBase64 } from '@/lib/encoding';

export interface UseDeletePostResult {
  deletePost: (postId: string) => Promise<boolean>;
  isDeleting: boolean;
  error: string | null;
}

/**
 * Hook for deleting posts from GitHub repository
 */
export function useDeletePost(): UseDeletePostResult {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deletePost = useCallback(async (postId: string): Promise<boolean> => {
    if (!hasToken() || !hasRepoConfig()) {
      setError('GitHub接続が設定されていません');
      return false;
    }

    const token = getToken();
    const config = getRepoConfig();

    if (!token || !config) {
      setError('GitHub接続が設定されていません');
      return false;
    }

    setIsDeleting(true);
    setError(null);

    try {
      // Fetch current posts.json
      const getResponse = await fetch(
        `https://api.github.com/repos/${config.owner}/${config.repo}/contents/posts.json`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );

      if (!getResponse.ok) {
        if (getResponse.status === 404) {
          throw new Error('posts.jsonが見つかりません');
        }
        throw new Error(`GitHub API エラー: ${getResponse.status}`);
      }

      const data = await getResponse.json();
      const sha = data.sha;
      const content = decodeBase64(data.content);
      const postsData: PostsData = JSON.parse(content);

      // Find and remove the post
      const postIndex = postsData.posts.findIndex(p => p.id === postId);
      if (postIndex === -1) {
        throw new Error('投稿が見つかりません');
      }

      postsData.posts.splice(postIndex, 1);

      // Update file
      const updateResponse = await fetch(
        `https://api.github.com/repos/${config.owner}/${config.repo}/contents/posts.json`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: `Delete post: ${postId}`,
            content: encodeBase64(JSON.stringify(postsData, null, 2)),
            sha,
          }),
        }
      );

      if (!updateResponse.ok) {
        const errorBody = await updateResponse.json().catch(() => ({}));
        if (updateResponse.status === 409) {
          throw new Error('競合エラー: 再度お試しください');
        }
        throw new Error(`削除に失敗しました: ${updateResponse.status} - ${errorBody.message || ''}`);
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : '削除に失敗しました';
      setError(message);
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  return {
    deletePost,
    isDeleting,
    error,
  };
}
