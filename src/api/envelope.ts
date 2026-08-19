/** The backend's fixed response envelope (`src/common/utils/response.util.ts` /
 * `ResponseInterceptor`) — every module's API service should type its axios calls against these,
 * not `res.data` directly, so a `.data` vs `.data.data` mistake shows up as a compile error. */

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedEnvelope<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: PaginationMeta;
}
