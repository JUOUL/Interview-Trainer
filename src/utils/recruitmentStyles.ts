import type { RecruitmentPriority, RecruitmentStatus } from '../types/recruitment'

/** 状态 → 徽章样式（沿用项目 Tailwind 配色，浅底深字圆角） */
export const STATUS_BADGE: Record<RecruitmentStatus, string> = {
  待关注: 'bg-gray-100 text-gray-600',
  已开放: 'bg-sky-100 text-sky-700',
  已投递: 'bg-indigo-100 text-indigo-700',
  '笔试/测评': 'bg-violet-100 text-violet-700',
  面试: 'bg-amber-100 text-amber-700',
  Offer: 'bg-green-100 text-green-700',
  结束: 'bg-gray-200 text-gray-500',
}

/** 看板列顶部的强调色（用于列标题左侧圆点 / 边框） */
export const STATUS_ACCENT: Record<RecruitmentStatus, string> = {
  待关注: 'bg-gray-400',
  已开放: 'bg-sky-400',
  已投递: 'bg-indigo-400',
  '笔试/测评': 'bg-violet-400',
  面试: 'bg-amber-400',
  Offer: 'bg-green-400',
  结束: 'bg-gray-300',
}

/**
 * 优先级视觉：P0 最醒目、P1 次之、P2 普通。
 * badge 用于徽章，cardRing 用于卡片左侧强调条。
 */
export const PRIORITY_STYLE: Record<
  RecruitmentPriority,
  { badge: string; bar: string }
> = {
  P0: { badge: 'bg-red-100 text-red-700 font-semibold', bar: 'bg-red-400' },
  P1: { badge: 'bg-orange-100 text-orange-600 font-medium', bar: 'bg-orange-300' },
  P2: { badge: 'bg-gray-100 text-gray-500', bar: 'bg-gray-200' },
}
