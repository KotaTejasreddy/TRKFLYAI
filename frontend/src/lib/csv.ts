/**
 * Minimal CSV parser + column profiler.
 * Handles quoted fields, escaped quotes, and common delimiters.
 * Good enough for analysis previews (not a full RFC4180 implementation).
 */

export interface ColumnProfile {
  name: string;
  inferred_type: "number" | "string" | "boolean" | "date" | "mixed";
  missing_count: number;
  unique_count: number;
  sample_values: string[];
}

export interface ParsedCsv {
  headers: string[];
  rows: string[][];     // first up to N rows
  total_rows: number;   // includes rows not stored in `rows`
  columns: ColumnProfile[];
  preview_text: string; // raw preview text we send to backend
}

const MAX_PREVIEW_ROWS = 100;

function detectDelimiter(line: string): string {
  const candidates = [",", ";", "\t", "|"];
  let best = ",";
  let bestCount = 0;
  for (const c of candidates) {
    const count = (line.match(new RegExp(`\\${c}`, "g")) || []).length;
    if (count > bestCount) { best = c; bestCount = count; }
  }
  return best;
}

function parseLine(line: string, delim: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQ) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') { inQ = false; }
      else cur += ch;
    } else {
      if (ch === '"') inQ = true;
      else if (ch === delim) { out.push(cur); cur = ""; }
      else cur += ch;
    }
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

function isNumberLike(v: string): boolean {
  if (!v) return false;
  return /^-?\d+(\.\d+)?([eE][-+]?\d+)?$/.test(v.replace(/,/g, ""));
}

function isBoolLike(v: string): boolean {
  const x = v.toLowerCase().trim();
  return x === "true" || x === "false" || x === "yes" || x === "no" || x === "0" || x === "1";
}

function isDateLike(v: string): boolean {
  if (!v || v.length < 6) return false;
  // common ISO / slash / dash formats
  return /^\d{4}-\d{1,2}-\d{1,2}/.test(v)
      || /^\d{1,2}\/\d{1,2}\/\d{2,4}/.test(v)
      || /^\d{1,2}-\d{1,2}-\d{2,4}/.test(v);
}

function inferType(values: string[]): ColumnProfile["inferred_type"] {
  const nonEmpty = values.filter((v) => v !== "");
  if (nonEmpty.length === 0) return "mixed";
  let nums = 0, bools = 0, dates = 0;
  for (const v of nonEmpty) {
    if (isDateLike(v)) dates++;
    else if (isNumberLike(v)) nums++;
    else if (isBoolLike(v)) bools++;
  }
  const total = nonEmpty.length;
  if (nums / total > 0.85) return "number";
  if (dates / total > 0.8) return "date";
  if (bools / total > 0.9 && new Set(nonEmpty).size <= 3) return "boolean";
  return "string";
}

export async function parseCsvFile(file: File): Promise<ParsedCsv> {
  const text = await file.text();
  return parseCsvText(text);
}

export function parseCsvText(text: string): ParsedCsv {
  // Normalise line endings, split
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").filter((l) => l.length > 0);
  if (lines.length === 0) {
    return { headers: [], rows: [], total_rows: 0, columns: [], preview_text: "" };
  }
  const delim = detectDelimiter(lines[0]);
  const headers = parseLine(lines[0], delim).map((h, i) => h || `col_${i + 1}`);

  const dataLines = lines.slice(1);
  const previewLines = dataLines.slice(0, MAX_PREVIEW_ROWS);
  const rows = previewLines.map((l) => parseLine(l, delim));

  // Column profiles (compute over preview only)
  const columns: ColumnProfile[] = headers.map((name, idx) => {
    const values = rows.map((r) => (r[idx] ?? "").trim());
    const nonEmpty = values.filter((v) => v !== "");
    const unique = new Set(nonEmpty);
    return {
      name,
      inferred_type: inferType(values),
      missing_count: values.length - nonEmpty.length,
      unique_count: unique.size,
      sample_values: Array.from(unique).slice(0, 5),
    };
  });

  // Preview text we send to backend (header + first 60 lines for token budget)
  const previewSlice = [lines[0], ...dataLines.slice(0, 60)].join("\n");

  return {
    headers,
    rows,
    total_rows: dataLines.length,
    columns,
    preview_text: previewSlice,
  };
}
