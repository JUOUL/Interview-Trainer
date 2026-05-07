import type { QuestionBank, BankStats } from '../types/question'
import ProgressBar from './ProgressBar'

interface Props {
  bank: QuestionBank
  stats: BankStats
  onStart: () => void
  onReset: () => void
}

export default function BankCard({ bank, stats, onStart, onReset }: Props) {
  return (
    <div
      className="bg-white border border-gray-200 rounded-xl p-6 hover:border-indigo-300 hover:shadow-sm transition-all duration-200 cursor-pointer group"
      onClick={onStart}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
              {bank.name}
            </h2>
            {stats.known === stats.total && stats.total > 0 && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                已完成
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{bank.description}</p>
        </div>
        <span className="ml-4 text-2xl font-bold text-indigo-500 shrink-0">
          {stats.percentage}%
        </span>
      </div>

      <ProgressBar percentage={stats.percentage} className="mb-4" />

      <div className="flex items-center gap-4 text-sm">
        <StatItem label="总题数" value={stats.total} color="text-gray-600" />
        <StatItem label="已掌握" value={stats.known} color="text-green-600" />
        <StatItem label="不确定" value={stats.uncertain} color="text-yellow-600" />
        <StatItem label="不知道" value={stats.unknown} color="text-red-600" />
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
        <button
          className="text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1 rounded hover:bg-red-50"
          onClick={(e) => {
            e.stopPropagation()
            onReset()
          }}
        >
          重置进度
        </button>
      </div>
    </div>
  )
}

function StatItem({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-1">
      <span className={`font-semibold ${color}`}>{value}</span>
      <span className="text-gray-400">{label}</span>
    </div>
  )
}
