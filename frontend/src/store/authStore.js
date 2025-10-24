import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      // Set user after successful login/register
      // Token is now stored in httpOnly cookies, not in localStorage
      setAuth: (user) => set({
        user,
        isAuthenticated: true
      }),

      logout: () => set({
        user: null,
        isAuthenticated: false
      }),

      updateUser: (user) => set({ user })
    }),
    {
      name: 'auth-storage',
      // Only persist user data, not tokens
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
);

export default useAuthStore;
