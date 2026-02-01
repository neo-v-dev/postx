'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar,
  Check,
  X as XIcon,
  Loader2,
  AlertCircle,
  Settings,
  ArrowLeft,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { PostType } from '@/types';
import { usePost } from '@/hooks/usePost';
import { useUpdatePost } from '@/hooks/useUpdatePost';
import { hasToken, hasRepoConfig } from '@/lib/storage';

const CHAR_LIMIT = 280;

export function EditPostContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const postId = searchParams.get('id');

  const { post, isLoading: isLoadingPost, error: loadError } = usePost(postId);
  const { updatePost, isUpdating, error: updateError } = useUpdatePost();

  const [formData, setFormData] = useState({
    type: 'tweet' as PostType,
    scheduledAt: '',
    text: '',
    targetTweetId: '',
    threadText: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form with post data
  useEffect(() => {
    if (post) {
      setFormData({
        type: post.type,
        scheduledAt: format(parseISO(post.scheduled_at), "yyyy-MM-dd'T'HH:mm"),
        text: post.text || '',
        targetTweetId: post.target_tweet_id || '',
        threadText: post.thread?.[0]?.text || '',
      });
    }
  }, [post]);

  const isConfigured = hasToken() && hasRepoConfig();

  // No ID provided
  if (!postId) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-yellow-800 mb-2">
                  投稿が指定されていません
                </h2>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md font-medium hover:bg-gray-700"
                >
                  <ArrowLeft className="w-4 h-4" />
                  ダッシュボードへ戻る
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const scheduledDate = parseISO(formData.scheduledAt);
    if (scheduledDate <= new Date()) {
      newErrors.scheduledAt = '予約日時は未来の時刻を指定してください';
    }

    if (formData.type === 'tweet') {
      if (!formData.text.trim()) {
        newErrors.text = 'テキストを入力してください';
      } else if (formData.text.length > CHAR_LIMIT) {
        newErrors.text = `文字数が制限を超えています (${formData.text.length}/${CHAR_LIMIT})`;
      }
    } else if (formData.type === 'thread') {
      if (!formData.threadText.trim()) {
        newErrors.threadText = 'テキストを入力してください';
      }
    } else if (formData.type === 'repost') {
      if (!formData.targetTweetId.trim()) {
        newErrors.targetTweetId = 'ツイートIDを入力してください';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !post) return;

    const result = await updatePost({
      id: post.id,
      type: formData.type,
      status: post.status,
      scheduled_at: new Date(formData.scheduledAt).toISOString(),
      text: formData.type === 'tweet' ? formData.text : undefined,
      thread: formData.type === 'thread' ? [{ text: formData.threadText, media: [] }] : undefined,
      target_tweet_id: formData.type === 'repost' ? formData.targetTweetId : undefined,
    });

    if (result) {
      router.push('/');
    }
  };

  // Loading state
  if (isLoadingPost) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            <span className="ml-3 text-gray-600">読み込み中...</span>
          </div>
        </div>
      </main>
    );
  }

  // Not configured state
  if (!isConfigured) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-yellow-800 mb-2">
                  GitHub連携が必要です
                </h2>
                <Link
                  href="/settings"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-md font-medium hover:bg-yellow-700"
                >
                  <Settings className="w-4 h-4" />
                  設定画面へ
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Error state
  if (loadError) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-red-800 mb-2">エラー</h2>
                <p className="text-sm text-red-700 mb-4">{loadError}</p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md font-medium hover:bg-gray-700"
                >
                  <ArrowLeft className="w-4 h-4" />
                  ダッシュボードへ戻る
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            ダッシュボードへ戻る
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">投稿を編集</h1>
          <p className="mt-2 text-sm text-gray-600">
            予約投稿の内容を編集します
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* API Error */}
          {updateError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-sm text-red-700">{updateError}</p>
              </div>
            </div>
          )}

          {/* Post Type (read-only display) */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              投稿タイプ
            </label>
            <p className="text-sm text-gray-900 capitalize">{formData.type}</p>
          </div>

          {/* Tweet Fields */}
          {formData.type === 'tweet' && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="text" className="block text-sm font-medium text-gray-700">
                  テキスト
                </label>
                <span
                  className={`text-sm ${
                    formData.text.length > CHAR_LIMIT ? 'text-red-600' : 'text-gray-500'
                  }`}
                >
                  {formData.text.length}/{CHAR_LIMIT}
                </span>
              </div>
              <textarea
                id="text"
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.text && (
                <p className="mt-1 text-sm text-red-600">{errors.text}</p>
              )}
            </div>
          )}

          {/* Thread Fields */}
          {formData.type === 'thread' && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <label htmlFor="threadText" className="block text-sm font-medium text-gray-700 mb-2">
                スレッド（最初のツイート）
              </label>
              <textarea
                id="threadText"
                value={formData.threadText}
                onChange={(e) => setFormData({ ...formData, threadText: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.threadText && (
                <p className="mt-1 text-sm text-red-600">{errors.threadText}</p>
              )}
            </div>
          )}

          {/* Repost Fields */}
          {formData.type === 'repost' && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <label htmlFor="targetTweetId" className="block text-sm font-medium text-gray-700 mb-2">
                ツイートID
              </label>
              <input
                type="text"
                id="targetTweetId"
                value={formData.targetTweetId}
                onChange={(e) => setFormData({ ...formData, targetTweetId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.targetTweetId && (
                <p className="mt-1 text-sm text-red-600">{errors.targetTweetId}</p>
              )}
            </div>
          )}

          {/* Scheduled Time */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <label htmlFor="scheduledAt" className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline w-4 h-4 mr-1" />
              予約日時
            </label>
            <input
              type="datetime-local"
              id="scheduledAt"
              value={formData.scheduledAt}
              onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.scheduledAt && (
              <p className="mt-1 text-sm text-red-600">{errors.scheduledAt}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              <XIcon className="w-4 h-4" />
              キャンセル
            </Link>
            <button
              type="submit"
              disabled={isUpdating}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  更新中...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  更新する
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
