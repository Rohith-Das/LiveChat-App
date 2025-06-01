


import { create } from "zustand";

export const useThemeStore = create((set) => {
  const defaultTheme = typeof window !== "undefined" && localStorage.getItem("chat-theme") 
    ? localStorage.getItem("chat-theme") 
    : "coffee";

  return {
    theme: defaultTheme,
    setTheme: (theme) => {
      localStorage.setItem("chat-theme", theme);
      set({ theme });
    },
  };
});
