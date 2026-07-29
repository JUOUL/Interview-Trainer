import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Company } from '../../types/recruitment'
import { PRIORITY_STYLE, STATUS_BADGE } from '../../utils/recruitmentStyles'

interface Props {
  company: Company
  onClose: () => void
}

export default function CompanyDetailModal({ company: c, onClose }: Props) {
  const navigate = useNavigate()

  // Esc 关闭
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const pStyle = PRIORITY_STYLE[c.priority]

  /** 轻量联动：跳转到现有「每日学习」训练页，并携带 company / role / stage 参数 */
  function handleStartInterviewPrep() {
    const params = new URLSearchParams()
    params.set('company', c.company)
    if (c.targetRoles[0]) params.set('role', c.targetRoles[0])
    if (c.interviewStage) params.set('stage', c.interviewStage)
    navigate(`/daily?${params.toString()}`)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-gray-900">{c.company}</h2>
              <span className={`text-xs px-1.5 py-0.5 rounded ${pStyle.badge}`}>{c.priority}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_BADGE[c.status]}`}>
                {c.status}
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-1">
              {c.category} · {c.batch}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-xl leading-none shrink-0 px-1"
            aria-label="关闭"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* 面试联动 */}
          {c.status === '面试' && (
            <button
              onClick={handleStartInterviewPrep}
              className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors"
            >
              开始面试准备 →
            </button>
          )}

          {/* 目标岗位 */}
          <Section title="目标岗位">
            {c.targetRoles.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {c.targetRoles.map((r) => (
                  <span
                    key={r}
                    className="text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-600"
                  >
                    {r}
                  </span>
                ))}
              </div>
            ) : (
              <Empty />
            )}
          </Section>

          {/* 流程与时间 */}
          <Section title="流程与时间">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
              <Field label="部门 / 业务线" value={c.department} />
              <Field label="工作地点" value={c.location.join('、')} />
              <Field label="招聘开放" value={c.openDate} />
              <Field label="申请截止" value={c.deadline} />
              <Field label="投递日期" value={c.applicationDate} />
              <Field label="面试阶段" value={c.interviewStage} />
              <Field label="面试 / 笔试" value={c.interviewDate} />
              <Field label="结果" value={c.result} />
            </dl>
          </Section>

          {/* 投递材料 */}
          <Section title="投递与内推">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
              <Field label="内推状态" value={c.referral} />
              <Field label="简历版本" value={c.resumeVersion} />
              <Field label="官方链接" value={c.officialUrl} link />
            </dl>
          </Section>

          {/* 下一步 */}
          <Section title="下一步行动">
            {c.nextAction ? (
              <p className="text-sm text-gray-700">
                {c.nextAction}
                {c.nextActionDate && (
                  <span className="text-gray-400">（{c.nextActionDate}）</span>
                )}
              </p>
            ) : (
              <Empty />
            )}
          </Section>

          {/* 备注 */}
          <Section title="备注">
            {c.notes ? (
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{c.notes}</p>
            ) : (
              <Empty />
            )}
          </Section>

          <p className="text-xs text-gray-300 pt-1">最后更新：{c.lastUpdated}</p>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{title}</h3>
      {children}
    </div>
  )
}

function Field({ label, value, link }: { label: string; value: string; link?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-gray-400">{label}</dt>
      <dd className="text-gray-700 mt-0.5 break-all">
        {value ? (
          link ? (
            <a
              href={value}
              target="_blank"
              rel="noreferrer"
              className="text-indigo-500 hover:underline"
            >
              {value}
            </a>
          ) : (
            value
          )
        ) : (
          <span className="text-gray-300">—</span>
        )}
      </dd>
    </div>
  )
}

function Empty() {
  return <p className="text-sm text-gray-300">暂无</p>
}
