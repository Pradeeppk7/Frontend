import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001'; // Adjust as needed

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Types based on OpenAPI
export interface User {
  id: string;
  name: string;
  email: string;
  // Add other fields as per schema
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

export interface PlanExercise {
  id: string;
  exerciseName: string;
  order: number;
  sets: PlanSet[];
}

export interface PlanSet {
  setNumber: number;
  targetReps: number;
  targetWeight: number;
}

// API functions
export const apiClient = {
  // Users
  getUsers: () => api.get<User[]>('/users'),
  createUser: (data: any) => api.post<User>('/users', data),
  getUser: (id: string) => api.get<User>(`/users/${id}`),
  updateUser: (id: string, data: any) => api.put<User>(`/users/${id}`, data),

  // Workout Plans
  getWorkoutPlans: (params?: { page?: number; pageSize?: number }) => api.get('/workout-plans', { params }),
  createWorkoutPlan: (data: any) => api.post('/workout-plans', data),
  getWorkoutPlan: (id: string) => api.get(`/workout-plans/${id}`),
  updateWorkoutPlan: (id: string, data: any) => api.put(`/workout-plans/${id}`, data),
  deleteWorkoutPlan: (id: string) => api.delete(`/workout-plans/${id}`),

  // User specific
  getUserWorkoutPlans: (userId: string, params?: { page?: number; pageSize?: number }) => 
    api.get(`/users/${userId}/workout-plans`, { params }),

  // Workout Sessions
  getWorkoutSessions: (params?: { page?: number; pageSize?: number }) => api.get('/workout-sessions', { params }),
  createWorkoutSession: (data: any) => api.post('/workout-sessions', data),
  getWorkoutSession: (id: string) => api.get(`/workout-sessions/${id}`),

  // Exercises
  getExerciseHistory: (exerciseName: string) => api.get(`/exercises/${exerciseName}/history`),

  // AI Coach
  coachChat: (data: { message: string }) => api.post('/ai/coach-chat', data),
};