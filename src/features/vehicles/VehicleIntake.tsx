import { useParams, useNavigate } from "react-router-dom";
import { useVehicleIntakes } from "./hooks/useVehicleIntakes";
import { useEffect, useMemo, useState } from "react";

export default function VehicleIntake() {
  const { id: plate } = useParams<{ id: string }>()
  const navigate = useNavigate();
  const { getIntakesByPlate } = useVehicleIntakes()

  const [index, setIndex] = useState(0);
  const [loadedIndex, setLoadedIndex] = useState<number | null>(null)

  useEffect(() => {
    setLoadedIndex(index)
  }, [index])

  const intakes = useMemo(() => {
    if (!plate) return [];
    return getIntakesByPlate(plate).sort((a, b) => b.datetime - a.datetime);
  }, [plate, getIntakesByPlate]);


  const current = intakes[index];

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const formatDateTime = (ts: number) =>
    new Date(ts).toLocaleString("pt-BR");

  const photos = current?.photos
    ? current.photos.split(",").map((p: string) => p.trim())
    : [];

  if (!current) {
    return (
      <div className="p-6">
        <button onClick={() => navigate(-1)} className="text-blue-600">
          ← Voltar
        </button>
        <p className="mt-4">Nenhum registro encontrado</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-blue-600 hover:underline"
        >
          ← Voltar
        </button>

        <h1 className="text-lg md:text-xl font-semibold text-center md:text-left">
          {plate}
        </h1>

        <div className="text-sm text-gray-500 text-right">
          {index + 1} / {intakes.length}
        </div>
      </div>

      {/* Seletor de datas */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {intakes.map((i, idx) => (
          <button
            key={i.id}
            onClick={() => setIndex(idx)}
            className={`px-3 py-2 rounded-xl text-sm whitespace-nowrap border ${idx === index
              ? "bg-blue-600 text-white"
              : "bg-white hover:bg-gray-100"
              }`}
          >
            {formatDate(i.datetime)}
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Informações */}
        <div className="bg-white rounded-2xl shadow p-4 space-y-4">
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

        {/* Fotos */}
        <div className="bg-white rounded-2xl shadow p-4">
          <p className="text-xs text-gray-500 mb-2">Fotos</p>

          {photos.length === 0 ? (
            <p className="text-sm text-gray-400">Sem fotos</p>
          ) : loadedIndex === index ? (
            <div className="grid grid-cols-2 gap-2">
              {photos.map((img, i) => (
                <a href={getImageUrl(img)} target="_blank">
                  <img
                    key={i}
                    src={getImageUrl(img)}
                    loading="lazy"
                    className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80"
                  />
                </a>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Carregando fotos...</p>
          )}
        </div>
      </div>

      {/* Navegação */}
      <div className="flex justify-between">
        <button
          onClick={() => setIndex((i) => Math.max(i - 1, 0))}
          disabled={index === 0}
          className="px-4 py-2 border rounded-xl disabled:opacity-40"
        >
          ← Mais recente
        </button>

        <button
          onClick={() =>
            setIndex((i) => Math.min(i + 1, intakes.length - 1))
          }
          disabled={index === intakes.length - 1}
          className="px-4 py-2 border rounded-xl disabled:opacity-40"
        >
          Mais antigo →
        </button>
      </div>
    </div>
  );
}


const getImageUrl = (url: string) => {
  const idMatch = url.match(/id=([^&]+)/);
  const id = idMatch?.[1];

  if (!id) return url;

  return `https://lh3.googleusercontent.com/d/${id}`;
};