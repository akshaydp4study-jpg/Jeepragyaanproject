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
    { to: '/', label: 'LOGS', icon: LayoutDashboard },
    { to: '/physics', label: 'PHYSICS', icon: Atom },
    { to: '/chemistry', label: 'CHEMISTRY', icon: FlaskConical },
    { to: '/maths', label: 'MATHS', icon: Sigma },
    { to: '/problem-solving', label: 'PRACTICE', icon: BrainCircuit },
    { to: '/tests', label: 'EVALS', icon: ClipboardCheck },
    { to: '/settings', label: 'METADATA', icon: Settings },
  ];

  return (
    <nav className="w-full bg-bg-panel border-b-2 border-text-primary select-none font-serif sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 bg-hazard-yellow border border-text-primary rotate-45"></span>
            <span className="text-sm font-black font-orbitron text-text-primary tracking-widest uppercase">EXPEDITION CORE</span>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {links.map((link) => {
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `py-2 px-2 text-xs font-bold font-orbitron tracking-widest uppercase transition-all duration-150 ${
                      isActive
                        ? 'text-text-primary border-b-2 border-text-primary bg-hazard-yellow/5'
                        : 'text-text-muted hover:text-text-primary'
                    }`
                  }
                >
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs font-mono-tech">
            <span className="text-text-primary font-bold uppercase border-l-2 border-text-primary pl-3">
              PREP PROGRESS: {overallPercentage}%
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
        <div className="md:hidden bg-bg-panel border-t-2 border-text-primary py-2 px-4 space-y-1">
          {links.map((link) => {
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 py-3 px-4 text-xs font-bold uppercase transition-all ${
                    isActive
                      ? 'bg-hazard-yellow/10 text-text-primary border-l-4 border-text-primary'
                      : 'text-text-muted hover:text-text-primary hover:bg-bg-panel-raised/30'
                  }`
                }
              >
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </div>
      )}
    </nav>
  );
}
