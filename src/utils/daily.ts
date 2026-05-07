import type { QuestionBank } from '../types/question'

export interface DailyQuestionRef {
  bankId: string
  questionId: string
}

export interface DailySession {
  date: string
  total: number
  queue: DailyQuestionRef[]
  completed: boolean
  finishedAt?: string
}

const DAILY_KEY = 'interview-trainer:daily-session'
const DAILY_SIZE_KEY = 'interview-trainer:daily-size'
export const DEFAULT_DAILY_SIZE = 30

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function getDailyCycleKey(date = new Date()): string {
  const shifted = new Date(date)
  shifted.setHours(shifted.getHours() - 4)
  const y = shifted.getFullYear()
  const m = String(shifted.getMonth() + 1).padStart(2, '0')
  const d = String(shifted.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function collectAllQuestionRefs(banks: QuestionBank[]): DailyQuestionRef[] {
  const refs: DailyQuestionRef[] = []
  for (const bank of banks) {
    for (const q of bank.questions) {
      refs.push({ bankId: bank.id, questionId: q.id })
    }
  }
  return refs
}

export function loadDailySession(): DailySession | null {
  try {
    const raw = localStorage.getItem(DAILY_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as DailySession
    if (!data || typeof data !== 'object') return null
    if (!Array.isArray(data.queue)) return null
    if (typeof data.date !== 'string' || typeof data.total !== 'number') return null
    return data
  } catch {
    return null
  }
}

export function saveDailySession(session: DailySession): void {
  try {
    localStorage.setItem(DAILY_KEY, JSON.stringify(session))
  } catch {
    // ignore
  }
}

export function normalizeDailySize(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_DAILY_SIZE
  const n = Math.floor(value)
  if (n < 10) return 10
  return n % 10 === 0 ? n : Math.round(n / 10) * 10
}

export function loadDailySize(): number {
  try {
    const raw = localStorage.getItem(DAILY_SIZE_KEY)
    if (!raw) return DEFAULT_DAILY_SIZE
    return normalizeDailySize(Number(raw))
  } catch {
    return DEFAULT_DAILY_SIZE
  }
}

export function saveDailySize(size: number): number {
  const normalized = normalizeDailySize(size)
  try {
    localStorage.setItem(DAILY_SIZE_KEY, String(normalized))
  } catch {
    // ignore
  }
  return normalized
}

export function createDailySession(
  candidates: DailyQuestionRef[],
  date: string,
  limit = 30
): DailySession {
  const picked = shuffle(candidates).slice(0, limit)
  return {
    date,
    total: picked.length,
    queue: picked,
    completed: picked.length === 0,
  }
}
