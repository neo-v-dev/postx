'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { Filter, Calendar, ChevronLeft, ChevronRight, ExternalLink, AlertCircle, Loader2, Settings } from 'lucide-react';
import { HistoryEntry } from '@/types';
import { cn } from '@/lib/utils';
import { useHistory } from '@/hooks/useHistory';

function filterHistory(
  history: HistoryEntry[],
  actionFilter: string,
  dateRange: { start: string; end: string }
): HistoryEntry[] {
  return history.filter(entry => {
    // Action filter
    if (actionFilter !== 'all' && entry.action !== actionFilter) {
      return false;
    }

    // Date range filter
    const executedDate = new Date(entry.executed_at);
    if (dateRange.start) {
      const startDate = new Date(dateRange.start);
      if (executedDate < startDate) {
        return false;
      }
    }
    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);
      if (executedDate > endDate) {
        return false;
      }
    }

    return true;
  });
}

function paginate<T>(items: T[], page: number, perPage: number): T[] {
  const start = (page - 1) * perPage;
  return items.slice(start, start + perPage);
}

function StatusBadge({ action }: { action: HistoryEntry['action'] }) {
  const variants = {
    posted: 'bg-green-100 text-green-800 border-green-300',
    failed: 'bg-red-100 text-red-800 border-red-300',
    cancelled: 'bg-gray-100 text-gray-800 border-gray-300',
  };

  const labels = {
    posted: '成功',
    failed: '失敗',
    cancelled: 'キャンセル',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variants[action]
      )}
    >
      {labels[action]}
    </span>
  );
}

function HistoryEntryCard({ entry }: { entry: HistoryEntry }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
        <div className="flex items-center gap-3">
          <time className="text-sm text-gray-600" dateTime={entry.executed_at}>
            {format(parseISO(entry.executed_at), 'yyyy-MM-dd HH:mm')}
          </time>
          <StatusBadge action={entry.action} />
        </div>
      </div>

      <div className="flex flex-col gap-1 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-500">投稿ID:</span>
          <a
            href={`/posts/${entry.post_id}`}
            className="text-blue-600 hover:text-blue-800 hover:underline font-mono"
          >
            {entry.post_id}
          </a>
        </div>

        {entry.tweet_id && (
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Tweet ID:</span>
            <a
              href={`https://x.com/i/web/status/${entry.tweet_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline font-mono flex items-center gap-1"
            >
              {entry.tweet_id}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {entry.error && (
          <div className="flex items-start gap-2 mt-1">
            <span className="text-gray-500">エラー:</span>
            <span className="text-red-600 flex-1">{entry.error}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const { history, isLoading, error, isConfigured } = useHistory();
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 20;

  const filteredHistory = useMemo(() => {
    return filterHistory(history, actionFilter, dateRange);
  }, [history, actionFilter, dateRange]);

  const paginatedHistory = useMemo(() => {
    return paginate(filteredHistory, currentPage, ITEMS_PER_PAGE);
  }, [filteredHistory, currentPage]);

  const totalPages = Math.ceil(filteredHistory.length / ITEMS_PER_PAGE);

  const handleActionFilterChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setActionFilter(e.target.value);
    setCurrentPage(1);
  }, []);

  const handleDateStartChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setDateRange(prev => ({ ...prev, start: e.target.value }));
    setCurrentPage(1);
  }, []);

  const handleDateEndChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setDateRange(prev => ({ ...prev, end: e.target.value }));
    setCurrentPage(1);
  }, []);

  const handlePreviousPage = useCallback(() => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  }, [totalPages]);

  // Loading state
  if (isLoading) {
    return (
      <main className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">履歴</h1>
          </div>
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
      <main className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">履歴</h1>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-yellow-800 mb-2">
                  設定が必要です
                </h2>
                <p className="text-sm text-yellow-700 mb-4">
                  履歴を表示するには、GitHubリポジトリの設定が必要です。
                </p>
                <Link
                  href="/settings"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-md font-medium hover:bg-yellow-700 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  設定へ移動
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">履歴</h1>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-red-800 mb-2">
                  エラーが発生しました
                </h2>
                <p className="text-sm text-red-700 mb-4">{error}</p>
                <Link
                  href="/settings"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  設定を確認
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">履歴</h1>
          <p className="mt-2 text-sm text-gray-600">投稿の実行履歴を確認できます</p>
        </div>

        {/* Filters */}
        <section className="mb-6 bg-white border border-gray-200 rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-gray-500" />
            <h2 className="text-sm font-semibold text-gray-700">フィルター</h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            {/* Action Filter */}
            <div className="flex-1">
              <label htmlFor="action-filter" className="block text-sm font-medium text-gray-700 mb-1">
                アクション
              </label>
              <select
                id="action-filter"
                value={actionFilter}
                onChange={handleActionFilterChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              >
                <option value="all">すべて</option>
                <option value="posted">成功</option>
                <option value="failed">失敗</option>
                <option value="cancelled">キャンセル</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div className="flex-1">
              <label htmlFor="date-start" className="block text-sm font-medium text-gray-700 mb-1">
                開始日
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="date-start"
                  value={dateRange.start}
                  onChange={handleDateStartChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex-1">
              <label htmlFor="date-end" className="block text-sm font-medium text-gray-700 mb-1">
                終了日
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="date-end"
                  value={dateRange.end}
                  onChange={handleDateEndChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </section>

        {/* History List */}
        <section>
          {filteredHistory.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center">
              <p className="text-gray-500">条件に一致する履歴がありません</p>
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-gray-600">
                {filteredHistory.length}件の履歴（{currentPage}ページ目 / 全{totalPages}ページ）
              </div>
              <div className="space-y-4">
                {paginatedHistory.map(entry => (
                  <HistoryEntryCard key={entry.id} entry={entry} />
                ))}
              </div>
            </>
          )}
        </section>

        {/* Pagination */}
        {totalPages > 1 && (
          <section className="mt-6">
            <div className="flex justify-center items-center gap-4">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={handlePreviousPage}
                aria-label="前のページ"
                className={cn(
                  'inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium',
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                )}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                前へ
              </button>

              <span className="text-sm text-gray-700">
                ページ <span className="font-semibold">{currentPage}</span> / {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={handleNextPage}
                aria-label="次のページ"
                className={cn(
                  'inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium',
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                )}
              >
                次へ
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
