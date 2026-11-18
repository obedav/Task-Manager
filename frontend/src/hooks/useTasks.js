import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import taskService from '../services/taskService';

const TASKS_KEY = ['tasks'];
const ANALYTICS_KEY = ['analytics'];

export function useTasks(filters = {}) {
  return useQuery({
    queryKey: [...TASKS_KEY, filters],
    queryFn: () => taskService.getAllTasks(filters),
    select: (data) => data?.tasks ?? [],
    staleTime: 30_000
  });
}

export function useAnalytics() {
  return useQuery({
    queryKey: ANALYTICS_KEY,
    queryFn: () => taskService.getAnalytics(),
    staleTime: 60_000
  });
}

export function useTaskStats() {
  return useQuery({
    queryKey: ['taskStats'],
    queryFn: () => taskService.getStats(),
    staleTime: 30_000
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskData) => taskService.createTask(taskData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TASKS_KEY });
      qc.invalidateQueries({ queryKey: ANALYTICS_KEY });
    }
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => taskService.updateTask(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TASKS_KEY });
      qc.invalidateQueries({ queryKey: ANALYTICS_KEY });
    }
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => taskService.deleteTask(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TASKS_KEY });
      qc.invalidateQueries({ queryKey: ANALYTICS_KEY });
    }
  });
}

export function useUpdateProgress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, progress }) => taskService.updateProgress(id, progress),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TASKS_KEY });
      qc.invalidateQueries({ queryKey: ANALYTICS_KEY });
    }
  });
}
