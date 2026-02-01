'use client';

import { useState, useCallback } from 'react';
import type { Post, PostsData, PostType, PostStatus } from '@/types';
import { getToken, getRepoConfig, hasToken, hasRepoConfig } from '@/lib/storage';
import { encodeBase64, decodeBase64 } from '@/lib/encoding';

export interface CreatePostInput {
  type: PostType;
  status: PostStatus;
  scheduled_at: string;
  text?: string;
  media?: Post['media'];
  thread?: Post['thread'];
  target_tweet_id?: string;
  repeat?: Post['repeat'];
}

export interface UseCreatePostResult {
  createPost: (input: CreatePostInput) => Promise<Post | null>;
  isCreating: boolean;
  error: string | null;
  isConfigured: boolean;
}

/**
 * Generate UUID (browser-compatible)
 */
function generateUUID(): string {
  return crypto.randomUUID();
}

/**
 * Hook for creating posts in GitHub repository
 */
export function useCreatePost(): UseCreatePostResult {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConfigured = hasToken() && hasRepoConfig();

  const createPost = useCallback(async (input: CreatePostInput): Promise<Post | null> => {
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

    setIsCreating(true);
    setError(null);

    try {
      // First, fetch current posts.json
      const getResponse = await fetch(
        `https://api.github.com/repos/${config.owner}/${config.repo}/contents/posts.json`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );

      let postsData: PostsData;
      let sha: string | undefined;

      if (getResponse.status === 404) {
        // File doesn't exist, create default structure
        postsData = {
          config: {
            timezone: 'Asia/Tokyo',
            interval_minutes: 30,
            daily_limit: 50,
            monthly_limit: 1500,
            retry_max: 3,
          },
          posts: [],
          history: [],
          stats: {
            daily_count: 0,
            daily_reset_at: new Date().toISOString(),
            monthly_count: 0,
            monthly_reset_at: new Date().toISOString(),
          },
        };
      } else if (!getResponse.ok) {
        if (getResponse.status === 401 || getResponse.status === 403) {
          throw new Error('認証エラー: トークンが無効か権限が不足しています');
        }
        throw new Error(`GitHub API エラー: ${getResponse.status}`);
      } else {
        const data = await getResponse.json();
        sha = data.sha;
        const content = decodeBase64(data.content);
        postsData = JSON.parse(content);
      }

      // Create new post
      const now = new Date().toISOString();
      const newPost: Post = {
        id: generateUUID(),
        type: input.type,
        status: input.status,
        scheduled_at: input.scheduled_at,
        created_at: now,
        updated_at: now,
        text: input.text,
        media: input.media,
        thread: input.thread,
        target_tweet_id: input.target_tweet_id,
        repeat: input.repeat,
      };

      // Add to posts array
      postsData.posts.push(newPost);

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
            message: `Add post: ${newPost.id}`,
            content: encodeBase64(JSON.stringify(postsData, null, 2)),
            ...(sha ? { sha } : {}),
          }),
        }
      );

      if (!updateResponse.ok) {
        const errorBody = await updateResponse.json().catch(() => ({}));
        console.error('GitHub API Error:', updateResponse.status, errorBody);

        if (updateResponse.status === 409) {
          throw new Error('競合エラー: ファイルが別の場所で更新されました。再度お試しください。');
        }
        if (updateResponse.status === 404) {
          throw new Error(`リポジトリまたはブランチが見つかりません: ${config.owner}/${config.repo}`);
        }
        if (updateResponse.status === 422) {
          throw new Error(`バリデーションエラー: ${errorBody.message || 'SHA が必要です'}`);
        }
        throw new Error(`投稿の保存に失敗しました: ${updateResponse.status} - ${errorBody.message || ''}`);
      }

      return newPost;
    } catch (err) {
      const message = err instanceof Error ? err.message : '投稿の作成に失敗しました';
      setError(message);
      return null;
    } finally {
      setIsCreating(false);
    }
  }, []);

  return {
    createPost,
    isCreating,
    error,
    isConfigured,
  };
}
