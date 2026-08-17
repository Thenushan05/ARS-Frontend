import { AsyncSelect } from './AsyncSelect'
import { visaCasesApi } from '@/api/visaCasesApi'

/** Search-select for picking a visa case (e.g. when linking an invoice/payment to a case). */
export function CaseSelector({ value, onChange, customerId, placeholder = 'Search by case ID or country...' }) {
  return (
    <AsyncSelect
      value={value}
      onChange={onChange}
      queryKeyPrefix={`cases-${customerId ?? 'all'}`}
      placeholder={placeholder}
      loadOptions={(query) => visaCasesApi.search(query, { customerId })}
      renderOption={(option) => (
        <>
          <span className="font-medium text-slate-800">{option.label}</span>
          <span className="text-xs text-slate-500">{option.meta?.country}</span>
        </>
      )}
    />
  )
}
