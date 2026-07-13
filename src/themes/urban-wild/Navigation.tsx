import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X, LayoutDashboard, Atom, FlaskConical, Sigma, ClipboardCheck, Settings, BrainCircuit } from 'lucide-react';
import { useOverallStats } from '../../hooks/useDbQueries';

interface NavigationProps {
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
}

export default function Navigation({ mobileMenuOpen, setMobileMenuOpen }: NavigationProps) {
  const stats = useOverallStats();
  const overallPercentage = stats ? Math.round(stats.overallPercentage) : 0;
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { to: '/', label: 'DASHBOARD', icon: LayoutDashboard },
    { to: '/physics', label: 'PHYSICS', icon: Atom },
    { to: '/chemistry', label: 'CHEMISTRY', icon: FlaskConical },
    { to: '/maths', label: 'MATHS', icon: Sigma },
    { to: '/problem-solving', label: 'PRACTICE', icon: BrainCircuit },
    { to: '/tests', label: 'TEST LOGS', icon: ClipboardCheck },
    { to: '/settings', label: 'SETTINGS', icon: Settings },
  ];

  return (
    <nav className="w-full bg-bg-panel border-b border-border-subtle select-none font-sans sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 bg-sync-green rounded-full"></span>
            <span className="text-sm font-black font-orbitron text-text-primary tracking-widest uppercase">URBAN WILD</span>
          </div>

          <div className="hidden md:flex items-center space-x-2">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 py-1.5 px-3.5 text-xs font-bold tracking-wide rounded-full transition-all duration-150 ${
                      isActive
                        ? 'bg-sync-green text-bg-void shadow-sm'
                        : 'text-text-muted hover:text-text-primary hover:bg-bg-panel-raised/50'
                    }`
                  }
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs font-mono-tech">
            <span className="px-2.5 py-1 bg-sync-green/10 text-sync-green rounded-full font-bold">
              SYNC VELOCITY: {overallPercentage}%
            </span>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-text-muted hover:text-text-primary focus:outline-none cursor-pointer"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-bg-panel border-t border-border-subtle py-2 px-4 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 py-2.5 px-4 text-xs font-bold rounded-full transition-all ${
                    isActive
                      ? 'bg-sync-green text-bg-void'
                      : 'text-text-muted hover:text-text-primary hover:bg-bg-panel-raised/30'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </div>
      )}
    </nav>
  );
}
