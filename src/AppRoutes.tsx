import { Route, Routes } from "react-router-dom";
import AppShell from "./features/vehicles/components/AppShell";
import Dashboard from "./features/vehicles/pages/Dashboard"
import Vehicle from "./features/vehicles/pages/Vehicle";
import DailyIntake from "./features/vehicles/pages/DailyIntake";
import { DataSyncProvider } from "./features/vehicles/contexts/DataSyncProvider";
import { ThemeProvider } from "./providers/ThemeProvider";

/**
 * Defines the application's main routes and applies the synchronization provider.
 *
 * @returns Route tree used by React Router.
 */
const AppRoutes = () => {
  return (
    <ThemeProvider>
      <DataSyncProvider>
        <AppShell>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/vehicles/daily-intake" element={<DailyIntake />} />
            <Route path="/vehicles/:id" element={<Vehicle />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </AppShell>
      </DataSyncProvider>
    </ThemeProvider>
  )
}

export default AppRoutes;
