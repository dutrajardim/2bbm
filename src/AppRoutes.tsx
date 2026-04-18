import { Route, Routes } from "react-router-dom";
import Dashboard from "./features/vehicles/Dashboard"
import Vehicle from "./features/vehicles/Vehicle";
import { SyncProvider } from "./features/vehicles/providers/SyncProvider";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<SyncProvider><Dashboard /></SyncProvider>} />
      <Route path="/vehicles/:id" element={<SyncProvider><Vehicle /></SyncProvider>} />
      <Route path="*" element={<SyncProvider><Dashboard /></SyncProvider>} />
    </Routes>
  )
}