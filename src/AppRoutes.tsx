import { Route, Routes } from "react-router-dom";
import Dashboard from "./features/vehicles/pages/Dashboard"
import Vehicle from "./features/vehicles/pages/Vehicle";
import { SyncProvider } from "./features/vehicles/providers/SyncProvider";

/**
 * Defines the application's main routes and applies the synchronization provider.
 *
 * @returns Route tree used by React Router.
 */
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<SyncProvider><Dashboard /></SyncProvider>} />
      <Route path="/vehicles/:id" element={<SyncProvider><Vehicle /></SyncProvider>} />
      <Route path="*" element={<SyncProvider><Dashboard /></SyncProvider>} />
    </Routes>
  )
}

export default AppRoutes;
