import { Route, Routes } from "react-router-dom";
import Dashboard from "./features/vehicles/Dashboard"
import VehicleIntake from "./features/vehicles/VehicleIntake";

export default function App(){
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/vehicle-intakes/:id" element={<VehicleIntake />} />
      <Route path="*" element={<Dashboard />} />
    </Routes>
  )
}