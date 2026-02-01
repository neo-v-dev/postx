'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { EditPostContent } from '@/components/edit-post-content';

function LoadingFallback() {
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

export default function EditPostPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <EditPostContent />
    </Suspense>
  );
}
