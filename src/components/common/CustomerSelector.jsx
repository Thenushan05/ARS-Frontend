import { AsyncSelect } from './AsyncSelect'
import { customersApi } from '@/api/customersApi'

/** Search-select for picking an existing customer (e.g. when starting a new visa case, §9). */
export function CustomerSelector({ value, onChange, placeholder = 'Search by name, mobile, passport or NIC...' }) {
  return (
    <AsyncSelect
      value={value}
      onChange={onChange}
      queryKeyPrefix="customers"
      placeholder={placeholder}
      loadOptions={customersApi.search}
      renderOption={(option) => (
        <>
          <span className="font-medium text-slate-800">{option.label}</span>
          <span className="text-xs text-slate-500">{option.meta?.customerId}</span>
        </>
      )}
    />
  )
}
