// 2027 秋招模块类型定义

/** 招聘流程固定状态（不要新增含义重复的状态，用 nextAction / notes / result 表达细节） */
export const RECRUITMENT_STATUSES = [
  '待关注',
  '已开放',
  '已投递',
  '笔试/测评',
  '面试',
  'Offer',
  '结束',
] as const

export type RecruitmentStatus = (typeof RECRUITMENT_STATUSES)[number]

/** 企业类别 */
export const RECRUITMENT_CATEGORIES = ['互联网大厂', '行业龙头', '央国企'] as const
export type RecruitmentCategory = (typeof RECRUITMENT_CATEGORIES)[number]

/** 优先级 */
export const RECRUITMENT_PRIORITIES = ['P0', 'P1', 'P2'] as const
export type RecruitmentPriority = (typeof RECRUITMENT_PRIORITIES)[number]

/** 内推状态 */
export type ReferralStatus = '未寻找' | '寻找中' | '已内推' | '不需要'

export interface Company {
  id: string
  company: string
  category: RecruitmentCategory
  priority: RecruitmentPriority
  status: RecruitmentStatus
  targetRoles: string[]
  department: string
  location: string[]
  batch: string
  /** 招聘开放日期 YYYY-MM-DD */
  openDate: string
  /** 申请截止日期 YYYY-MM-DD */
  deadline: string
  /** 实际投递日期 YYYY-MM-DD */
  applicationDate: string
  officialUrl: string
  referral: ReferralStatus
  resumeVersion: string
  nextAction: string
  /** 下一步行动日期 YYYY-MM-DD */
  nextActionDate: string
  interviewStage: string
  /** 面试 / 笔试日期 YYYY-MM-DD 或 YYYY-MM-DD HH:mm */
  interviewDate: string
  result: string
  notes: string
  /** 最后更新时间 YYYY-MM-DD */
  lastUpdated: string
}

export interface RecruitmentData {
  batch: string
  companies: Company[]
}

export interface RecruitmentStats {
  total: number
  open: number
  applied: number
  assessment: number
  interview: number
  offer: number
  /** 未来七天内截止 */
  deadlineSoon: number
  /** 未来七天内有待办 */
  todoSoon: number
}
