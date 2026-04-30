import { useCallback, useEffect, useState } from "react";

export type VehiclePageTab = "intakes" | "maintenance";

/**
 * Stores local UI state for the vehicle detail page.
 *
 * Separating this hook from the page keeps rendering focused on composition
 * while making modal visibility and carousel indexes explicit.
 *
 * @returns State values and intent-based handlers used by the vehicle page.
 */
export const useVehiclePageState = () => {
  const [intakeIndex, setIntakeIndex] = useState(0);
  const [loadedIntakeIndex, setLoadedIntakeIndex] = useState<number | null>(null);
  const [maintenanceIndex, setMaintenanceIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<VehiclePageTab>("intakes");
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showRepairForm, setShowRepairForm] = useState(false);

  useEffect(() => {
    setLoadedIntakeIndex(intakeIndex);
  }, [intakeIndex]);

  /**
   * Opens the maintenance request form.
   */
  const openRequestForm = useCallback(() => setShowRequestForm(true), []);

  /**
   * Closes the maintenance request form.
   */
  const closeRequestForm = useCallback(() => setShowRequestForm(false), []);

  /**
   * Opens the repair registration form.
   */
  const openRepairForm = useCallback(() => setShowRepairForm(true), []);

  /**
   * Closes the repair registration form.
   */
  const closeRepairForm = useCallback(() => setShowRepairForm(false), []);

  return {
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
  };
}
