import { useVehicleIntakes } from '../hooks/useVehicleIntakes'
import { useVehicles } from '../hooks/useVehicles'
import { useMemo } from 'react'
import { AlertTriangle, ClipboardList, TrendingDown, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

/**
 * Displays the daily intake dashboard.
 *
 * Shows daily reception metrics, issues, and a matrix of vehicles by location.
 *
 * @returns Daily intake dashboard page.
 */
const DailyIntake = () => {
  const navigate = useNavigate()
  const { vehiclesLastIntake, latestVehicleIssues } = useVehicleIntakes()
  const { vehicles, locations } = useVehicles()

  // Get today's date in the format used by the app
  const today = useMemo(() => {
    return new Date().toLocaleDateString("pt-BR")
  }, [])

  // Get intakes from today
  const todayIntakes = useMemo(() => {
    return vehiclesLastIntake.filter(intake => {
      const intakeDate = new Date(intake.datetime).toLocaleDateString("pt-BR")
      return intakeDate === today
    })
  }, [vehiclesLastIntake, today])

  // Get issues from today
  const todayIssues = useMemo(() => {
    return latestVehicleIssues.filter(issue => {
      const issueDate = new Date(issue.datetime).toLocaleDateString("pt-BR")
      return issueDate === today
    })
  }, [latestVehicleIssues, today])

  // Get plates that were received today
  const receivedTodayPlates = useMemo(() => {
    return new Set(todayIntakes.map(intake => intake.plateNumber))
  }, [todayIntakes])

  // Get vehicles not received today (only DISPONÍVEL status)
  const vehiclesNotReceivedToday = useMemo(() => {
    return vehicles.filter(v => !receivedTodayPlates.has(v.plateNumber) && v.status === "DISPONÍVEL")
  }, [vehicles, receivedTodayPlates])

  // Get vehicles with non-DISPONÍVEL status
  const vehiclesOtherStatus = useMemo(() => {
    return vehicles.filter(v => v.status !== "DISPONÍVEL")
  }, [vehicles])

  // Get all categories from DISPONÍVEL vehicles
  const categories = useMemo(() => {
    const availableVehicles = vehicles.filter(v => v.status === "DISPONÍVEL")
    const cats = new Set(availableVehicles.map(v => v.category))
    return Array.from(cats).sort()
  }, [vehicles])

  /**
   * Navigates to the vehicle detail page.
   */
  const goToVehicle = (plate: string) => {
    navigate(`/vehicles/${plate}`)
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-4 md:p-8">

      {/* HEADER */}
      <div className="relative flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Recebimento do Dia
          </h1>
          <p className="text-sm text-muted">
            {today} - Monitoramento de recebimentos do dia
          </p>
        </div>
      </div>

      {/* METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-border bg-surface p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted">Recebimentos hoje</p>
            <TrendingUp className="size-5 text-success" aria-hidden="true" />
          </div>
          <p className="mt-2 text-3xl font-semibold text-success">{todayIntakes.length}</p>
        </div>

        <div className="border border-border bg-surface p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted">Problemas relatados</p>
            <AlertTriangle className="size-5 text-danger" aria-hidden="true" />
          </div>
          <p className="mt-2 text-3xl font-semibold text-danger">{todayIssues.length}</p>
        </div>

        <div className="border border-border bg-surface p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted">Faltam receber</p>
            <TrendingDown className="size-5 text-warning" aria-hidden="true" />
          </div>
          <p className="mt-2 text-3xl font-semibold text-warning">{vehiclesNotReceivedToday.length}</p>
        </div>

        <div className="border border-border bg-surface p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted">Total de viaturas</p>
            <ClipboardList className="size-5 text-accent" aria-hidden="true" />
          </div>
          <p className="mt-2 text-3xl font-semibold text-accent">{vehicles.length}</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* ISSUES */}
        <section className='flex-1'>
          <h2 className="mb-3 inline-flex items-center gap-2 text-lg font-semibold text-foreground">
            <AlertTriangle className="size-5 text-danger" aria-hidden="true" />
            Problemas relatados hoje
          </h2>

          {todayIssues.length === 0 ? (
            <div className="border border-border bg-surface p-8 text-center">
              <p className="text-muted">Nenhum problema relatado hoje</p>
            </div>
          ) : (
            <div className="hidden h-96 overflow-hidden border border-border bg-surface md:block md:overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface-muted text-left text-muted">
                  <tr>
                    <th className="p-3">Hora</th>
                    <th className="p-3">Prefixo</th>
                    <th className="p-3">Placa</th>
                    <th className="p-3">Descrição</th>
                  </tr>
                </thead>
                <tbody>
                  {todayIssues.map((issue) => (
                    <tr
                      key={issue.id}
                      onClick={() => goToVehicle(issue.plateNumber || "")}
                      className="cursor-pointer border-t border-t-border transition hover:bg-surface-muted"
                    >
                      <td className="p-3">
                        {new Date(issue.datetime).toLocaleTimeString('pt-BR')}
                      </td>
                      <td className="p-3">{issue.prefix}</td>
                      <td className="p-3 text-accent font-medium">
                        {issue.plateNumber}
                      </td>
                      <td className="p-3">{issue.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* MISSING */}
        <section className='flex-1'>
          <h2 className="mb-3 inline-flex items-center gap-2 text-lg font-semibold text-foreground">
            <TrendingDown className="size-5 text-warning" aria-hidden="true" />
            Faltam receber ({vehiclesNotReceivedToday.length})
          </h2>

          {vehiclesNotReceivedToday.length === 0 ? (
            <div className="border border-border bg-surface p-8 text-center">
              <p className="text-success font-medium">Todas as viaturas disponíveis foram recebidas!</p>
            </div>
          ) : (
            <div className="hidden h-96 overflow-hidden border border-border bg-surface md:block md:overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface-muted text-left text-muted">
                  <tr>
                    <th className="p-3">Placa</th>
                    <th className="p-3">Prefixo</th>
                    <th className="p-3">Localização</th>
                  </tr>
                </thead>
                <tbody>
                  {vehiclesNotReceivedToday.map((vehicle) => (
                    <tr
                      key={vehicle.id}
                      onClick={() => goToVehicle(vehicle.plateNumber)}
                      className="cursor-pointer border-t border-t-border transition hover:bg-surface-muted"
                    >
                      <td className="p-3 text-accent font-medium">
                        {vehicle.plateNumber}
                      </td>
                      <td className="p-3">{vehicle.prefix}</td>
                      <td className="p-3">{vehicle.location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* MATRIX: VEHICLES BY LOCATION AND CATEGORY */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-foreground">
          Matriz de Recebimentos por localidade e categoria
        </h2>

        <div className="overflow-x-auto border border-border bg-surface">
          <table className="w-full text-sm">
            <thead className="bg-surface-muted text-left text-muted sticky top-0">
              <tr>
                <th className="p-3 min-w-40 font-semibold">Localidade</th>
                {categories.map((category) => (
                  <th key={category} className="p-3 min-w-32 text-center font-semibold">
                    {category}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {locations.map((location) => {
                // Get all DISPONÍVEL vehicles in this location
                const locationVehicles = vehicles.filter(
                  v => v.location === location && v.status === "DISPONÍVEL"
                );

                // Only show location if it has vehicles
                if (locationVehicles.length === 0) return null;

                return (
                  <tr key={location} className="border-t border-t-border">
                    <td className="p-3 font-semibold text-foreground bg-surface-muted">
                      {location}
                    </td>
                    {categories.map((category) => {
                      const vehiclesInCategory = locationVehicles.filter(
                        v => v.category === category
                      );

                      return (
                        <td key={`${location}-${category}`} className="p-3 align-top">
                          {vehiclesInCategory.length > 0 ? (
                            <div className="space-y-2">
                              {vehiclesInCategory.map((vehicle) => {
                                const wasReceived = receivedTodayPlates.has(
                                  vehicle.plateNumber
                                );
                                return (
                                  <div
                                    key={vehicle.id}
                                    onClick={() => goToVehicle(vehicle.plateNumber)}
                                    className="cursor-pointer p-2 rounded border border-border hover:bg-surface-muted transition"
                                  >
                                    <div className="font-medium text-accent text-xs">
                                      {vehicle.plateNumber}
                                    </div>
                                    <div className="text-xs text-muted">
                                      {vehicle.prefix}
                                    </div>
                                    <div className={`mt-1 inline-flex px-2 py-1 rounded-full text-xs font-semibold ${wasReceived
                                      ? 'bg-success/20 text-success'
                                      : 'bg-warning/20 text-warning'
                                      }`}>
                                      {wasReceived ? '✓' : '○'}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              {/* TOTAL ROW */}
              {locations.some((location) =>
                vehicles.some(v => v.location === location && v.status === "DISPONÍVEL")
              ) && (
                  <tr className="bg-surface-muted border-t-2 border-t-border font-semibold text-foreground">
                    <td className="p-3">TOTAL</td>
                    {categories.map((category) => {
                      const categoryVehicles = vehicles.filter(
                        v => v.category === category && v.status === "DISPONÍVEL"
                      );
                      const receivedCount = categoryVehicles.filter(v =>
                        receivedTodayPlates.has(v.plateNumber)
                      ).length;
                      const totalCount = categoryVehicles.length;

                      return (
                        <td key={`total-${category}`} className="p-3 text-center">
                          <span className="text-sm">
                            ✓ {receivedCount} / ○ {totalCount - receivedCount}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                )}
            </tbody>
          </table>
        </div>
      </section>

      {/* OTHER STATUS VEHICLES */}
      {vehiclesOtherStatus.length > 0 && (
        <section>
          <h2 className="mb-3 inline-flex items-center gap-2 text-lg font-semibold text-foreground">
            Viaturas não disponíveis ({vehiclesOtherStatus.length})
          </h2>

          <div className="border border-border bg-surface md:block md:max-h-96">
            <div className="overflow-x-auto overflow-y-auto max-h-96">
              <table className="w-full text-sm">
                <thead className="bg-surface-muted text-left text-muted">
                  <tr>
                    <th className="p-3">Placa</th>
                    <th className="p-3">Prefixo</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Localização</th>
                  </tr>
                </thead>
                <tbody className=''>
                  {vehiclesOtherStatus.map((vehicle) => (
                    <tr
                      key={vehicle.id}
                      onClick={() => goToVehicle(vehicle.plateNumber)}
                      className="cursor-pointer border-t border-t-border transition hover:bg-surface-muted"
                    >
                      <td className="p-3 text-accent font-medium">
                        {vehicle.plateNumber}
                      </td>
                      <td className="p-3">{vehicle.prefix}</td>
                      <td className="p-3">
                        <span className="inline-flex px-2 py-1 rounded text-xs font-medium bg-muted/20 text-muted">
                          {vehicle.status}
                        </span>
                      </td>
                      <td className="p-3">{vehicle.location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

    </div>
  )
}

export default DailyIntake
