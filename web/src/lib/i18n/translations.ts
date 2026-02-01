export const translations = {
  ja: {
    // Common
    common: {
      loading: '読み込み中...',
      save: '保存',
      cancel: 'キャンセル',
      delete: '削除',
      edit: '編集',
      confirm: '確認',
      error: 'エラー',
      success: '成功',
      settings: '設定',
      back: '戻る',
      create: '作成',
      update: '更新',
      close: '閉じる',
    },

    // Navigation
    nav: {
      dashboard: 'ダッシュボード',
      newPost: '新規投稿',
      history: '履歴',
      settings: '設定',
    },

    // Dashboard
    dashboard: {
      title: 'X Scheduler',
      subtitle: '予定投稿を管理して、効率的にコンテンツを配信',
      newPost: '新規投稿',
      filter: {
        all: 'すべて',
        pending: '予定',
        posted: '投稿済み',
        failed: '失敗',
      },
      empty: {
        all: '投稿がありません',
        pending: '予定の投稿がありません',
        posted: '投稿済みの投稿がありません',
        failed: '失敗した投稿がありません',
      },
    },

    // Post Card
    postCard: {
      edit: 'Edit',
      delete: 'Delete',
    },

    // Post Form
    postForm: {
      title: '新規投稿作成',
      editTitle: '投稿を編集',
      subtitle: 'X（旧Twitter）への予約投稿を作成します',
      editSubtitle: '予約投稿の内容を編集します',
      postType: '投稿タイプ',
      text: 'テキスト',
      textPlaceholder: 'ツイートの内容を入力...',
      media: 'メディア',
      selectFile: 'ファイルを選択',
      thread: 'スレッド',
      addTweet: 'ツイートを追加',
      tweetId: 'ツイートIDまたはURL',
      tweetIdPlaceholder: '例: 1234567890 または https://x.com/username/status/1234567890',
      scheduledAt: '予約日時',
      repeatSettings: '繰り返し設定を有効にする',
      repeatType: '繰り返しタイプ',
      daily: '毎日',
      weekly: '毎週',
      monthly: '毎月',
      selectDays: '曜日を選択',
      selectDate: '日付を選択',
      executionTime: '実行時刻',
      endCondition: '終了条件',
      endByDate: '終了日で指定',
      endByCount: '回数で指定',
      times: '回',
      createPost: '予約投稿を作成',
      updatePost: '更新する',
      creating: '作成中...',
      updating: '更新中...',
    },

    // Settings
    settings: {
      title: '設定',
      subtitle: 'システムの動作設定を変更できます',
      github: {
        title: 'GitHub連携',
        connected: 'GitHub接続済み',
        testConnection: '接続テスト',
        testing: 'テスト中...',
        clearSettings: '設定をクリア',
        testSuccess: '接続テスト成功',
        testFailed: '接続テスト失敗',
        setupTitle: 'GitHub Personal Access Token (PAT) の設定',
        setupSteps: {
          step1: 'GitHubのトークン設定ページにアクセス',
          step2: '"Generate new token" → "Fine-grained token" を選択',
          step3: 'Repository access: 対象リポジトリを選択',
          step4: 'Permissions → Contents: Read and write を設定',
          step5: '生成されたトークンを下記に入力',
        },
        token: 'Personal Access Token',
        owner: 'オーナー名（ユーザー名または組織名）',
        repo: 'リポジトリ名',
        saveAndTest: '保存して接続テスト',
      },
      system: {
        title: 'システム設定',
        timezone: 'タイムゾーン',
        interval: '実行間隔（分）',
        dailyLimit: '日次投稿上限',
        monthlyLimit: '月次投稿上限',
        retryMax: 'リトライ上限回数',
        reset: 'リセット',
        saving: '保存中...',
        saved: '設定を保存しました。',
        validationError: '入力内容に誤りがあります。修正してください。',
      },
      usage: {
        title: '利用状況',
        daily: '日次投稿数',
        monthly: '月次投稿数',
        nextReset: '次回リセット:',
      },
      language: {
        title: '言語設定',
        label: '表示言語',
      },
    },

    // Delete Dialog
    deleteDialog: {
      title: '投稿を削除',
      message: 'この投稿を削除してもよろしいですか？',
      confirm: '削除する',
      cancel: 'キャンセル',
      processing: '処理中...',
    },

    // Errors
    errors: {
      required: '必須項目です',
      minValue: '{min}以上を入力してください',
      maxValue: '{max}以下を入力してください',
      charLimit: '文字数が制限を超えています ({current}/{limit})',
      futureDate: '予約日時は未来の時刻を指定してください',
      invalidTweetId: 'ツイートIDは数字のみ、または有効なXのURLを入力してください',
      invalidToken: '無効なトークン形式です。Fine-grained token (github_pat_) または Classic token (ghp_) を入力してください',
      authError: '認証エラー: トークンが無効か権限が不足しています',
      notFound: '見つかりません',
      conflict: '競合エラー: 再度お試しください',
      connectionFailed: '接続テストに失敗しました',
      saveFailed: '保存に失敗しました',
      deleteFailed: '削除に失敗しました',
      fetchFailed: '取得に失敗しました',
    },

    // Setup Guide
    setupGuide: {
      title: 'GitHub連携が必要です',
      message: '投稿データを保存・取得するために、GitHub Personal Access Token (PAT) の設定が必要です。設定画面からトークンを登録してください。',
      goToSettings: '設定画面へ',
    },
  },

  en: {
    // Common
    common: {
      loading: 'Loading...',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      confirm: 'Confirm',
      error: 'Error',
      success: 'Success',
      settings: 'Settings',
      back: 'Back',
      create: 'Create',
      update: 'Update',
      close: 'Close',
    },

    // Navigation
    nav: {
      dashboard: 'Dashboard',
      newPost: 'New Post',
      history: 'History',
      settings: 'Settings',
    },

    // Dashboard
    dashboard: {
      title: 'X Scheduler',
      subtitle: 'Manage scheduled posts and deliver content efficiently',
      newPost: 'New Post',
      filter: {
        all: 'All',
        pending: 'Pending',
        posted: 'Posted',
        failed: 'Failed',
      },
      empty: {
        all: 'No posts',
        pending: 'No pending posts',
        posted: 'No posted posts',
        failed: 'No failed posts',
      },
    },

    // Post Card
    postCard: {
      edit: 'Edit',
      delete: 'Delete',
    },

    // Post Form
    postForm: {
      title: 'Create New Post',
      editTitle: 'Edit Post',
      subtitle: 'Create a scheduled post for X (formerly Twitter)',
      editSubtitle: 'Edit the scheduled post',
      postType: 'Post Type',
      text: 'Text',
      textPlaceholder: 'Enter tweet content...',
      media: 'Media',
      selectFile: 'Select file',
      thread: 'Thread',
      addTweet: 'Add tweet',
      tweetId: 'Tweet ID or URL',
      tweetIdPlaceholder: 'e.g., 1234567890 or https://x.com/username/status/1234567890',
      scheduledAt: 'Scheduled Time',
      repeatSettings: 'Enable repeat settings',
      repeatType: 'Repeat Type',
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      selectDays: 'Select days',
      selectDate: 'Select date',
      executionTime: 'Execution time',
      endCondition: 'End condition',
      endByDate: 'By end date',
      endByCount: 'By count',
      times: 'times',
      createPost: 'Create Scheduled Post',
      updatePost: 'Update',
      creating: 'Creating...',
      updating: 'Updating...',
    },

    // Settings
    settings: {
      title: 'Settings',
      subtitle: 'Configure system settings',
      github: {
        title: 'GitHub Integration',
        connected: 'Connected to GitHub',
        testConnection: 'Test Connection',
        testing: 'Testing...',
        clearSettings: 'Clear Settings',
        testSuccess: 'Connection test successful',
        testFailed: 'Connection test failed',
        setupTitle: 'GitHub Personal Access Token (PAT) Setup',
        setupSteps: {
          step1: 'Go to GitHub token settings page',
          step2: 'Select "Generate new token" → "Fine-grained token"',
          step3: 'Repository access: Select target repository',
          step4: 'Permissions → Contents: Set to Read and write',
          step5: 'Enter the generated token below',
        },
        token: 'Personal Access Token',
        owner: 'Owner (username or organization)',
        repo: 'Repository name',
        saveAndTest: 'Save and Test Connection',
      },
      system: {
        title: 'System Settings',
        timezone: 'Timezone',
        interval: 'Interval (minutes)',
        dailyLimit: 'Daily post limit',
        monthlyLimit: 'Monthly post limit',
        retryMax: 'Max retry count',
        reset: 'Reset',
        saving: 'Saving...',
        saved: 'Settings saved.',
        validationError: 'Please fix the errors in the form.',
      },
      usage: {
        title: 'Usage',
        daily: 'Daily posts',
        monthly: 'Monthly posts',
        nextReset: 'Next reset:',
      },
      language: {
        title: 'Language',
        label: 'Display language',
      },
    },

    // Delete Dialog
    deleteDialog: {
      title: 'Delete Post',
      message: 'Are you sure you want to delete this post?',
      confirm: 'Delete',
      cancel: 'Cancel',
      processing: 'Processing...',
    },

    // Errors
    errors: {
      required: 'Required',
      minValue: 'Must be at least {min}',
      maxValue: 'Must be at most {max}',
      charLimit: 'Character limit exceeded ({current}/{limit})',
      futureDate: 'Scheduled time must be in the future',
      invalidTweetId: 'Tweet ID must be numeric or a valid X URL',
      invalidToken: 'Invalid token format. Use Fine-grained token (github_pat_) or Classic token (ghp_)',
      authError: 'Authentication error: Invalid token or insufficient permissions',
      notFound: 'Not found',
      conflict: 'Conflict error: Please try again',
      connectionFailed: 'Connection test failed',
      saveFailed: 'Failed to save',
      deleteFailed: 'Failed to delete',
      fetchFailed: 'Failed to fetch',
    },

    // Setup Guide
    setupGuide: {
      title: 'GitHub Integration Required',
      message: 'GitHub Personal Access Token (PAT) is required to save and retrieve post data. Please register your token in the settings.',
      goToSettings: 'Go to Settings',
    },
  },
};

export type Language = keyof typeof translations;
export type TranslationKeys = typeof translations.ja;
