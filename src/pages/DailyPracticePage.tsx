import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { Question, QuestionBank, QuestionStatus } from '../types/question'
import { BANK_IDS } from '../data/banks'
import { fetchQuestionBank } from '../utils/questionBank'
import { updateQuestionStatus } from '../utils/storage'
import { loadEnabledBankMap } from '../utils/bankSettings'
import {
  collectAllQuestionRefs,
  createDailySession,
  getDailyCycleKey,
  loadDailySize,
  loadDailySession,
  saveDailySession,
  type DailyQuestionRef,
  type DailySession,
} from '../utils/daily'
import QuestionCard from '../components/QuestionCard'
import AnswerPanel from '../components/AnswerPanel'

type DailyQuestion = {
  ref: DailyQuestionRef
  question: Question
  bank: QuestionBank
}

function makeKey(ref: DailyQuestionRef): string {
  return `${ref.bankId}::${ref.questionId}`
}

export default function DailyPracticePage() {
  const navigate = useNavigate()
  // 秋招模块「开始面试准备」跳转时携带的轻量上下文（可选，不影响每日学习逻辑）
  const [searchParams] = useSearchParams()
  const prepCompany = searchParams.get('company')
  const prepRole = searchParams.get('role')
  const prepStage = searchParams.get('stage')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [session, setSession] = useState<DailySession | null>(null)
  const [questionMap, setQuestionMap] = useState<Record<string, DailyQuestion>>({})
  const [answered, setAnswered] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<QuestionStatus | null>(null)

  const today = useMemo(() => getDailyCycleKey(), [])
  const dailySize = useMemo(() => loadDailySize(), [])

  useEffect(() => {
    let cancelled = false
    async function init() {
      setLoading(true)
      try {
        const enabledMap = loadEnabledBankMap(BANK_IDS)
        const banks = (
          await Promise.allSettled(BANK_IDS.map((id) => fetchQuestionBank(id)))
        )
          .flatMap((r) => (r.status === 'fulfilled' ? [r.value] : []))
          .filter((bank) => enabledMap[bank.id] !== false)

        const allRefs = collectAllQuestionRefs(banks)
        const map: Record<string, DailyQuestion> = {}
        for (const bank of banks) {
          for (const question of bank.questions) {
            map[makeKey({ bankId: bank.id, questionId: question.id })] = {
              ref: { bankId: bank.id, questionId: question.id },
              question,
              bank,
            }
          }
        }

        const candidateKeys = new Set(allRefs.map(makeKey))
        let nextSession = loadDailySession()
        if (!nextSession || nextSession.date !== today) {
          nextSession = createDailySession(allRefs, today, dailySize)
        } else {
          nextSession = {
            ...nextSession,
            queue: nextSession.queue.filter((q) => candidateKeys.has(makeKey(q))),
          }
          if (nextSession.queue.length === 0) {
            nextSession = {
              ...nextSession,
              completed: true,
              finishedAt: nextSession.finishedAt ?? new Date().toISOString(),
            }
          }
        }

        saveDailySession(nextSession)
        if (cancelled) return
        setQuestionMap(map)
        setSession(nextSession)
      } catch (e) {
        if (cancelled) return
        setError(e instanceof Error ? e.message : '加载失败')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    init()
    return () => {
      cancelled = true
    }
  }, [dailySize, today])

  const current = useMemo(() => {
    if (!session || session.completed || session.queue.length === 0) return null
    return questionMap[makeKey(session.queue[0])] ?? null
  }, [questionMap, session])

  const doneCount = session ? session.total - session.queue.length : 0

  const handleMark = useCallback(
    (status: QuestionStatus) => {
      if (!session || !current || answered) return
      setPendingStatus(status)
      setAnswered(true)
    },
    [answered, current, session]
  )

  const handleNext = useCallback(() => {
    if (!session || !current || !pendingStatus) return
    const head = session.queue[0]
    const rest = session.queue.slice(1)

    updateQuestionStatus(head.bankId, head.questionId, pendingStatus)

    const nextQueue = pendingStatus === 'known' ? rest : [...rest, { ...head }]

    const nextSession: DailySession = {
      ...session,
      queue: nextQueue,
      completed: nextQueue.length === 0,
      finishedAt: nextQueue.length === 0 ? new Date().toISOString() : undefined,
    }
    saveDailySession(nextSession)
    setSession(nextSession)
    setPendingStatus(null)
    setAnswered(false)
  }, [current, pendingStatus, session])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (!answered && current) {
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
  }, [answered, current, handleMark, handleNext])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">加载每日学习中…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white border border-red-200 rounded-xl p-8 max-w-lg w-full">
          <p className="font-semibold text-red-600 mb-2">加载失败</p>
          <pre className="text-sm text-red-500 whitespace-pre-wrap bg-red-50 rounded-lg p-4 mb-6">
            {error}
          </pre>
          <button onClick={() => navigate('/')} className="text-sm text-indigo-500 hover:underline">
            ← 返回首页
          </button>
        </div>
      </div>
    )
  }

  if (!session) return null

  if (session.total === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white border border-gray-200 rounded-2xl p-10 max-w-md w-full text-center shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">暂无可练习题目</h2>
          <p className="text-gray-500 mb-6">请先检查题库是否加载成功。</p>
          <button
            onClick={() => navigate('/')}
            className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    )
  }

  if (session.completed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white border border-gray-200 rounded-2xl p-10 max-w-md w-full text-center shadow-sm">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">今日已完成</h2>
          <p className="text-gray-500 mb-1">{today} 的每日学习已结束（每日 04:00 刷新）</p>
          <p className="text-gray-400 text-sm mb-8">
            已掌握 {session.total} / {session.total} 题
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    )
  }

  if (!current) return null

  return (
    <div className="min-h-screen bg-gray-50">
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
          <span className="font-semibold text-gray-900 text-sm shrink-0">每日学习</span>
          <span className="text-xs text-gray-400">{today}</span>
          <div className="ml-auto text-sm font-mono text-gray-600">
            {doneCount}/{session.total}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-6 space-y-4">
        {prepCompany && (
          <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 flex items-center justify-between gap-2">
            <span>
              面试准备：<span className="font-medium">{prepCompany}</span>
              {prepStage && ` · ${prepStage}`}
              {prepRole && ` · ${prepRole}`}
            </span>
            <button onClick={() => navigate('/recruitment')} className="text-amber-600 hover:underline shrink-0">
              返回秋招
            </button>
          </div>
        )}
        <div className="text-sm text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg px-4 py-2">
          当前题库：{current.bank.name}
        </div>

        <QuestionCard
          question={current.question}
          bankIndex={current.bank.questions.findIndex((q) => q.id === current.question.id) + 1}
          bankTotal={current.bank.questions.length}
          queueIndex={doneCount + 1}
          queueTotal={session.total}
          showPosition={false}
        />

        <AnswerPanel
          answer={current.question.answer}
          answered={answered}
          onMark={handleMark}
          onNext={handleNext}
          isLast={session.queue.length === 1}
        />
      </div>
    </div>
  )
}
