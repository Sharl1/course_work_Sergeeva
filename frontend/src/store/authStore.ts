import { create } from 'zustand';
import { persist } from 'zustand/middleware'; // <--- Импортируем persist
import apiClient from '../api/axiosClient';
import type { User, AuthResponse } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const formData = new URLSearchParams();
          formData.append('username', email);
          formData.append('password', password);

          const response = await apiClient.post<AuthResponse>('/auth/login', formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
          });

          const token = response.data.access_token;
          localStorage.setItem('token', token);
          set({ token, isAuthenticated: true });
          
          await useAuthStore.getState().fetchMe();
        } catch (error) {
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
      },

      fetchMe: async () => {
        try {
          const response = await apiClient.get<User>('/auth/me');
          set({ user: response.data, isAuthenticated: true });
        } catch (error) {
          useAuthStore.getState().logout();
        }
      },
    }),
    {
      name: 'auth-storage', // Имя в LocalStorage
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }), // Сохраняем только нужные поля
    }
  )
);