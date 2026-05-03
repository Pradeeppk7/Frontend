import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001'; // Adjust as needed
export const AUTH_STORAGE_KEY = 'liftlog-auth';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);

  if (stored) {
    try {
      const parsed = JSON.parse(stored) as { token?: string };

      if (parsed.token) {
        config.headers.Authorization = `Bearer ${parsed.token}`;
      }
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }

  return config;
});

export interface PlanSet {
  setNumber: number;
  targetReps: number;
  targetWeight: number;
}

export interface PlanExercise {
  id?: string;
  exerciseName: string;
  order: number;
  sets: PlanSet[];
}

export interface WorkoutPlan {
  id: string;
  name: string;
  userId?: string;
  description?: string;
  exercises: PlanExercise[];
  createdAt: string;
  updatedAt: string;
}

export interface SessionSet {
  setNumber: number;
  actualReps: number;
  actualWeight: number;
}

export interface SessionExercise {
  exerciseName: string;
  sets: SessionSet[];
}

export interface WorkoutSession {
  id: string;
  userId?: string;
  planId: string;
  performedAt: string;
  notes?: string;
  exercises: SessionExercise[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  age?: number;
  coachProfile?: {
    goal?: string;
    dietaryPreferences?: string;
    injuriesOrLimitations?: string;
    experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends LoginRequest {
  name: string;
  age?: number;
  coachProfile?: User['coachProfile'];
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface CoachChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface CoachChatRequest {
  message: string;
  userId?: string;
  history?: CoachChatMessage[];
  profile?: {
    goal?: string;
    dietaryPreferences?: string;
    injuriesOrLimitations?: string;
    experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  };
}

export interface PaginatedWorkoutPlansResponse {
  items: WorkoutPlan[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface PaginatedWorkoutSessionsResponse {
  items: WorkoutSession[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

export const apiClient = {
  // Users
  getUsers: () => api.get<User[]>('/users'),
  createUser: (data: Partial<User>) => api.post<User>('/users', data),
  getUser: (id: string) => api.get<User>(`/users/${id}`),
  updateUser: (id: string, data: Partial<User>) => api.put<User>(`/users/${id}`, data),

  // Workout Plans
  getWorkoutPlans: (params?: { page?: number; pageSize?: number }) =>
    api.get<PaginatedWorkoutPlansResponse>('/workout-plans', { params }),
  createWorkoutPlan: (data: Omit<WorkoutPlan, 'id' | 'createdAt' | 'updatedAt'>) =>
    api.post<WorkoutPlan>('/workout-plans', data),
  getWorkoutPlan: (id: string) => api.get<WorkoutPlan>(`/workout-plans/${id}`),
  updateWorkoutPlan: (id: string, data: Omit<WorkoutPlan, 'id' | 'createdAt' | 'updatedAt'>) =>
    api.put<WorkoutPlan>(`/workout-plans/${id}`, data),
  deleteWorkoutPlan: (id: string) => api.delete<{ message: string }>(`/workout-plans/${id}`),

  // User specific
  getUserWorkoutPlans: (userId: string, params?: { page?: number; pageSize?: number }) =>
    api.get<PaginatedWorkoutPlansResponse>(`/users/${userId}/workout-plans`, { params }),
  getUserWorkoutSessions: (userId: string, params?: { page?: number; pageSize?: number }) =>
    api.get<PaginatedWorkoutSessionsResponse>(`/users/${userId}/workout-sessions`, { params }),

  // Workout Sessions
  getWorkoutSessions: (params?: { page?: number; pageSize?: number }) =>
    api.get<PaginatedWorkoutSessionsResponse>('/workout-sessions', { params }),
  createWorkoutSession: (data: Omit<WorkoutSession, 'id'>) =>
    api.post<WorkoutSession>('/workout-sessions', data),
  getWorkoutSession: (id: string) => api.get<WorkoutSession>(`/workout-sessions/${id}`),

  // Exercises
  getExerciseHistory: (exerciseName: string) => api.get(`/exercises/${exerciseName}/history`),

  // Auth
  register: (data: RegisterRequest) => api.post<AuthResponse>('/auth/register', data),
  login: (data: LoginRequest) => api.post<AuthResponse>('/auth/login', data),
  me: () => api.get<User>('/auth/me'),

  // AI Coach
  coachChat: (data: CoachChatRequest) => api.post('/ai/coach-chat', data),
};
