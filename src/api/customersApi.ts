import axiosInstance from './axiosInstance';
import { ApiEnvelope, PaginatedEnvelope } from './envelope';
import { ApiCustomer, CreateCustomerInput, UpdateCustomerInput, CustomerFilters } from '../types/api';

export const customersApi = {
  async getAll(filters: CustomerFilters = {}): Promise<PaginatedEnvelope<ApiCustomer>> {
    const res = await axiosInstance.get<PaginatedEnvelope<ApiCustomer>>('/customers', { params: filters });
    return res.data;
  },

  async getOne(id: string): Promise<ApiCustomer> {
    const res = await axiosInstance.get<ApiEnvelope<ApiCustomer>>(`/customers/${id}`);
    return res.data.data;
  },

  async create(input: CreateCustomerInput): Promise<ApiCustomer> {
    const res = await axiosInstance.post<ApiEnvelope<ApiCustomer>>('/customers', input);
    return res.data.data;
  },

  async update(id: string, input: UpdateCustomerInput): Promise<ApiCustomer> {
    const res = await axiosInstance.patch<ApiEnvelope<ApiCustomer>>(`/customers/${id}`, input);
    return res.data.data;
  },

  async archive(id: string): Promise<ApiCustomer> {
    const res = await axiosInstance.post<ApiEnvelope<ApiCustomer>>(`/customers/${id}/archive`);
    return res.data.data;
  },

  async restore(id: string): Promise<ApiCustomer> {
    const res = await axiosInstance.post<ApiEnvelope<ApiCustomer>>(`/customers/${id}/restore`);
    return res.data.data;
  },
};
