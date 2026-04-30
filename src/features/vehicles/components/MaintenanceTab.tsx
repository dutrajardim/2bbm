import { CheckCircle2, Wrench } from "lucide-react";
import type { VehicleMaintenance } from "../types";

interface MaintenanceTabProps {
  vehicleStatus: string;
  sortedMaintenances: VehicleMaintenance[] | undefined;
  maintenanceIndex: number;
  onMaintenanceIndexChange: (index: number) => void;
  onShowRequestForm: () => void;
  onShowRepairForm: () => void;
}

/**
 * Formats a timestamp as a short Brazilian date.
 *
 * @param ts - Timestamp in milliseconds.
 * @returns Date formatted as DD/MM/YYYY.
 */
const formatDate = (ts: number) =>
  new Date(ts).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

/**
 * Formats a timestamp as Brazilian date and time.
 *
 * @param ts - Timestamp in milliseconds.
 * @returns Localized date and time for pt-BR.
 */
const formatDateTime = (ts: number) =>
  new Date(ts).toLocaleString("pt-BR");

/**
 * Displays the current status and maintenance history for a vehicle.
 *
 * @param props.vehicleStatus - Consolidated vehicle status.
 * @param props.sortedMaintenances - Ordered maintenance records for display.
 * @param props.maintenanceIndex - Index of the currently selected maintenance record.
 * @param props.onMaintenanceIndexChange - Updates the selected maintenance record.
 * @param props.onShowRequestForm - Opens the request form.
 * @param props.onShowRepairForm - Opens the repair form.
 * @returns Maintenance tab with actions and history.
 */
const MaintenanceTab = ({
  vehicleStatus,
  sortedMaintenances,
  maintenanceIndex,
  onMaintenanceIndexChange,
  onShowRequestForm,
  onShowRepairForm
}: MaintenanceTabProps) => {
  const currentMaintenance = sortedMaintenances?.[maintenanceIndex];

  return (
    <div className="space-y-4 border border-border bg-surface p-4">
      <h2 className="text-lg font-semibold text-foreground">Manutenção</h2>
      <div>
        <p className="text-xs text-muted">Status do Veículo</p>
        <p className={`font-medium ${vehicleStatus === "Disponível" ? "text-success" : "text-danger"}`}>
          {vehicleStatus}
        </p>
      </div>

      {/* Maintenance Buttons */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={onShowRequestForm}
          className="inline-flex items-center gap-2 rounded-none bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Wrench className="size-4" aria-hidden="true" />
          Solicitar Manutenção
        </button>
        <button
          onClick={onShowRepairForm}
          className="inline-flex items-center gap-2 rounded-none bg-warning px-4 py-2 text-sm font-medium text-warning-foreground hover:opacity-90"
        >
          <CheckCircle2 className="size-4" aria-hidden="true" />
          Inserir Reparo
        </button>
      </div>

      {sortedMaintenances && sortedMaintenances.length > 0 && (
        <>
          <div>
            <p className="text-xs text-muted">Histórico de Manutenções</p>
            <div className="flex gap-2 overflow-x-auto pb-2 mt-2">
              {sortedMaintenances.map((m, idx) => (
                <button
                  key={m.id}
                  onClick={() => onMaintenanceIndexChange(idx)}
                  className={`whitespace-nowrap rounded-none border px-3 py-2 text-sm transition ${idx === maintenanceIndex
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-surface text-foreground hover:bg-surface-muted"
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
                <p className="text-xs text-muted">Data/Hora</p>
                <p className="font-medium">{formatDateTime(currentMaintenance.datetime)}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Descrição</p>
                <p className="text-sm">{currentMaintenance.reasonDescription || "Sem descrição"}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Tipo</p>
                <p className="font-medium">{currentMaintenance.type || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Status</p>
                <p className="font-medium">{currentMaintenance.disabled ? "Indisponível" : "Disponível"}</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default MaintenanceTab;
