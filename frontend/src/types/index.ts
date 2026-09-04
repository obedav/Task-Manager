// Shared domain types for TaskFlow frontend

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  language: string;
  timezone: string;
  theme: 'dark' | 'light' | 'system';
  notificationPrefs?: NotificationPrefs;
  createdAt: string;
}

export interface NotificationPrefs {
  taskUpdates: boolean;
  taskDeadlines: boolean;
  weeklyDigest: boolean;
}

export interface ProgressEntry {
  date: string;
  progress: number;
  note: string;
}

export interface TimeEntry {
  date: string;
  hours: number;
  description: string;
}

export interface DailyUpdate {
  date: string;
  workedOn: boolean;
  status: TaskStatus;
  accomplishments: string[];
  blockers: string[];
  nextSteps: string[];
  mood: string;
}

export type TaskStatus   = 'pending' | 'in-progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  _id: string;
  id?: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  progress: number;
  dueDate: string | null;
  completedAt: string | null;
  category: string;
  estimatedHours: number | null;
  totalTimeSpent: number;
  progressHistory: ProgressEntry[];
  timeEntries: TimeEntry[];
  dailyUpdates: DailyUpdate[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskStats {
  total: number;
  completed: number;
  'in-progress': number;
  pending: number;
  overdue: number;
  averageProgress: number;
  totalTimeSpent: number;
}

export interface Analytics {
  totalTasks: number;
  averageProgress: number;
  totalTimeSpent: number;
  productivityByDay: Record<string, { tasksWorkedOn: number; accomplishments: number; blockers: number }>;
  timeByDay: Record<string, number>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface Toast {
  id: number;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}
