/**
 * LocalStorage Keys
 */
const STORAGE_KEYS = {
  GITHUB_TOKEN: 'postx_github_token',
  GITHUB_OWNER: 'postx_github_owner',
  GITHUB_REPO: 'postx_github_repo',
} as const;

/**
 * Check if localStorage is available
 */
function isStorageAvailable(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get GitHub token from localStorage
 */
export function getToken(): string | null {
  if (!isStorageAvailable()) {
    return null;
  }
  return window.localStorage.getItem(STORAGE_KEYS.GITHUB_TOKEN);
}

/**
 * Set GitHub token to localStorage
 */
export function setToken(token: string): void {
  if (!isStorageAvailable()) {
    console.warn('localStorage is not available');
    return;
  }
  window.localStorage.setItem(STORAGE_KEYS.GITHUB_TOKEN, token);
}

/**
 * Clear GitHub token from localStorage
 */
export function clearToken(): void {
  if (!isStorageAvailable()) {
    return;
  }
  window.localStorage.removeItem(STORAGE_KEYS.GITHUB_TOKEN);
}

/**
 * Check if GitHub token exists in localStorage
 */
export function hasToken(): boolean {
  const token = getToken();
  return token !== null && token.length > 0;
}

/**
 * GitHub repository configuration
 */
export interface RepoConfig {
  owner: string;
  repo: string;
}

/**
 * Get repository configuration from localStorage
 */
export function getRepoConfig(): RepoConfig | null {
  if (!isStorageAvailable()) {
    return null;
  }
  const owner = window.localStorage.getItem(STORAGE_KEYS.GITHUB_OWNER);
  const repo = window.localStorage.getItem(STORAGE_KEYS.GITHUB_REPO);

  if (!owner || !repo) {
    return null;
  }

  return { owner, repo };
}

/**
 * Set repository configuration to localStorage
 */
export function setRepoConfig(config: RepoConfig): void {
  if (!isStorageAvailable()) {
    console.warn('localStorage is not available');
    return;
  }
  window.localStorage.setItem(STORAGE_KEYS.GITHUB_OWNER, config.owner);
  window.localStorage.setItem(STORAGE_KEYS.GITHUB_REPO, config.repo);
}

/**
 * Clear repository configuration from localStorage
 */
export function clearRepoConfig(): void {
  if (!isStorageAvailable()) {
    return;
  }
  window.localStorage.removeItem(STORAGE_KEYS.GITHUB_OWNER);
  window.localStorage.removeItem(STORAGE_KEYS.GITHUB_REPO);
}

/**
 * Check if repository configuration exists
 */
export function hasRepoConfig(): boolean {
  const config = getRepoConfig();
  return config !== null;
}

/**
 * Clear all PostX data from localStorage
 */
export function clearAllData(): void {
  clearToken();
  clearRepoConfig();
}
