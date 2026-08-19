import axiosInstance from './axiosInstance';
import { ApiEnvelope, PaginatedEnvelope } from './envelope';
import {
  ApiAppointment, CreateAppointmentInput, UpdateAppointmentInput, AppointmentFilters,
} from '../types/api';

export const appointmentsApi = {
  async getAll(filters: AppointmentFilters = {}): Promise<PaginatedEnvelope<ApiAppointment>> {
    const res = await axiosInstance.get<PaginatedEnvelope<ApiAppointment>>('/appointments', { params: filters });
    return res.data;
  },

  async getOne(id: string): Promise<ApiAppointment> {
    const res = await axiosInstance.get<ApiEnvelope<ApiAppointment>>(`/appointments/${id}`);
    return res.data.data;
  },

  async create(input: CreateAppointmentInput): Promise<ApiAppointment> {
    const res = await axiosInstance.post<ApiEnvelope<ApiAppointment>>('/appointments', input);
    return res.data.data;
  },

  /** NOTE: if `scheduledAt` is included, the backend silently sets status to RESCHEDULED itself. */
  async update(id: string, input: UpdateAppointmentInput): Promise<ApiAppointment> {
    const res = await axiosInstance.patch<ApiEnvelope<ApiAppointment>>(`/appointments/${id}`, input);
    return res.data.data;
  },

  /** Bare POSTs — no request body for any of the three status actions. */
  async complete(id: string): Promise<ApiAppointment> {
    const res = await axiosInstance.post<ApiEnvelope<ApiAppointment>>(`/appointments/${id}/complete`);
    return res.data.data;
  },

  async cancel(id: string): Promise<ApiAppointment> {
    const res = await axiosInstance.post<ApiEnvelope<ApiAppointment>>(`/appointments/${id}/cancel`);
    return res.data.data;
  },

  async noShow(id: string): Promise<ApiAppointment> {
    const res = await axiosInstance.post<ApiEnvelope<ApiAppointment>>(`/appointments/${id}/no-show`);
    return res.data.data;
  },
};
