import { Post } from '@/types';

export const mockPosts: Post[] = [
  // Pending posts (4)
  {
    id: '1',
    type: 'tweet',
    status: 'pending',
    scheduled_at: '2026-02-01T14:30:00+09:00',
    created_at: '2026-01-31T10:00:00+09:00',
    updated_at: '2026-01-31T10:00:00+09:00',
    text: 'Excited to share our latest product update! Check out the new features we\'ve been working on. #ProductLaunch',
  },
  {
    id: '2',
    type: 'thread',
    status: 'pending',
    scheduled_at: '2026-02-02T09:00:00+09:00',
    created_at: '2026-01-31T15:30:00+09:00',
    updated_at: '2026-01-31T15:30:00+09:00',
    thread: [
      {
        text: '🧵 Thread: Top 5 productivity tips for developers in 2026',
      },
      {
        text: '1/ Start your day with the most important task. Don\'t check email first!',
      },
      {
        text: '2/ Use the Pomodoro Technique: 25 minutes of focused work, 5 minutes break.',
      },
    ],
  },
  {
    id: '3',
    type: 'repost',
    status: 'pending',
    scheduled_at: '2026-02-01T18:00:00+09:00',
    created_at: '2026-02-01T08:00:00+09:00',
    updated_at: '2026-02-01T08:00:00+09:00',
    target_tweet_id: '1234567890',
    text: 'Great insights on AI development trends!',
  },
  {
    id: '4',
    type: 'tweet',
    status: 'pending',
    scheduled_at: '2026-02-03T12:00:00+09:00',
    created_at: '2026-02-01T09:00:00+09:00',
    updated_at: '2026-02-01T09:00:00+09:00',
    text: 'Join us for our upcoming webinar on cloud-native architecture. Limited seats available!',
  },

  // Posted posts (5)
  {
    id: '5',
    type: 'tweet',
    status: 'posted',
    scheduled_at: '2026-01-30T10:00:00+09:00',
    created_at: '2026-01-29T14:00:00+09:00',
    updated_at: '2026-01-30T10:01:00+09:00',
    text: 'Happy Monday everyone! Let\'s make this week productive and successful. 💪',
    posted_tweet_id: '9876543210',
  },
  {
    id: '6',
    type: 'thread',
    status: 'posted',
    scheduled_at: '2026-01-29T15:00:00+09:00',
    created_at: '2026-01-28T10:00:00+09:00',
    updated_at: '2026-01-29T15:02:00+09:00',
    thread: [
      {
        text: '🚀 Announcing our Q1 2026 roadmap!',
        posted_tweet_id: '1111111111',
      },
      {
        text: 'Feature 1: Enhanced security with zero-trust architecture',
        posted_tweet_id: '2222222222',
      },
      {
        text: 'Feature 2: AI-powered analytics dashboard',
        posted_tweet_id: '3333333333',
      },
    ],
  },
  {
    id: '7',
    type: 'repost',
    status: 'posted',
    scheduled_at: '2026-01-28T12:00:00+09:00',
    created_at: '2026-01-27T18:00:00+09:00',
    updated_at: '2026-01-28T12:01:00+09:00',
    target_tweet_id: '5555555555',
    posted_tweet_id: '6666666666',
  },
  {
    id: '8',
    type: 'tweet',
    status: 'posted',
    scheduled_at: '2026-01-27T16:30:00+09:00',
    created_at: '2026-01-26T10:00:00+09:00',
    updated_at: '2026-01-27T16:31:00+09:00',
    text: 'Check out our latest blog post on microservices best practices: https://example.com/blog/microservices',
    posted_tweet_id: '7777777777',
  },
  {
    id: '9',
    type: 'tweet',
    status: 'posted',
    scheduled_at: '2026-01-26T11:00:00+09:00',
    created_at: '2026-01-25T14:00:00+09:00',
    updated_at: '2026-01-26T11:02:00+09:00',
    text: 'Thank you for 10K followers! We appreciate your support and engagement. Here\'s to many more milestones together! 🎉',
    posted_tweet_id: '8888888888',
  },

  // Failed posts (3)
  {
    id: '10',
    type: 'tweet',
    status: 'failed',
    scheduled_at: '2026-01-31T08:00:00+09:00',
    created_at: '2026-01-30T16:00:00+09:00',
    updated_at: '2026-01-31T08:05:00+09:00',
    text: 'This tweet failed to post due to API rate limiting.',
    retry_count: 3,
    error_message: 'API rate limit exceeded. Please try again later.',
  },
  {
    id: '11',
    type: 'thread',
    status: 'failed',
    scheduled_at: '2026-01-30T14:00:00+09:00',
    created_at: '2026-01-29T10:00:00+09:00',
    updated_at: '2026-01-30T14:03:00+09:00',
    thread: [
      {
        text: 'Thread about our new feature (failed to post)',
      },
      {
        text: 'Details about the feature...',
      },
    ],
    retry_count: 2,
    error_message: 'Authentication failed. Invalid credentials.',
  },
  {
    id: '12',
    type: 'tweet',
    status: 'failed',
    scheduled_at: '2026-01-29T09:00:00+09:00',
    created_at: '2026-01-28T12:00:00+09:00',
    updated_at: '2026-01-29T09:02:00+09:00',
    text: 'Morning motivation: Every expert was once a beginner. Keep learning, keep growing! 🌱',
    retry_count: 1,
    error_message: 'Network timeout. Unable to connect to X API.',
  },
];
