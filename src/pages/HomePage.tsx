import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import type { QuestionBank, BankStats } from '../types/question'
import { BANK_IDS } from '../data/banks'
import {
  fetchQuestionBank,
  MissingBankError,
  BankJsonError,
  BankValidationError,
} from '../utils/questionBank'
import { loadBankProgress, resetBankProgress, exportAllProgress, importProgress } from '../utils/storage'
import { computeBankStats } from '../utils/practice'
import BankCard from '../components/BankCard'
import BankPlaceholderCard, { type PlaceholderKind } from '../components/BankPlaceholderCard'

type BankEntry =
  | { kind: 'ok'; bank: QuestionBank; stats: BankStats }
  | { kind: 'placeholder'; id: string; errorKind: PlaceholderKind; detail?: string }

export default function HomePage() {
  const navigate = useNavigate()
  const [entries, setEntries] = useState<BankEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [importMsg, setImportMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function loadBanks() {
    setLoading(true)
    const results: BankEntry[] = []

    for (const id of BANK_IDS) {
      try {
        const bank = await fetchQuestionBank(id)
        const progress = loadBankProgress(id)
        const stats = computeBankStats(bank.questions, progress)
        results.push({ kind: 'ok', bank, stats })
      } catch (e) {
        if (e instanceof MissingBankError) {
          results.push({ kind: 'placeholder', id, errorKind: 'missing' })
        } else if (e instanceof BankJsonError) {
          results.push({ kind: 'placeholder', id, errorKind: 'json-error', detail: e.message })
        } else if (e instanceof BankValidationError) {
          const detail = e.issues.map((i) => `· ${i.message}`).join('\n')
          results.push({ kind: 'placeholder', id, errorKind: 'validation-error', detail })
        } else {
          const msg = e instanceof Error ? e.message : '未知错误'
          results.push({ kind: 'placeholder', id, errorKind: 'load-error', detail: msg })
        }
      }
    }

    setEntries(results)
    setLoading(false)
  }

  useEffect(() => {
    loadBanks()
  }, [])

  function handleReset(bankId: string) {
    if (!confirm('确定要重置该题库的进度吗？')) return
    resetBankProgress(bankId)
    setEntries((prev) =>
      prev.map((e) => {
        if (e.kind !== 'ok' || e.bank.id !== bankId) return e
        const progress = loadBankProgress(bankId)
        const stats = computeBankStats(e.bank.questions, progress)
        return { ...e, stats }
      })
    )
  }

  function handleExport() {
    exportAllProgress(BANK_IDS)
  }

  function handleImportClick() {
    fileInputRef.current?.click()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const result = importProgress(text)
      setImportMsg({ ok: result.success, text: result.message })
      if (result.success) loadBanks()
      if (fileInputRef.current) fileInputRef.current.value = ''
      setTimeout(() => setImportMsg(null), 4000)
    }
    reader.readAsText(file)
  }

  const okCount = entries.filter((e) => e.kind === 'ok').length
  const missingCount = entries.filter(
    (e) => e.kind === 'placeholder' && e.errorKind === 'missing'
  ).length
  const errorCount = entries.filter(
    (e) => e.kind === 'placeholder' && e.errorKind !== 'missing'
  ).length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Interview Trainer</h1>
            <p className="text-gray-500 mt-1">系统刷面试题，掌握核心知识点</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="text-sm text-gray-500 hover:text-gray-800 px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-white transition-colors"
            >
              导出进度
            </button>
            <button
              onClick={handleImportClick}
              className="text-sm text-gray-500 hover:text-gray-800 px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-white transition-colors"
            >
              导入进度
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>

        {/* Import feedback */}
        {importMsg && (
          <div
            className={`mb-5 px-4 py-3 rounded-lg text-sm border ${
              importMsg.ok
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            {importMsg.text}
          </div>
        )}

        {/* Stats bar */}
        {!loading && (
          <div className="mb-6 flex items-center gap-4 text-sm text-gray-400">
            <span>{BANK_IDS.length} 个题库</span>
            {okCount > 0 && <span className="text-green-600">{okCount} 已就绪</span>}
            {missingCount > 0 && <span className="text-gray-400">{missingCount} 待添加</span>}
            {errorCount > 0 && <span className="text-red-500">{errorCount} 加载错误</span>}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {BANK_IDS.map((id) => (
              <div key={id} className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
                <div className="h-5 bg-gray-100 rounded w-1/3 mb-2" />
                <div className="h-4 bg-gray-100 rounded w-2/3 mb-4" />
                <div className="h-1.5 bg-gray-100 rounded-full mb-4" />
                <div className="flex gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-4 bg-gray-100 rounded w-12" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {entries.map((entry) =>
              entry.kind === 'ok' ? (
                <BankCard
                  key={entry.bank.id}
                  bank={entry.bank}
                  stats={entry.stats}
                  onStart={() => navigate(`/practice/${entry.bank.id}`)}
                  onReset={() => handleReset(entry.bank.id)}
                />
              ) : (
                <BankPlaceholderCard
                  key={entry.id}
                  bankId={entry.id}
                  kind={entry.errorKind}
                  detail={entry.detail}
                />
              )
            )}
          </div>
        )}
      </div>
    </div>
  )
}
