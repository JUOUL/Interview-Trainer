import type { QuestionBank, ValidationResult, ValidationIssue } from '../types/question'

// ─── Typed error classes ───────────────────────────────────────────────────────

/** The JSON file simply doesn't exist (HTTP 404 or SPA HTML fallback). */
export class MissingBankError extends Error {
  readonly bankId: string
  constructor(id: string) {
    super(`题库文件未找到: ${id}`)
    this.name = 'MissingBankError'
    this.bankId = id
  }
}

/** The file exists but its content is not valid JSON. */
export class BankJsonError extends Error {
  readonly bankId: string
  constructor(id: string) {
    super(`题库 "${id}" JSON 格式错误，无法解析`)
    this.name = 'BankJsonError'
    this.bankId = id
  }
}

/** The JSON parses fine but fails schema validation. */
export class BankValidationError extends Error {
  readonly bankId: string
  readonly issues: ValidationIssue[]
  constructor(id: string, issues: ValidationIssue[]) {
    super(`题库 "${id}" 字段校验失败`)
    this.name = 'BankValidationError'
    this.bankId = id
    this.issues = issues
  }
}

// ─── Validation ────────────────────────────────────────────────────────────────

export function validateQuestionBank(data: unknown): ValidationResult {
  const issues: ValidationIssue[] = []

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { valid: false, issues: [{ field: 'root', message: 'JSON 根节点必须是对象' }] }
  }

  const obj = data as Record<string, unknown>

  if (!obj.id || typeof obj.id !== 'string' || !obj.id.trim()) {
    issues.push({ field: 'id', message: '题库 id 不能为空' })
  }
  if (!obj.name || typeof obj.name !== 'string' || !obj.name.trim()) {
    issues.push({ field: 'name', message: '题库 name 不能为空' })
  }
  if (!Array.isArray(obj.questions)) {
    issues.push({ field: 'questions', message: 'questions 必须是数组' })
    return { valid: false, issues }
  }
  if (obj.questions.length === 0) {
    issues.push({ field: 'questions', message: 'questions 数组不能为空' })
  }

  const seenIds = new Set<string>()
  for (let i = 0; i < obj.questions.length; i++) {
    const q = obj.questions[i]
    const pos = `第 ${i + 1} 题`

    if (!q || typeof q !== 'object' || Array.isArray(q)) {
      issues.push({ field: `questions[${i}]`, message: `${pos} 必须是对象` })
      continue
    }

    const qObj = q as Record<string, unknown>

    if (!qObj.id || typeof qObj.id !== 'string' || !qObj.id.trim()) {
      issues.push({ field: `questions[${i}].id`, message: `${pos} 缺少 id` })
    } else {
      const qid = qObj.id as string
      if (seenIds.has(qid)) {
        issues.push({ field: `questions[${i}].id`, message: `${pos} 的 id "${qid}" 与前面的题重复` })
      }
      seenIds.add(qid)
    }

    if (!qObj.question || typeof qObj.question !== 'string' || !qObj.question.trim()) {
      issues.push({ field: `questions[${i}].question`, message: `${pos} 缺少 question 字段` })
    }
    if (!qObj.answer || typeof qObj.answer !== 'string' || !qObj.answer.trim()) {
      issues.push({ field: `questions[${i}].answer`, message: `${pos} 缺少 answer 字段` })
    }
  }

  return { valid: issues.length === 0, issues }
}

// ─── Fetch ─────────────────────────────────────────────────────────────────────

/**
 * Fetch and validate a single question bank JSON from /public/question-banks/.
 *
 * Throws:
 *   MissingBankError    – 404, or Vite SPA fallback (HTML returned instead of JSON)
 *   BankJsonError       – file found but not valid JSON
 *   BankValidationError – JSON valid but schema check failed
 *   Error               – other HTTP / network failures
 */
export async function fetchQuestionBank(id: string): Promise<QuestionBank> {
  const url = `/question-banks/${id}.json`
  const res = await fetch(url)

  // Explicit 404
  if (res.status === 404) {
    throw new MissingBankError(id)
  }

  // Other non-OK statuses (5xx etc.)
  if (!res.ok) {
    throw new Error(`加载题库 "${id}" 失败：HTTP ${res.status}`)
  }

  // Vite dev server SPA fallback: returns index.html (text/html) with 200
  // when the static file doesn't exist.
  const contentType = res.headers.get('content-type') ?? ''
  if (contentType.includes('text/html')) {
    throw new MissingBankError(id)
  }

  // Now safe to parse JSON
  let data: unknown
  try {
    data = await res.json()
  } catch {
    throw new BankJsonError(id)
  }

  const result = validateQuestionBank(data)
  if (!result.valid) {
    throw new BankValidationError(id, result.issues)
  }

  return data as QuestionBank
}
