import { useEffect, useRef } from "react";

/**
 * Hook for running an asynchronous function repeatedly through polling.
 *
 * Runs immediately when the component mounts and then at the configured interval.
 * Includes safeguards against concurrent executions and unnecessary runs when
 * the browser tab is not visible.
 *
 * @param callback Asynchronous function that runs periodically.
 * @param interval Interval between executions in milliseconds (defaults to 5 minutes).
 *
 * @example
 * usePolling(async () => {
 *   const changed = await hasChanged()
 *   if (changed) {
 *     await syncData()
 *   }
 * }, 300000)
 *
 * @remarks
 * - Prevents concurrent calls with a lock (`running`)
 * - Skips execution when the tab is in the background (`document.hidden`)
 * - Runs immediately on mount instead of waiting for the first interval
 * - Automatically clears the interval when the component unmounts
 */
export const usePolling = (
  callback: () => Promise<void>,
  interval: number = 5 * 60 * 1000 // Default to 5 minutes
) => {
  const running = useRef(false)

  useEffect(() => {
    let mounted = true

    /**
     * Runs the callback while respecting the concurrency lock and tab visibility.
     */
    const run = async () => {
      if (running.current) return
      if (document.hidden) return

      running.current = true

      try {
        await callback()
      } finally {
        running.current = false
      }
    }

    run()

    const id = setInterval(() => {
      if (mounted) run()
    }, interval)

    return () => {
      mounted = false
      clearInterval(id)
    }

  }, [callback, interval])
}
