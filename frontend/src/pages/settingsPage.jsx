


import React from 'react';
import { useThemeStore } from '../store/useThemeStore';
import { THEMES } from '../constants';

export default function SettingsPage() {
  const { theme, setTheme } = useThemeStore();


  // Theme color configurations that match DaisyUI's actual colors
  const getThemeColors = (themeName) => {
    const themeColors = {
      light: { primary: '#570df8', secondary: '#f000b8', accent: '#37cdbe', neutral: '#3d4451' },
      dark: { primary: '#661AE6', secondary: '#D926AA', accent: '#1FB2A5', neutral: '#191D24' },
      cupcake: { primary: '#65c3c8', secondary: '#ef9fbc', accent: '#eeaf3a', neutral: '#291334' },
      emerald: { primary: '#66cc8a', secondary: '#f699cd', accent: '#f4d03f', neutral: '#333c4d' },
      corporate: { primary: '#4b6cb7', secondary: '#7b92b3', accent: '#67cba0', neutral: '#181a2a' },
      synthwave: { primary: '#e779c1', secondary: '#58c7f3', accent: '#f3cc30', neutral: '#20134e' },
      retro: { primary: '#ef9995', secondary: '#a4cbb4', accent: '#e4d96f', neutral: '#7f7f7f' },
      cyberpunk: { primary: '#ff7598', secondary: '#75d1f0', accent: '#c7f59b', neutral: '#423e66' },
      valentine: { primary: '#e96d7b', secondary: '#a991f7', accent: '#f9a8d4', neutral: '#3e2f5b' },
      halloween: { primary: '#f28c38', secondary: '#6d3a9c', accent: '#51a800', neutral: '#212121' },
      garden: { primary: '#5c7f67', secondary: '#ecf4e7', accent: '#ba5624', neutral: '#2a2a2a' },
      lofi: { primary: '#0d0d0d', secondary: '#1a1a1a', accent: '#262626', neutral: '#0a0a0a' },
      pastel: { primary: '#d1c4e9', secondary: '#f8bbd9', accent: '#e7d794', neutral: '#6b7280' },
      fantasy: { primary: '#6e0b75', secondary: '#007ebd', accent: '#f28c38', neutral: '#1f2937' },
      wireframe: { primary: '#b8b8b8', secondary: '#b8b8b8', accent: '#b8b8b8', neutral: '#b8b8b8' },
      dracula: { primary: '#ff79c6', secondary: '#bd93f9', accent: '#ffb86c', neutral: '#414558' },
      business: { primary: '#1C4E80', secondary: '#7C909A', accent: '#EA6947', neutral: '#23282f' },
      acid: { primary: '#ff00aa', secondary: '#00ffaa', accent: '#aaff00', neutral: '#2a2a2a' },
      luxury: { primary: '#ffffff', secondary: '#152747', accent: '#513448', neutral: '#091c29' },
      night: { primary: '#38bdf8', secondary: '#818cf8', accent: '#f471b5', neutral: '#1e293b' },
      coffee: { primary: '#DB924B', secondary: '#263E3F', accent: '#10576D', neutral: '#3C2E26' },
      dim: { primary: '#9ca3af', secondary: '#f3f4f6', accent: '#fbbf24', neutral: '#2d3748' },
      nord: { primary: '#5e81ac', secondary: '#81a1c1', accent: '#88c0d0', neutral: '#4c566a' },
      aqua: { primary: '#09ecf3', secondary: '#966fb3', accent: '#ffe999', neutral: '#3c4142' },
      lemonade: { primary: '#519903', secondary: '#e9e92f', accent: '#ff8800', neutral: '#291334' }
    };
    
    return themeColors[themeName] || themeColors.light;
  };

  return (
    <div className="min-h-screen px-4 py-6 sm:px-4 md:px-8 lg:px-10">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Title Section */}
        <div className="flex flex-col gap-1 text-center sm:text-left">
          <h2 className="text-xl font-bold mt-10 sm:text-2xl">Theme</h2>
          <p className="text-sm mt-4 text-base-content/70">
            Choose a theme for your application
          </p>
        </div>

        {/* Themes Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4">
          {THEMES.map((t) => {
            const colors = getThemeColors(t);
            return (
              <button
                key={t}
                className={`group flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all duration-200 text-xs sm:text-sm hover:scale-105 ${
                  theme === t 
                    ? "bg-base-200 ring-2 ring-primary shadow-md" 
                    : "hover:bg-base-200/50"
                }`}
                onClick={() => setTheme(colors)}
              >
                {/* Theme Preview */}
                <div className="relative h-8 w-full rounded-md overflow-hidden border border-base-300">
                  <div className="absolute inset-0 grid grid-cols-4 gap-px p-1">
                    <div 
                      className="rounded transition-all duration-200 hover:scale-110" 
                      style={{ backgroundColor: colors.primary }}
                    ></div>
                    <div 
                      className="rounded transition-all duration-200 hover:scale-110" 
                      style={{ backgroundColor: colors.secondary }}
                    ></div>
                    <div 
                      className="rounded transition-all duration-200 hover:scale-110" 
                      style={{ backgroundColor: colors.accent }}
                    ></div>
                    <div 
                      className="rounded transition-all duration-200 hover:scale-110" 
                      style={{ backgroundColor: colors.neutral }}
                    ></div>
                  </div>
                </div>
                
                {/* Theme Name */}
                <span className={`truncate w-full text-center font-medium transition-colors ${
                  theme === t ? "text-primary" : "text-base-content"
                }`}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </span>
                
                {/* Active Indicator */}
                {theme === t && (
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* Current Theme Info */}
      
      </div>
    </div>
  );
}