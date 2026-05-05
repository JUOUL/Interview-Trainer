import type { BankProgress, QuestionStatus } from '../types/question'

const PREFIX = 'interview-trainer:'

function getKey(bankId: string): string {
  return `${PREFIX}${bankId}`
}

export function loadBankProgress(bankId: string): BankProgress {
  try {
    const raw = localStorage.getItem(getKey(bankId))
    if (!raw) return {}
    return JSON.parse(raw) as BankProgress
  } catch {
    return {}
  }
}

export function saveBankProgress(bankId: string, progress: BankProgress): void {
  try {
    localStorage.setItem(getKey(bankId), JSON.stringify(progress))
  } catch {
    // ignore storage quota errors
  }
}

export function updateQuestionStatus(
  bankId: string,
  questionId: string,
  status: QuestionStatus
): BankProgress {
  const progress = loadBankProgress(bankId)
  const existing = progress[questionId]
  progress[questionId] = {
    status,
    lastReviewedAt: new Date().toISOString(),
    reviewCount: (existing?.reviewCount ?? 0) + 1,
  }
  saveBankProgress(bankId, progress)
  return progress
}

export function resetBankProgress(bankId: string): void {
  try {
    localStorage.removeItem(getKey(bankId))
  } catch {
    // ignore
  }
}

// ─── Export / Import ───────────────────────────────────────────────────────────

/** Download all progress for the given bank IDs as a JSON file. */
export function exportAllProgress(bankIds: string[]): void {
  const data: Record<string, BankProgress> = {}
  for (const id of bankIds) {
    const p = loadBankProgress(id)
    if (Object.keys(p).length > 0) {
      data[id] = p
    }
  }
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `interview-trainer-progress-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export interface ImportResult {
  success: boolean
  message: string
  bankCount: number
}

/** Parse and write imported progress JSON to localStorage. */
export function importProgress(json: string): ImportResult {
  let data: unknown
  try {
    data = JSON.parse(json)
  } catch {
    return { success: false, message: 'JSON 解析失败，请检查文件格式', bankCount: 0 }
  }

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { success: false, message: '进度文件格式错误，根节点应为对象', bankCount: 0 }
  }

  const entries = Object.entries(data as Record<string, unknown>)
  let bankCount = 0
  for (const [bankId, progress] of entries) {
    if (progress && typeof progress === 'object' && !Array.isArray(progress)) {
      saveBankProgress(bankId, progress as BankProgress)
      bankCount++
    }
  }

  if (bankCount === 0) {
    return { success: false, message: '文件中没有找到有效的进度数据', bankCount: 0 }
  }
  return { success: true, message: `成功导入 ${bankCount} 个题库的进度`, bankCount }
}
