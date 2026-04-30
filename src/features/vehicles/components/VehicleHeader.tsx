import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface VehicleHeaderProps {
  plate: string;
  vehicleStatus: string;
}

/**
 * Displays the vehicle page header with back navigation and status.
 *
 * @param props.plate - Plate of the vehicle being viewed.
 * @param props.vehicleStatus - Vehicle availability status.
 * @returns Header for the vehicle detail screen.
 */
const VehicleHeader = ({ plate, vehicleStatus }: VehicleHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="border border-border bg-surface p-4 md:flex md:items-center md:justify-between">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Voltar
      </button>
      <h1 className="mt-3 text-lg font-semibold text-foreground md:mt-0 md:text-xl">
        {plate} - <span className={`font-medium ${vehicleStatus === "Disponível" ? "text-success" : "text-danger"}`}>
          {vehicleStatus}
        </span>
      </h1>
    </div>
  );
}

export default VehicleHeader;
