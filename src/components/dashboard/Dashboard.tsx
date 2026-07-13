import React, { useState, useEffect } from 'react';
import { useOverallStats, useExamConfig, useAppSettings } from '../../hooks/useDbQueries';
import { RefreshCw } from 'lucide-react';
import { calculateCountdown, calculatePace } from '../../utils/calculations';
import { useTheme } from '../../context/ThemeContext';
import { themeRegistry } from '../../themes/themeRegistry';
import TheoryCoveragePanel from './TheoryCoveragePanel';
import ProblemSolvingSummary from './ProblemSolvingSummary';

export default function Dashboard() {
  const stats = useOverallStats();
  const examConfig = useExamConfig();
  const settings = useAppSettings();
  const { currentThemeId } = useTheme();

  const [currentTime, setCurrentTime] = useState(new Date());

  // Tick the countdown every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!stats || !examConfig || !settings) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-text-muted font-mono-tech gap-4 animate-pulse">
        <RefreshCw className="w-8 h-8 animate-spin text-nerv-orange" />
        <span>BOOTING TACTICAL DIRECTORY SYSTEM...</span>
      </div>
    );
  }

  const theme = themeRegistry[currentThemeId] || themeRegistry['nerv-terminal'];

  return (
    <>
      <theme.DashboardComposition
        stats={stats}
        examConfig={examConfig}
        settings={settings}
        currentTime={currentTime}
        calculateCountdown={calculateCountdown}
        calculatePace={calculatePace}
      />
      <TheoryCoveragePanel
        stats={stats}
        examConfig={examConfig}
        settings={settings}
        currentTime={currentTime}
      />
      <ProblemSolvingSummary />
    </>
  );
}
