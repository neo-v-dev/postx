import { randomUUID } from 'crypto';
import type {
  Post,
  PostsData,
  HistoryEntry,
  Config,
  Stats,
  PostStatus,
  PostType,
} from '@/types';
import {
  GitHubClient,
  GitHubConflictError,
  GitHubNotFoundError,
  GitHubAPIError,
} from './github-client';

/**
 * Posts API Error Classes
 */
export class PostsAPIError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = 'PostsAPIError';
  }
}

export class PostNotFoundError extends PostsAPIError {
  constructor(postId: string) {
    super(`Post not found: ${postId}`);
    this.name = 'PostNotFoundError';
  }
}

export class InvalidPostDataError extends PostsAPIError {
  constructor(message: string) {
    super(`Invalid post data: ${message}`);
    this.name = 'InvalidPostDataError';
  }
}

export class ConcurrentUpdateError extends PostsAPIError {
  constructor(message: string = 'Data was modified by another user. Please retry.') {
    super(message);
    this.name = 'ConcurrentUpdateError';
  }
}

/**
 * Posts API Configuration
 */
export interface PostsAPIConfig {
  githubClient: GitHubClient;
  postsFilePath?: string;
}

/**
 * New Post Input (without auto-generated fields)
 */
export type NewPost = Omit<Post, 'id' | 'created_at' | 'updated_at'>;

/**
 * Posts API for managing X scheduler posts
 */
export class PostsAPI {
  private client: GitHubClient;
  private filePath: string;

  constructor(config: PostsAPIConfig) {
    this.client = config.githubClient;
    this.filePath = config.postsFilePath || 'posts.json';
  }

  /**
   * Get all posts
   */
  async getPosts(): Promise<Post[]> {
    const { data } = await this.readPostsData();
    return data.posts;
  }

  /**
   * Get single post by ID
   */
  async getPost(id: string): Promise<Post | null> {
    const { data } = await this.readPostsData();
    return data.posts.find((post) => post.id === id) || null;
  }

  /**
   * Create new post
   */
  async createPost(post: NewPost): Promise<Post> {
    // Validate required fields
    this.validatePost(post);

    const { data, sha } = await this.readPostsData();

    // Create post with auto-generated fields
    const now = new Date().toISOString();
    const newPost: Post = {
      ...post,
      id: this.generateId(),
      created_at: now,
      updated_at: now,
    };

    // Add to posts array
    data.posts.push(newPost);

    // Write back to GitHub
    await this.writePostsData(data, sha, `Add post: ${newPost.id}`);

    return newPost;
  }

  /**
   * Update existing post
   */
  async updatePost(id: string, updates: Partial<Post>): Promise<Post> {
    const { data, sha } = await this.readPostsData();

    // Find post index
    const postIndex = data.posts.findIndex((post) => post.id === id);
    if (postIndex === -1) {
      throw new PostNotFoundError(id);
    }

    // Apply updates
    const updatedPost: Post = {
      ...data.posts[postIndex],
      ...updates,
      id, // Prevent ID change
      updated_at: new Date().toISOString(),
    };

    // Validate updated post
    this.validatePost(updatedPost);

    // Update in array
    data.posts[postIndex] = updatedPost;

    // Write back to GitHub
    try {
      await this.writePostsData(data, sha, `Update post: ${id}`);
    } catch (error) {
      if (error instanceof GitHubConflictError) {
        throw new ConcurrentUpdateError();
      }
      throw error;
    }

    return updatedPost;
  }

  /**
   * Delete post
   */
  async deletePost(id: string): Promise<void> {
    const { data, sha } = await this.readPostsData();

    // Find post index
    const postIndex = data.posts.findIndex((post) => post.id === id);
    if (postIndex === -1) {
      throw new PostNotFoundError(id);
    }

    // Remove from array
    data.posts.splice(postIndex, 1);

    // Write back to GitHub
    try {
      await this.writePostsData(data, sha, `Delete post: ${id}`);
    } catch (error) {
      if (error instanceof GitHubConflictError) {
        throw new ConcurrentUpdateError();
      }
      throw error;
    }
  }

  /**
   * Get post history
   */
  async getHistory(): Promise<HistoryEntry[]> {
    const { data } = await this.readPostsData();
    return data.history;
  }

  /**
   * Get configuration
   */
  async getConfig(): Promise<Config> {
    const { data } = await this.readPostsData();
    return data.config;
  }

  /**
   * Update configuration
   */
  async updateConfig(updates: Partial<Config>): Promise<Config> {
    const { data, sha } = await this.readPostsData();

    // Apply updates
    const updatedConfig: Config = {
      ...data.config,
      ...updates,
    };

    // Validate config
    this.validateConfig(updatedConfig);

    data.config = updatedConfig;

    // Write back to GitHub
    try {
      await this.writePostsData(data, sha, 'Update config');
    } catch (error) {
      if (error instanceof GitHubConflictError) {
        throw new ConcurrentUpdateError();
      }
      throw error;
    }

    return updatedConfig;
  }

  /**
   * Get statistics
   */
  async getStats(): Promise<Stats> {
    const { data } = await this.readPostsData();
    return data.stats;
  }

