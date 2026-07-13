import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAppSettings } from '../hooks/useDbQueries';
import { updateAppSettings } from '../data/dataAccess';
import appThemesData from '../data/appThemes.json';

export interface ThemeColors {
  bgVoid: string;
  bgPanel: string;
  bgPanelRaised: string;
  borderSubtle: string;
  accentPrimary: string;
  accentPrimaryDim: string;
  accentSecondary: string;
  accentSecondaryBright: string;
  warning: string;
  danger: string;
  success: string;
  textPrimary: string;
  textMuted: string;
  textDim: string;
}

export interface ThemeTypography {
  displayFont: string;
  bodyFont: string;
  monoFont: string;
  googleFonts: string[];
}

export interface ThemeMotifs {
  progressIndicatorStyle: string;
  sectionDividerStyle: string;
  buttonStyle: string;
  cardStyle: string;
  signatureElement: string;
}

export interface ThemeScrollAnimation {
  revealStyle: string;
}

export interface AppTheme {
  id: string;
  name: string;
  inspiration: string;
  mood: string;
  colors: ThemeColors;
  typography: ThemeTypography;
  motifs: ThemeMotifs;
  scrollAnimation: ThemeScrollAnimation;
}

interface ThemeContextType {
  themes: AppTheme[];
  currentThemeId: string;
  currentTheme: AppTheme;
  setTheme: (id: string) => Promise<void>;
  prefersReducedMotion: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const settings = useAppSettings();
  const [localThemeId, setLocalThemeId] = useState<string>('nerv-terminal');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  useEffect(() => {
    if (settings?.activeThemeId) {
      setLocalThemeId(settings.activeThemeId);
    }
  }, [settings?.activeThemeId]);

  const themes = appThemesData.themes as AppTheme[];
  const currentTheme = themes.find(t => t.id === localThemeId) || themes[0];

  const setTheme = async (id: string) => {
    setLocalThemeId(id);
    try {
      await updateAppSettings({ activeThemeId: id });
    } catch (e) {
      console.error('Failed to save theme setting', e);
    }
  };

  useEffect(() => {
    if (!currentTheme) return;
    const root = document.documentElement;

    // Apply colors to Tailwind CSS variables
    root.style.setProperty('--color-bg-void', currentTheme.colors.bgVoid);
    root.style.setProperty('--color-bg-panel', currentTheme.colors.bgPanel);
    root.style.setProperty('--color-bg-panel-raised', currentTheme.colors.bgPanelRaised);
    root.style.setProperty('--color-border-subtle', currentTheme.colors.borderSubtle);
    root.style.setProperty('--color-nerv-orange', currentTheme.colors.accentPrimary);
    root.style.setProperty('--color-nerv-orange-dim', currentTheme.colors.accentPrimaryDim);
    root.style.setProperty('--color-eva-purple', currentTheme.colors.accentSecondary);
    root.style.setProperty('--color-eva-purple-bright', currentTheme.colors.accentSecondaryBright);
    root.style.setProperty('--color-hazard-yellow', currentTheme.colors.warning);
    root.style.setProperty('--color-alert-red', currentTheme.colors.danger);
    root.style.setProperty('--color-sync-green', currentTheme.colors.success);
    root.style.setProperty('--color-text-primary', currentTheme.colors.textPrimary);
    root.style.setProperty('--color-text-muted', currentTheme.colors.textMuted);
    root.style.setProperty('--color-text-dim', currentTheme.colors.textDim);

    // Apply fonts to Tailwind font variables
    root.style.setProperty('--font-orbitron', `"${currentTheme.typography.displayFont}", sans-serif`);
    root.style.setProperty('--font-rajdhani', `"${currentTheme.typography.bodyFont}", sans-serif`);
    root.style.setProperty('--font-mono-tech', `"${currentTheme.typography.monoFont}", monospace`);
  }, [currentTheme]);

  return (
    <ThemeContext.Provider value={{ themes, currentThemeId: localThemeId, currentTheme, setTheme, prefersReducedMotion }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
