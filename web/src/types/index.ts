export interface Config {
  timezone: string;
  interval_minutes: number;
  daily_limit: number;
  monthly_limit: number;
  retry_max: number;
}

export interface MediaItem {
  type: 'image' | 'video' | 'gif';
  path: string;
  media_id?: string;
}

export interface ThreadItem {
  text: string;
  media?: MediaItem[];
  posted_tweet_id?: string;
}

export interface RepeatConfig {
  type: 'daily' | 'weekly' | 'monthly';
  days?: string[];
  day_of_month?: number;
  time: string;
  end_date?: string;
  end_count?: number;
  executed_count: number;
}

export type PostStatus = 'pending' | 'posting' | 'posted' | 'failed' | 'cancelled';
export type PostType = 'tweet' | 'thread' | 'repost';

export interface Post {
  id: string;
  type: PostType;
  status: PostStatus;
  scheduled_at: string;
  created_at: string;
  updated_at: string;
  text?: string;
  media?: MediaItem[];
  thread?: ThreadItem[];
  target_tweet_id?: string;
  repeat?: RepeatConfig;
  retry_count?: number;
  error_message?: string;
  posted_tweet_id?: string;
}

export interface HistoryEntry {
  id: string;
  post_id: string;
  action: 'posted' | 'failed' | 'cancelled';
  executed_at: string;
  tweet_id?: string;
  error?: string;
}

export interface Stats {
  daily_count: number;
  daily_reset_at: string;
  monthly_count: number;
  monthly_reset_at: string;
}

export interface PostsData {
  config: Config;
  posts: Post[];
  history: HistoryEntry[];
  stats: Stats;
}
