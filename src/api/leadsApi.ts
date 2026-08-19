import axiosInstance from './axiosInstance';
import { ApiEnvelope, PaginatedEnvelope } from './envelope';
import {
  ApiLead, CreateLeadInput, UpdateLeadInput, ConvertLeadInput, ConvertLeadResult, LeadFilters,
} from '../types/api';

export const leadsApi = {
  async getAll(filters: LeadFilters = {}): Promise<PaginatedEnvelope<ApiLead>> {
    const res = await axiosInstance.get<PaginatedEnvelope<ApiLead>>('/leads', { params: filters });
    return res.data;
  },

  async getOne(id: string): Promise<ApiLead> {
    const res = await axiosInstance.get<ApiEnvelope<ApiLead>>(`/leads/${id}`);
    return res.data.data;
  },

  async create(input: CreateLeadInput): Promise<ApiLead> {
    const res = await axiosInstance.post<ApiEnvelope<ApiLead>>('/leads', input);
    return res.data.data;
  },

  async update(id: string, input: UpdateLeadInput): Promise<ApiLead> {
    const res = await axiosInstance.patch<ApiEnvelope<ApiLead>>(`/leads/${id}`, input);
    return res.data.data;
  },

  async archive(id: string): Promise<ApiLead> {
    const res = await axiosInstance.post<ApiEnvelope<ApiLead>>(`/leads/${id}/archive`);
    return res.data.data;
  },

  /** Backend creates the Customer + marks the Lead REGISTERED in one transaction — never creates
   * a VisaCase. Response is `{lead, customer}`, not a bare Customer. */
  async convert(id: string, input: ConvertLeadInput = {}): Promise<ConvertLeadResult> {
    const res = await axiosInstance.post<ApiEnvelope<ConvertLeadResult>>(`/leads/${id}/convert`, input);
    return res.data.data;
  },
};
