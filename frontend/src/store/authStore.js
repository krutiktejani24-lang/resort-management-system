import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

login: async (email, password) => {
  set({ isLoading: true });

  try {
    const { data } = await api.post('/auth/login', { email, password });

    set({
      user: data.user,
      token: data.token,
      isAuthenticated: true,
      isLoading: false
    });

    localStorage.setItem('token', data.token);
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

    return { success: true };

  } catch (error) {
    set({ isLoading: false });
    return {
      success: false,
      error: error.response?.data?.error || 'Login failed'
    };
  }
},

      register: async (userData) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/register', userData);
          set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
                    localStorage.setItem('token', data.token);
          api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: error.response?.data?.error || 'Registration failed' };
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
                localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
      },

      fetchMe: async () => {
        const { token } = get();
        const authToken = token || localStorage.getItem('token');
        if (!authToken) return;
        api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
        try {
          const { data } = await api.get('/auth/me');
          set({ user: data.user, isAuthenticated: true });
        } catch {
          set({ user: null, token: null, isAuthenticated: false });
        }
      },

      updateUser: (userData) => set({ user: { ...get().user, ...userData } }),
    }),
    {
      name: 'resort-auth',
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated })
    }
  )
);
