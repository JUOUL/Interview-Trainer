export type PlaceholderKind = 'missing' | 'json-error' | 'validation-error' | 'load-error'

interface Props {
  bankId: string
  kind: PlaceholderKind
  detail?: string
}

const KIND_CONFIG: Record<PlaceholderKind, { label: string; labelClass: string }> = {
  'missing':          { label: '题库文件未添加', labelClass: 'text-gray-300' },
  'json-error':       { label: 'JSON 格式错误',  labelClass: 'text-red-400' },
  'validation-error': { label: '字段校验失败',   labelClass: 'text-orange-400' },
  'load-error':       { label: '加载失败',       labelClass: 'text-red-400' },
}

export default function BankPlaceholderCard({ bankId, kind, detail }: Props) {
  const { label, labelClass } = KIND_CONFIG[kind]
  const isMissing = kind === 'missing'

  return (
    <div
      className={`bg-white border border-dashed rounded-xl p-6 select-none ${
        isMissing ? 'border-gray-200 opacity-50' : 'border-red-200 opacity-70'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold text-gray-400">{bankId}</h2>
          <p className={`text-sm mt-0.5 ${labelClass}`}>{label}</p>
        </div>
        <span className="ml-4 text-sm text-gray-200 shrink-0">—</span>
      </div>

      <div className="h-1.5 bg-gray-100 rounded-full mb-4" />

      <div className="flex items-center gap-4 text-sm text-gray-200">
        <span>总题数 —</span>
        <span>已掌握 —</span>
        <span>不确定 —</span>
        <span>不知道 —</span>
      </div>

      {!isMissing && detail && (
        <p className="mt-3 text-xs text-red-400 bg-red-50 rounded-lg px-3 py-2 whitespace-pre-wrap line-clamp-4">
          {detail}
        </p>
      )}
    </div>
  )
}
