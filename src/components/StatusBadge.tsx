import type { Difficulty, QuestionStatus } from '../types/question'

interface DifficultyBadgeProps {
  difficulty: Difficulty
}

const difficultyConfig: Record<Difficulty, { label: string; className: string }> = {
  easy: { label: '简单', className: 'bg-green-50 text-green-700 ring-1 ring-green-200' },
  medium: { label: '中等', className: 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200' },
  hard: { label: '困难', className: 'bg-red-50 text-red-700 ring-1 ring-red-200' },
}

export function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  const cfg = difficultyConfig[difficulty]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  )
}

interface StatusBadgeProps {
  status: QuestionStatus
}

const statusConfig: Record<QuestionStatus, { label: string; className: string }> = {
  known: { label: '知道', className: 'bg-green-50 text-green-700 ring-1 ring-green-200' },
  uncertain: { label: '不确定', className: 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200' },
  unknown: { label: '不知道', className: 'bg-red-50 text-red-700 ring-1 ring-red-200' },
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const cfg = statusConfig[status]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  )
}
