import { useVehicleIntakes } from '../hooks/useVehicleIntakes'
import { AlertTriangle, BarChart3, ClipboardList, Gauge, Wrench } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { VehicleIntake } from '../types'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, } from 'recharts'

/**
 * Displays the main vehicle management dashboard.
 *
 * Consolidates metrics, alert lists, plate or prefix search, and charts derived
 * from locally synchronized intake records.
 *
 * @returns Operational vehicle dashboard.
 */
const Dashboard = () => {
  const navigate = useNavigate()

  const {
    nextToOilChange,
    latestVehicleIssues,
    intakesCount,
    vehiclesLastIntake,
    last30DaysIntakesCount,
    // last7DaysScatter
  } = useVehicleIntakes()

  /**
   * Navigates to the detail screen when the provided plate is valid.
   *
   * @param plate - Selected vehicle plate.
   */
  const goToVehicle = (plate: string | null) => {
    if (!plate) return
    navigate(`/vehicles/${plate}`)
  }

  // const days = Array.from(
  //  new Set(last7DaysScatter.map((d) => d.date))
  //)

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-4 md:p-8">

      {/* HEADER */}
      <div className="relative flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Dashboard
          </h1>
          <p className="text-sm text-muted">
            Monitoramento de recebimentos, manutenção e disponibilidade
          </p>
        </div>
      </div>

      {/* METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="border border-border bg-surface p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted">VTR com problemas relatados</p>
            <AlertTriangle className="size-5 text-danger" aria-hidden="true" />
          </div>
          <p className="mt-2 text-3xl font-semibold text-foreground">{latestVehicleIssues.length}</p>
        </div>

        <div className="border border-border bg-surface p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted">Troca de óleo necessária</p>
            <Gauge className="size-5 text-warning" aria-hidden="true" />
          </div>
          <p className="mt-2 text-3xl font-semibold text-warning">{nextToOilChange.length}</p>
        </div>

        <div className="border border-border bg-surface p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted">Total de recebimentos</p>
            <ClipboardList className="size-5 text-accent" aria-hidden="true" />
          </div>
          <p className="mt-2 text-3xl font-semibold text-accent">{intakesCount}</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">

        {/* ISSUES */}
        <section className='flex-1'>
          <h2 className="mb-3 inline-flex items-center gap-2 text-lg font-semibold text-foreground">
            <AlertTriangle className="size-5 text-danger" aria-hidden="true" />
            Últimos problemas relatados
          </h2>

          {/* DESKTOP */}
          <div className="hidden h-96 overflow-hidden border border-border bg-surface md:block md:overflow-y-auto md:overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-muted text-left text-muted">
                <tr>
                  <th className="p-3">Data</th>
                  <th className="p-3">Prefixo</th>
                  <th className="p-3">Placa</th>
                  <th className="p-3">Descrição</th>
                </tr>
              </thead>

              <tbody>
                {latestVehicleIssues.map((v: VehicleIntake) => (
                  <tr
                    key={v.id}
                    onClick={() => goToVehicle(v.plateNumber)}
                    className="cursor-pointer border-t border-t-border transition hover:bg-surface-muted"
                  >
                    <td className="p-3">
                      {new Date(v.datetime).toLocaleString('pt-BR')}
                    </td>
                    <td className="p-3">{v.prefix}</td>
                    <td className="p-3 text-accent font-medium">
                      {v.plateNumber}
                    </td>
                    <td className="p-3">{v.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE */}
          <div className="md:hidden space-y-2">
            {latestVehicleIssues.map((v: VehicleIntake) => (
              <div
                key={v.id}
                onClick={() => goToVehicle(v.plateNumber)}
                className="border border-border bg-surface p-4"
              >
                <div className="flex justify-between">
                  <span className="font-semibold">{v.prefix}</span>
                  <span className="text-accent">{v.plateNumber}</span>
                </div>

                <p className="text-xs text-muted mt-1">
                  {new Date(v.datetime).toLocaleString('pt-BR')}
                </p>

                <p className="text-sm mt-2 text-foreground">
                  {v.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* OIL */}
        <section className='flex-1'>
          <h2 className="mb-3 inline-flex items-center gap-2 text-lg font-semibold text-foreground">
            <Gauge className="size-5 text-warning" aria-hidden="true" />
            Próximo a troca de óleo
          </h2>

          <div className="overflow-hidden border border-border bg-surface md:h-96 md:overflow-y-auto md:overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-muted text-left text-muted">
                <tr>
                  <th className="p-3">Prefixo</th>
                  <th className="p-3">Placa</th>
                  <th className="p-3">KM restante</th>
                </tr>
              </thead>

              <tbody>
                {nextToOilChange.map((v: VehicleIntake) => (
                  <tr
                    key={v.id}
                    onClick={() => goToVehicle(v.plateNumber)}
                    className="cursor-pointer border-t border-t-border hover:bg-surface-muted"
                  >
                    <td className="p-3">{v.prefix}</td>
                    <td className="p-3 text-accent font-medium">
                      {v.plateNumber}
                    </td>
                    <td
                      className={`p-3 ${v.kmToNextOilChange !== null &&
                        v.kmToNextOilChange < 100
                        ? 'text-danger font-bold'
                        : ''
                        }`}
                    >
                      {v.kmToNextOilChange}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>


      { /* Last 7 days intakes count */}
      <section>
        <h2 className="mb-3 inline-flex items-center gap-2 text-lg font-semibold text-foreground">
          <BarChart3 className="size-5 text-accent" aria-hidden="true" />
          Recebimentos (últimos 7 dias)
        </h2>

        <div className="h-64 w-full border border-border bg-surface p-5">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={last30DaysIntakesCount}>
              <XAxis dataKey="date" angle={-30} textAnchor="end" height={60} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar
                dataKey="count"
                fill="var(--accent)"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* LAST INTAKES */}
      <section>
        <h2 className="mb-3 inline-flex items-center gap-2 text-lg font-semibold text-foreground">
          <Wrench className="size-5 text-muted" aria-hidden="true" />
          Últimos recebimentos por VTR
        </h2>

        <div className="overflow-hidden border border-border bg-surface md:max-h-96 md:overflow-y-auto md:overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-muted text-left text-muted">
              <tr>
                <th className="p-3">Prefixo</th>
                <th className="p-3">Placa</th>
                <th className="p-3">Data</th>
                <th className="p-3">Unidade</th>
              </tr>
            </thead>

            <tbody>
              {vehiclesLastIntake
                .slice()
                .sort((a, b) => b.datetime - a.datetime)
                .slice(0, 50)
                .map((v: VehicleIntake) => (
                  <tr
                    key={v.id}
                    onClick={() => goToVehicle(v.plateNumber)}
                    className="cursor-pointer border-t border-t-border hover:bg-surface-muted"
                  >
                    <td className="p-3">
                      {v.prefix}
                    </td>
                    <td className="p-3 text-accent font-medium">
                      {v.plateNumber}
                    </td>
                    <td className="p-3">
                      {new Date(v.datetime).toLocaleString('pt-BR')}
                    </td>
                    <td className="p-3">{v.receivingUnit}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default Dashboard;
