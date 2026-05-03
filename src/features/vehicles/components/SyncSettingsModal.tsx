import { useEffect, useMemo, useState } from 'react'
import { ArrowUpRight, Link2, RefreshCw, Settings2, X } from 'lucide-react'
import { useDataSync } from '../contexts/DataSyncContext'
import type { SyncType } from '../contexts/DataSyncContext'

/**
 * Maps each sync data type to its corresponding Google Sheets URL.
 */
const SHEETS_LINKS: Record<SyncType, string> = {
  intakes: 'https://docs.google.com/spreadsheets/d/1Cxy54jbBfgDS5w2w3TkmzUWeyVs4A0JulchBAtD54dA',
  maintenance: 'https://docs.google.com/spreadsheets/d/1y5GyOpMPrN0tQ48FFZ32hMkjhWc-2XmD0GWlV9EUELo/edit?gid=1046510535#gid=1046510535',
  vehicles: 'https://docs.google.com/spreadsheets/d/1y5GyOpMPrN0tQ48FFZ32hMkjhWc-2XmD0GWlV9EUELo',
}

interface SyncSettingsModalProps {
  open: boolean
  onClose: () => void
}

const syncTypes: Array<{ type: SyncType; label: string }> = [
  { type: 'intakes', label: 'Recebimentos' },
  { type: 'maintenance', label: 'Manutenção' },
  { type: 'vehicles', label: 'Veículos' },
]

interface SyncPanelProps {
  type: SyncType
  label: string
  minutes: number
  currentIntervalMinutes: number
  isSyncing: boolean
  onMinutesChange: (minutes: number) => void
  onSyncNow: () => void
  sheetLink: string
}

const SyncPanel = ({
  type,
  label,
  minutes,
  currentIntervalMinutes,
  isSyncing,
  onMinutesChange,
  onSyncNow,
  sheetLink,
}: SyncPanelProps) => (
  <div className="space-y-5">
    <div className="space-y-3 border border-border bg-surface-muted p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-foreground">{label}</p>
          <p className="text-xs text-muted">Ajuste o intervalo para esta fonte.</p>
        </div>
        <span className="text-xs text-muted">Intervalo atual: {currentIntervalMinutes} min</span>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium text-foreground" htmlFor={`sync-interval-${type}`}>
          Minutos
        </label>
        <div className="flex items-center gap-2 border border-border bg-background px-3 py-2">
          <input
            id={`sync-interval-${type}`}
            type="number"
            min={1}
            value={minutes}
            onChange={(event) => onMinutesChange(Math.max(1, Number(event.target.value)))}
            className="w-20 bg-transparent text-right text-sm font-semibold text-foreground outline-none"
          />
          <span className="text-sm text-muted">min</span>
        </div>
      </div>
    </div>

    <div className="space-y-4 border border-border bg-surface-muted p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <RefreshCw className="size-4" aria-hidden="true" />
          Atualização manual
        </div>
        <span className="text-xs text-muted">{isSyncing ? 'Sincronizando...' : 'Pronto para usar'}</span>
      </div>
      <p className="text-sm text-muted">Força uma atualização imediata para este tipo de sincronização.</p>
      <button
        type="button"
        onClick={onSyncNow}
        disabled={isSyncing}
        className="inline-flex w-full items-center justify-center gap-2 border border-border bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition hover:bg-accent/90 disabled:opacity-50"
      >
        {isSyncing ? 'Sincronizando...' : `Sincronizar ${label}`}
      </button>
    </div>

    <div className="space-y-2 border border-border bg-surface-muted p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Link2 className="size-4" aria-hidden="true" />
        Link de planilha
      </div>
      <p className="text-sm text-muted">Abra esta fonte diretamente no Google Sheets.</p>
      <a
        href={sheetLink}
        target="_blank"
        rel="noreferrer noopener"
        className="inline-flex items-center gap-2 text-sm font-semibold text-accent underline-offset-4 hover:underline"
      >
        Abrir {label}
        <ArrowUpRight className="size-4" aria-hidden="true" />
      </a>
    </div>
  </div>
)

/**
 * Modal component that exposes sync interval settings, manual sync controls,
 * and Google Sheets links for each sync data type.
 */
export const SyncSettingsModal = ({ open, onClose }: SyncSettingsModalProps) => {
  const { syncIntervals, setSyncInterval, refreshSync, syncStatus } = useDataSync()
  const [activeType, setActiveType] = useState<SyncType>('intakes')
  const [minutesByType, setMinutesByType] = useState<Record<SyncType, number>>({
    intakes: Math.max(1, Math.round(syncIntervals.intakes / 60000)),
    maintenance: Math.max(1, Math.round(syncIntervals.maintenance / 60000)),
    vehicles: Math.max(1, Math.round(syncIntervals.vehicles / 60000)),
  })

  useEffect(() => {
    setMinutesByType({
      intakes: Math.max(1, Math.round(syncIntervals.intakes / 60000)),
      maintenance: Math.max(1, Math.round(syncIntervals.maintenance / 60000)),
      vehicles: Math.max(1, Math.round(syncIntervals.vehicles / 60000)),
    })
  }, [syncIntervals])

  const activeLabel = useMemo(
    () => syncTypes.find((item) => item.type === activeType)?.label ?? 'Recebimentos',
    [activeType]
  )

  const activeSheetLink = SHEETS_LINKS[activeType]
  const isSyncing = syncStatus[activeType].isLoading

  const handleSaveAll = () => {
    Object.entries(minutesByType).forEach(([type, minutes]) => {
      setSyncInterval(type as SyncType, Math.max(1, minutes) * 60 * 1000)
    })
    onClose()
  }

  const handleMinutesChange = (type: SyncType, value: number) => {
    setMinutesByType((current) => ({
      ...current,
      [type]: Math.max(1, value),
    }))
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded border border-border bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Settings2 className="size-5" aria-hidden="true" />
            Configurações de sincronização
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center border border-border bg-surface text-foreground transition hover:bg-surface-muted"
            aria-label="Fechar modal"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        <div className="border-b border-border px-5 py-3">
          <div className="flex gap-2 overflow-x-auto">
            {syncTypes.map(({ type, label }) => (
              <button
                key={type}
                type="button"
                onClick={() => setActiveType(type)}
                className={`px-3 py-2 text-sm font-medium transition ${activeType === type
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-surface text-foreground hover:bg-surface-muted'
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5">
          <SyncPanel
            type={activeType}
            label={activeLabel}
            minutes={minutesByType[activeType]}
            currentIntervalMinutes={Math.round(syncIntervals[activeType] / 60000)}
            isSyncing={isSyncing}
            onMinutesChange={(minutes) => handleMinutesChange(activeType, minutes)}
            onSyncNow={() => refreshSync(activeType)}
            sheetLink={activeSheetLink}
          />
        </div>

        <div className="flex flex-col gap-2 border-t border-border px-5 py-4 sm:flex-row sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition hover:bg-surface-muted"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              className="rounded border border-accent bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition hover:bg-accent/90"
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
