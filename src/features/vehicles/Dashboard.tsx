import { useVehicleIntakes } from './hooks/useVehicleIntakes'
import { useNavigate } from 'react-router-dom'
import type { VehicleIntake } from './types'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, } from 'recharts'
import { useMemo, useState } from 'react'


export default function Dashboard() {
  const navigate = useNavigate()

  const {
    nextToOilChange,
    latestVehicleIssues,
    intakesCount,
    vehiclesLastIntake,
    last30DaysIntakesCount,
    // last7DaysScatter
  } = useVehicleIntakes()

  const goToVehicle = (plate: string | null) => {
    if (!plate) return
    navigate(`/vehicle-intakes/${plate}`)
  }

  // const days = Array.from(
  //  new Set(last7DaysScatter.map((d) => d.date))
  //)

  const [query, setQuery] = useState("")
  const results = useMemo(() => {
    if (!query) return [];

    return vehiclesLastIntake.filter(v =>
      v.plateNumber?.toUpperCase().includes(query) ||
      v.prefix?.toUpperCase().includes(query)
    );
  }, [query, vehiclesLastIntake]);

  return (
    <div className="bg-gray-100 p-4 md:p-8 space-y-8">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 relative">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Gestão de Viaturas
          </h1>
          <p className="text-sm text-gray-500">
            Monitoramento de recebimentos
          </p>
        </div>

        {/* BUSCA */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Buscar placa ou prefixo..."
            value={query}
            onChange={(e) => setQuery(e.target.value.toUpperCase())}
            onKeyDown={(e) => {
              if (e.key === "Enter" && results[0]) {
                goToVehicle(results[0].plateNumber);
              }
            }}
            className="w-full p-2 border rounded-lg text-sm"
          />

          {/* AUTOCOMPLETE */}
          {query && results.length > 0 && (
            <div className="absolute z-50 bg-white border w-full mt-1 rounded shadow max-h-60 overflow-auto">
              {results.slice(0, 5).map((v) => (
                <div
                  key={v.id}
                  onClick={() => {
                    goToVehicle(v.plateNumber);
                    setQuery("");
                  }}
                  className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                >
                  🚓 <strong>{v.plateNumber}</strong> ({v.prefix})
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-gray-50 p-5 shadow-xs">
          <p className="text-sm text-gray-500">VTR com problemas relatados</p>
          <p className="text-3xl font-bold text-gray-800">{latestVehicleIssues.length}</p>
        </div>

        <div className="bg-gray-50 p-5 shadow-xs">
          <p className="text-sm text-gray-500">Troca de óleo necessária</p>
          <p className="text-3xl font-bold text-gray-800">{nextToOilChange.length}</p>
        </div>

        <div className="bg-gray-50 p-5 shadow-xs">
          <p className="text-sm text-gray-500">Total de recebimentos</p>
          <p className="text-3xl font-bold text-gray-800">{intakesCount}</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">

        {/* ISSUES */}
        <section className='flex-1'>
          <h2 className="text-lg font-semibold mb-3 text-gray-800">
            Últimos problemas relatados
          </h2>

          {/* DESKTOP */}
          <div className="hidden md:block bg-gray-50 shadow-xs h-96 md:overflow-y-auto md:overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
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
                    className="border-t border-t-gray-300 hover:bg-gray-100 cursor-pointer transition"
                  >
                    <td className="p-3">
                      {new Date(v.datetime).toLocaleString('pt-BR')}
                    </td>
                    <td className="p-3">{v.prefix}</td>
                    <td className="p-3 text-indigo-600 font-medium">
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
                className="bg-gray-50 p-4 shadow-xs"
              >
                <div className="flex justify-between">
                  <span className="font-semibold">{v.prefix}</span>
                  <span className="text-indigo-600">{v.plateNumber}</span>
                </div>

                <p className="text-xs text-gray-400 mt-1">
                  {new Date(v.datetime).toLocaleString('pt-BR')}
                </p>

                <p className="text-sm mt-2 text-gray-700">
                  {v.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* OIL */}
        <section className='flex-1'>
          <h2 className="text-lg font-semibold mb-3 text-gray-800">
            Próximo a troca de óleo
          </h2>

          <div className="bg-gray-50 md:h-96 md:overflow-y-auto md:overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
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
                    className="border-t border-t-gray-300 hover:bg-gray-100 cursor-pointer"
                  >
                    <td className="p-3">{v.prefix}</td>
                    <td className="p-3 text-indigo-600 font-medium">
                      {v.plateNumber}
                    </td>
                    <td
                      className={`p-3 ${v.kmToNextOilChange !== null &&
                        v.kmToNextOilChange < 100
                        ? 'text-red-600 font-bold'
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


      { /* <div className="flex flex-col md:flex-row gap-4"> */ }

        { /* Last 7days intakes count */}
        <section>
          <h2 className="text-lg font-semibold mb-3 text-gray-800">
            Recebimentos (últimos 7 dias)
          </h2>

          <div className="bg-gray-50 shadow-xs w-full h-64 p-5">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last30DaysIntakesCount}>
                <XAxis dataKey="date" angle={-30} textAnchor="end" height={60} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar
                  dataKey="count"
                  fill="#2563eb"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
        { /*
        <section className='flex-2'>
          <h2 className="text-lg font-semibold mb-3 text-gray-800">
            Horário de recebimento (últimos 7 dias)
          </h2>
          <div className="bg-gray-50 shadow-xs w-full h-64 p-5">
            <ResponsiveContainer width="100%" height="100%">

              <ScatterChart width={600} height={300}>
                <CartesianGrid vertical strokeDasharray="3 3" />

                {days.map((day, i) => {
                  const nextDay = days[i + 1];

                  if (!nextDay) return null;

                  return (
                    <ReferenceArea
                      key={day}
                      x1={day}
                      x2={nextDay}
                      fill={i % 2 === 0 ? "#f8fafc" : "#eef2ff"}
                      strokeOpacity={0}
                    />
                  );
                })}

                <XAxis
                  dataKey="date"
                  name="Dia"
                  type="category"
                  ticks={days}
                  angle={-30}
                  height={60}
                  textAnchor="end"
                />

                <YAxis
                  dataKey="time"
                  name="Horário"
                  domain={[0, 1440]}
                  reversed
                  tickFormatter={(value) => {
                    const h = Math.floor(value / 60);
                    const m = value % 60;
                    return `${h.toString().padStart(2, "0")}:${m
                      .toString()
                      .padStart(2, "0")}`;
                  }}
                />

                <Tooltip
                  formatter={(value, _name, props) => {
                    if (typeof value !== "number") return value ?? "";

                    const h = Math.floor(value / 60);
                    const m = value % 60;

                    const data = props.payload

                    return [
                      `${h.toString().padStart(2, "0")}:${m
                        .toString()
                        .padStart(2, "0")} (${data.prefix})`,
                      `Horário`
                    ]
                  }}
                />

                <Scatter data={last7DaysScatter} fill="#2563eb" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
      */}
      {/* LAST INTakes */}
      <section>
        <h2 className="text-lg font-semibold mb-3 text-gray-800">
          Últimos recebimentos por VTR
        </h2>

        <div className="bg-gray-50 shadow-xs md:max-h-96 md:overflow-scroll md:overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
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
                    className="border-t border-t-gray-300 hover:bg-gray-100 cursor-pointer"
                  >
                    <td className="p-3">
                      {v.prefix}
                    </td>
                    <td className="p-3 text-indigo-600 font-medium">
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