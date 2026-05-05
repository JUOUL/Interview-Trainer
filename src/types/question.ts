export type Difficulty = 'easy' | 'medium' | 'hard'

export type QuestionStatus = 'known' | 'uncertain' | 'unknown'

export type PracticeMode = 'smart' | 'unreviewed' | 'uncertain' | 'unknown' | 'all' | 'random'

export interface Question {
  id: string
  question: string
  answer: string
  difficulty: Difficulty
  tags: string[]
}

export interface QuestionBank {
  id: string
  name: string
  description: string
  questions: Question[]
}

export interface QuestionProgress {
  status: QuestionStatus
  lastReviewedAt: string
  reviewCount: number
}

/** key = questionId */
export type BankProgress = Record<string, QuestionProgress>

export interface BankStats {
  total: number
  known: number
  uncertain: number
  unknown: number
  unreviewed: number
  percentage: number
}

export interface ValidationIssue {
  field: string
  message: string
}

export interface ValidationResult {
  valid: boolean
  issues: ValidationIssue[]
}
