import api from './api';
import type { Task, TaskStats, Analytics } from '../types';

interface TasksResponse   { success: boolean; tasks: Task[]; total: number }
interface TaskResponse    { success: boolean; task: Task; message?: string }
interface StatsResponse   { success: boolean; stats: TaskStats }
interface AnalyticsResponse { success: boolean; analytics: Analytics }

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  status?: 'pending' | 'in-progress' | 'completed';
  dueDate?: string | null;
  category?: string;
  estimatedHours?: number | null;
}

export interface TaskFilters {
  status?: string;
  priority?: string;
  search?: string;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const taskService = {
  async getAllTasks(filters: TaskFilters = {}): Promise<TasksResponse> {
    const params = new URLSearchParams();
    if (filters.status)    params.set('status',    filters.status);
    if (filters.priority)  params.set('priority',  filters.priority);
    if (filters.search)    params.set('search',    filters.search);
    if (filters.limit)     params.set('limit',     String(filters.limit));
    if (filters.sortBy)    params.set('sortBy',    filters.sortBy);
    if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);
    const qs = params.toString();
    return api.get<TasksResponse>(`/tasks${qs ? `?${qs}` : ''}`);
  },

  async getTask(id: string): Promise<Task> {
    const res = await api.get<TaskResponse>(`/tasks/${id}`);
    return res.task;
  },

  async createTask(data: CreateTaskInput): Promise<Task> {
    const res = await api.post<TaskResponse>('/tasks', data);
    return res.task;
  },

  async updateTask(id: string, data: Partial<CreateTaskInput>): Promise<Task> {
    const res = await api.put<TaskResponse>(`/tasks/${id}`, data);
    return res.task;
  },

  async updateTaskStatus(id: string, status: string): Promise<Task> {
    const res = await api.patch<TaskResponse>(`/tasks/${id}`, { status });
    return res.task;
  },

  async deleteTask(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },

  async updateProgress(id: string, progress: number, note = ''): Promise<Task> {
    const res = await api.patch<TaskResponse>(`/tasks/${id}/progress`, { progress, note });
    return res.task;
  },

  async addTimeEntry(id: string, hours: number, description = ''): Promise<Task> {
    const res = await api.post<TaskResponse>(`/tasks/${id}/time`, { hours, description });
    return res.task;
  },

  async addDailyUpdate(id: string, data: Record<string, unknown>): Promise<Task> {
    const res = await api.post<TaskResponse>(`/tasks/${id}/daily-update`, data);
    return res.task;
  },

  async getStats(): Promise<TaskStats> {
    const res = await api.get<StatsResponse>('/tasks/stats');
    return res.stats;
  },

  async getAnalytics(): Promise<Analytics> {
    const res = await api.get<AnalyticsResponse>('/tasks/analytics');
    return res.analytics;
  }
};

export default taskService;
