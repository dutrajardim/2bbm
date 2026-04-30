import { useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import IntakesTab from "../components/IntakesTab";
import MaintenanceRepairForm from "../components/MaintenanceRepairForm";
import MaintenanceRequestForm from "../components/MaintenanceRequestForm";
import MaintenanceTab from "../components/MaintenanceTab";
import Tabs from "../components/Tabs";
import VehicleHeader from "../components/VehicleHeader";
import { useVehicleIntakes } from "../hooks/useVehicleIntakes";
import { useVehicleMaintenanceByPlate } from "../hooks/useVehicleMaintenanceByPlate";
import { useVehiclePageState } from "../hooks/useVehiclePageState";
import { selectVehicleIntakes } from "../utils/intakeSelectors";

/**
 * Renders the empty state for a vehicle route without matching intake records.
 *
 * @param props.onBack - Handler used to return to the previous route.
 * @returns A compact empty-state view with back navigation.
 */
const VehicleNotFoundState = ({ onBack }: { onBack: () => void }) => {
  return (
    <div className="mx-auto max-w-6xl p-6">
      <button onClick={onBack} className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Voltar
      </button>
      <p className="mt-4 border border-border bg-surface p-4 text-foreground">
        Nenhum registro encontrado
      </p>
    </div>
  );
};

/**
 * Displays the vehicle detail workflow for intakes and maintenance.
 *
 * The page composes data hooks, pure selectors, and presentational components
 * so each concern has a semantic home.
 *
 * @returns The vehicle detail page for the route plate parameter.
 */
const Vehicle = () => {
  const { id: plate } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getIntakesByPlate } = useVehicleIntakes();
  const { sortedMaintenances, vehicleStatus } = useVehicleMaintenanceByPlate(plate ?? "");
  const {
    activeTab,
    closeRepairForm,
    closeRequestForm,
    intakeIndex,
    loadedIntakeIndex,
    maintenanceIndex,
    openRepairForm,
    openRequestForm,
    setActiveTab,
    setIntakeIndex,
    setMaintenanceIndex,
    showRepairForm,
    showRequestForm,
  } = useVehiclePageState();

  const intakes = useMemo(
    () => selectVehicleIntakes(plate, getIntakesByPlate),
    [plate, getIntakesByPlate],
  );

  const currentIntake = intakes[intakeIndex];

  /**
   * Returns to the previous route in the navigation history.
   */
  const goBack = () => navigate(-1);

  if (!plate || !currentIntake) {
    return <VehicleNotFoundState onBack={goBack} />;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5 p-4 md:p-6">
      <VehicleHeader plate={plate} vehicleStatus={vehicleStatus} />

      <Tabs activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "intakes" && (
        <IntakesTab
          intakes={intakes}
          index={intakeIndex}
          loadedIndex={loadedIntakeIndex}
          onIndexChange={setIntakeIndex}
        />
      )}

      {activeTab === "maintenance" && (
        <MaintenanceTab
          vehicleStatus={vehicleStatus}
          sortedMaintenances={sortedMaintenances}
          maintenanceIndex={maintenanceIndex}
          onMaintenanceIndexChange={setMaintenanceIndex}
          onShowRequestForm={openRequestForm}
          onShowRepairForm={openRepairForm}
        />
      )}

      {showRequestForm && (
        <MaintenanceRequestForm plate={plate} onClose={closeRequestForm} />
      )}

      {showRepairForm && (
        <MaintenanceRepairForm plate={plate} onClose={closeRepairForm} />
      )}
    </div>
  );
};

export default Vehicle;
