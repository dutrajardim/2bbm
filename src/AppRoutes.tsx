import { Route, Routes } from "react-router-dom";
import Dashboard from "./features/vehicles/Dashboard"
import VehicleIntake from "./features/vehicles/VehicleIntake";
import { SyncProvider } from "./features/vehicles/providers/SyncProvider";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<SyncProvider><Dashboard /></SyncProvider>} />
      <Route path="/vehicle-intakes/:id" element={<SyncProvider><VehicleIntake /></SyncProvider>} />
      <Route path="*" element={<SyncProvider><Dashboard /></SyncProvider>} />
    </Routes>
  )
}