import { AxiosError } from 'axios';

/** The backend's fixed error envelope — see Backend `AllExceptionsFilter`
 *  (`src/common/filters/all-exceptions.filter.ts`): every error is `{success:false, message,
 *  errors:string[]}`, never a raw stack trace, never a `data` field. */
interface ApiErrorBody {
  success: false;
  message: string;
  errors: string[];
}

export interface NormalizedApiError {
  status?: number;
  message: string;
  /** Raw per-item validation messages from class-validator (e.g. "mobile must be a valid phone
   *  number") — a form that knows its own DTO field names can match these itself; this layer does
   *  not guess field ownership (brief §48's field-level mapping is per-form, done when that
   *  module's phase lands, not here). */
  errors: string[];
  raw: unknown;
}

/**
 * Normalizes any Axios rejection against this backend's error contract into one predictable shape
 * (brief §49) — callers should never need to reach into `error.response.data` themselves, and a
 * network failure (no response at all) is distinguished from a real 4xx/5xx.
 */
export function normalizeApiError(error: unknown): NormalizedApiError {
  const axiosErr = error as AxiosError<Partial<ApiErrorBody>> | undefined;

  if (!axiosErr?.response) {
    return {
      status: undefined,
      message: axiosErr?.message || 'Network error — check your connection and try again.',
      errors: [],
      raw: error,
    };
  }

  const { status } = axiosErr.response;
  const body = axiosErr.response.data;
  const errors = Array.isArray(body?.errors) ? (body!.errors as string[]) : [];

  const fallback =
    status === 400
      ? 'Validation failed.'
      : status === 401
        ? 'Your session has expired. Please log in again.'
        : status === 403
          ? 'You do not have permission to perform this action.'
          : status === 404
            ? 'The requested record was not found.'
            : status === 409
              ? 'This conflicts with an existing record.'
              : status === 422
                ? 'This request is not valid.'
                : status && status >= 500
                  ? 'Something went wrong on our end. Please try again shortly.'
                  : 'Request failed.';

  return { status, message: body?.message || fallback, errors, raw: body };
}
