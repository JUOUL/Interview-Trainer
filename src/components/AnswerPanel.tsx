import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { QuestionStatus } from '../types/question'

interface Props {
  answer: string
  answered: boolean
  onMark: (status: QuestionStatus) => void
  onNext: () => void
  isLast: boolean
}

const STATUS_BUTTONS: {
  status: QuestionStatus
  label: string
  shortcut: string
  idle: string
  active: string
}[] = [
  {
    status: 'known',
    label: '知道',
    shortcut: '1',
    idle: 'border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300',
    active: 'bg-green-50 border-green-400 text-green-700 opacity-40 cursor-not-allowed',
  },
  {
    status: 'uncertain',
    label: '不确定',
    shortcut: '2',
    idle: 'border-yellow-200 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-300',
    active: 'bg-yellow-50 border-yellow-400 text-yellow-700 opacity-40 cursor-not-allowed',
  },
  {
    status: 'unknown',
    label: '不知道',
    shortcut: '3',
    idle: 'border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300',
    active: 'bg-red-50 border-red-400 text-red-700 opacity-40 cursor-not-allowed',
  },
]

export default function AnswerPanel({ answer, answered, onMark, onNext, isLast }: Props) {
  return (
    <div className="space-y-4">
      {/* Status buttons */}
      <div className="flex gap-3">
        {STATUS_BUTTONS.map((btn) => (
          <button
            key={btn.status}
            disabled={answered}
            onClick={() => onMark(btn.status)}
            className={`flex-1 py-3 px-4 border rounded-lg font-medium text-sm transition-all duration-150 flex items-center justify-center gap-2 ${answered ? btn.active : btn.idle}`}
          >
            <span>{btn.label}</span>
            <kbd className="text-xs opacity-60 font-mono border border-current rounded px-1">
              {btn.shortcut}
            </kbd>
          </button>
        ))}
      </div>

      {/* Answer reveal */}
      {answered && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-indigo-400 rounded-full" />
            <span className="text-sm font-medium text-gray-500">参考答案</span>
          </div>
          {/* Markdown rendered answer */}
          <div className="prose-answer">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{answer}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* Next button */}
      {answered && (
        <button
          onClick={onNext}
          className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <span>{isLast ? '完成本轮' : '下一题'}</span>
          <kbd className="text-xs opacity-70 font-mono border border-white/40 rounded px-1">
            Enter
          </kbd>
        </button>
      )}
    </div>
  )
}
