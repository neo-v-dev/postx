import { PostStatus } from '@/types';
import { cn } from '@/lib/utils';

interface FilterTabsProps {
  selected: PostStatus | 'all';
  onChange: (filter: PostStatus | 'all') => void;
  counts: {
    all: number;
    pending: number;
    posted: number;
    failed: number;
  };
}

type TabConfig = {
  value: PostStatus | 'all';
  label: string;
  count: keyof FilterTabsProps['counts'];
};

const tabs: TabConfig[] = [
  { value: 'all', label: 'All', count: 'all' },
  { value: 'pending', label: 'Pending', count: 'pending' },
  { value: 'posted', label: 'Posted', count: 'posted' },
  { value: 'failed', label: 'Failed', count: 'failed' },
];

export function FilterTabs({ selected, onChange, counts }: FilterTabsProps) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <nav className="-mb-px flex gap-6 overflow-x-auto" role="tablist">
        {tabs.map((tab) => {
          const isActive = selected === tab.value;
          const count = counts[tab.count];

          return (
            <button
              key={tab.value}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.value)}
              className={cn(
                'whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors',
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              )}
            >
              {tab.label}
              <span
                className={cn(
                  'ml-2 py-0.5 px-2 rounded-full text-xs',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
