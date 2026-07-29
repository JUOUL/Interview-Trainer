import type { RecruitmentStats } from '../../types/recruitment'

interface Props {
  stats: RecruitmentStats
}

/** 顶部统计栏 */
export default function StatsBar({ stats }: Props) {
  const items: { label: string; value: number; color: string }[] = [
    { label: '企业总数', value: stats.total, color: 'text-gray-900' },
    { label: '已开放', value: stats.open, color: 'text-sky-600' },
    { label: '已投递', value: stats.applied, color: 'text-indigo-600' },
    { label: '笔试/测评', value: stats.assessment, color: 'text-violet-600' },
    { label: '面试', value: stats.interview, color: 'text-amber-600' },
    { label: 'Offer', value: stats.offer, color: 'text-green-600' },
    { label: '七天内截止', value: stats.deadlineSoon, color: 'text-red-500' },
    { label: '七天内待办', value: stats.todoSoon, color: 'text-indigo-500' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
      {items.map((it) => (
        <div key={it.label} className="bg-white border border-gray-200 rounded-xl px-3 py-3 text-center">
          <div className={`text-2xl font-bold ${it.color}`}>{it.value}</div>
          <div className="text-xs text-gray-400 mt-0.5">{it.label}</div>
        </div>
      ))}
    </div>
  )
}
