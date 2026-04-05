import { useVehicleIntakes } from './hooks/useVehicleIntakes'
import Papa from 'papaparse'
import { parseBRDateToTimestamp, parseVehicle } from '../../helpers'
import { useNavigate } from 'react-router-dom'
import type { VehicleIntake } from './types'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const vehicleIntakesURL =
  'https://docs.google.com/spreadsheets/d/1Cxy54jbBfgDS5w2w3TkmzUWeyVs4A0JulchBAtD54dA/export?format=csv#gid=1703470295'

export default function Dashboard() {
  const navigate = useNavigate()

  const {
    addVehicleIntake,
    clearVehicleIntakes,
    nextToOilChange,
    latestVehicleIssues,
    intakesCount,
    vehiclesLastIntake,
    last7DaysIntakesCount
  } = useVehicleIntakes()

  const handleImport = async (): Promise<void> => {
    const response = await fetch(vehicleIntakesURL)
    const csv = await response.text()

    await clearVehicleIntakes()

    Papa.parse<Record<string, string>>(csv, {
      header: true,
      delimiter: ',',
      skipEmptyLines: true,
      transformHeader: (header, index) => `${header.normalize("NFD").replace(/[^\w\s]/g, "").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "_").toLowerCase()}_${index}`,
      step: (row) => {
        const data = row.data

        const datetime = parseBRDateToTimestamp(data.carimbo_de_datahora_0_0)
        const vehicle = parseVehicle(data.marque_a_viatura_7_7)

        const photos: string | null = data.insira_as_4_fotos_do_veiculo_conforme_exemplo_abaixo_107_107?.trim() || null

        if (vehicle?.plate && !/^(ABT|ABTS|TLP|REF|ASL|ASM|APF|UR|AJ|AMA)/.test(vehicle?.plate)) {
          addVehicleIntake({
            datetime,
            receivingUnit: data.qual_a_sua_unidade_3_3?.trim() || null,
            prefix: vehicle?.prefix || null,
            plateNumber: vehicle?.plate || null,
            odometer: /^\d+$/.test(data.insira_o_hodometro_atual_100_100)
              ? Number(data.insira_o_hodometro_atual_100_100)
              : null,
            kmToNextOilChange: /^\d+$/.test(
              data.quantos_quilometros_faltam_para_proxima_troca_de_oleo_9_9
            )
              ? Number(data.quantos_quilometros_faltam_para_proxima_troca_de_oleo_9_9)
              : null,
            description: data.descricao_de_itens_opcional_67_67?.trim() || null,
            photos
          })
        }
      }
    })
  }

  const goToVehicle = (plate: string | null) => {
    if (!plate) return
    navigate(`/vehicle-intakes/${plate}`)
  }

  return (
    <div className="bg-gray-100 p-4 md:p-8 space-y-8">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Gestão de Viaturas
          </h1>
          <p className="text-sm text-gray-500">
            Monitoramento de recebimentos
          </p>
        </div>

        <button
          onClick={handleImport}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-sm"
        >
          Importar dados
        </button>
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

      { /* Last 7days intakes count */}

      <section>
        <h2 className="text-lg font-semibold mb-3 text-gray-800">
          Recebimentos (últimos 7 dias)
        </h2>

        <div className="bg-gray-50 shadow-xs w-full h-64 p-5">
          <ResponsiveContainer>
            <BarChart data={last7DaysIntakesCount}>
              <XAxis dataKey="date" />
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