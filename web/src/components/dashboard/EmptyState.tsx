import { PostStatus } from '@/types';
import { Plus } from 'lucide-react';

interface EmptyStateProps {
  filter: PostStatus | 'all';
}

const messages: Record<PostStatus | 'all', { title: string; description: string }> = {
  all: {
    title: '投稿がありません',
    description: '新規投稿を作成して、スケジュールを開始しましょう。',
  },
  pending: {
    title: '予定されている投稿がありません',
    description: '新しい投稿をスケジュールして、自動投稿を設定しましょう。',
  },
  posting: {
    title: '投稿中のものはありません',
    description: '現在投稿処理中のものはありません。',
  },
  posted: {
    title: '投稿済みの履歴がありません',
    description: 'まだ投稿が完了したものがありません。',
  },
  failed: {
    title: '失敗した投稿がありません',
    description: 'すべての投稿が正常に処理されています。',
  },
  cancelled: {
    title: 'キャンセルされた投稿がありません',
    description: 'キャンセルされた投稿はありません。',
  },
};

export function EmptyState({ filter }: EmptyStateProps) {
  const message = messages[filter];

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <Plus className="w-8 h-8 text-gray-400 dark:text-gray-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {message.title}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-sm mb-6">
        {message.description}
      </p>
      <button
        onClick={() => console.log('Create new post')}
        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity"
      >
        <Plus className="w-4 h-4" />
        新規投稿を作成
      </button>
    </div>
  );
}
