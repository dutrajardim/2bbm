import { useParams, useNavigate } from "react-router-dom";
import { useVehicleIntakes } from "./hooks/useVehicleIntakes";
import { useVehicleMaintenanceByPlate } from "./hooks/useVehicleMaintenanceByPlate";
import { useEffect, useMemo, useState } from "react";
import VehicleHeader from "./components/VehicleHeader";
import Tabs from "./components/Tabs";
import IntakesTab from "./components/IntakesTab";
import MaintenanceTab from "./components/MaintenanceTab";
import MaintenanceRequestForm from "./components/MaintenanceRequestForm";
import MaintenanceRepairForm from "./components/MaintenanceRepairForm";

export default function Vehicle() {
  const { id: plate } = useParams<{ id: string }>()
  const navigate = useNavigate();
  const { getIntakesByPlate } = useVehicleIntakes()
  const { sortedMaintenances, vehicleStatus } = useVehicleMaintenanceByPlate(plate!);

  const [index, setIndex] = useState(0);
  const [loadedIndex, setLoadedIndex] = useState<number | null>(null)
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showRepairForm, setShowRepairForm] = useState(false);
  const [maintenanceIndex, setMaintenanceIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'intakes' | 'maintenance'>('intakes');

  useEffect(() => {
    setLoadedIndex(index)
  }, [index])

  const intakes = useMemo(() => {
    if (!plate) return [];
    return getIntakesByPlate(plate).sort((a, b) => b.datetime - a.datetime);
  }, [plate, getIntakesByPlate]);


  const current = intakes[index];

  if (!current) {
    return (
      <div className="p-6">
        <button onClick={() => navigate(-1)} className="text-blue-600">
          ← Voltar
        </button>
        <p className="mt-4">Nenhum registro encontrado</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-4">
      {/* Header */}
      <VehicleHeader plate={plate!} vehicleStatus={vehicleStatus} />

      {/* Tabs */}
      <Tabs activeTab={activeTab} onTabChange={setActiveTab} />


      {/* Intakes Tab */}
      {activeTab === 'intakes' && (
        <IntakesTab
          intakes={intakes}
          index={index}
          loadedIndex={loadedIndex}
          onIndexChange={setIndex}
        />
      )}

      {/* Maintenance Tab */}
      {activeTab === 'maintenance' && (
        <MaintenanceTab
          vehicleStatus={vehicleStatus}
          sortedMaintenances={sortedMaintenances}
          maintenanceIndex={maintenanceIndex}
          onMaintenanceIndexChange={setMaintenanceIndex}
          onShowRequestForm={() => setShowRequestForm(true)}
          onShowRepairForm={() => setShowRepairForm(true)}
        />
      )}


      {/* Maintenance Request Form */}
      {showRequestForm && (
        <MaintenanceRequestForm
          plate={plate!}
          onClose={() => setShowRequestForm(false)}
        />
      )}

      {/* Repair Form */}
      {showRepairForm && (
        <MaintenanceRepairForm
          plate={plate!}
          onClose={() => setShowRepairForm(false)}
        />
      )}
    </div>
  );
}