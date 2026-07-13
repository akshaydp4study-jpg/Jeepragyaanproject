import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Menu, X } from 'lucide-react';
import { useExamConfig } from '../../hooks/useDbQueries';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import { useTheme } from '../../context/ThemeContext';
import { themeRegistry } from '../../themes/themeRegistry';

interface AppShellProps {
  children: React.ReactNode;
  storageUnavailable: boolean;
}

export default function AppShell({ children, storageUnavailable }: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const examConfig = useExamConfig();
  const location = useLocation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { currentThemeId } = useTheme();

  const theme = themeRegistry[currentThemeId] || themeRegistry['nerv-terminal'];
  const isSidebar = currentThemeId === 'nerv-terminal';

  useEffect(() => {
    const element = scrollContainerRef.current;
    if (!element) return;

    const lenis = new Lenis({
      wrapper: element,
      content: element.firstElementChild as HTMLElement || element,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [currentThemeId]);

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'UNIT-01 READINESS';
      case '/physics': return 'PHYSICS SYLLABUS SECTOR';
      case '/chemistry': return 'CHEMISTRY SYLLABUS SECTOR';
      case '/maths': return 'MATHEMATICS SYLLABUS SECTOR';
      case '/problem-solving': return 'PROBLEM-SOLVING PHASE';
      case '/tests': return 'TEST RECORDS ENCLAVE';
      case '/settings': return 'SYSTEM OVERRIDE ENCLAVE';
      default: return 'MAGI COMMAND CONSOLE';
    }
  };

  const getPageSub = () => {
    switch (location.pathname) {
      case '/': return 'Operations Command';
      case '/physics': return 'Sector-01 Analysis';
      case '/chemistry': return 'Sector-02 Analysis';
      case '/maths': return 'Sector-03 Analysis';
      case '/problem-solving': return '48 Session Checklist';
      case '/tests': return 'Performance Audit';
      case '/settings': return 'Control Parameters';
      default: return 'Active Session';
    }
  };

  return (
    <div className="h-[100dvh] bg-bg-void flex flex-col font-rajdhani text-text-primary overflow-hidden">
      {/* Storage Warning Banner (Non-dismissible if storage unavailable) */}
      {storageUnavailable && (
        <div className="w-full bg-alert-red/10 border-b border-alert-red px-4 py-3 flex items-start gap-3 text-xs leading-relaxed z-50 text-alert-red shrink-0 font-sans">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 animate-pulse" />
          <div className="flex-1">
            <strong className="font-orbitron tracking-widest block uppercase">CRITICAL SYSTEM WARNING: INDEXEDDB DISCONNECTED</strong>
            <p className="mt-0.5">
              Secure local database (IndexedDB) access has been blocked (typically caused by Private/Incognito browser restrictions).
              Any progress logged in this terminal session <strong className="underline">will NOT be saved</strong>. Export your progress before closing this browser tab.
            </p>
          </div>
        </div>
      )}

      {isSidebar ? (
        // Sidebar Layout (NERV Terminal style)
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
          {/* Mobile Top Header */}
          <header className="lg:hidden bg-bg-panel border-b border-border-subtle p-4 flex items-center justify-between select-none shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-nerv-orange animate-pulse rounded-sm"></div>
              <h1 className="text-md font-black font-orbitron text-nerv-orange tracking-widest uppercase leading-none">
                PROJECT Z
              </h1>
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1 text-text-muted hover:text-text-primary border border-border-subtle rounded bg-bg-void cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </header>

          {/* Vertical Navigation (Sidebar) */}
          <div
            className={`fixed inset-y-0 left-0 lg:static z-40 lg:z-auto lg:flex shrink-0 transition-transform duration-300 lg:translate-x-0 ${
              mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            }`}
          >
            {mobileMenuOpen && (
              <div
                onClick={() => setMobileMenuOpen(false)}
                className="absolute inset-0 bg-bg-void/80 lg:hidden"
              />
            )}
            <div className="relative w-64 h-full bg-bg-panel flex flex-col z-10" onClick={() => setMobileMenuOpen(false)}>
              <theme.Navigation mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
            {/* Global Desktop Header with Hazard Stripes */}
            <header className="hidden lg:flex h-20 items-center justify-between px-8 bg-bg-panel border-b border-border-subtle shrink-0 select-none">
              <div className="flex flex-col">
                <span className="text-[10px] text-nerv-orange uppercase font-black font-orbitron tracking-[0.2em]">{getPageSub()}</span>
                <h2 className="text-xl font-bold font-orbitron text-text-primary uppercase tracking-wider">{getPageTitle()}</h2>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-text-muted uppercase tracking-wider font-orbitron font-bold leading-none">TARGET DATE</span>
                  <span className="text-sm text-hazard-yellow font-mono-tech tracking-widest uppercase mt-1">
                    {examConfig ? `${examConfig.jeeAdvancedDate} [${examConfig.jeeAdvancedOfficial ? 'OFFICIAL' : 'ESTIMATED'}]` : '2027-06-06 [ESTIMATED]'}
                  </span>
                </div>
                <div className="w-48 h-2 bg-bg-void relative overflow-hidden border border-border-subtle rounded-sm">
                  <div className="absolute inset-0 hazard-stripe opacity-80"></div>
                </div>
              </div>
            </header>

            {/* Scrollable Container */}
            <div ref={scrollContainerRef} id="app-scroll-container" className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
              <div id="app-scroll-content" className="max-w-6xl w-full mx-auto min-h-full flex flex-col justify-between">
                <div className="flex-1">
                  {children}
                </div>

                {/* Footer branding */}
                <footer className="mt-12 pt-6 border-t border-border-subtle/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-mono-tech text-text-dim uppercase shrink-0">
                  <div>
                    NERV COMBAT PREPARATION SYSTEMS CORP // MAGI-02 COMPACT ENGINE
                  </div>
                  <div>
                    © 2026 JEE-ADV TACTICAL SUITE - OFF-LINE DOCK
                  </div>
                </footer>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Top Horizontal Navigation Layout (all other themes)
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <theme.Navigation />

          {/* Scrollable Container */}
          <div ref={scrollContainerRef} id="app-scroll-container" className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div id="app-scroll-content" className="max-w-6xl w-full mx-auto min-h-full flex flex-col justify-between">
              <div className="flex-1">
                {children}
              </div>

              {/* Footer branding */}
              <footer className="mt-12 pt-6 border-t border-border-subtle/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-mono-tech text-text-dim uppercase shrink-0">
                <div>
                  THEORETICAL TRAINING CADRE SYSTEM
                </div>
                <div>
                  © 2026 GENERAL INTELLECT DOCK
                </div>
              </footer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
