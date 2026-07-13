import React from 'react';
import { Flame, BookOpen } from 'lucide-react';
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
  const dates = [
    { label: 'JEE MAIN (SESSION 1)', dateStr: examConfig.jeeMainS1Date, official: examConfig.jeeMainS1Official, key: 's1' },
    { label: 'JEE MAIN (SESSION 2)', dateStr: examConfig.jeeMainS2Date, official: examConfig.jeeMainS2Official, key: 's2' },
    { label: 'JEE ADVANCED 2027', dateStr: examConfig.jeeAdvancedDate, official: examConfig.jeeAdvancedOfficial, key: 'adv' },
  ];

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
  const { days, hours, minutes } = calculateCountdown(targetTime, currentTime.getTime());

  const phase1TargetTime = new Date(examConfig.phase1EndDate + 'T23:59:59').getTime();
  const totalHoursRemaining = stats.totalHours - stats.completedHours;
  const { daysToPhase1, paceHoursPerDay } = calculatePace(phase1TargetTime, currentTime.getTime(), totalHoursRemaining);

  const getEntranceAnimation = (delayIndex: number = 0): any => {
    return {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: 0.4, ease: 'easeOut', delay: delayIndex * 0.05 }
    };
  };

  return (
    <div className="space-y-6 font-mono-tech select-none animate-fadeIn text-text-primary">
      {/* Header */}
      <div className="border-b border-border-subtle pb-3 flex justify-between items-center">
        <div>
          <span className="text-[10px] uppercase font-bold text-text-muted tracking-widest font-orbitron">THE GRID STATUS</span>
          <h1 className="text-xl font-black font-orbitron tracking-widest uppercase mt-0.5">ULTRALIGHT DASHBOARD</h1>
        </div>
        <span className="text-xs text-text-muted">
          {currentTime.toLocaleDateString()} // {currentTime.toLocaleTimeString()}
        </span>
      </div>

      {/* Hero Countdown */}
      <motion.div
        {...getEntranceAnimation(0)}
        className="bg-bg-panel border border-border-subtle p-5 rounded-md text-center"
      >
        <span className="text-xs font-bold text-text-muted font-orbitron tracking-wider">ACTIVE JEE TIMER</span>
        <h3 className="text-sm font-extrabold font-orbitron mt-1 uppercase text-text-primary">{activeDateObj.label}</h3>

        <div className="flex gap-4 sm:gap-6 justify-center items-center my-6">
          <div>
            <div className="text-4xl font-bold font-mono-tech">{String(days).padStart(3, '0')}</div>
            <div className="text-[9px] font-bold text-text-muted font-orbitron">DAYS</div>
          </div>
          <div className="text-2xl text-text-dim">:</div>
          <div>
            <div className="text-4xl font-bold font-mono-tech">{String(hours).padStart(2, '0')}</div>
            <div className="text-[9px] font-bold text-text-muted font-orbitron">HOURS</div>
          </div>
          <div className="text-2xl text-text-dim">:</div>
          <div>
            <div className="text-4xl font-bold font-mono-tech">{String(minutes).padStart(2, '0')}</div>
            <div className="text-[9px] font-bold text-text-muted font-orbitron">MINS</div>
          </div>
        </div>
      </motion.div>

      {/* Bento Honeycomb Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          {/* Pacing */}
          <motion.div {...getEntranceAnimation(1)} className="bg-bg-panel border border-border-subtle p-5 rounded-md space-y-4">
            <span className="text-xs font-bold font-orbitron uppercase text-text-primary border-b border-border-subtle pb-2 block flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-text-muted" />
              PACING CALCULATOR
            </span>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <span className="text-[10px] text-text-muted block">HOURS LEFT</span>
                <span className="text-lg font-bold">{totalHoursRemaining.toFixed(1)}h</span>
              </div>
              <div className="border-x border-border-subtle">
                <span className="text-[10px] text-text-muted block">DAYS LEFT</span>
                <span className="text-lg font-bold">{daysToPhase1}</span>
              </div>
              <div>
                <span className="text-[10px] text-text-muted block">REQUIRED PACE</span>
                <span className="text-lg font-bold text-sync-green">{paceHoursPerDay.toFixed(1)}h/d</span>
              </div>
            </div>
          </motion.div>

          {/* Hexagons Card */}
          <div className="bg-bg-panel border border-border-subtle p-5 rounded-md space-y-4">
            <span className="text-xs font-bold font-orbitron uppercase text-text-primary border-b border-border-subtle pb-2 block flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-text-muted" />
              HONEYCOMB SECTORS
            </span>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-4">
              {/* Physics Hex */}
              <motion.div {...getEntranceAnimation(1.1)} className="relative group cursor-pointer transition-all duration-300">
                <Link to="/physics" className="block relative w-48 h-52 mx-auto bg-border-subtle hover:bg-nerv-orange p-[1.5px]" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
                  <div className="w-full h-full bg-bg-panel-raised hover:bg-bg-panel flex flex-col items-center justify-center text-center p-4 transition-colors" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
                    <div className="absolute top-4 text-[9px] font-bold font-orbitron text-text-dim uppercase tracking-widest">SEC-01</div>
                    <SyncRing percentage={stats.physics.percentage} size={60} strokeWidth={4} label="" />
                    <h4 className="text-xs font-extrabold tracking-widest mt-2">PHYSICS</h4>
                    <span className="text-[9px] text-text-muted mt-1 uppercase">{stats.physics.completedLectures} LECS DONE</span>
                  </div>
                </Link>
              </motion.div>

              {/* Chemistry Hex */}
              <motion.div {...getEntranceAnimation(1.2)} className="relative group cursor-pointer transition-all duration-300">
                <Link to="/chemistry" className="block relative w-48 h-52 mx-auto bg-border-subtle hover:bg-nerv-orange p-[1.5px]" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
                  <div className="w-full h-full bg-bg-panel-raised hover:bg-bg-panel flex flex-col items-center justify-center text-center p-4 transition-colors" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
                    <div className="absolute top-4 text-[9px] font-bold font-orbitron text-text-dim uppercase tracking-widest">SEC-02</div>
                    <SyncRing percentage={stats.chemistry.percentage} size={60} strokeWidth={4} label="" />
                    <h4 className="text-xs font-extrabold tracking-widest mt-2">CHEMISTRY</h4>
                    <span className="text-[9px] text-text-muted mt-1 uppercase">{stats.chemistry.completedLectures} LECS DONE</span>
                  </div>
                </Link>
              </motion.div>

              {/* Maths Hex */}
              <motion.div {...getEntranceAnimation(1.3)} className="relative group cursor-pointer transition-all duration-300">
                <Link to="/maths" className="block relative w-48 h-52 mx-auto bg-border-subtle hover:bg-nerv-orange p-[1.5px]" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
                  <div className="w-full h-full bg-bg-panel-raised hover:bg-bg-panel flex flex-col items-center justify-center text-center p-4 transition-colors" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
                    <div className="absolute top-4 text-[9px] font-bold font-orbitron text-text-dim uppercase tracking-widest">SEC-03</div>
                    <SyncRing percentage={stats.maths.percentage} size={60} strokeWidth={4} label="" />
                    <h4 className="text-xs font-extrabold tracking-widest mt-2">MATHS</h4>
                    <span className="text-[9px] text-text-muted mt-1 uppercase">{stats.maths.completedLectures} LECS DONE</span>
                  </div>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Sync Card */}
        <motion.div {...getEntranceAnimation(2)} className="lg:col-span-4 bg-bg-panel border border-border-subtle p-5 rounded-md flex flex-col items-center justify-center text-center">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-4">HARMONIZED PROGRESS</span>
          <SyncRing percentage={stats.overallPercentage} size={110} strokeWidth={6} label="" />
          <span className="text-sm font-bold mt-4 uppercase">
            {Math.round(stats.overallPercentage)}% SYNCHRONIZED
          </span>
          <span className="text-[9px] text-text-muted mt-1 uppercase">
            {stats.completedLectures} / {stats.totalLectures} modules resolved
          </span>
        </motion.div>
      </div>
    </div>
  );
}
