import axiosInstance from './axiosInstance';
import { PaginatedEnvelope } from './envelope';
import { ApiCountry } from '../types/api';

/** Minimal read-only slice of the Countries master-data module (full CRUD is Phase 3). Needed now
 * only to populate "country" pickers in Leads/Customers. */
export const countriesApi = {
  /** `GET /countries`, permission `country.view`. */
  async getAll(): Promise<ApiCountry[]> {
    const res = await axiosInstance.get<PaginatedEnvelope<ApiCountry>>('/countries', {
      params: { limit: 100 },
    });
    return res.data.data;
  },
};
