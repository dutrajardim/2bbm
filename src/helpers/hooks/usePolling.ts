import { useEffect, useRef } from "react";

/**
 * Hook para executar uma função assíncrona de forma recorrente (polling).
 *
 * Executa imediatamente ao montar o componente e depois em intervalos definidos.
 * Possui proteções para evitar execuções simultâneas e execuções desnecessárias
 * quando a aba do navegador não está visível.
 *
 * @param callback Função assíncrona que será executada periodicamente.
 * @param interval Intervalo entre execuções em milissegundos (default: 5 minutos).
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
 * - Evita chamadas concorrentes usando um lock (`running`)
 * - Não executa quando a aba está em background (`document.hidden`)
 * - Executa imediatamente na montagem (não espera o primeiro intervalo)
 * - Limpa automaticamente o intervalo ao desmontar o componente
 */
export const usePolling = (
  callback: () => Promise<void>,
  interval: number = 5 * 60 * 1000 // Default to 5 minutes
) => {
  const running = useRef(false)

  useEffect(() => {
    let mounted = true

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