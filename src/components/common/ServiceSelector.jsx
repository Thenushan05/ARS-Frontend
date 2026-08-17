import { AsyncSelect } from './AsyncSelect'
import { pricingApi } from '@/api/pricingApi'

/** Search-select for picking a priced service from the master price list (§16) when building a quotation/invoice/package. */
export function ServiceSelector({ value, onChange, placeholder = 'Search a service...' }) {
  return (
    <AsyncSelect
      value={value}
      onChange={onChange}
      queryKeyPrefix="services"
      placeholder={placeholder}
      loadOptions={pricingApi.searchServices}
      renderOption={(option) => (
        <div className="flex w-full items-center justify-between">
          <span className="font-medium text-slate-800">{option.label}</span>
          {/* Selling price only — cost/profit are restricted (§7) and never surfaced here. */}
          <span className="text-xs text-slate-500">{option.meta?.sellingPrice}</span>
        </div>
      )}
    />
  )
}
