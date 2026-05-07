import type { Question } from '../types/question'
import { DifficultyBadge } from './StatusBadge'

interface Props {
  question: Question
  /** Real position in the full bank (1-based) */
  bankIndex: number
  bankTotal: number
  /** Position in the current practice queue (1-based) */
  queueIndex: number
  queueTotal: number
  showPosition?: boolean
}

export default function QuestionCard({
  question,
  bankIndex,
  bankTotal,
  queueIndex,
  queueTotal,
  showPosition = true,
}: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-8">
      <div className="flex items-center gap-3 mb-6">
        {showPosition && (
          <>
            <span className="text-sm text-gray-900 font-mono font-medium">
              {bankIndex}
              <span className="text-gray-400 font-normal"> / {bankTotal}</span>
            </span>
            {queueTotal < bankTotal && (
              <span className="text-xs text-gray-300 font-mono">
                本轮 {queueIndex}/{queueTotal}
              </span>
            )}
          </>
        )}
        <DifficultyBadge difficulty={question.difficulty} />
        <div className="flex flex-wrap gap-1.5 ml-auto">
          {question.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <h2 className="text-xl font-semibold text-gray-900 leading-relaxed">
        {question.question}
      </h2>
    </div>
  )
}
