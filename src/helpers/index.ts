export function parseBRDateToTimestamp(dateStr: string): number {
  const [datePart, timePart] = dateStr.trim().split(" ");

  if (!datePart || !timePart) {
    throw new Error("Formato inválido. Use DD/MM/YYYY HH:mm:ss");
  }

  const [day, month, year] = datePart.split("/").map(Number);
  const [hour, minute, second] = timePart.split(":").map(Number);

  if (
    [day, month, year, hour, minute, second].some((n) => isNaN(n))
  ) {
    throw new Error("Data contém valores inválidos");
  }

  const date = new Date(
    year,
    month - 1, // mês começa em 0
    day,
    hour,
    minute,
    second
  );

  return date.getTime();
}

type VehicleParsed = {
  prefix?: string; // ASL
  plate?: string; // QXW6B42
};

const PREFIXES = ["ABT", "ABTS", "TLP", "REF", "ASL", "ASM", "APF", "UR", "AJ", "TC", "AMA"];

export function parseVehicle(text: string): VehicleParsed | null {
  const normalized = text.toUpperCase().trim();

  // 1️⃣ Extrair placa dentro dos parênteses (PRIORIDADE MÁXIMA)
  const plateFromParentheses = normalized.match(/\(([^)]+)\)/);

  let plate: string | undefined;

  if (plateFromParentheses) {
    plate = plateFromParentheses[1].replace(/[^A-Z0-9]/g, "");
  }

  // 2️⃣ Remover conteúdo entre parênteses
  const outside = normalized.replace(/\([^)]*\)/g, "").trim();

  // 3️⃣ Extrair prefixo
  const prefixMatch = outside.match(
    new RegExp(`\\b(${PREFIXES.join("|")})[-\\s]?(\\d{3,5})\\b`)
  );

  const prefix = prefixMatch
    ? `${prefixMatch[1]} ${prefixMatch[2]}`
    : undefined;

  // 4️⃣ Fallback → tentar placa fora dos parênteses
  if (!plate) {
    const mercosul = normalized.match(/\b[A-Z]{3}\d[A-Z]\d{2}\b/);
    const oldPlate = normalized.match(/\b[A-Z]{3}\d{4}\b/);

    plate = mercosul?.[0] || oldPlate?.[0];
  }

  // 5️⃣ Se não encontrou nada
  if (!prefix && !plate) {
    console.warn(`Não foi possível extrair prefixo ou placa de: "${text}"`);
    return null;
  }

  return { prefix, plate };
}