import React from 'react';
import { Shield, Flame, BookOpen, Clock, Zap, ArrowRight, RefreshCw, AlertCircle, Info, Atom, FlaskConical, Sigma } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import SyncRing from '../../components/common/SyncRing';
import type { DashboardCompositionProps } from '../types';

export default function DashboardComposition({
  stats,
  examConfig,
  settings,
  currentTime,
  calculateCountdown,
  calculatePace,
}: DashboardCompositionProps) {
  // Define target dates
  const dates = [
    { label: 'JEE MAIN (SESSION 1)', dateStr: examConfig.jeeMainS1Date, official: examConfig.jeeMainS1Official, key: 's1' },
    { label: 'JEE MAIN (SESSION 2)', dateStr: examConfig.jeeMainS2Date, official: examConfig.jeeMainS2Official, key: 's2' },
    { label: 'JEE ADVANCED 2027', dateStr: examConfig.jeeAdvancedDate, official: examConfig.jeeAdvancedOfficial, key: 'adv' },
  ];

  // Auto-detect nearest upcoming date
  let selectedDateIndex = 0;
  let minDifference = Infinity;
  let allDatesPassed = true;

  dates.forEach((d, idx) => {
    const targetDateObj = new Date(d.dateStr + 'T00:00:00');
    const diff = targetDateObj.getTime() - currentTime.getTime();
    if (diff > 0 && diff < minDifference) {
      minDifference = diff;
      selectedDateIndex = idx;
      allDatesPassed = false;
    }
  });

  if (allDatesPassed) {
    selectedDateIndex = dates.length - 1;
  }

  const activeDateObj = dates[selectedDateIndex];
  const targetTime = new Date(activeDateObj.dateStr + 'T00:00:00').getTime();
  const { days, hours, minutes, seconds, difference } = calculateCountdown(targetTime, currentTime.getTime());

  // Pace Calculator
  const phase1TargetTime = new Date(examConfig.phase1EndDate + 'T23:59:59').getTime();
  const totalHoursRemaining = stats.totalHours - stats.completedHours;
  const { daysToPhase1, paceHoursPerDay } = calculatePace(phase1TargetTime, currentTime.getTime(), totalHoursRemaining);

  const isBehind = paceHoursPerDay > 4 || (daysToPhase1 <= 0 && totalHoursRemaining > 0);

  const getEntranceAnimation = (delayIndex: number = 0): any => {
    return {
      initial: { opacity: 0, y: 5 },
      animate: { opacity: [0, 0.3, 0.1, 1], y: 0 },
      transition: { duration: 0.4, delay: delayIndex * 0.05, ease: "linear" }
    };
  };

  return (
    <div className="space-y-6 font-rajdhani select-none animate-fadeIn">
      {/* Top Re-clock Time Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-subtle pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-nerv-orange rounded-full"></span>
            <span className="text-[10px] font-bold tracking-[0.25em] text-text-muted font-orbitron">TACTICAL STATUS: OPERATIONAL</span>
          </div>
          <h2 className="text-2xl font-black font-orbitron tracking-widest text-text-primary mt-1">
            COMMAND DASHBOARD
          </h2>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[10px] font-mono-tech text-text-muted uppercase tracking-wider">SYSTEM RE-CLOCK TIME</div>
          <div className="text-xs font-bold font-mono-tech text-nerv-orange tracking-wider mt-0.5 uppercase">
            {currentTime.toLocaleDateString()} // {currentTime.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Hero Countdown Panel */}
      <motion.div
        {...getEntranceAnimation(0)}
        className="bg-bg-panel border border-border-subtle p-6 rounded-lg relative overflow-hidden flex flex-col items-center justify-center text-center"
      >
        <div className="absolute top-0 left-0 bg-nerv-orange text-bg-void text-[9px] font-black font-orbitron px-3 py-1 tracking-widest uppercase rounded-br-md">
          T-MINUS COUNTDOWN
        </div>

        <div className="absolute inset-0 bg-[linear-gradient(rgba(22,22,26,0.9),rgba(22,22,26,0.9)),repeating-linear-gradient(45deg,#2a2a30,#2a2a30_1px,transparent_1px,transparent_10px)] opacity-10 pointer-events-none"></div>

        <div className="relative z-10 space-y-4 w-full pt-4">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="text-xs font-bold font-orbitron tracking-[0.3em] text-text-muted">ACTIVE TIMER TARGET:</span>
            <span className="text-xs font-black font-orbitron tracking-widest text-nerv-orange uppercase">
              {activeDateObj.label}
            </span>
            {!activeDateObj.official && (
              <span className="px-2 py-0.5 border border-hazard-yellow/50 bg-hazard-yellow/10 text-hazard-yellow text-[9px] font-bold font-orbitron tracking-widest rounded-sm">
                ESTIMATED
              </span>
            )}
          </div>

          {difference > 0 ? (
            <div className="flex justify-center items-center gap-3 sm:gap-6 font-mono-tech text-text-primary">
              <div className="text-center">
                <div className="text-4xl sm:text-6xl font-black tracking-tighter text-nerv-orange drop-shadow-[0_0_12px_rgba(255,102,0,0.25)] font-mono-tech">
                  {String(days).padStart(3, '0')}
                </div>
                <div className="text-[10px] sm:text-xs font-bold text-text-muted mt-1 uppercase font-orbitron tracking-widest">DAYS</div>
              </div>
              <div className="text-3xl sm:text-5xl font-black text-text-dim leading-none -translate-y-2 font-mono-tech">:</div>
              <div className="text-center">
                <div className="text-4xl sm:text-6xl font-black tracking-tighter text-nerv-orange drop-shadow-[0_0_12px_rgba(255,102,0,0.25)] font-mono-tech">
                  {String(hours).padStart(2, '0')}
                </div>
                <div className="text-[10px] sm:text-xs font-bold text-text-muted mt-1 uppercase font-orbitron tracking-widest">HOURS</div>
              </div>
              <div className="text-3xl sm:text-5xl font-black text-text-dim leading-none -translate-y-2 font-mono-tech">:</div>
              <div className="text-center">
                <div className="text-4xl sm:text-6xl font-black tracking-tighter text-nerv-orange drop-shadow-[0_0_12px_rgba(255,102,0,0.25)] font-mono-tech">
                  {String(minutes).padStart(2, '0')}
                </div>
                <div className="text-[10px] sm:text-xs font-bold text-text-muted mt-1 uppercase font-orbitron tracking-widest">MINS</div>
              </div>
              <div className="text-3xl sm:text-5xl font-black text-text-dim leading-none -translate-y-2 font-mono-tech">:</div>
              <div className="text-center">
                <div className="text-4xl sm:text-6xl font-black tracking-tighter text-nerv-orange drop-shadow-[0_0_12px_rgba(255,102,0,0.25)] font-mono-tech">
                  {String(seconds).padStart(2, '0')}
                </div>
                <div className="text-[10px] sm:text-xs font-bold text-text-muted mt-1 uppercase font-orbitron tracking-widest">SECS</div>
              </div>
            </div>
          ) : (
            <div className="text-2xl sm:text-3xl font-black text-sync-green font-orbitron tracking-widest py-4 drop-shadow-[0_0_10px_rgba(57,255,20,0.25)]">
              MISSION TARGET ACHIEVED / JEE ACTIVE STATE
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 pt-4 border-t border-border-subtle/50 text-[11px] font-mono-tech text-text-muted max-w-2xl mx-auto">
            {dates.map((d, index) => (
              <div key={d.key} className={`flex items-center gap-2 ${index === selectedDateIndex ? 'text-nerv-orange' : ''}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                <span>{d.label.replace(' 2027', '')}:</span>
                <strong className="text-text-primary">{new Date(d.dateStr).toLocaleDateString()}</strong>
                {!d.official && <span className="text-[8px] text-hazard-yellow opacity-75">(EST)</span>}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-6">
          <motion.div
            {...getEntranceAnimation(1)}
            className="bg-bg-panel border border-border-subtle p-5 rounded-lg space-y-4"
          >
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h3 className="text-sm font-bold font-orbitron tracking-widest text-text-primary flex items-center gap-2">
                <Flame className="w-4 h-4 text-nerv-orange" />
                TACTICAL SYLLABUS PACING
              </h3>
              <div className="text-[10px] font-mono-tech text-text-muted uppercase">
                TARGET: {new Date(examConfig.phase1EndDate).toLocaleDateString()} (PHASE 1 COMPLETE)
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-bg-panel-raised border border-border-subtle rounded flex flex-col justify-between">
                <span className="text-xs font-bold text-text-muted uppercase font-orbitron">REMAINING HOURS</span>
                <div className="mt-2 text-3xl font-black font-mono-tech text-text-primary">
                  {totalHoursRemaining.toFixed(1)}h
                </div>
                <span className="text-[10px] font-mono-tech text-text-dim mt-1">
                  OF {stats.totalHours.toFixed(1)}h TOTAL
                </span>
              </div>

              <div className="p-4 bg-bg-panel-raised border border-border-subtle rounded flex flex-col justify-between">
                <span className="text-xs font-bold text-text-muted uppercase font-orbitron">REMAINING DAYS</span>
                <div className="mt-2 text-3xl font-black font-mono-tech text-hazard-yellow">
                  {daysToPhase1} <span className="text-sm font-bold text-text-muted font-rajdhani">DAYS</span>
                </div>
                <span className="text-[10px] font-mono-tech text-text-dim mt-1 uppercase">
                  UNTO SECURE DEADLINE
                </span>
              </div>

              <div className="p-4 bg-bg-panel-raised border border-border-subtle rounded flex flex-col justify-between">
                <span className="text-xs font-bold text-text-muted uppercase font-orbitron">REQUIRED PACE</span>
                <div className="mt-2 text-3xl font-black font-mono-tech text-sync-green">
                  {daysToPhase1 > 0 ? `${paceHoursPerDay.toFixed(1)}h` : '0.0h'}
                </div>
                <span className="text-[10px] font-mono-tech text-text-dim mt-1">
                  LECTURE HOURS / DAY
                </span>
              </div>
            </div>

            {paceHoursPerDay > 4 && (
              <div className="p-3 bg-alert-red/10 border border-alert-red text-alert-red rounded flex items-start gap-3 text-xs leading-relaxed">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-orbitron tracking-wider block">CRITICAL LOAD CAPACITY EXCEEDED:</strong>
                  The calculated required daily study pace of {paceHoursPerDay.toFixed(1)}h/day exceeds standard load recommendations. Optimize session planning or adjust the Phase 1 target date in Settings.
                </div>
              </div>
            )}
          </motion.div>

          <div className="bg-bg-panel border border-border-subtle p-5 rounded-lg space-y-4">
            <div className="border-b border-border-subtle pb-3">
              <h3 className="text-sm font-bold font-orbitron tracking-widest text-text-primary flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-nerv-orange" />
                SUBJECT DISPERSION MATRIX
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Physics */}
              <motion.div {...getEntranceAnimation(1)} className="relative group cursor-pointer border border-border-subtle hover:border-nerv-orange bg-bg-panel-raised rounded p-4 flex flex-col items-center text-center transition-all">
                <Link to="/physics" className="block w-full h-full">
                  <div className="absolute top-2 left-2 text-[9px] font-bold font-orbitron text-text-dim">SEC-01</div>
                  <SyncRing percentage={stats.physics.percentage} size={64} strokeWidth={5} label="" />
                  <h4 className="text-sm font-bold font-orbitron text-text-primary uppercase tracking-widest mt-3 group-hover:text-nerv-orange transition-colors">PHYSICS</h4>
                  <div className="text-[11px] font-mono-tech text-text-muted mt-2 space-y-0.5">
                    <div>LECTURES: {stats.physics.completedLectures}/{stats.physics.totalLectures}</div>
                    <div>DTS: {stats.physics.dtsCompleted}/{stats.physics.totalLectures} ({stats.physics.dtsPercentage.toFixed(1)}%)</div>
                    <div>HOURS: {stats.physics.completedHours.toFixed(1)}h / {stats.physics.totalHours.toFixed(1)}h</div>
                  </div>
                </Link>
              </motion.div>

              {/* Chemistry */}
              <motion.div {...getEntranceAnimation(1.2)} className="relative group cursor-pointer border border-border-subtle hover:border-nerv-orange bg-bg-panel-raised rounded p-4 flex flex-col items-center text-center transition-all">
                <Link to="/chemistry" className="block w-full h-full">
                  <div className="absolute top-2 left-2 text-[9px] font-bold font-orbitron text-text-dim">SEC-02</div>
                  <SyncRing percentage={stats.chemistry.percentage} size={64} strokeWidth={5} label="" />
                  <h4 className="text-sm font-bold font-orbitron text-text-primary uppercase tracking-widest mt-3 group-hover:text-nerv-orange transition-colors">CHEMISTRY</h4>
                  <div className="text-[11px] font-mono-tech text-text-muted mt-2 space-y-0.5">
                    <div>TOTAL CHEMISTRY LECTURES: {stats.chemistry.totalLectures}</div>
                    <div>COMPLETED CHEMISTRY LECTURES: {stats.chemistry.completedLectures}</div>
                    <div>LECTURE COMPLETION: {stats.chemistry.percentage.toFixed(1)}%</div>
                    <div>COMPLETED CHEMISTRY DTS: {stats.chemistry.dtsCompleted}</div>
                    <div>PENDING CHEMISTRY DTS: {stats.chemistry.dtsPending}</div>
                    <div>CHEMISTRY DTS: {stats.chemistry.dtsPercentage.toFixed(1)}%</div>
                    <div>HOURS: {stats.chemistry.completedHours.toFixed(1)}h / {stats.chemistry.totalHours.toFixed(1)}h</div>
                  </div>
                </Link>
              </motion.div>

              {/* Maths */}
              <motion.div {...getEntranceAnimation(1.4)} className="relative group cursor-pointer border border-border-subtle hover:border-nerv-orange bg-bg-panel-raised rounded p-4 flex flex-col items-center text-center transition-all">
                <Link to="/maths" className="block w-full h-full">
                  <div className="absolute top-2 left-2 text-[9px] font-bold font-orbitron text-text-dim">SEC-03</div>
                  <SyncRing percentage={stats.maths.percentage} size={64} strokeWidth={5} label="" />
                  <h4 className="text-sm font-bold font-orbitron text-text-primary uppercase tracking-widest mt-3 group-hover:text-nerv-orange transition-colors">MATHEMATICS</h4>
                  <div className="text-[11px] font-mono-tech text-text-muted mt-2 space-y-0.5">
                    <div>LECTURES: {stats.maths.completedLectures}/{stats.maths.totalLectures}</div>
                    <div>DTS: {stats.maths.dtsCompleted}/{stats.maths.totalLectures} ({stats.maths.dtsPercentage.toFixed(1)}%)</div>
                    <div>HOURS: {stats.maths.completedHours.toFixed(1)}h / {stats.maths.totalHours.toFixed(1)}h</div>
                  </div>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <motion.div {...getEntranceAnimation(2)} className="lg:col-span-4 space-y-6">
          <div className={`bg-bg-panel border rounded-lg flex flex-col items-center justify-center text-center h-full min-h-[350px] p-6 transition-all duration-300 ${
            isBehind
              ? 'border-alert-red shadow-[0_0_15px_rgba(230,0,18,0.15)] bg-alert-red/5'
              : 'border-border-subtle'
          }`}>
            <h3 className="text-xs font-bold font-orbitron tracking-[0.2em] text-text-muted mb-4">
              INTEGRAL SYNC RATIO (OVERALL)
            </h3>
            
            <SyncRing percentage={stats.overallPercentage} size={150} strokeWidth={10} label="" />

            <div className="w-full mt-6 space-y-1.5 text-left font-rajdhani">
              <div className="flex justify-between text-[10px] font-bold font-orbitron tracking-widest text-text-muted">
                <span>PROGRESS VELOCITY</span>
                <span className={`font-mono-tech ${isBehind ? 'text-alert-red font-bold' : 'text-sync-green'}`}>
                  {Math.round(stats.overallPercentage)}% {isBehind ? 'FALLEN BEHIND' : 'ON TRACK'}
                </span>
              </div>
              <div className={`w-full h-3 bg-bg-void border rounded-sm overflow-hidden p-[2px] ${isBehind ? 'border-alert-red' : 'border-border-subtle'}`}>
                <div
                  className={`h-full transition-all duration-500 ease-out ${isBehind ? 'bg-alert-red' : 'bg-sync-green'}`}
                  style={{ width: `${stats.overallPercentage}%` }}
                />
              </div>
            </div>

            <div className="mt-4 w-full space-y-3 font-mono-tech text-xs bg-bg-void p-4 border border-border-subtle rounded text-left">
              <div className="flex justify-between">
                <span className="text-text-muted">TOTAL LECTURES DONE:</span>
                <span className="text-text-primary font-bold">{stats.completedLectures} / {stats.totalLectures}</span>
              </div>
              <div className="flex justify-between border-t border-border-subtle/50 pt-2">
                <span className="text-text-muted">TOTAL DTS DONE:</span>
                <span className="text-text-primary font-bold">{stats.dtsCompleted} / {stats.totalLectures} ({stats.dtsPercentage.toFixed(1)}%)</span>
              </div>
              <div className="flex justify-between border-t border-border-subtle/50 pt-2">
                <span className="text-text-muted">TOTAL SYLLABUS HOURS:</span>
                <span className="text-text-primary font-bold">{stats.totalHours.toFixed(1)} HOURS</span>
              </div>
              <div className="flex justify-between border-t border-border-subtle/50 pt-2 text-sync-green">
                <span>COMPLETED ENERGY:</span>
                <span className="font-bold">{stats.completedHours.toFixed(1)} HOURS</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
