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
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: delayIndex * 0.08 }
    };
  };

  return (
    <div className="space-y-6 font-serif select-none animate-fadeIn text-text-primary">
      {/* Editorial Title */}
      <div className="border-b-2 border-text-primary pb-3 flex justify-between items-end">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest font-orbitron">THE FIELD RECORD</span>
          <h1 className="text-3xl font-black font-orbitron mt-0.5 uppercase tracking-wide">EXPEDITION CHRONICLES</h1>
        </div>
        <span className="text-xs font-mono-tech uppercase text-text-muted">
          LOG TIME: {currentTime.toLocaleDateString()} // {currentTime.toLocaleTimeString()}
        </span>
      </div>

      {/* Retro Book Countdown */}
      <motion.div
        {...getEntranceAnimation(0)}
        className="bg-bg-panel border-2 border-text-primary p-6 rounded-lg text-center relative"
      >
        <span className="text-xs font-bold uppercase tracking-wider font-orbitron text-text-muted">LOGBOOK MILESTONE</span>
        <h3 className="text-xl font-black font-orbitron mt-1 text-text-primary uppercase">{activeDateObj.label}</h3>

        <div className="flex gap-4 sm:gap-6 justify-center items-center my-6">
          <div>
            <div className="text-5xl font-black text-text-primary">{String(days).padStart(3, '0')}</div>
            <div className="text-[10px] font-bold text-text-muted font-orbitron">DAYS</div>
          </div>
          <div className="text-3xl text-text-dim mt-1">:</div>
          <div>
            <div className="text-5xl font-black text-text-primary">{String(hours).padStart(2, '0')}</div>
            <div className="text-[10px] font-bold text-text-muted font-orbitron">HOURS</div>
          </div>
          <div className="text-3xl text-text-dim mt-1">:</div>
          <div>
            <div className="text-5xl font-black text-text-primary">{String(minutes).padStart(2, '0')}</div>
            <div className="text-[10px] font-bold text-text-muted font-orbitron">MINS</div>
          </div>
        </div>
      </motion.div>

      {/* Bento Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pacing */}
        <motion.div {...getEntranceAnimation(1)} className="bg-bg-panel border border-border-subtle p-5 rounded-lg space-y-4">
          <span className="text-sm font-bold font-orbitron text-text-primary border-b border-border-subtle pb-2 block uppercase flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-text-primary" />
            STUDY PACING
          </span>
          <div className="space-y-2 font-mono-tech text-xs uppercase leading-relaxed text-text-muted">
            <div>REMAINING HOURS: <strong className="text-text-primary">{totalHoursRemaining.toFixed(1)}H</strong></div>
            <div>REMAINING DAYS: <strong className="text-text-primary">{daysToPhase1} DAYS</strong></div>
            <div className="border-t border-border-subtle pt-2 text-text-primary font-bold">
              REQUIRED VELOCITY: {paceHoursPerDay.toFixed(1)}H/DAY
            </div>
          </div>
        </motion.div>

        {/* Sync Ring */}
        <motion.div {...getEntranceAnimation(2)} className="bg-bg-panel border border-border-subtle p-5 rounded-lg flex flex-col items-center justify-center text-center">
          <span className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3 font-orbitron">COMPLETION STATE</span>
          <SyncRing percentage={stats.overallPercentage} size={110} strokeWidth={8} label="" />
          <span className="text-xs font-bold font-orbitron text-text-primary mt-3 uppercase">
            {Math.round(stats.overallPercentage)}% TOTAL PREP
          </span>
        </motion.div>

        {/* Subjects list */}
        <motion.div {...getEntranceAnimation(3)} className="bg-bg-panel border border-border-subtle p-5 rounded-lg space-y-3">
          <span className="text-sm font-bold font-orbitron text-text-primary border-b border-border-subtle pb-2 block uppercase flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-text-primary" />
            SUBJECT JOURNAL
          </span>
          <div className="space-y-1.5 font-sans text-xs uppercase">
            <Link to="/physics" className="flex justify-between p-1.5 hover:bg-bg-panel-raised rounded">
              <span>01 // PHYSICS</span>
              <span className="font-bold">{Math.round(stats.physics.percentage)}%</span>
            </Link>
            <Link to="/chemistry" className="flex justify-between p-1.5 hover:bg-bg-panel-raised rounded">
              <span>02 // CHEMISTRY</span>
              <span className="font-bold">{Math.round(stats.chemistry.percentage)}%</span>
            </Link>
            <Link to="/maths" className="flex justify-between p-1.5 hover:bg-bg-panel-raised rounded">
              <span>03 // MATHEMATICS</span>
              <span className="font-bold">{Math.round(stats.maths.percentage)}%</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
