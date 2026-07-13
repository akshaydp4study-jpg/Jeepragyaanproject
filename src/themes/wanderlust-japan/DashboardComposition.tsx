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
      initial: { opacity: 0, y: 15 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.5, ease: 'easeOut', delay: delayIndex * 0.05 }
    };
  };

  return (
    <div className="space-y-6 font-sans select-none animate-fadeIn text-text-primary">
      {/* Title block */}
      <div className="border-b-2 border-nerv-orange/30 pb-3 flex justify-between items-end">
        <div>
          <span className="text-xs uppercase font-bold text-text-muted tracking-widest font-orbitron">THE ZEN ROADMAP</span>
          <h1 className="text-2xl font-black font-orbitron tracking-widest uppercase mt-0.5">THE PILGRIMAGE LOGS</h1>
        </div>
        <span className="text-xs font-mono-tech text-text-muted">
          HOUR: {currentTime.toLocaleDateString()} // {currentTime.toLocaleTimeString()}
        </span>
      </div>

      {/* Timeline Hero */}
      <motion.div
        {...getEntranceAnimation(0)}
        className="bg-bg-panel border border-border-subtle p-6 rounded-lg text-center relative overflow-hidden"
      >
        <span className="text-xs font-bold text-text-muted font-orbitron uppercase tracking-wider">NEXT STATION</span>
        <h3 className="text-base font-extrabold font-orbitron mt-1 text-text-primary uppercase">{activeDateObj.label}</h3>

        <div className="flex gap-4 sm:gap-6 justify-center items-center my-5">
          <div>
            <div className="text-5xl font-black text-[#ff3838]">{String(days).padStart(3, '0')}</div>
            <div className="text-[10px] font-bold text-text-muted font-orbitron">DAYS</div>
          </div>
          <div className="text-2xl text-text-dim">:</div>
          <div>
            <div className="text-5xl font-black text-[#ff3838]">{String(hours).padStart(2, '0')}</div>
            <div className="text-[10px] font-bold text-text-muted font-orbitron">HOURS</div>
          </div>
          <div className="text-2xl text-text-dim">:</div>
          <div>
            <div className="text-5xl font-black text-[#ff3838]">{String(minutes).padStart(2, '0')}</div>
            <div className="text-[10px] font-bold text-text-muted font-orbitron">MINUTES</div>
          </div>
        </div>
      </motion.div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pacing */}
        <motion.div {...getEntranceAnimation(1)} className="bg-bg-panel border border-border-subtle p-5 rounded-lg space-y-3">
          <span className="text-xs font-bold font-orbitron uppercase text-text-primary border-b border-border-subtle pb-2 block flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-[#ff3838]" />
            JOURNEY PACING
          </span>
          <div className="space-y-1.5 font-mono-tech text-xs uppercase leading-relaxed text-text-muted">
            <div>STAGES LEFT: <strong className="text-text-primary">{daysToPhase1} DAYS</strong></div>
            <div>EFFORT REMAINING: <strong className="text-text-primary">{totalHoursRemaining.toFixed(1)}H</strong></div>
            <div className="border-t border-border-subtle pt-2 font-bold text-text-primary">
              VELOCITY EXPECTED: {paceHoursPerDay.toFixed(1)}H/DAY
            </div>
          </div>
        </motion.div>

        {/* Sync */}
        <motion.div {...getEntranceAnimation(2)} className="bg-bg-panel border border-border-subtle p-5 rounded-lg flex flex-col items-center justify-center text-center">
          <span className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 font-orbitron">MEDITATION FOCUS</span>
          <SyncRing percentage={stats.overallPercentage} size={100} strokeWidth={6} label="" />
          <span className="text-xs font-bold font-orbitron text-text-primary mt-2 uppercase">
            {Math.round(stats.overallPercentage)}% HARMONY
          </span>
        </motion.div>

        {/* Subjects */}
        <motion.div {...getEntranceAnimation(3)} className="bg-bg-panel border border-border-subtle p-5 rounded-lg space-y-3">
          <span className="text-xs font-bold font-orbitron uppercase text-text-primary border-b border-border-subtle pb-2 block flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-[#ff3838]" />
            CORE STATIONS
          </span>
          <div className="space-y-1.5 font-sans text-xs uppercase">
            <Link to="/physics" className="flex justify-between p-1.5 hover:bg-bg-panel-raised rounded">
              <span>PHYSICS</span>
              <span className="font-bold text-[#ff3838]">{Math.round(stats.physics.percentage)}%</span>
            </Link>
            <Link to="/chemistry" className="flex justify-between p-1.5 hover:bg-bg-panel-raised rounded">
              <span>CHEMISTRY</span>
              <span className="font-bold text-[#ff3838]">{Math.round(stats.chemistry.percentage)}%</span>
            </Link>
            <Link to="/maths" className="flex justify-between p-1.5 hover:bg-bg-panel-raised rounded">
              <span>MATHS</span>
              <span className="font-bold text-[#ff3838]">{Math.round(stats.maths.percentage)}%</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
