'use client';

import { useState, useCallback } from 'react';
import { format, parseISO } from 'date-fns';
import { Settings, Check, X, AlertCircle, Github } from 'lucide-react';
import { Config, Stats } from '@/types';
import { cn } from '@/lib/utils';
import { TokenSetup } from '@/components/token-setup';
import { LanguageSelector } from '@/components/language-selector';
import { useTranslation } from '@/lib/i18n';

// Mock data (temporary - will be replaced with API)
const INITIAL_CONFIG: Config = {
  timezone: 'Asia/Tokyo',
  interval_minutes: 15,
  daily_limit: 30,
  monthly_limit: 500,
  retry_max: 3,
};

const MOCK_STATS: Stats = {
  daily_count: 15,
  daily_reset_at: '2026-02-02T00:00:00+09:00',
  monthly_count: 120,
  monthly_reset_at: '2026-03-01T00:00:00+09:00',
};

const VALIDATION_RULES: Record<keyof Config, { min?: number; max?: number; required: boolean }> = {
  timezone: { required: true },
  interval_minutes: { min: 5, max: 60, required: true },
  daily_limit: { min: 1, max: 50, required: true },
  monthly_limit: { min: 1, max: 1000, required: true },
  retry_max: { min: 1, max: 10, required: true },
};

function validateField(field: keyof Config, value: string | number): string | null {
  const rule = VALIDATION_RULES[field];

  if (rule.required && !value) {
    return '必須項目です';
  }

  if (typeof value === 'number') {
    if (rule.min !== undefined && value < rule.min) {
      return `${rule.min}以上を入力してください`;
    }
    if (rule.max !== undefined && value > rule.max) {
      return `${rule.max}以下を入力してください`;
    }
  }

  return null;
}

function validateConfig(config: Config): Record<keyof Config, string | null> {
  const errors = {} as Record<keyof Config, string | null>;

  (Object.keys(config) as Array<keyof Config>).forEach(key => {
    errors[key] = validateField(key, config[key]);
  });

  return errors;
}

