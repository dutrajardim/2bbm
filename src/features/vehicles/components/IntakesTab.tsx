import { ChevronLeft, ChevronRight } from "lucide-react";
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
            className={`whitespace-nowrap rounded-none border px-3 py-2 text-sm transition ${idx === index
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-surface text-foreground hover:bg-surface-muted"
              }`}
          >
            {formatDate(i.datetime)}
          </button>
        ))}
      </div>

      <div className="text-right text-sm text-muted">
        {index + 1} / {intakes.length}
      </div>

      {/* Content */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Information */}
        <div className="space-y-4 border border-border bg-surface p-4">
          <div>
            <p className="text-xs text-muted">Data/Hora</p>
            <p className="font-medium">{formatDateTime(current.datetime)}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Unidade</p>
            <p className="font-medium">{current.receivingUnit}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Prefixo</p>
            <p className="font-medium">{current.prefix}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Odômetro</p>
            <p className="font-medium">{current.odometer} km</p>
          </div>
          <div>
            <p className="text-xs text-muted">Troca de óleo</p>
            <p className="font-medium">
              {current.kmToNextOilChange ?? "-"}
            </p>
          </div>
          {current.description && (
            <div>
              <p className="text-xs text-muted">Observações</p>
              <p className="text-sm leading-relaxed">
                {current.description}
              </p>
            </div>
          )}
        </div>

        {/* Photos */}
        <div className="border border-border bg-surface p-4">
          <p className="mb-2 text-xs text-muted">Fotos</p>
          {photos.length === 0 ? (
            <p className="text-sm text-muted">Sem fotos</p>
          ) : loadedIndex === index ? (
            <div className="grid grid-cols-2 gap-2">
              {photos.map((img, i) => (
                <a href={getImageUrl(img)} target="_blank" key={img}>
                  <img
                    key={i}
                    src={getImageUrl(img)}
                    loading="lazy"
                    className="h-32 w-full cursor-pointer object-cover hover:opacity-80"
                  />
                </a>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">Carregando fotos...</p>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => onIndexChange(Math.max(index - 1, 0))}
          disabled={index === 0}
          className="inline-flex items-center gap-2 rounded-none border border-border bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-surface-muted disabled:opacity-40"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Mais recente
        </button>
        <button
          onClick={() => onIndexChange(Math.min(index + 1, intakes.length - 1))}
          disabled={index === intakes.length - 1}
          className="inline-flex items-center gap-2 rounded-none border border-border bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-surface-muted disabled:opacity-40"
        >
          Mais antigo
          <ChevronRight className="size-4" aria-hidden="true" />
        </button>
      </div>
    </>
  );
}

export default IntakesTab;
