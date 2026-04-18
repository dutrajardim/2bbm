import type { VehicleMaintenance } from "../types";

interface MaintenanceTabProps {
  vehicleStatus: string;
  sortedMaintenances: VehicleMaintenance[] | undefined;
  maintenanceIndex: number;
  onMaintenanceIndexChange: (index: number) => void;
  onShowRequestForm: () => void;
  onShowRepairForm: () => void;
}

const formatDate = (ts: number) =>
  new Date(ts).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const formatDateTime = (ts: number) =>
  new Date(ts).toLocaleString("pt-BR");

export default function MaintenanceTab({
  vehicleStatus,
  sortedMaintenances,
  maintenanceIndex,
  onMaintenanceIndexChange,
  onShowRequestForm,
  onShowRepairForm
}: MaintenanceTabProps) {
  const currentMaintenance = sortedMaintenances?.[maintenanceIndex];

  return (
    <div className="bg-white border border-gray-300 p-4 space-y-4">
      <h2 className="text-lg font-semibold">Manutenção</h2>
      <div>
        <p className="text-xs text-gray-500">Status do Veículo</p>
        <p className={`font-medium ${vehicleStatus === "Disponível" ? "text-green-600" : "text-red-600"}`}>
          {vehicleStatus}
        </p>
      </div>

      {/* Maintenance Buttons */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={onShowRequestForm}
          className="px-4 py-2 bg-gray-600 text-white hover:bg-gray-700"
        >
          Solicitar Manutenção
        </button>
        <button
          onClick={onShowRepairForm}
          className="px-4 py-2 bg-gray-600 text-white hover:bg-gray-700"
        >
          Inserir Reparo
        </button>
      </div>

      {sortedMaintenances && sortedMaintenances.length > 0 && (
        <>
          <div>
            <p className="text-xs text-gray-500">Histórico de Manutenções</p>
            <div className="flex gap-2 overflow-x-auto pb-2 mt-2">
              {sortedMaintenances.map((m, idx) => (
                <button
                  key={m.id}
                  onClick={() => onMaintenanceIndexChange(idx)}
                  className={`px-3 py-2 text-sm whitespace-nowrap border border-gray-300 ${idx === maintenanceIndex
                    ? "bg-blue-600 text-white"
                    : "bg-white hover:bg-gray-100"
                    }`}
                >
                  {formatDate(m.datetime)}
                </button>
              ))}
            </div>
          </div>

          {currentMaintenance && (
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-500">Data/Hora</p>
                <p className="font-medium">{formatDateTime(currentMaintenance.datetime)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Descrição</p>
                <p className="text-sm">{currentMaintenance.reasonDescription || "Sem descrição"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Tipo</p>
                <p className="font-medium">{currentMaintenance.type || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <p className="font-medium">{currentMaintenance.disabled ? "Indisponível" : "Disponível"}</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}