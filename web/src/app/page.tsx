'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PostStatus, Post } from '@/types';
import { usePosts } from '@/hooks/usePosts';
import { useDeletePost } from '@/hooks/useDeletePost';
import { PostCard } from '@/components/dashboard/PostCard';
import { FilterTabs } from '@/components/dashboard/FilterTabs';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Plus, Settings, AlertCircle, Loader2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export default function Home() {
  const t = useTranslation();
  const router = useRouter();
  const { posts, isLoading, error, isConfigured, refetch } = usePosts();
  const { deletePost, isDeleting } = useDeletePost();
  const [selectedFilter, setSelectedFilter] = useState<PostStatus | 'all'>('all');
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);

  // Filter posts based on selected filter
  const filteredPosts = useMemo(() => {
    if (selectedFilter === 'all') return posts;
    return posts.filter((post) => post.status === selectedFilter);
  }, [selectedFilter, posts]);

  // Sort posts by scheduled_at (nearest first)
  const sortedPosts = useMemo(() => {
    return [...filteredPosts].sort(
      (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
    );
  }, [filteredPosts]);

  // Calculate counts for filter tabs
  const counts = useMemo(
    () => ({
      all: posts.length,
      pending: posts.filter((p) => p.status === 'pending').length,
      posted: posts.filter((p) => p.status === 'posted').length,
      failed: posts.filter((p) => p.status === 'failed').length,
    }),
    [posts]
  );

  // Handle edit button click
  const handleEditClick = useCallback((postId: string) => {
    router.push(`/edit?id=${postId}`);
  }, [router]);

  // Handle delete button click
  const handleDeleteClick = useCallback((postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      setDeleteTarget(post);
    }
  }, [posts]);

  // Handle delete confirmation
  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;

    const success = await deletePost(deleteTarget.id);
    if (success) {
      setDeleteTarget(null);
      refetch();
    }
  }, [deleteTarget, deletePost, refetch]);

  // Handle delete cancel
  const handleDeleteCancel = useCallback(() => {
    setDeleteTarget(null);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            <span className="ml-3 text-gray-600">{t.common.loading}</span>
          </div>
        </div>
      </main>
    );
  }

  // Not configured state
  if (!isConfigured) {
    return (
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {t.dashboard.title}
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {t.dashboard.subtitle}
            </p>
          </div>

          {/* Setup Guide */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-yellow-800 mb-2">
                  {t.setupGuide.title}
                </h2>
                <p className="text-sm text-yellow-700 mb-4">
                  {t.setupGuide.message}
                </p>
                <Link
                  href="/settings"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-md font-medium hover:bg-yellow-700 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  {t.setupGuide.goToSettings}
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
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {t.dashboard.title}
            </h1>
          </div>

          {/* Error Message */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-red-800 mb-2">
                  {t.common.error}
                </h2>
                <p className="text-sm text-red-700 mb-4">{error}</p>
                <Link
                  href="/settings"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  {t.common.settings}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {t.dashboard.title}
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {t.dashboard.subtitle}
            </p>
          </div>
          <Link
            href="/new"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity shadow-sm"
          >
            <Plus className="w-5 h-5" />
            {t.dashboard.newPost}
          </Link>
        </div>

        {/* Filter Tabs */}
        <FilterTabs selected={selectedFilter} onChange={setSelectedFilter} counts={counts} />

        {/* Post List or Empty State */}
        {sortedPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {sortedPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        ) : (
          <EmptyState filter={selectedFilter} />
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={deleteTarget !== null}
          title={t.deleteDialog.title}
          message={`${t.deleteDialog.message}\n\n「${deleteTarget?.text?.slice(0, 50) || deleteTarget?.thread?.[0]?.text?.slice(0, 50) || '...'}${(deleteTarget?.text?.length || 0) > 50 || (deleteTarget?.thread?.[0]?.text?.length || 0) > 50 ? '...' : ''}」`}
          confirmLabel={t.deleteDialog.confirm}
          cancelLabel={t.deleteDialog.cancel}
          variant="danger"
          isLoading={isDeleting}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      </div>
    </main>
  );
}
