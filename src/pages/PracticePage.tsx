import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { QuestionBank, BankProgress, QuestionStatus, Question, PracticeMode } from '../types/question'
import { fetchQuestionBank } from '../utils/questionBank'
import { loadBankProgress, updateQuestionStatus, resetBankProgress } from '../utils/storage'
import {
  buildPracticeQueue,
  isModeCompleted,
  computeBankStats,
  PRACTICE_MODE_LABELS,
  PRACTICE_MODE_COMPLETED_MSG,
} from '../utils/practice'
import QuestionCard from '../components/QuestionCard'
import AnswerPanel from '../components/AnswerPanel'
import ProgressBar from '../components/ProgressBar'
import QuestionListPanel from '../components/QuestionListPanel'
import ModeSelector from '../components/ModeSelector'

export default function PracticePage() {
  const { bankId } = useParams<{ bankId: string }>()
  const navigate = useNavigate()

  const [bank, setBank] = useState<QuestionBank | null>(null)
  const [progress, setProgress] = useState<BankProgress>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [mode, setMode] = useState<PracticeMode>('smart')
  const [queue, setQueue] = useState<Question[]>([])
  const [queueIndex, setQueueIndex] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [completed, setCompleted] = useState(false)

  // Load bank on mount
  useEffect(() => {
    if (!bankId) return
    setLoading(true)
    fetchQuestionBank(bankId)
      .then((b) => {
        setBank(b)
        const p = loadBankProgress(bankId)
        setProgress(p)
      })
      .catch((e) => setError(e instanceof Error ? e.message : '加载失败'))
      .finally(() => setLoading(false))
  }, [bankId])

  // Rebuild queue only when bank or mode changes.
  // Reading progress from localStorage here instead of React state so that
  // marking a question (which updates the progress state) does NOT trigger
  // this effect and accidentally reset `answered` to false mid-session.
  useEffect(() => {
    if (!bank || !bankId) return
    const currentProgress = loadBankProgress(bankId)
    if (isModeCompleted(bank.questions, currentProgress, mode)) {
      setCompleted(true)
      return
    }
    setCompleted(false)
    const q = buildPracticeQueue(bank.questions, currentProgress, mode)
    setQueue(q)
    setQueueIndex(0)
    setAnswered(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bank, bankId, mode])

  const currentQuestion = queue[queueIndex] ?? null
  const stats = bank ? computeBankStats(bank.questions, progress) : null

  const handleMark = useCallback(
    (status: QuestionStatus) => {
      if (!bankId || !currentQuestion || answered) return
      const newProgress = updateQuestionStatus(bankId, currentQuestion.id, status)
      setProgress(newProgress)
      setAnswered(true)
    },
    [bankId, currentQuestion, answered]
  )

  const handleNext = useCallback(() => {
    if (!bank || !bankId) return
    const nextIndex = queueIndex + 1

    if (nextIndex >= queue.length) {
      const newProgress = loadBankProgress(bankId)
      if (isModeCompleted(bank.questions, newProgress, mode)) {
        setCompleted(true)
        return
      }
      // Rebuild queue for the next round
      const newQueue = buildPracticeQueue(bank.questions, newProgress, mode)
      if (newQueue.length === 0) {
        setCompleted(true)
        return
      }
      setQueue(newQueue)
      setQueueIndex(0)
    } else {
      setQueueIndex(nextIndex)
    }
    setAnswered(false)
  }, [bank, bankId, mode, queueIndex, queue.length])

  const handleJumpToQuestion = useCallback(
    (questionId: string) => {
      if (!bank) return
      setAnswered(false)
      const idx = queue.findIndex((q) => q.id === questionId)
      if (idx !== -1) {
        setQueueIndex(idx)
        return
      }
      // Not in current queue — insert before current position
      const question = bank.questions.find((q) => q.id === questionId)
      if (!question) return
      const newQueue = [...queue]
      newQueue.splice(queueIndex, 0, question)
      setQueue(newQueue)
      // queueIndex already points to the newly inserted question
    },
    [bank, queue, queueIndex]
  )

  function handleReset() {
    if (!bankId || !bank) return
    if (!confirm('确定要重置该题库的进度吗？')) return
    resetBankProgress(bankId)
    const p = loadBankProgress(bankId)
    setProgress(p)
    setCompleted(false)
    setAnswered(false)
  }

  function handleChangeMode(newMode: PracticeMode) {
    setMode(newMode)
    // queue/completed will be rebuilt by the useEffect above
  }

  // Keyboard shortcuts
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (!answered && currentQuestion) {
        if (e.key === '1') handleMark('known')
        if (e.key === '2') handleMark('uncertain')
        if (e.key === '3') handleMark('unknown')
      }
      if (answered && e.key === 'Enter') {
        e.preventDefault()
        handleNext()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [answered, currentQuestion, handleMark, handleNext])

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">加载题库中…</p>
      </div>
    )
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white border border-red-200 rounded-xl p-8 max-w-lg w-full">
          <p className="font-semibold text-red-600 mb-2">加载失败</p>
          <pre className="text-sm text-red-500 whitespace-pre-wrap bg-red-50 rounded-lg p-4 mb-6">
            {error}
          </pre>
          <button
            onClick={() => navigate('/')}
            className="text-sm text-indigo-500 hover:underline"
          >
            ← 返回首页
          </button>
        </div>
      </div>
    )
  }

  if (!bank) return null

  // ── Completed ────────────────────────────────────────────────────────────────
  if (completed) {
    const msg = PRACTICE_MODE_COMPLETED_MSG[mode]
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white border border-gray-200 rounded-2xl p-10 max-w-md w-full text-center shadow-sm">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">本轮完成！</h2>
          <p className="text-gray-500 mb-1">《{bank.name}》</p>
          <p className="text-gray-400 text-sm mb-6">{msg}</p>
          {stats && (
            <p className="text-sm text-gray-400 mb-8">
              已掌握 {stats.known} / {stats.total} 题
            </p>
          )}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate('/')}
              className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors"
            >
              返回首页
            </button>
            <button
              onClick={() => {
                const newProgress = loadBankProgress(bankId!)
                const newQueue = buildPracticeQueue(bank.questions, newProgress, mode)
                if (newQueue.length > 0) {
                  setQueue(newQueue)
                  setQueueIndex(0)
                  setAnswered(false)
                  setCompleted(false)
                } else {
                  // Try switching to all mode
                  setMode('all')
                }
              }}
              className="w-full py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg font-medium transition-colors"
            >
              切换为「{PRACTICE_MODE_LABELS['all']}」继续刷
            </button>
            <button
              onClick={handleReset}
              className="w-full py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg font-medium transition-colors text-sm"
            >
              重置进度重新刷
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!currentQuestion) return null

  const isLastInQueue = queueIndex === queue.length - 1

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 h-14">
        <div className="max-w-6xl mx-auto px-6 h-full flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1 shrink-0"
          >
            <span>←</span>
            <span>首页</span>
          </button>

          <div className="w-px h-4 bg-gray-200" />

          <span className="font-semibold text-gray-900 text-sm shrink-0">{bank.name}</span>

          {stats && (
            <>
              <div className="flex-1 max-w-48">
                <ProgressBar percentage={stats.percentage} />
              </div>
              <span className="text-xs text-gray-400 shrink-0">
                {stats.known}/{stats.total}
              </span>
            </>
          )}

          <div className="ml-auto flex items-center gap-3">
            <ModeSelector mode={mode} onChange={handleChangeMode} />
            <button
              onClick={handleReset}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1.5 rounded hover:bg-red-50"
            >
              重置
            </button>
          </div>
        </div>
      </header>

      {/* Body: question area + sidebar */}
      <div className="max-w-6xl mx-auto px-6 py-6 flex gap-5">
        {/* Left: question + answer */}
        <main className="flex-1 min-w-0 space-y-4">
          <QuestionCard
            question={currentQuestion}
            index={queueIndex + 1}
            total={queue.length}
          />

          <AnswerPanel
            answer={currentQuestion.answer}
            answered={answered}
            onMark={handleMark}
            onNext={handleNext}
            isLast={isLastInQueue}
          />

          {/* Keyboard hints */}
          <p className="text-center text-xs text-gray-300 select-none">
            {!answered
              ? <>按 <kbd className="font-mono">1</kbd> 知道 &nbsp; <kbd className="font-mono">2</kbd> 不确定 &nbsp; <kbd className="font-mono">3</kbd> 不知道</>
              : <>按 <kbd className="font-mono">Enter</kbd> 下一题</>
            }
          </p>
        </main>

        {/* Right: question list */}
        <QuestionListPanel
          questions={bank.questions}
          progress={progress}
          currentQuestionId={currentQuestion.id}
          onJump={handleJumpToQuestion}
        />
      </div>
    </div>
  )
}
