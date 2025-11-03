import type { CursorData } from "./types";

export function encodeCursor(data: CursorData): string {
  return Buffer.from(JSON.stringify(data)).toString("base64");
}

export function decodeCursor(cursor: string): CursorData {
  try {
    const decoded = Buffer.from(cursor, "base64").toString("utf-8");
    return JSON.parse(decoded) as CursorData;
  } catch {
    throw new Error("Invalid cursor format");
  }
}
