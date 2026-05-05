import { useState, useRef, useEffect } from 'react'
import type { PracticeMode } from '../types/question'
import { PRACTICE_MODE_LABELS } from '../utils/practice'

interface Props {
  mode: PracticeMode
  onChange: (mode: PracticeMode) => void
}

const MODES: PracticeMode[] = ['smart', 'unreviewed', 'uncertain', 'unknown', 'all', 'random']

const MODE_ICON: Record<PracticeMode, string> = {
  smart: '✦',
  unreviewed: '○',
  uncertain: '△',
  unknown: '✕',
  all: '≡',
  random: '⟳',
}

export default function ModeSelector({ mode, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
      >
        <span>{MODE_ICON[mode]}</span>
        <span>{PRACTICE_MODE_LABELS[mode]}</span>
        <span className="text-gray-400">▾</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden py-1">
          {MODES.map((m) => (
            <button
              key={m}
              onClick={() => { onChange(m); setOpen(false) }}
              className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 transition-colors ${
                m === mode
                  ? 'bg-indigo-50 text-indigo-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="w-4">{MODE_ICON[m]}</span>
              <span>{PRACTICE_MODE_LABELS[m]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
