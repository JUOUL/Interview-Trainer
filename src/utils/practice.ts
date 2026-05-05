import type { Question, BankProgress, BankStats, PracticeMode } from '../types/question'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Build the practice queue according to the selected mode. */
export function buildPracticeQueue(
  questions: Question[],
  progress: BankProgress,
  mode: PracticeMode
): Question[] {
  switch (mode) {
    case 'smart': {
      const unreviewed = questions.filter((q) => !progress[q.id])
      const needReview = questions.filter(
        (q) => progress[q.id]?.status === 'uncertain' || progress[q.id]?.status === 'unknown'
      )
      return [...unreviewed, ...needReview]
    }
    case 'unreviewed':
      return questions.filter((q) => !progress[q.id])
    case 'uncertain':
      return questions.filter((q) => progress[q.id]?.status === 'uncertain')
    case 'unknown':
      return questions.filter((q) => progress[q.id]?.status === 'unknown')
    case 'all':
      return [...questions]
    case 'random':
      return shuffle(questions)
  }
}

/** Compute stats for a bank. */
export function computeBankStats(questions: Question[], progress: BankProgress): BankStats {
  const total = questions.length
  let known = 0
  let uncertain = 0
  let unknown = 0

  for (const q of questions) {
    const p = progress[q.id]
    if (!p) continue
    if (p.status === 'known') known++
    else if (p.status === 'uncertain') uncertain++
    else if (p.status === 'unknown') unknown++
  }

  const unreviewed = total - known - uncertain - unknown
  const percentage = total === 0 ? 0 : Math.round((known / total) * 100)

  return { total, known, uncertain, unknown, unreviewed, percentage }
}

/**
 * Determine if the queue for the given mode would be empty (i.e., done).
 * 'all' and 'random' modes never auto-complete.
 */
export function isModeCompleted(
  questions: Question[],
  progress: BankProgress,
  mode: PracticeMode
): boolean {
  if (mode === 'all' || mode === 'random') return false
  return buildPracticeQueue(questions, progress, mode).length === 0
}

export const PRACTICE_MODE_LABELS: Record<PracticeMode, string> = {
  smart: '智能刷题',
  unreviewed: '只刷未做',
  uncertain: '只刷不确定',
  unknown: '只刷不知道',
  all: '顺序全刷',
  random: '随机刷题',
}

export const PRACTICE_MODE_COMPLETED_MSG: Record<PracticeMode, string> = {
  smart: '已掌握全部题目',
  unreviewed: '没有未做的题了',
  uncertain: '没有「不确定」的题了',
  unknown: '没有「不知道」的题了',
  all: '',
  random: '',
}
