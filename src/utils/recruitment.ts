import type {
  Company,
  RecruitmentData,
  RecruitmentStats,
  RecruitmentStatus,
} from '../types/recruitment'

const DATA_URL = 'recruitment-companies.json'

export class RecruitmentLoadError extends Error {}

/** 读取秋招唯一数据源。数据文件位于 public/recruitment-companies.json，修改后刷新页面即生效。 */
export async function fetchCompanies(): Promise<Company[]> {
  const base = import.meta.env.BASE_URL || '/'
  const url = `${base}${DATA_URL}`
  let res: Response
  try {
    res = await fetch(url, { cache: 'no-store' })
  } catch {
    throw new RecruitmentLoadError('无法加载秋招数据文件')
  }
  if (!res.ok) {
    throw new RecruitmentLoadError(`秋招数据文件加载失败（HTTP ${res.status}）`)
  }
  let data: RecruitmentData
  try {
    data = (await res.json()) as RecruitmentData
  } catch {
    throw new RecruitmentLoadError('秋招数据文件 JSON 格式错误')
  }
  if (!data || !Array.isArray(data.companies)) {
    throw new RecruitmentLoadError('秋招数据文件结构错误：缺少 companies 数组')
  }
  return data.companies
}

// ─── 日期工具 ──────────────────────────────────────────────────────────────────
// 所有日期字段为 YYYY-MM-DD 或 YYYY-MM-DD HH:mm，空字符串表示未知。

/** 解析日期字符串为本地时间的 Date（仅取日期部分），无效或空返回 null。 */
export function parseDate(value: string): Date | null {
  if (!value) return null
  const datePart = value.slice(0, 10)
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart)
  if (!m) return null
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  return Number.isNaN(d.getTime()) ? null : d
}

/** 今天零点（本地时间）。 */
export function startOfToday(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

/** date 与今天相差的天数（正数=未来，负数=已过，0=今天）。null 返回 null。 */
export function daysFromToday(value: string): number | null {
  const d = parseDate(value)
  if (!d) return null
  const diff = d.getTime() - startOfToday().getTime()
  return Math.round(diff / 86_400_000)
}

/** 日期是否已过（早于今天）。空/无效返回 false。 */
export function isPast(value: string): boolean {
  const n = daysFromToday(value)
  return n !== null && n < 0
}

/** 日期是否落在未来 windowDays 天内（含今天，含第 windowDays 天）。 */
export function isWithinNextDays(value: string, windowDays = 7): boolean {
  const n = daysFromToday(value)
  return n !== null && n >= 0 && n <= windowDays
}

// ─── 统计 ──────────────────────────────────────────────────────────────────────

export function computeStats(companies: Company[]): RecruitmentStats {
  const countByStatus = (status: RecruitmentStatus) =>
    companies.filter((c) => c.status === status).length

  const deadlineSoon = companies.filter(
    (c) => c.status !== '结束' && isWithinNextDays(c.deadline, 7)
  ).length

  const todoSoon = companies.filter(
    (c) => c.status !== '结束' && isWithinNextDays(c.nextActionDate, 7)
  ).length

  return {
    total: companies.length,
    open: countByStatus('已开放'),
    applied: countByStatus('已投递'),
    assessment: countByStatus('笔试/测评'),
    interview: countByStatus('面试'),
    offer: countByStatus('Offer'),
    deadlineSoon,
    todoSoon,
  }
}

// ─── 筛选 ──────────────────────────────────────────────────────────────────────

export interface CompanyFilters {
  search: string
  category: string // '' = 全部
  priority: string // '' = 全部
  status: string // '' = 全部
  role: string // '' = 全部
  deadlineSoonOnly: boolean
  todoSoonOnly: boolean
}

export const EMPTY_FILTERS: CompanyFilters = {
  search: '',
  category: '',
  priority: '',
  status: '',
  role: '',
  deadlineSoonOnly: false,
  todoSoonOnly: false,
}

export function filterCompanies(companies: Company[], f: CompanyFilters): Company[] {
  const search = f.search.trim().toLowerCase()
  return companies.filter((c) => {
    if (search && !c.company.toLowerCase().includes(search)) return false
    if (f.category && c.category !== f.category) return false
    if (f.priority && c.priority !== f.priority) return false
    if (f.status && c.status !== f.status) return false
    if (f.role && !c.targetRoles.includes(f.role)) return false
    if (f.deadlineSoonOnly && !(c.status !== '结束' && isWithinNextDays(c.deadline, 7)))
      return false
    if (f.todoSoonOnly && !(c.status !== '结束' && isWithinNextDays(c.nextActionDate, 7)))
      return false
    return true
  })
}

/** 收集全部目标岗位（去重、按出现顺序）。 */
export function collectRoles(companies: Company[]): string[] {
  const seen = new Set<string>()
  const roles: string[] = []
  for (const c of companies) {
    for (const r of c.targetRoles) {
      if (!seen.has(r)) {
        seen.add(r)
        roles.push(r)
      }
    }
  }
  return roles
}
