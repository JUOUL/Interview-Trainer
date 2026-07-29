import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Company } from '../types/recruitment'
import {
  fetchCompanies,
  computeStats,
  filterCompanies,
  collectRoles,
  EMPTY_FILTERS,
  type CompanyFilters,
} from '../utils/recruitment'
import StatsBar from '../components/recruitment/StatsBar'
import FilterBar from '../components/recruitment/FilterBar'
import KanbanBoard from '../components/recruitment/KanbanBoard'
import CompanyTable from '../components/recruitment/CompanyTable'
import CompanyDetailModal from '../components/recruitment/CompanyDetailModal'

type View = 'board' | 'table'

export default function RecruitmentPage() {
  const navigate = useNavigate()
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<CompanyFilters>(EMPTY_FILTERS)
  const [view, setView] = useState<View>('board')
  const [selected, setSelected] = useState<Company | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchCompanies()
      .then((list) => {
        if (!cancelled) setCompanies(list)
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : '加载失败')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const stats = useMemo(() => computeStats(companies), [companies])
  const roles = useMemo(() => collectRoles(companies), [companies])
  const filtered = useMemo(() => filterCompanies(companies, filters), [companies, filters])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 h-14">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1 shrink-0"
          >
            <span>←</span>
            <span>首页</span>
          </button>
          <div className="w-px h-4 bg-gray-200" />
          <span className="font-semibold text-gray-900 text-sm shrink-0">2027 秋招</span>

          <div className="ml-auto flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
            <ViewTab active={view === 'board'} onClick={() => setView('board')} label="看板" />
            <ViewTab active={view === 'table'} onClick={() => setView('table')} label="表格" />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">2027 秋招看板</h1>
          <p className="text-gray-500 mt-1 text-sm">
            记录与管理 2027 届秋招进度 · 数据源 <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">public/recruitment-companies.json</code>
          </p>
        </div>

        {loading ? (
          <p className="text-gray-400 py-20 text-center">加载秋招数据中…</p>
        ) : error ? (
          <div className="bg-white border border-red-200 rounded-xl p-8 max-w-lg">
            <p className="font-semibold text-red-600 mb-2">加载失败</p>
            <pre className="text-sm text-red-500 whitespace-pre-wrap bg-red-50 rounded-lg p-4">
              {error}
            </pre>
          </div>
        ) : (
          <>
            <StatsBar stats={stats} />
            <FilterBar filters={filters} roles={roles} onChange={setFilters} />

            <div className="mb-3 text-xs text-gray-400">
              显示 {filtered.length} / {companies.length} 家企业
            </div>

            {view === 'board' ? (
              <KanbanBoard companies={filtered} onSelect={setSelected} />
            ) : (
              <CompanyTable companies={filtered} onSelect={setSelected} />
            )}
          </>
        )}
      </div>

      {selected && <CompanyDetailModal company={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}

function ViewTab({
  active,
  onClick,
  label,
}: {
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={`text-xs px-3 py-1 rounded-md transition-colors ${
        active ? 'bg-white text-gray-900 shadow-sm font-medium' : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      {label}
    </button>
  )
}
