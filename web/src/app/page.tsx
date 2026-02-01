'use client';

import { useState, useMemo } from 'react';
import { PostStatus } from '@/types';
import { mockPosts } from '@/data/mock';
import { PostCard } from '@/components/dashboard/PostCard';
import { FilterTabs } from '@/components/dashboard/FilterTabs';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { Plus } from 'lucide-react';

export default function Home() {
  const [selectedFilter, setSelectedFilter] = useState<PostStatus | 'all'>('all');

  // Filter posts based on selected filter
  const filteredPosts = useMemo(() => {
    if (selectedFilter === 'all') return mockPosts;
    return mockPosts.filter((post) => post.status === selectedFilter);
  }, [selectedFilter]);

  // Sort posts by scheduled_at (nearest first)
  const sortedPosts = useMemo(() => {
    return [...filteredPosts].sort(
      (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
    );
  }, [filteredPosts]);

  // Calculate counts for filter tabs
  const counts = useMemo(
    () => ({
      all: mockPosts.length,
      pending: mockPosts.filter((p) => p.status === 'pending').length,
      posted: mockPosts.filter((p) => p.status === 'posted').length,
      failed: mockPosts.filter((p) => p.status === 'failed').length,
    }),
    []
  );

  const handleNewPost = () => {
    console.log('Create new post');
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              X Scheduler
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              予定投稿を管理して、効率的にコンテンツを配信
            </p>
          </div>
          <button
            onClick={handleNewPost}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity shadow-sm"
          >
            <Plus className="w-5 h-5" />
            新規投稿
          </button>
        </div>

        {/* Filter Tabs */}
        <FilterTabs selected={selectedFilter} onChange={setSelectedFilter} counts={counts} />

        {/* Post List or Empty State */}
        {sortedPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {sortedPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <EmptyState filter={selectedFilter} />
        )}
      </div>
    </main>
  );
}
