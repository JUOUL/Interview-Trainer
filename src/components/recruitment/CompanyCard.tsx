import type { Company } from '../../types/recruitment'
import { daysFromToday, isPast, isWithinNextDays } from '../../utils/recruitment'
import { PRIORITY_STYLE, STATUS_BADGE } from '../../utils/recruitmentStyles'

interface Props {
  company: Company
  onClick: () => void
}

export default function CompanyCard({ company: c, onClick }: Props) {
  const pStyle = PRIORITY_STYLE[c.priority]

  const deadlineOverdue = c.status !== '结束' && isPast(c.deadline)
  const deadlineSoon = c.status !== '结束' && isWithinNextDays(c.deadline, 7)
  const todoSoon = c.status !== '结束' && isWithinNextDays(c.nextActionDate, 7)

  return (
    <div
      onClick={onClick}
      className="relative bg-white border border-gray-200 rounded-xl p-4 pl-5 hover:border-indigo-300 hover:shadow-sm transition-all duration-200 cursor-pointer group overflow-hidden"
    >
      {/* 优先级强调条 */}
      <span className={`absolute left-0 top-0 h-full w-1 ${pStyle.bar}`} />

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
            {c.company}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">{c.category}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span className={`text-[11px] px-1.5 py-0.5 rounded ${pStyle.badge}`}>{c.priority}</span>
          <span className={`text-[11px] px-2 py-0.5 rounded-full ${STATUS_BADGE[c.status]}`}>
            {c.status}
          </span>
        </div>
      </div>

      {/* 目标岗位 */}
      {c.targetRoles.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1">
          {c.targetRoles.slice(0, 4).map((r) => (
            <span
              key={r}
              className="text-[11px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600"
            >
              {r}
            </span>
          ))}
        </div>
      )}

      {/* 关键信息 */}
      <div className="mt-3 space-y-1 text-xs text-gray-500">
        {c.interviewStage && (
          <div>
            面试阶段：<span className="text-gray-700">{c.interviewStage}</span>
          </div>
        )}
        {c.deadline && (
          <div>
            截止：<span className="text-gray-700">{c.deadline}</span>
          </div>
        )}
        {c.nextAction && (
          <div className="truncate">
            下一步：<span className="text-gray-700">{c.nextAction}</span>
            {c.nextActionDate && <span className="text-gray-400">（{c.nextActionDate}）</span>}
          </div>
        )}
      </div>

      {/* 提醒标签 */}
      {(deadlineOverdue || deadlineSoon || todoSoon) && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {deadlineOverdue && (
            <span className="text-[11px] px-1.5 py-0.5 rounded bg-red-50 text-red-600 border border-red-200">
              已过截止
            </span>
          )}
          {deadlineSoon && (
            <span className="text-[11px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
              {daysFromToday(c.deadline) === 0
                ? '今日截止'
                : `${daysFromToday(c.deadline)} 天后截止`}
            </span>
          )}
          {todoSoon && (
            <span className="text-[11px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-200">
              {daysFromToday(c.nextActionDate) === 0
                ? '今日待办'
                : `${daysFromToday(c.nextActionDate)} 天后待办`}
            </span>
          )}
        </div>
      )}

      <div className="mt-2.5 text-[11px] text-gray-300">更新于 {c.lastUpdated}</div>
    </div>
  )
}
