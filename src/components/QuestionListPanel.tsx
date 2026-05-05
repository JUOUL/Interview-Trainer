import type { Question, BankProgress, QuestionStatus } from '../types/question'

interface Props {
  questions: Question[]
  progress: BankProgress
  currentQuestionId: string
  onJump: (questionId: string) => void
}

const STATUS_DOT: Record<QuestionStatus, string> = {
  known: 'bg-green-400',
  uncertain: 'bg-yellow-400',
  unknown: 'bg-red-400',
}

const STATUS_ROW: Record<QuestionStatus, string> = {
  known: 'text-gray-400',
  uncertain: 'text-gray-700',
  unknown: 'text-gray-700',
}

export default function QuestionListPanel({ questions, progress, currentQuestionId, onJump }: Props) {
  return (
    <aside className="w-64 shrink-0">
      <div className="sticky top-14 bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-3 py-2.5 border-b border-gray-100 flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            题目列表
          </span>
          <span className="text-xs text-gray-400">{questions.length} 题</span>
        </div>

        <ul className="overflow-y-auto max-h-[calc(100vh-120px)] divide-y divide-gray-50">
          {questions.map((q, i) => {
            const p = progress[q.id]
            const status = p?.status
            const isCurrent = q.id === currentQuestionId

            return (
              <li key={q.id}>
                <button
                  onClick={() => onJump(q.id)}
                  className={`w-full text-left px-3 py-2.5 flex items-start gap-2.5 transition-colors group ${
                    isCurrent
                      ? 'bg-indigo-50 border-l-2 border-indigo-400'
                      : 'hover:bg-gray-50 border-l-2 border-transparent'
                  }`}
                >
                  {/* Index */}
                  <span
                    className={`shrink-0 text-xs font-mono w-5 pt-0.5 ${
                      isCurrent ? 'text-indigo-500' : 'text-gray-300'
                    }`}
                  >
                    {i + 1}
                  </span>

                  {/* Status dot */}
                  <span className="shrink-0 pt-1.5">
                    {status ? (
                      <span className={`block w-2 h-2 rounded-full ${STATUS_DOT[status]}`} />
                    ) : (
                      <span className="block w-2 h-2 rounded-full border border-gray-200" />
                    )}
                  </span>

                  {/* Question text */}
                  <span
                    className={`text-xs leading-relaxed line-clamp-2 ${
                      isCurrent
                        ? 'text-indigo-700 font-medium'
                        : status
                        ? STATUS_ROW[status]
                        : 'text-gray-600'
                    }`}
                  >
                    {q.question}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </aside>
  )
}