  /**
   * Read posts data from GitHub
   */
  private async readPostsData(): Promise<{ data: PostsData; sha: string }> {
    try {
      const fileContent = await this.client.getFileContent(this.filePath);

      if (!fileContent) {
        // File doesn't exist, return default structure
        return {
          data: this.getDefaultPostsData(),
          sha: '',
        };
      }

      // Parse JSON
      let data: PostsData;
      try {
        data = JSON.parse(fileContent.content);
      } catch (error) {
        throw new PostsAPIError(
          `Failed to parse ${this.filePath}: Invalid JSON`,
          error
        );
      }

      // Validate structure
      this.validatePostsData(data);

      return {
        data,
        sha: fileContent.sha,
      };
    } catch (error) {
      if (error instanceof PostsAPIError) {
        throw error;
      }
      if (error instanceof GitHubNotFoundError) {
        // Return default data for missing file
        return {
          data: this.getDefaultPostsData(),
          sha: '',
        };
      }
      throw new PostsAPIError(
        `Failed to read ${this.filePath}`,
        error
      );
    }
  }

  /**
   * Write posts data to GitHub
   */
  private async writePostsData(
    data: PostsData,
    sha: string,
    message: string
  ): Promise<void> {
    try {
      const content = JSON.stringify(data, null, 2);
      await this.client.updateFileContent(this.filePath, content, sha, message);
    } catch (error) {
      if (error instanceof GitHubConflictError) {
        throw new ConcurrentUpdateError();
      }
      throw new PostsAPIError(
        `Failed to write ${this.filePath}`,
        error
      );
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return randomUUID();
  }

  /**
   * Get default posts data structure
   */
  private getDefaultPostsData(): PostsData {
    const now = new Date().toISOString();
    return {
      config: {
        timezone: 'Asia/Tokyo',
        interval_minutes: 30,
        daily_limit: 50,
        monthly_limit: 1500,
        retry_max: 3,
      },
      posts: [],
      history: [],
      stats: {
        daily_count: 0,
        daily_reset_at: now,
        monthly_count: 0,
        monthly_reset_at: now,
      },
    };
  }

  /**
   * Validate posts data structure
   */
  private validatePostsData(data: unknown): asserts data is PostsData {
    if (typeof data !== 'object' || data === null) {
      throw new InvalidPostDataError('Posts data must be an object');
    }

    const d = data as Record<string, unknown>;

    if (!d.config || typeof d.config !== 'object') {
      throw new InvalidPostDataError('Missing or invalid config');
    }

    if (!Array.isArray(d.posts)) {
      throw new InvalidPostDataError('Posts must be an array');
    }

    if (!Array.isArray(d.history)) {
      throw new InvalidPostDataError('History must be an array');
    }

    if (!d.stats || typeof d.stats !== 'object') {
      throw new InvalidPostDataError('Missing or invalid stats');
    }
  }

  /**
   * Validate post data
   */
  private validatePost(post: Partial<Post>): void {
    if (!post.type) {
      throw new InvalidPostDataError('Missing required field: type');
    }

    if (!post.status) {
      throw new InvalidPostDataError('Missing required field: status');
    }

    if (!post.scheduled_at) {
      throw new InvalidPostDataError('Missing required field: scheduled_at');
    }

    // Validate scheduled_at is valid ISO date
    if (!this.isValidISODate(post.scheduled_at)) {
      throw new InvalidPostDataError('scheduled_at must be a valid ISO 8601 date');
    }

    // Type-specific validation
    if (post.type === 'tweet' || post.type === 'thread') {
      if (post.type === 'tweet' && !post.text) {
        throw new InvalidPostDataError('Tweet must have text');
      }
      if (post.type === 'thread' && (!post.thread || post.thread.length === 0)) {
        throw new InvalidPostDataError('Thread must have at least one item');
      }
    }

    if (post.type === 'repost' && !post.target_tweet_id) {
      throw new InvalidPostDataError('Repost must have target_tweet_id');
    }

    // Validate status
    const validStatuses: PostStatus[] = ['pending', 'posting', 'posted', 'failed', 'cancelled'];
    if (!validStatuses.includes(post.status as PostStatus)) {
      throw new InvalidPostDataError(`Invalid status: ${post.status}`);
    }

    // Validate type
    const validTypes: PostType[] = ['tweet', 'thread', 'repost'];
    if (!validTypes.includes(post.type as PostType)) {
      throw new InvalidPostDataError(`Invalid type: ${post.type}`);
    }
  }

  /**
   * Validate config
   */
  private validateConfig(config: Config): void {
    if (!config.timezone || typeof config.timezone !== 'string') {
      throw new InvalidPostDataError('Invalid timezone');
    }

    if (typeof config.interval_minutes !== 'number' || config.interval_minutes <= 0) {
      throw new InvalidPostDataError('interval_minutes must be a positive number');
    }

    if (typeof config.daily_limit !== 'number' || config.daily_limit <= 0) {
      throw new InvalidPostDataError('daily_limit must be a positive number');
    }

    if (typeof config.monthly_limit !== 'number' || config.monthly_limit <= 0) {
      throw new InvalidPostDataError('monthly_limit must be a positive number');
    }

    if (typeof config.retry_max !== 'number' || config.retry_max < 0) {
      throw new InvalidPostDataError('retry_max must be a non-negative number');
    }
  }

  /**
   * Check if string is valid ISO 8601 date
   */
  private isValidISODate(dateString: string): boolean {
    const date = new Date(dateString);
    return !isNaN(date.getTime()) && date.toISOString() === dateString;
  }
}

/**
 * Factory function to create Posts API
 */
export function createPostsAPI(config: PostsAPIConfig): PostsAPI {
  return new PostsAPI(config);
}
