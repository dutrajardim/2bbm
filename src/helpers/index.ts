/**
 * Converts a Brazilian date string in DD/MM/YYYY HH:mm:ss format to a timestamp.
 *
 * Validates that date and time are present, converts each field to a number,
 * and returns the millisecond value produced by Date.
 */
export const parseBRDateToTimestamp = (dateStr: string): number => {
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
    month - 1, // Months are zero-based
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

/**
 * Extracts an operational prefix and/or license plate from vehicle text.
 *
 * Prioritizes plates inside parentheses, searches for known prefixes in the
 * remaining text, and falls back to Mercosul or legacy plate patterns.
 */
export const parseVehicle = (text: string): VehicleParsed | null => {
  const normalized = text.toUpperCase().trim();

  // 1. Extract the plate inside parentheses first.
  const plateFromParentheses = normalized.match(/\(([^)]+)\)/);

  let plate: string | undefined;

  if (plateFromParentheses) {
    plate = plateFromParentheses[1].replace(/[^A-Z0-9]/g, "");
  }

  // 2. Remove content inside parentheses.
  const outside = normalized.replace(/\([^)]*\)/g, "").trim();

  // 3. Extract the operational prefix.
  const prefixMatch = outside.match(
    new RegExp(`\\b(${PREFIXES.join("|")})[-\\s]?(\\d{3,5})\\b`)
  );

  const prefix = prefixMatch
    ? `${prefixMatch[1]} ${prefixMatch[2]}`
    : undefined;

  // 4. Fallback: try to find a plate outside parentheses.
  if (!plate) {
    const mercosul = normalized.match(/\b[A-Z]{3}\d[A-Z]\d{2}\b/);
    const oldPlate = normalized.match(/\b[A-Z]{3}\d{4}\b/);

    plate = mercosul?.[0] || oldPlate?.[0];
  }

  // 5. Return null when nothing useful was found.
  if (!prefix && !plate) {
    console.warn(`Não foi possível extrair prefixo ou placa de: "${text}"`);
    return null;
  }

  return { prefix, plate };
}
