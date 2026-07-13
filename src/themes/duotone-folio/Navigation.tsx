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

  const handleLinkClick = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="w-full bg-bg-panel border-b border-border-subtle select-none font-sans sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Brand Header */}
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-nerv-orange rounded-full flex items-center justify-center text-[9px] text-bg-void font-bold">#</div>
            <span className="text-sm tracking-[0.25em] font-black font-orbitron text-text-primary uppercase">PROJECT Z</span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 py-2 px-3 text-xs font-bold font-orbitron tracking-widest uppercase transition-all duration-150 ${
                      isActive
                        ? 'text-nerv-orange border-b-2 border-nerv-orange bg-nerv-orange/5'
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

          {/* Right Statistics Badge */}
          <div className="hidden md:flex items-center gap-3 bg-bg-void px-3 py-1.5 border border-border-subtle rounded-full text-xs font-mono-tech">
            <span className="text-text-muted font-bold">SYNC:</span>
            <span className="text-sync-green font-black">{overallPercentage}%</span>
          </div>

          {/* Mobile Menu Button */}
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

      {/* Mobile Links Overlay */}
      {menuOpen && (
        <div className="md:hidden bg-bg-panel border-t border-border-subtle py-2 px-4 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={handleLinkClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 py-3 px-4 text-xs font-bold font-orbitron tracking-wider uppercase rounded transition-all ${
                    isActive
                      ? 'bg-nerv-orange/10 text-nerv-orange border-l-4 border-nerv-orange'
                      : 'text-text-muted hover:text-text-primary hover:bg-bg-panel-raised/30'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
          <div className="p-4 border-t border-border-subtle flex justify-between items-center text-xs font-mono-tech">
            <span className="text-text-muted">OVERALL PREP SYNC:</span>
            <span className="text-sync-green font-black">{overallPercentage}%</span>
          </div>
        </div>
      )}
    </nav>
  );
}
