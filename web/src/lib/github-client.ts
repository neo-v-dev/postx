import { Octokit } from '@octokit/rest';

/**
 * GitHub API Error Classes
 */
export class GitHubAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'GitHubAPIError';
  }
}

export class GitHubAuthError extends GitHubAPIError {
  constructor(message: string = 'GitHub authentication failed') {
    super(message, 401);
    this.name = 'GitHubAuthError';
  }
}

export class GitHubNotFoundError extends GitHubAPIError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
    this.name = 'GitHubNotFoundError';
  }
}

export class GitHubConflictError extends GitHubAPIError {
  constructor(message: string = 'File was modified by another process') {
    super(message, 409);
    this.name = 'GitHubConflictError';
  }
}

export class GitHubRateLimitError extends GitHubAPIError {
  constructor(
    message: string = 'GitHub API rate limit exceeded',
    public resetTime?: Date
  ) {
    super(message, 429);
    this.name = 'GitHubRateLimitError';
  }
}

export class GitHubServerError extends GitHubAPIError {
  constructor(message: string = 'GitHub server error') {
    super(message, 500);
    this.name = 'GitHubServerError';
  }
}

/**
 * GitHub Client Configuration
 */
export interface GitHubClientConfig {
  owner: string;
  repo: string;
  token: string;
}

/**
 * File Content Response
 */
export interface FileContent {
  content: string;
  sha: string;
}

/**
 * GitHub Client for file operations
 */
export class GitHubClient {
  private octokit: Octokit;
  private owner: string;
  private repo: string;

  constructor(config: GitHubClientConfig) {
    if (!config.token) {
      throw new GitHubAuthError('GitHub token is required');
    }
    if (!config.owner || !config.repo) {
      throw new GitHubAPIError('GitHub owner and repo are required');
    }

    this.octokit = new Octokit({ auth: config.token });
    this.owner = config.owner;
    this.repo = config.repo;
  }

  /**
   * Get file content from repository
   * @param path File path in repository
   * @returns File content and SHA, or null if not found
   */
  async getFileContent(path: string): Promise<FileContent | null> {
    try {
      const response = await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path,
      });

      // Log rate limit info for monitoring
      const rateLimit = response.headers['x-ratelimit-remaining'];
      if (rateLimit) {
        console.debug(`GitHub API rate limit remaining: ${rateLimit}`);
      }

      // Check if response is a file (not directory or symlink)
      if (!('content' in response.data) || Array.isArray(response.data)) {
        throw new GitHubAPIError(`Path ${path} is not a file`);
      }

      const { content, sha } = response.data;

      // Decode base64 content
      const decodedContent = Buffer.from(content, 'base64').toString('utf-8');

      return {
        content: decodedContent,
        sha,
      };
    } catch (error: unknown) {
      return this.handleError(error, path);
    }
  }

  /**
   * Update file content in repository
   * @param path File path in repository
   * @param content New file content
   * @param sha Current file SHA for optimistic locking
   * @param message Commit message
   * @returns New SHA after update
   */
  async updateFileContent(
    path: string,
    content: string,
    sha: string,
    message: string
  ): Promise<string> {
    try {
      const response = await this.octokit.repos.createOrUpdateFileContents({
        owner: this.owner,
        repo: this.repo,
        path,
        message,
        content: Buffer.from(content, 'utf-8').toString('base64'),
        sha,
      });

      // Log rate limit info
      const rateLimit = response.headers['x-ratelimit-remaining'];
      if (rateLimit) {
        console.debug(`GitHub API rate limit remaining: ${rateLimit}`);
      }

      if (!response.data.content) {
        throw new GitHubAPIError('Failed to update file: no content in response');
      }

      if (!response.data.content.sha) {
        throw new GitHubAPIError('Failed to update file: no SHA in response');
      }

      return response.data.content.sha;
    } catch (error: unknown) {
      throw this.handleError(error, path);
    }
  }

  /**
   * Create blob (for media uploads)
   * @param content Content to upload
   * @param encoding Content encoding ('base64' or 'utf-8')
   * @returns Blob SHA
   */
  async createBlob(
    content: string,
    encoding: 'base64' | 'utf-8' = 'utf-8'
  ): Promise<string> {
    try {
      const response = await this.octokit.git.createBlob({
        owner: this.owner,
        repo: this.repo,
        content,
        encoding,
      });

      return response.data.sha;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle GitHub API errors
   */
  private handleError(error: unknown, path?: string): never {
    if (typeof error === 'object' && error !== null && 'status' in error) {
      const status = (error as { status: number }).status;
      const message = (error as { message?: string }).message || 'Unknown error';

      switch (status) {
        case 401:
        case 403:
          throw new GitHubAuthError(
            `Authentication failed: ${message}. Please check your GitHub token.`
          );

        case 404:
          // For getFileContent, return null for 404
          if (path && message.includes('Not Found')) {
            return null as never;
          }
          throw new GitHubNotFoundError(
            path ? `File not found: ${path}` : message
          );

        case 409:
          throw new GitHubConflictError(
            `File was modified by another process. Please retry.`
          );

        case 429: {
          const resetHeader =
            'response' in error &&
            typeof error.response === 'object' &&
            error.response !== null &&
            'headers' in error.response &&
            typeof error.response.headers === 'object' &&
            error.response.headers !== null &&
            'x-ratelimit-reset' in error.response.headers
              ? (error.response.headers as { 'x-ratelimit-reset'?: string })[
                  'x-ratelimit-reset'
                ]
              : undefined;

          const resetTime = resetHeader
            ? new Date(parseInt(resetHeader) * 1000)
            : undefined;

          throw new GitHubRateLimitError(
            `Rate limit exceeded.${
              resetTime ? ` Resets at ${resetTime.toISOString()}` : ''
            }`,
            resetTime
          );
        }

        case 500:
        case 502:
        case 503:
        case 504:
          throw new GitHubServerError(`GitHub server error: ${message}`);

        default:
          throw new GitHubAPIError(
            `GitHub API error: ${message}`,
            status,
            error
          );
      }
    }

    // Unknown error type
    throw new GitHubAPIError(
      `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
      undefined,
      error
    );
  }
}

/**
 * Factory function to create GitHub client
 */
export function createGitHubClient(config: GitHubClientConfig): GitHubClient {
  return new GitHubClient(config);
}
