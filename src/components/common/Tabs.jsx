import { cn } from '@/utils/cn'

/**
 * Generic tab strip. Controlled — the caller owns `activeKey` and renders
 * whichever panel matches it; this component only owns the strip itself
 * (no built-in panel switching), so it composes with any content shape.
 *
 *   tabs: [{ key, label, icon?: LucideIcon }]
 *   <Tabs tabs={TABS} activeKey={activeTab} onChange={setActiveTab} />
 */
export function Tabs({ tabs, activeKey, onChange }) {
  return (
    <div className="border-b border-surface-border">
      <nav className="-mb-px flex gap-1 overflow-x-auto scrollbar-thin" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = tab.key === activeKey
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onChange(tab.key)}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-slate-500 hover:border-slate-200 hover:text-slate-700',
              )}
            >
              {Icon && <Icon className="size-4" />}
              {tab.label}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
