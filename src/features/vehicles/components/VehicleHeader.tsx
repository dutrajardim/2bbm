import { useNavigate } from "react-router-dom";

interface VehicleHeaderProps {
  plate: string;
  vehicleStatus: string;
}

export default function VehicleHeader({ plate, vehicleStatus }: VehicleHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-blue-600 hover:underline"
      >
        ← Voltar
      </button>
      <h1 className="text-lg md:text-xl font-semibold text-center md:text-left">
        {plate} - <span className={`font-medium ${vehicleStatus === "Disponível" ? "text-green-600" : "text-red-600"}`}>
          {vehicleStatus}
        </span>
      </h1>
    </div>
  );
}