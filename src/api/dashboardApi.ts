import axiosInstance from './axiosInstance';
import { ApiEnvelope } from './envelope';
import { ApiDashboardResponse, DashboardFilters } from '../types/api';

export const dashboardApi = {
  async get(filters: DashboardFilters = {}): Promise<ApiDashboardResponse> {
    const res = await axiosInstance.get<ApiEnvelope<ApiDashboardResponse>>('/dashboard', { params: filters });
    return res.data.data;
  },
};