function FormField({
  label,
  name,
  type = 'text',
  value,
  error,
  min,
  max,
  onChange,
}: {
  label: string;
  name: string;
  type?: 'text' | 'number';
  value: string | number;
  error: string | null;
  min?: number;
  max?: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        className={cn(
          'block w-full rounded-md shadow-sm text-sm',
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
        )}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}

function ProgressBar({ current, limit }: { current: number; limit: number }) {
  const percentage = Math.min((current / limit) * 100, 100);
  const isHigh = percentage >= 80;
  const isMedium = percentage >= 60;

  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div
        className={cn(
          'h-2.5 rounded-full transition-all',
          isHigh ? 'bg-red-600' : isMedium ? 'bg-yellow-600' : 'bg-green-600'
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

function StatCard({
  title,
  current,
  limit,
  resetAt,
  resetLabel,
}: {
  title: string;
  current: number;
  limit: number;
  resetAt: string;
  resetLabel: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">{title}</h3>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-gray-900">{current}</span>
          <span className="text-sm text-gray-500">/ {limit}</span>
        </div>

        <ProgressBar current={current} limit={limit} />

        <div className="flex items-center gap-1 text-xs text-gray-500">
          <span>{resetLabel}</span>
          <time dateTime={resetAt}>{format(parseISO(resetAt), 'yyyy-MM-dd HH:mm')}</time>
        </div>
      </div>
    </div>
  );
}

function Alert({ type, children }: { type: 'success' | 'error'; children: React.ReactNode }) {
  const variants = {
    success: 'bg-green-50 border-green-300 text-green-800',
    error: 'bg-red-50 border-red-300 text-red-800',
  };

  const Icon = type === 'success' ? Check : X;

  return (
    <div
      className={cn('border rounded-lg p-4 flex items-start gap-3 mb-6', variants[type])}
      role="status"
      aria-live="polite"
    >
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1 text-sm">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const t = useTranslation();
  const [formData, setFormData] = useState<Config>(INITIAL_CONFIG);
  const [errors, setErrors] = useState<Record<keyof Config, string | null>>({
    timezone: null,
    interval_minutes: null,
    daily_limit: null,
    monthly_limit: null,
    retry_max: null,
  });
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleFieldChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value, type } = e.target;
      const fieldName = name as keyof Config;
      const fieldValue = type === 'number' ? Number(value) : value;

      setFormData(prev => ({ ...prev, [fieldName]: fieldValue }));

      // Real-time validation
      const error = validateField(fieldName, fieldValue);
      setErrors(prev => ({ ...prev, [fieldName]: error }));

      // Clear save message on change
      setSaveMessage(null);
    },
    []
  );

  const handleSave = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      // Validate all fields
      const validationErrors = validateConfig(formData);
      setErrors(validationErrors);

      // Check if there are any errors
      const hasErrors = Object.values(validationErrors).some(error => error !== null);

      if (hasErrors) {
        setSaveMessage({ type: 'error', text: t.settings.system.validationError });
        return;
      }

      // Mock save (will be replaced with API call)
      setIsSaving(true);
      console.log('Saving config:', formData);

      setTimeout(() => {
        setIsSaving(false);
        setSaveMessage({ type: 'success', text: t.settings.system.saved });
      }, 500);
    },
    [formData, t]
  );

  const handleReset = useCallback(() => {
    setFormData(INITIAL_CONFIG);
    setErrors({
      timezone: null,
      interval_minutes: null,
      daily_limit: null,
      monthly_limit: null,
      retry_max: null,
    });
    setSaveMessage(null);
  }, []);

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-8 h-8 text-gray-900" />
            <h1 className="text-3xl font-bold text-gray-900">{t.settings.title}</h1>
          </div>
          <p className="text-sm text-gray-600">{t.settings.subtitle}</p>
        </div>

        {/* Save Message */}
        {saveMessage && <Alert type={saveMessage.type}>{saveMessage.text}</Alert>}

        {/* Language Settings */}
        <section className="mb-8">
          <LanguageSelector />
        </section>

        {/* GitHub PAT Settings */}
        <section className="mb-8">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Github className="w-5 h-5" />
              {t.settings.github.title}
            </h2>
            <TokenSetup />
          </div>
        </section>

        {/* Config Form */}
        <section className="mb-8">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t.settings.system.title}</h2>

            <form onSubmit={handleSave}>
              <div className="space-y-4">
                <FormField
                  label={t.settings.system.timezone}
                  name="timezone"
                  value={formData.timezone}
                  error={errors.timezone}
                  onChange={handleFieldChange}
                />

                <FormField
                  label={t.settings.system.interval}
                  name="interval_minutes"
                  type="number"
                  min={5}
                  max={60}
                  value={formData.interval_minutes}
                  error={errors.interval_minutes}
                  onChange={handleFieldChange}
                />

                <FormField
                  label={t.settings.system.dailyLimit}
                  name="daily_limit"
                  type="number"
                  min={1}
                  max={50}
                  value={formData.daily_limit}
                  error={errors.daily_limit}
                  onChange={handleFieldChange}
                />

                <FormField
                  label={t.settings.system.monthlyLimit}
                  name="monthly_limit"
                  type="number"
                  min={1}
                  max={1000}
                  value={formData.monthly_limit}
                  error={errors.monthly_limit}
                  onChange={handleFieldChange}
                />

                <FormField
                  label={t.settings.system.retryMax}
                  name="retry_max"
                  type="number"
                  min={1}
                  max={10}
                  value={formData.retry_max}
                  error={errors.retry_max}
                  onChange={handleFieldChange}
                />

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className={cn(
                      'inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white',
                      isSaving
                        ? 'bg-blue-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                    )}
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        {t.settings.system.saving}
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        {t.common.save}
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <X className="w-4 h-4 mr-2" />
                    {t.settings.system.reset}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </section>

        {/* Stats */}
        <section>
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t.settings.usage.title}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatCard
                title={t.settings.usage.daily}
                current={MOCK_STATS.daily_count}
                limit={formData.daily_limit}
                resetAt={MOCK_STATS.daily_reset_at}
                resetLabel={t.settings.usage.nextReset}
              />

              <StatCard
                title={t.settings.usage.monthly}
                current={MOCK_STATS.monthly_count}
                limit={formData.monthly_limit}
                resetAt={MOCK_STATS.monthly_reset_at}
                resetLabel={t.settings.usage.nextReset}
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
