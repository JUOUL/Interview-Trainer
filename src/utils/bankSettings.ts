const ENABLED_KEY = 'interview-trainer:enabled-banks'

export type EnabledBankMap = Record<string, boolean>

export function loadEnabledBankMap(bankIds: string[]): EnabledBankMap {
  try {
    const raw = localStorage.getItem(ENABLED_KEY)
    const parsed = raw ? (JSON.parse(raw) as Record<string, unknown>) : {}
    const result: EnabledBankMap = {}
    for (const id of bankIds) {
      const v = parsed?.[id]
      result[id] = typeof v === 'boolean' ? v : true
    }
    return result
  } catch {
    const fallback: EnabledBankMap = {}
    for (const id of bankIds) fallback[id] = true
    return fallback
  }
}

export function saveEnabledBankMap(map: EnabledBankMap): void {
  try {
    localStorage.setItem(ENABLED_KEY, JSON.stringify(map))
  } catch {
    // ignore
  }
}

export function setBankEnabled(bankId: string, enabled: boolean, bankIds: string[]): EnabledBankMap {
  const map = loadEnabledBankMap(bankIds)
  map[bankId] = enabled
  saveEnabledBankMap(map)
  return map
}
