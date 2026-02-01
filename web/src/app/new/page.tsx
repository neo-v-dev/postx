import PostForm from '@/components/post-form';

export default function NewPostPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">新規投稿作成</h1>
          <p className="mt-2 text-sm text-gray-600">
            X（旧Twitter）への予約投稿を作成します
          </p>
        </div>

        <PostForm />
      </div>
    </main>
  );
}
