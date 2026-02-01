'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Image as ImageIcon,
  Plus,
  Trash2,
  Check,
  X as XIcon
} from 'lucide-react';
import { format, addHours, parseISO } from 'date-fns';
import type { PostType, MediaItem, ThreadItem, RepeatConfig, Post } from '@/types';

interface PostFormState {
  postType: PostType;
  scheduledAt: string;
  text: string;
  media: MediaItem[];
  threadItems: ThreadItem[];
  targetTweetId: string;
  enableRepeat: boolean;
  repeatConfig: RepeatConfig | null;
  errors: Record<string, string>;
}

const CHAR_LIMIT = 280;
const MAX_MEDIA = 4;

export default function PostForm() {
  const router = useRouter();

  // Initialize scheduledAt with current time + 1 hour
  const defaultScheduledAt = format(addHours(new Date(), 1), "yyyy-MM-dd'T'HH:mm");

  const [state, setState] = useState<PostFormState>({
    postType: 'tweet',
    scheduledAt: defaultScheduledAt,
    text: '',
    media: [],
    threadItems: [{ text: '', media: [] }],
    targetTweetId: '',
    enableRepeat: false,
    repeatConfig: null,
    errors: {},
  });

  // Handle post type change
  const handleTypeChange = (type: PostType) => {
    setState(prev => ({
      ...prev,
      postType: type,
      text: '',
      media: [],
      threadItems: [{ text: '', media: [] }],
      targetTweetId: '',
      errors: {},
    }));
  };

  // Handle text input with character count
  const handleTextChange = (value: string) => {
    const errors = { ...state.errors };
    if (value.length > CHAR_LIMIT) {
      errors.text = `文字数が制限を超えています (${value.length}/${CHAR_LIMIT})`;
    } else {
      delete errors.text;
    }
    setState(prev => ({ ...prev, text: value, errors }));
  };

  // Handle media file selection
  const handleMediaAdd = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newMedia: MediaItem[] = [];
    for (let i = 0; i < files.length && state.media.length + newMedia.length < MAX_MEDIA; i++) {
      const file = files[i];
      let type: 'image' | 'video' | 'gif' = 'image';
      if (file.type.startsWith('video/')) type = 'video';
      if (file.type === 'image/gif') type = 'gif';

      newMedia.push({
        type,
        path: file.name, // In production, this would be uploaded to a server
      });
    }

    setState(prev => ({
      ...prev,
      media: [...prev.media, ...newMedia],
    }));
  };

  // Remove media item
  const handleMediaRemove = (index: number) => {
    setState(prev => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index),
    }));
  };

  // Handle thread item text change
  const handleThreadItemTextChange = (index: number, value: string) => {
    const errors = { ...state.errors };
    if (value.length > CHAR_LIMIT) {
      errors[`thread_${index}`] = `文字数が制限を超えています (${value.length}/${CHAR_LIMIT})`;
    } else {
      delete errors[`thread_${index}`];
    }

    const newThreadItems = [...state.threadItems];
    newThreadItems[index] = { ...newThreadItems[index], text: value };
    setState(prev => ({ ...prev, threadItems: newThreadItems, errors }));
  };

  // Add thread item
  const handleThreadItemAdd = () => {
    setState(prev => ({
      ...prev,
      threadItems: [...prev.threadItems, { text: '', media: [] }],
    }));
  };

  // Remove thread item
  const handleThreadItemRemove = (index: number) => {
    setState(prev => ({
      ...prev,
      threadItems: prev.threadItems.filter((_, i) => i !== index),
    }));
  };

  // Handle thread item media
  const handleThreadMediaAdd = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const currentMedia = state.threadItems[index].media || [];
    const newMedia: MediaItem[] = [];

    for (let i = 0; i < files.length && currentMedia.length + newMedia.length < MAX_MEDIA; i++) {
      const file = files[i];
      let type: 'image' | 'video' | 'gif' = 'image';
      if (file.type.startsWith('video/')) type = 'video';
      if (file.type === 'image/gif') type = 'gif';

      newMedia.push({
        type,
        path: file.name,
      });
    }

    const newThreadItems = [...state.threadItems];
    newThreadItems[index] = {
      ...newThreadItems[index],
      media: [...currentMedia, ...newMedia],
    };
    setState(prev => ({ ...prev, threadItems: newThreadItems }));
  };

  // Remove thread media item
  const handleThreadMediaRemove = (threadIndex: number, mediaIndex: number) => {
    const newThreadItems = [...state.threadItems];
    newThreadItems[threadIndex] = {
      ...newThreadItems[threadIndex],
      media: newThreadItems[threadIndex].media?.filter((_, i) => i !== mediaIndex),
    };
    setState(prev => ({ ...prev, threadItems: newThreadItems }));
  };

  // Handle target tweet ID (extract from URL if needed)
  const handleTargetTweetIdChange = (value: string) => {
    let tweetId = value;

    // Extract ID from URL if provided
    const urlMatch = value.match(/status\/(\d+)/);
    if (urlMatch) {
      tweetId = urlMatch[1];
    }

    const errors = { ...state.errors };
    if (tweetId && !/^\d+$/.test(tweetId)) {
      errors.targetTweetId = 'ツイートIDは数字のみ、または有効なXのURLを入力してください';
    } else {
      delete errors.targetTweetId;
    }

    setState(prev => ({ ...prev, targetTweetId: tweetId, errors }));
  };

  // Handle repeat config toggle
  const handleRepeatToggle = (enabled: boolean) => {
    setState(prev => ({
      ...prev,
      enableRepeat: enabled,
      repeatConfig: enabled
        ? {
            type: 'daily',
            time: '09:00',
            executed_count: 0,
          }
        : null,
    }));
  };

  // Handle repeat config changes
  const handleRepeatConfigChange = <K extends keyof RepeatConfig>(
    key: K,
    value: RepeatConfig[K]
  ) => {
    if (!state.repeatConfig) return;
    setState(prev => ({
      ...prev,
      repeatConfig: prev.repeatConfig ? { ...prev.repeatConfig, [key]: value } : null,
    }));
  };

  // Validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Validate scheduled time is in the future
    const scheduledDate = parseISO(state.scheduledAt);
    if (scheduledDate <= new Date()) {
      errors.scheduledAt = '予約日時は未来の時刻を指定してください';
    }

    // Type-specific validation
    if (state.postType === 'tweet') {
      if (!state.text.trim()) {
        errors.text = 'テキストを入力してください';
      } else if (state.text.length > CHAR_LIMIT) {
        errors.text = `文字数が制限を超えています (${state.text.length}/${CHAR_LIMIT})`;
      }
    } else if (state.postType === 'thread') {
      state.threadItems.forEach((item, index) => {
        if (!item.text.trim()) {
          errors[`thread_${index}`] = 'テキストを入力してください';
        } else if (item.text.length > CHAR_LIMIT) {
          errors[`thread_${index}`] = `文字数が制限を超えています (${item.text.length}/${CHAR_LIMIT})`;
        }
      });
    } else if (state.postType === 'repost') {
      if (!state.targetTweetId.trim()) {
        errors.targetTweetId = 'ツイートIDまたはURLを入力してください';
      } else if (!/^\d+$/.test(state.targetTweetId)) {
        errors.targetTweetId = 'ツイートIDは数字のみ、または有効なXのURLを入力してください';
      }
    }

    // Repeat config validation
    if (state.enableRepeat && state.repeatConfig) {
      if (state.repeatConfig.type === 'weekly' && (!state.repeatConfig.days || state.repeatConfig.days.length === 0)) {
        errors.repeatDays = '曜日を1つ以上選択してください';
      }
      if (state.repeatConfig.type === 'monthly' && !state.repeatConfig.day_of_month) {
        errors.repeatDayOfMonth = '日付を選択してください';
      }
      if (!state.repeatConfig.end_date && !state.repeatConfig.end_count) {
        errors.repeatEnd = '終了条件を指定してください';
      }
    }

    setState(prev => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  };

  // Generate Post object
  const generatePost = (): Post => {
    const basePost: Post = {
      id: crypto.randomUUID(),
      type: state.postType,
      status: 'pending',
      scheduled_at: new Date(state.scheduledAt).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (state.postType === 'tweet') {
      basePost.text = state.text;
      basePost.media = state.media.length > 0 ? state.media : undefined;
    } else if (state.postType === 'thread') {
      basePost.thread = state.threadItems;
    } else if (state.postType === 'repost') {
      basePost.target_tweet_id = state.targetTweetId;
    }

    if (state.enableRepeat && state.repeatConfig) {
      basePost.repeat = state.repeatConfig;
    }

    return basePost;
  };

  // Handle form submission
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      // Focus first error field
      const firstErrorKey = Object.keys(state.errors)[0];
      const errorElement = document.querySelector(`[data-error="${firstErrorKey}"]`);
      if (errorElement) {
        (errorElement as HTMLElement).focus();
      }
      return;
    }

    const post = generatePost();

    // TODO: Send to API
    console.log('Created post:', post);

    // Redirect to dashboard
    router.push('/');
  };

  // Handle cancel
  const handleCancel = () => {
    router.push('/');
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
      {/* Post Type Selector */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          投稿タイプ
        </label>
        <div className="flex gap-4">
          {(['tweet', 'thread', 'repost'] as PostType[]).map((type) => (
            <label key={type} className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="postType"
                value={type}
                checked={state.postType === type}
                onChange={() => handleTypeChange(type)}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 capitalize">{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Tweet Mode Fields */}
      {state.postType === 'tweet' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          {/* Text Input */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="text" className="block text-sm font-medium text-gray-700">
                テキスト
              </label>
              <span
                className={`text-sm ${
                  state.text.length > CHAR_LIMIT ? 'text-red-600' : 'text-gray-500'
                }`}
              >
                {state.text.length}/{CHAR_LIMIT}
              </span>
            </div>
            <textarea
              id="text"
              data-error="text"
              value={state.text}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="ツイートの内容を入力..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              aria-invalid={!!state.errors.text}
              aria-describedby={state.errors.text ? 'text-error' : undefined}
            />
            {state.errors.text && (
              <p id="text-error" className="mt-1 text-sm text-red-600" role="alert">
                {state.errors.text}
              </p>
            )}
          </div>

          {/* Media Uploader */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              メディア ({state.media.length}/{MAX_MEDIA})
            </label>
            <div className="space-y-2">
              {state.media.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 p-2 rounded"
                >
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{item.path}</span>
                    <span className="text-xs text-gray-500 capitalize">({item.type})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleMediaRemove(index)}
                    className="text-red-600 hover:text-red-800"
                    aria-label={`削除: ${item.path}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {state.media.length < MAX_MEDIA && (
                <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                  <ImageIcon className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">ファイルを選択</span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleMediaAdd}
                    className="sr-only"
                  />
                </label>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Thread Mode Fields */}
      {state.postType === 'thread' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-gray-700">
              スレッド
            </label>
            <button
              type="button"
              onClick={handleThreadItemAdd}
              className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
            >
              <Plus className="w-4 h-4" />
              ツイートを追加
            </button>
          </div>

          <div className="space-y-4">
            {state.threadItems.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">
                    {index + 1}/{state.threadItems.length}
                  </span>
                  {state.threadItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleThreadItemRemove(index)}
                      className="text-red-600 hover:text-red-800"
                      aria-label={`ツイート ${index + 1} を削除`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Thread Item Text */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor={`thread-text-${index}`} className="block text-sm text-gray-600">
                      テキスト
                    </label>
                    <span
                      className={`text-sm ${
                        item.text.length > CHAR_LIMIT ? 'text-red-600' : 'text-gray-500'
                      }`}
                    >
                      {item.text.length}/{CHAR_LIMIT}
                    </span>
                  </div>
                  <textarea
                    id={`thread-text-${index}`}
                    data-error={`thread_${index}`}
                    value={item.text}
                    onChange={(e) => handleThreadItemTextChange(index, e.target.value)}
                    placeholder="ツイートの内容を入力..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    aria-invalid={!!state.errors[`thread_${index}`]}
                    aria-describedby={state.errors[`thread_${index}`] ? `thread-${index}-error` : undefined}
                  />
                  {state.errors[`thread_${index}`] && (
                    <p id={`thread-${index}-error`} className="mt-1 text-sm text-red-600" role="alert">
                      {state.errors[`thread_${index}`]}
                    </p>
                  )}
                </div>

                {/* Thread Item Media */}
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    メディア ({(item.media?.length || 0)}/{MAX_MEDIA})
                  </label>
                  <div className="space-y-2">
                    {item.media?.map((media, mediaIndex) => (
                      <div
                        key={mediaIndex}
                        className="flex items-center justify-between bg-gray-50 p-2 rounded"
                      >
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-700">{media.path}</span>
                          <span className="text-xs text-gray-500 capitalize">({media.type})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleThreadMediaRemove(index, mediaIndex)}
                          className="text-red-600 hover:text-red-800"
                          aria-label={`削除: ${media.path}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {(item.media?.length || 0) < MAX_MEDIA && (
                      <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                        <ImageIcon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">ファイルを選択</span>
                        <input
                          type="file"
                          accept="image/*,video/*"
                          multiple
                          onChange={(e) => handleThreadMediaAdd(index, e)}
                          className="sr-only"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Repost Mode Fields */}
      {state.postType === 'repost' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <div>
            <label htmlFor="targetTweetId" className="block text-sm font-medium text-gray-700 mb-2">
              ツイートIDまたはURL
            </label>
            <input
              type="text"
              id="targetTweetId"
              data-error="targetTweetId"
              value={state.targetTweetId}
              onChange={(e) => handleTargetTweetIdChange(e.target.value)}
              placeholder="例: 1234567890 または https://x.com/username/status/1234567890"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              aria-invalid={!!state.errors.targetTweetId}
              aria-describedby={state.errors.targetTweetId ? 'targetTweetId-error' : undefined}
            />
            {state.errors.targetTweetId && (
              <p id="targetTweetId-error" className="mt-1 text-sm text-red-600" role="alert">
                {state.errors.targetTweetId}
              </p>
            )}
          </div>
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
          data-error="scheduledAt"
          value={state.scheduledAt}
          onChange={(e) => setState(prev => ({ ...prev, scheduledAt: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          aria-invalid={!!state.errors.scheduledAt}
          aria-describedby={state.errors.scheduledAt ? 'scheduledAt-error' : undefined}
        />
        {state.errors.scheduledAt && (
          <p id="scheduledAt-error" className="mt-1 text-sm text-red-600" role="alert">
            {state.errors.scheduledAt}
          </p>
        )}
      </div>

      {/* Repeat Configuration */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={state.enableRepeat}
            onChange={(e) => handleRepeatToggle(e.target.checked)}
            className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
          />
          <span className="ml-2 text-sm font-medium text-gray-700">
            繰り返し設定を有効にする
          </span>
        </label>

        {state.enableRepeat && state.repeatConfig && (
          <div className="space-y-4 pl-6 border-l-2 border-blue-200">
            {/* Repeat Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                繰り返しタイプ
              </label>
              <div className="flex gap-4">
                {(['daily', 'weekly', 'monthly'] as const).map((type) => (
                  <label key={type} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="repeatType"
                      value={type}
                      checked={state.repeatConfig?.type === type}
                      onChange={() => handleRepeatConfigChange('type', type)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {type === 'daily' && '毎日'}
                      {type === 'weekly' && '毎週'}
                      {type === 'monthly' && '毎月'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Weekly: Days Selection */}
            {state.repeatConfig.type === 'weekly' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  曜日を選択
                </label>
                <div className="flex flex-wrap gap-2">
                  {['月', '火', '水', '木', '金', '土', '日'].map((day, index) => {
                    const dayValue = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index];
                    const isChecked = state.repeatConfig?.days?.includes(dayValue) || false;
                    return (
                      <label key={day} className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const currentDays = state.repeatConfig?.days || [];
                            const newDays = e.target.checked
                              ? [...currentDays, dayValue]
                              : currentDays.filter(d => d !== dayValue);
                            handleRepeatConfigChange('days', newDays);
                          }}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
                        />
                        <span className="ml-1 text-sm text-gray-700">{day}</span>
                      </label>
                    );
                  })}
                </div>
                {state.errors.repeatDays && (
                  <p className="mt-1 text-sm text-red-600" role="alert">
                    {state.errors.repeatDays}
                  </p>
                )}
              </div>
            )}

            {/* Monthly: Day of Month */}
            {state.repeatConfig.type === 'monthly' && (
              <div>
                <label htmlFor="dayOfMonth" className="block text-sm font-medium text-gray-700 mb-2">
                  日付を選択
                </label>
                <select
                  id="dayOfMonth"
                  value={state.repeatConfig.day_of_month || ''}
                  onChange={(e) => handleRepeatConfigChange('day_of_month', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">選択してください</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <option key={day} value={day}>
                      {day}日
                    </option>
                  ))}
                </select>
                {state.errors.repeatDayOfMonth && (
                  <p className="mt-1 text-sm text-red-600" role="alert">
                    {state.errors.repeatDayOfMonth}
                  </p>
                )}
              </div>
            )}

            {/* Execution Time */}
            <div>
              <label htmlFor="repeatTime" className="block text-sm font-medium text-gray-700 mb-2">
                実行時刻
              </label>
              <input
                type="time"
                id="repeatTime"
                value={state.repeatConfig.time}
                onChange={(e) => handleRepeatConfigChange('time', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* End Condition */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                終了条件
              </label>
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="endCondition"
                    checked={!!state.repeatConfig.end_date && !state.repeatConfig.end_count}
                    onChange={() => {
                      handleRepeatConfigChange('end_date', format(addHours(new Date(), 24 * 30), 'yyyy-MM-dd'));
                      handleRepeatConfigChange('end_count', undefined);
                    }}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">終了日で指定</span>
                  <input
                    type="date"
                    value={state.repeatConfig.end_date || ''}
                    onChange={(e) => handleRepeatConfigChange('end_date', e.target.value)}
                    disabled={!!state.repeatConfig.end_count}
                    className="px-3 py-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  />
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="endCondition"
                    checked={!!state.repeatConfig.end_count && !state.repeatConfig.end_date}
                    onChange={() => {
                      handleRepeatConfigChange('end_count', 10);
                      handleRepeatConfigChange('end_date', undefined);
                    }}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">回数で指定</span>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={state.repeatConfig.end_count || ''}
                    onChange={(e) => handleRepeatConfigChange('end_count', parseInt(e.target.value))}
                    disabled={!!state.repeatConfig.end_date}
                    className="w-24 px-3 py-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  />
                  <span className="text-sm text-gray-700">回</span>
                </label>
              </div>
              {state.errors.repeatEnd && (
                <p className="mt-1 text-sm text-red-600" role="alert">
                  {state.errors.repeatEnd}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={handleCancel}
          className="flex items-center gap-2 px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <XIcon className="w-4 h-4" />
          キャンセル
        </button>
        <button
          type="submit"
          disabled={Object.keys(state.errors).length > 0}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <Check className="w-4 h-4" />
          予約投稿を作成
        </button>
      </div>
    </form>
  );
}
