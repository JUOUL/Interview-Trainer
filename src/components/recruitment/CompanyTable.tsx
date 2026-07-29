import type { Company } from '../../types/recruitment'
import { isPast, isWithinNextDays } from '../../utils/recruitment'
import { PRIORITY_STYLE, STATUS_BADGE } from '../../utils/recruitmentStyles'

interface Props {
  companies: Company[]
  onSelect: (c: Company) => void
}

/** 表格视图：一屏浏览全部企业关键字段 */
export default function CompanyTable({ companies, onSelect }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
            <th className="px-4 py-3 font-medium">企业</th>
            <th className="px-4 py-3 font-medium">类别</th>
            <th className="px-4 py-3 font-medium">优先级</th>
            <th className="px-4 py-3 font-medium">状态</th>
            <th className="px-4 py-3 font-medium">目标岗位</th>
            <th className="px-4 py-3 font-medium">截止</th>
            <th className="px-4 py-3 font-medium">下一步</th>
            <th className="px-4 py-3 font-medium">面试阶段</th>
            <th className="px-4 py-3 font-medium">更新</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((c) => {
            const overdue = c.status !== '结束' && isPast(c.deadline)
            const soon = c.status !== '结束' && isWithinNextDays(c.deadline, 7)
            return (
              <tr
                key={c.id}
                onClick={() => onSelect(c)}
                className="border-b border-gray-50 last:border-0 hover:bg-indigo-50/40 cursor-pointer"
              >
                <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                  {c.company}
                </td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{c.category}</td>
                <td className="px-4 py-3">
                  <span className={`text-[11px] px-1.5 py-0.5 rounded ${PRIORITY_STYLE[c.priority].badge}`}>
                    {c.priority}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[11px] px-2 py-0.5 rounded-full ${STATUS_BADGE[c.status]}`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 max-w-48 truncate">
                  {c.targetRoles.join('、')}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {c.deadline ? (
                    <span className={overdue ? 'text-red-600' : soon ? 'text-amber-600' : 'text-gray-500'}>
                      {c.deadline}
                    </span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-500 max-w-40 truncate">
                  {c.nextAction || <span className="text-gray-300">—</span>}
                </td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                  {c.interviewStage || <span className="text-gray-300">—</span>}
                </td>
                <td className="px-4 py-3 text-gray-400 whitespace-nowrap text-xs">{c.lastUpdated}</td>
              </tr>
            )
          })}
          {companies.length === 0 && (
            <tr>
              <td colSpan={9} className="px-4 py-10 text-center text-gray-300">
                没有符合条件的企业
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
