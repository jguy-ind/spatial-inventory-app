import type { Region } from "./types";

interface CsvRow {
  officeName: string;
  pathId: number;
  x: number;
  y: number;
  location: string;
}

function parseRow(line: string): CsvRow | null {
  const parts = line.split(",").map((p) => p.trim());
  if (parts.length < 4) return null;
  const [officeName, pathIdStr, xStr, yStr, location] = parts;
  const pathId = Number.parseInt(pathIdStr, 10);
  const x = Number.parseFloat(xStr);
  const y = Number.parseFloat(yStr);
  if (Number.isNaN(pathId) || Number.isNaN(x) || Number.isNaN(y)) return null;
  return { officeName, pathId, x, y, location: location ?? "" };
}

/**
 * Parses a CSV string (Office Name, Path_ID, X, Y, Location) into Region[].
 * Groups rows by Office Name, sorts by Path_ID, and builds polygon points from X,Y.
 */
export function parseRegionsCsv(csvString: string): Region[] {
  const lines = csvString.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length === 0) return [];
  const headerLine = lines[0].toLowerCase();
  const dataStart = headerLine.includes("office name") ? 1 : 0;
  const rows: CsvRow[] = [];
  for (let i = dataStart; i < lines.length; i++) {
    const row = parseRow(lines[i]);
    if (row) rows.push(row);
  }
  const byOffice = new Map<string, CsvRow[]>();
  for (const row of rows) {
    const list = byOffice.get(row.officeName) ?? [];
    list.push(row);
    byOffice.set(row.officeName, list);
  }
  const regions: Region[] = [];
  for (const [officeName, list] of byOffice) {
    list.sort((a, b) => a.pathId - b.pathId);
    const points = list.map((r) => ({ x: r.x, y: r.y }));
    const location = list[0]?.location ?? "";
    regions.push({
      id: officeName,
      label: officeName,
      location: location || undefined,
      points,
    });
  }
  return regions;
}
