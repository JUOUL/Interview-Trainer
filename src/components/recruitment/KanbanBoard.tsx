import type { Company } from '../../types/recruitment'
import { RECRUITMENT_STATUSES } from '../../types/recruitment'
import { STATUS_ACCENT } from '../../utils/recruitmentStyles'
import CompanyCard from './CompanyCard'

interface Props {
  companies: Company[]
  onSelect: (c: Company) => void
}

/** 横向可滚动看板：待关注 → 已开放 → … → 结束 */
export default function KanbanBoard({ companies, onSelect }: Props) {
  return (
    <div className="overflow-x-auto pb-3 -mx-6 px-6">
      <div className="flex gap-4 min-w-max">
        {RECRUITMENT_STATUSES.map((status) => {
          const items = companies.filter((c) => c.status === status)
          return (
            <div key={status} className="w-72 shrink-0">
              <div className="flex items-center gap-2 mb-3 px-1">
                <span className={`w-2 h-2 rounded-full ${STATUS_ACCENT[status]}`} />
                <span className="text-sm font-semibold text-gray-700">{status}</span>
                <span className="text-xs text-gray-400">{items.length}</span>
              </div>
              <div className="space-y-3">
                {items.length === 0 ? (
                  <div className="text-xs text-gray-300 border border-dashed border-gray-200 rounded-lg py-6 text-center">
                    暂无
                  </div>
                ) : (
                  items.map((c) => (
                    <CompanyCard key={c.id} company={c} onClick={() => onSelect(c)} />
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
