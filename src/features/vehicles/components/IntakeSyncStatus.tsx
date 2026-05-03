import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { useSyncStatus } from '../contexts/DataSyncContext'

/**
 * Displays a minimal sync status indicator for intakes.
 *
 * Shows time until the next check and includes a manual refresh button.
 *
 * @returns Minimal sync status component
 */
export const IntakeSyncStatus = () => {
  const { timeUntilNextSync, isLoading, refreshSync } = useSyncStatus('intakes')
  const [formattedCountdown, setFormattedCountdown] = useState<string>('5:00')


  // Format countdown timer and last sync time
  useEffect(() => {
    const minutes = Math.floor(timeUntilNextSync / 60000)
    const seconds = Math.floor((timeUntilNextSync % 60000) / 1000)
    setFormattedCountdown(`${minutes}:${seconds.toString().padStart(2, '0')}`)

  }, [timeUntilNextSync])

  return (
    <div className='md:flex md:justify-end'>
      <div className="flex items-center justify-end gap-3 px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">

        {/* Countdown to next sync */}
        <div className="flex items-center gap-1.5 text-xs">
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-slate-600 dark:text-slate-400">Prox. atualização:</span>
          <span className="font-mono font-medium text-slate-900 dark:text-white">
            {formattedCountdown}
          </span>
        </div>

        {/* Refresh button */}
        <button
          onClick={refreshSync}
          disabled={isLoading}
          className="ml-1 flex items-center gap-1.5 px-2.5 py-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 disabled:opacity-50 text-slate-700 dark:text-slate-300 text-xs font-medium rounded transition-colors cursor-pointer"
          title="Verificar atualizações agora"
        >
          <RefreshCw
            className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`}
          />
        </button>
      </div>
    </div>
  )
}
