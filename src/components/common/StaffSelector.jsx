import { AsyncSelect } from './AsyncSelect'
import { staffApi } from '@/api/staffApi'

/** Search-select for assigning a consultant/staff member to a lead, case, or task. */
export function StaffSelector({ value, onChange, role, placeholder = 'Search staff...' }) {
  return (
    <AsyncSelect
      value={value}
      onChange={onChange}
      queryKeyPrefix={`staff-${role ?? 'all'}`}
      placeholder={placeholder}
      loadOptions={(query) => staffApi.search(query, { role })}
      renderOption={(option) => (
        <>
          <span className="font-medium text-slate-800">{option.label}</span>
          <span className="text-xs text-slate-500">{option.meta?.roleLabel}</span>
        </>
      )}
    />
  )
}
