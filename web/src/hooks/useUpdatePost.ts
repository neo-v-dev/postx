'use client';

import { useState, useCallback } from 'react';
import type { Post, PostsData } from '@/types';
import { getToken, getRepoConfig, hasToken, hasRepoConfig } from '@/lib/storage';
import { decodeBase64, encodeBase64 } from '@/lib/encoding';

export interface UpdatePostInput {
  id: string;
  type?: Post['type'];
  status?: Post['status'];
  scheduled_at?: string;
  text?: string;
  media?: Post['media'];
  thread?: Post['thread'];
  target_tweet_id?: string;
  repeat?: Post['repeat'];
}

export interface UseUpdatePostResult {
  updatePost: (input: UpdatePostInput) => Promise<Post | null>;
  isUpdating: boolean;
  error: string | null;
}

/**
 * Hook for updating posts in GitHub repository
 */
export function useUpdatePost(): UseUpdatePostResult {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updatePost = useCallback(async (input: UpdatePostInput): Promise<Post | null> => {
    if (!hasToken() || !hasRepoConfig()) {
      setError('GitHub接続が設定されていません');
      return null;
    }

    const token = getToken();
    const config = getRepoConfig();

    if (!token || !config) {
      setError('GitHub接続が設定されていません');
      return null;
    }

    setIsUpdating(true);
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

      // Find the post
      const postIndex = postsData.posts.findIndex(p => p.id === input.id);
      if (postIndex === -1) {
        throw new Error('投稿が見つかりません');
      }

      // Update the post
      const existingPost = postsData.posts[postIndex];
      const updatedPost: Post = {
        ...existingPost,
        type: input.type ?? existingPost.type,
        status: input.status ?? existingPost.status,
        scheduled_at: input.scheduled_at ?? existingPost.scheduled_at,
        text: input.text,
        media: input.media,
        thread: input.thread,
        target_tweet_id: input.target_tweet_id,
        repeat: input.repeat,
        updated_at: new Date().toISOString(),
      };

      postsData.posts[postIndex] = updatedPost;

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
            message: `Update post: ${input.id}`,
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
        throw new Error(`更新に失敗しました: ${updateResponse.status} - ${errorBody.message || ''}`);
      }

      return updatedPost;
    } catch (err) {
      const message = err instanceof Error ? err.message : '更新に失敗しました';
      setError(message);
      return null;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  return {
    updatePost,
    isUpdating,
    error,
  };
}
