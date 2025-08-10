import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'light', // 'light' or 'dark'
      
      toggleTheme: () => set((state) => ({
        theme: state.theme === 'light' ? 'dark' : 'light'
      })),
      
      setTheme: (theme) => set({ theme }),
      
      isDark: () => {
        const state = useThemeStore.getState();
        return state.theme === 'dark';
      }
    }),
    {
      name: 'theme-storage', // unique name for localStorage key
    }
  )
);

export default useThemeStore;