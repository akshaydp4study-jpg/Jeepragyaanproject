import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Atom, FlaskConical, Sigma, ClipboardCheck, Settings, ShieldAlert, BrainCircuit } from 'lucide-react';
import { useOverallStats } from '../../hooks/useDbQueries';

export default function Sidebar() {
  const stats = useOverallStats();
  const overallPercentage = stats ? Math.round(stats.overallPercentage) : 0;

  const links = [
    { to: '/', label: 'DASHBOARD', icon: LayoutDashboard },
    { to: '/physics', label: 'PHYSICS', icon: Atom },
    { to: '/chemistry', label: 'CHEMISTRY', icon: FlaskConical },
    { to: '/maths', label: 'MATHEMATICS', icon: Sigma },
    { to: '/problem-solving', label: 'PRACTICE', icon: BrainCircuit },
    { to: '/tests', label: 'TEST LOGS', icon: ClipboardCheck },
    { to: '/settings', label: 'SETTINGS', icon: Settings },
  ];

  return (
    <aside className="w-full lg:w-64 bg-bg-panel border-r lg:border-b-0 border-border-subtle flex flex-col min-h-screen select-none font-rajdhani">
      {/* Brand Header */}
      <div className="p-6 border-b border-border-subtle flex flex-col justify-center">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-nerv-orange animate-pulse rounded-sm"></div>
          <span className="text-xs tracking-[0.2em] font-bold text-text-muted font-orbitron">NERV TERMINAL</span>
        </div>
        <h1 className="text-xl font-black font-orbitron text-nerv-orange tracking-widest mt-1">
          PROJECT Z
        </h1>
        <div className="text-[10px] text-text-dim uppercase tracking-wider font-mono-tech mt-0.5">
          JEE ADV 2027 TACTICAL TRACKER
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center justify-between py-3 px-4 border-l-4 font-bold tracking-widest transition-all duration-200 group text-xs ${
                  isActive
                    ? 'bg-bg-panel-raised border-l-nerv-orange text-nerv-orange border-t-transparent border-b-transparent border-r-transparent'
                    : 'bg-transparent border-l-transparent text-text-muted hover:text-text-primary hover:bg-bg-panel-raised/40 border-t-transparent border-b-transparent border-r-transparent'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                <span className="font-orbitron text-[11px] tracking-widest uppercase">{link.label}</span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-current opacity-70 group-hover:scale-125 transition-transform"></div>
            </NavLink>
          );
        })}
      </nav>

      {/* System Status / Bottom Panel */}
      <div className="p-6 border-t border-border-subtle bg-bg-panel-raised/50">
        <div className="flex justify-between items-center mb-1 text-[11px] font-bold tracking-wider text-text-muted">
          <span className="font-orbitron uppercase">SYNC STATE</span>
          <span className="font-mono-tech text-sync-green text-xs">{overallPercentage}%</span>
        </div>
        
        {/* Sync Progress Bar */}
        <div className="w-full h-1.5 bg-bg-void border border-border-subtle rounded-sm overflow-hidden mb-4">
          <div
            className="h-full bg-sync-green transition-all duration-500 ease-out"
            style={{ width: `${overallPercentage}%` }}
          />
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-2 p-2 bg-bg-void/80 border border-border-subtle rounded text-[10px] font-mono-tech">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sync-green opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-sync-green"></span>
          </div>
          <div className="flex-1 text-text-muted">
            <span className="text-text-primary uppercase font-bold text-[9px] block leading-none mb-0.5">TACTICAL DIRECTIVE:</span>
            S1 COMPLETE AT 100% PREP
          </div>
        </div>
      </div>
    </aside>
  );
}
