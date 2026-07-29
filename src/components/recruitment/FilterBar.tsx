import type { CompanyFilters } from '../../utils/recruitment'
import { EMPTY_FILTERS } from '../../utils/recruitment'
import {
  RECRUITMENT_CATEGORIES,
  RECRUITMENT_PRIORITIES,
  RECRUITMENT_STATUSES,
} from '../../types/recruitment'

interface Props {
  filters: CompanyFilters
  roles: string[]
  onChange: (f: CompanyFilters) => void
}

const selectClass =
  'text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 focus:outline-none focus:border-indigo-300'

export default function FilterBar({ filters, roles, onChange }: Props) {
  function set<K extends keyof CompanyFilters>(key: K, value: CompanyFilters[K]) {
    onChange({ ...filters, [key]: value })
  }

  const isDirty = JSON.stringify(filters) !== JSON.stringify(EMPTY_FILTERS)

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 mb-5 flex flex-wrap items-center gap-2">
      <input
        type="text"
        placeholder="搜索企业名称…"
        value={filters.search}
        onChange={(e) => set('search', e.target.value)}
        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:border-indigo-300 w-44"
      />

      <select value={filters.category} onChange={(e) => set('category', e.target.value)} className={selectClass}>
        <option value="">全部类别</option>
        {RECRUITMENT_CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <select value={filters.priority} onChange={(e) => set('priority', e.target.value)} className={selectClass}>
        <option value="">全部优先级</option>
        {RECRUITMENT_PRIORITIES.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>

      <select value={filters.status} onChange={(e) => set('status', e.target.value)} className={selectClass}>
        <option value="">全部状态</option>
        {RECRUITMENT_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <select value={filters.role} onChange={(e) => set('role', e.target.value)} className={selectClass}>
        <option value="">全部岗位</option>
        {roles.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>

      <label className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer px-1">
        <input
          type="checkbox"
          checked={filters.deadlineSoonOnly}
          onChange={(e) => set('deadlineSoonOnly', e.target.checked)}
          className="accent-indigo-500"
        />
        七天内截止
      </label>

      <label className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer px-1">
        <input
          type="checkbox"
          checked={filters.todoSoonOnly}
          onChange={(e) => set('todoSoonOnly', e.target.checked)}
          className="accent-indigo-500"
        />
        七天内待办
      </label>

      {isDirty && (
        <button
          onClick={() => onChange(EMPTY_FILTERS)}
          className="text-sm text-gray-400 hover:text-red-500 transition-colors px-2 py-1 rounded hover:bg-red-50 ml-auto"
        >
          清除筛选
        </button>
      )}
    </div>
  )
}
