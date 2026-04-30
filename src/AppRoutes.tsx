import { Route, Routes } from "react-router-dom";
import AppShell from "./features/vehicles/components/AppShell";
import Dashboard from "./features/vehicles/pages/Dashboard"
import Vehicle from "./features/vehicles/pages/Vehicle";
import { SyncProvider } from "./features/vehicles/providers/SyncProvider";
import { ThemeProvider } from "./providers/ThemeProvider";

/**
 * Defines the application's main routes and applies the synchronization provider.
 *
 * @returns Route tree used by React Router.
 */
const AppRoutes = () => {
  return (
    <ThemeProvider>
      <SyncProvider>
        <AppShell>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/vehicles/:id" element={<Vehicle />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </AppShell>
      </SyncProvider>
    </ThemeProvider>
  )
}

export default AppRoutes;
