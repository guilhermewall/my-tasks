export type UUID = string;

export type Timestamp = Date;

export interface PageInfo {
  nextCursor: string | null;
  hasNextPage: boolean;
}

export interface Page<T> {
  data: T[];
  pageInfo: PageInfo;
}

export type TaskStatus = "pending" | "done";

export type TaskPriority = "low" | "medium" | "high";

export interface CursorData {
  createdAt: string;
  id: string;
}
