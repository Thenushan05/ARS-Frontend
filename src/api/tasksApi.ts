import axiosInstance from './axiosInstance';
import { ApiEnvelope, PaginatedEnvelope } from './envelope';
import { ApiTask, CreateTaskInput, UpdateTaskInput, TaskFilters } from '../types/api';

export const tasksApi = {
  async getAll(filters: TaskFilters = {}): Promise<PaginatedEnvelope<ApiTask>> {
    const res = await axiosInstance.get<PaginatedEnvelope<ApiTask>>('/tasks', { params: filters });
    return res.data;
  },

  async getOne(id: string): Promise<ApiTask> {
    const res = await axiosInstance.get<ApiEnvelope<ApiTask>>(`/tasks/${id}`);
    return res.data.data;
  },

  async create(input: CreateTaskInput): Promise<ApiTask> {
    const res = await axiosInstance.post<ApiEnvelope<ApiTask>>('/tasks', input);
    return res.data.data;
  },

  async update(id: string, input: UpdateTaskInput): Promise<ApiTask> {
    const res = await axiosInstance.patch<ApiEnvelope<ApiTask>>(`/tasks/${id}`, input);
    return res.data.data;
  },

  /** Bare POST — backend takes no request body for either action. */
  async complete(id: string): Promise<ApiTask> {
    const res = await axiosInstance.post<ApiEnvelope<ApiTask>>(`/tasks/${id}/complete`);
    return res.data.data;
  },

  async cancel(id: string): Promise<ApiTask> {
    const res = await axiosInstance.post<ApiEnvelope<ApiTask>>(`/tasks/${id}/cancel`);
    return res.data.data;
  },
};
