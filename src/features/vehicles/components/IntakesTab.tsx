import type { VehicleIntake } from "../types";

interface IntakesTabProps {
  intakes: VehicleIntake[];
  index: number;
  loadedIndex: number | null;
  onIndexChange: (index: number) => void;
}

/**
 * Formats a timestamp as a short Brazilian date.
 *
 * @param ts - Timestamp in milliseconds.
 * @returns Date formatted as DD/MM/YYYY.
 */
const formatDate = (ts: number) =>
  new Date(ts).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

/**
 * Formats a timestamp as Brazilian date and time.
 *
 * @param ts - Timestamp in milliseconds.
 * @returns Localized date and time for pt-BR.
 */
const formatDateTime = (ts: number) =>
  new Date(ts).toLocaleString("pt-BR");

/**
 * Converts shared Google Drive links into direct image URLs.
 *
 * @param url - Original photo URL.
 * @returns Direct URL when the file identifier is found.
 */
const getImageUrl = (url: string) => {
  const idMatch = url.match(/id=([^&]+)/);
  const id = idMatch?.[1];
  if (!id) return url;
  return `https://lh3.googleusercontent.com/d/${id}`;
};

/**
 * Displays a vehicle's intake history with record navigation.
 *
 * @param props.intakes - Intake list for the selected vehicle.
 * @param props.index - Index of the intake currently displayed.
 * @param props.loadedIndex - Index allowed to load photos.
 * @param props.onIndexChange - Updates the selected intake.
 * @returns Intake tab with details, photos, and chronological navigation.
 */
const IntakesTab = ({ intakes, index, loadedIndex, onIndexChange }: IntakesTabProps) => {
  const current = intakes[index];
  const photos = current?.photos
    ? current.photos.split(",").map((p: string) => p.trim())
    : [];

  return (
    <>
      {/* Date selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {intakes.map((i, idx) => (
          <button
            key={i.id}
            onClick={() => onIndexChange(idx)}
            className={`px-3 py-2 text-sm whitespace-nowrap border border-gray-300 ${idx === index
              ? "bg-blue-600 text-white"
              : "bg-white hover:bg-gray-100"
              }`}
          >
            {formatDate(i.datetime)}
          </button>
        ))}
      </div>

      <div className="text-sm text-gray-500 text-right">
        {index + 1} / {intakes.length}
      </div>

      {/* Content */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Information */}
        <div className="bg-white border border-gray-300 p-4 space-y-4">
          <div>
            <p className="text-xs text-gray-500">Data/Hora</p>
            <p className="font-medium">{formatDateTime(current.datetime)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Unidade</p>
            <p className="font-medium">{current.receivingUnit}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Prefixo</p>
            <p className="font-medium">{current.prefix}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Odômetro</p>
            <p className="font-medium">{current.odometer} km</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Troca de óleo</p>
            <p className="font-medium">
              {current.kmToNextOilChange ?? "-"}
            </p>
          </div>
          {current.description && (
            <div>
              <p className="text-xs text-gray-500">Observações</p>
              <p className="text-sm leading-relaxed">
                {current.description}
              </p>
            </div>
          )}
        </div>

        {/* Photos */}
        <div className="bg-white border border-gray-300 p-4">
          <p className="text-xs text-gray-500 mb-2">Fotos</p>
          {photos.length === 0 ? (
            <p className="text-sm text-gray-400">Sem fotos</p>
          ) : loadedIndex === index ? (
            <div className="grid grid-cols-2 gap-2">
              {photos.map((img, i) => (
                <a href={getImageUrl(img)} target="_blank" key={img}>
                  <img
                    key={i}
                    src={getImageUrl(img)}
                    loading="lazy"
                    className="w-full h-32 object-cover cursor-pointer hover:opacity-80"
                  />
                </a>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Carregando fotos...</p>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => onIndexChange(Math.max(index - 1, 0))}
          disabled={index === 0}
          className="px-4 py-2 border border-gray-300 disabled:opacity-40"
        >
          ← Mais recente
        </button>
        <button
          onClick={() => onIndexChange(Math.min(index + 1, intakes.length - 1))}
          disabled={index === intakes.length - 1}
          className="px-4 py-2 border border-gray-300 disabled:opacity-40"
        >
          Mais antigo →
        </button>
      </div>
    </>
  );
}

export default IntakesTab;
