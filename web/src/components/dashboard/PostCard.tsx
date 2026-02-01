import { Post } from '@/types';
import { StatusBadge } from './StatusBadge';
import { MessageSquare, List, Repeat2, Edit, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { truncateText } from '@/lib/utils';

interface PostCardProps {
  post: Post;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const typeIcons = {
  tweet: MessageSquare,
  thread: List,
  repost: Repeat2,
};

export function PostCard({ post, onEdit, onDelete }: PostCardProps) {
  const Icon = typeIcons[post.type];

  const getPreviewText = () => {
    if (post.type === 'thread' && post.thread) {
      return post.thread[0]?.text || 'Thread post';
    }
    if (post.type === 'repost') {
      return post.text || 'Repost';
    }
    return post.text || 'No text';
  };

  const previewText = truncateText(getPreviewText(), 50);
  const scheduledTime = formatDistanceToNow(new Date(post.scheduled_at), {
    addSuffix: true,
    locale: ja,
  });

  const handleEdit = () => {
    console.log('Edit:', post.id);
    onEdit?.(post.id);
  };

  const handleDelete = () => {
    console.log('Delete:', post.id);
    onDelete?.(post.id);
  };

  return (
    <article className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
            {post.type}
          </span>
        </div>
        <StatusBadge status={post.status} />
      </div>

      {/* Scheduled Time */}
      <div className="mb-3">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          📅 {scheduledTime}
        </p>
      </div>

      {/* Preview Text */}
      <div className="mb-4">
        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
          {previewText}
        </p>
      </div>

      {/* Error Message (if failed) */}
      {post.status === 'failed' && post.error_message && (
        <div className="mb-4 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
          <p className="text-xs text-red-700 dark:text-red-400">
            ⚠️ {post.error_message}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleEdit}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
          aria-label="投稿を編集"
        >
          <Edit className="w-4 h-4" />
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md transition-colors"
          aria-label="投稿を削除"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>
    </article>
  );
}
