import type { Question } from '../types/question'
import { DifficultyBadge } from './StatusBadge'

interface Props {
  question: Question
  index: number
  total: number
}

export default function QuestionCard({ question, index, total }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-8">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-sm text-gray-400 font-mono">
          {index} / {total}
        </span>
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
