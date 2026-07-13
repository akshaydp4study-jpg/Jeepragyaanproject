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
  const { days, hours, minutes, seconds } = calculateCountdown(targetTime, currentTime.getTime());

  const phase1TargetTime = new Date(examConfig.phase1EndDate + 'T23:59:59').getTime();
  const totalHoursRemaining = stats.totalHours - stats.completedHours;
  const { daysToPhase1, paceHoursPerDay } = calculatePace(phase1TargetTime, currentTime.getTime(), totalHoursRemaining);

  const getEntranceAnimation = (delayIndex: number = 0): any => {
    return {
      initial: { opacity: 0, y: 15 },
      animate: { opacity: 1, y: 0 },
      transition: { type: 'spring', stiffness: 80, damping: 15, delay: delayIndex * 0.08 }
    };
  };

  return (
    <div className="space-y-6 font-sans select-none animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
        <div>
          <span className="text-xs font-bold text-sync-green uppercase tracking-wide">ORGANIC SYNAPSE</span>
          <h2 className="text-2xl font-black text-text-primary tracking-tight mt-0.5">
            PREP JOURNAL
          </h2>
        </div>
        <div className="text-xs font-semibold text-text-muted bg-bg-panel px-3 py-1.5 rounded-full border border-border-subtle">
          CALENDAR: {currentTime.toLocaleDateString()} at {currentTime.toLocaleTimeString()}
        </div>
      </div>

      {/* Countdown Hero */}
      <motion.div
        {...getEntranceAnimation(0)}
        className="bg-bg-panel/40 border border-border-subtle p-6 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden"
      >
        <span className="text-xs font-bold text-text-muted tracking-wider uppercase">APPROACHING MILESTONE</span>
        <h3 className="text-lg font-extrabold text-text-primary mt-1 uppercase">{activeDateObj.label}</h3>

        <div className="flex gap-4 sm:gap-6 text-text-primary my-6 items-center">
          <div className="text-center">
            <div className="text-5xl font-black text-sync-green">{String(days).padStart(3, '0')}</div>
            <div className="text-[10px] font-bold text-text-muted mt-0.5">DAYS</div>
          </div>
          <div className="text-3xl text-text-dim leading-none -translate-y-1">:</div>
          <div className="text-center">
            <div className="text-5xl font-black text-sync-green">{String(hours).padStart(2, '0')}</div>
            <div className="text-[10px] font-bold text-text-muted mt-0.5">HOURS</div>
          </div>
          <div className="text-3xl text-text-dim leading-none -translate-y-1">:</div>
          <div className="text-center">
            <div className="text-5xl font-black text-sync-green">{String(minutes).padStart(2, '0')}</div>
            <div className="text-[10px] font-bold text-text-muted mt-0.5">MINS</div>
          </div>
        </div>

        <div className="text-xs text-text-dim max-w-md font-mono-tech uppercase">
          Journeying steadily. Let the focus flow organically.
        </div>
      </motion.div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          {/* Pacing Card */}
          <motion.div {...getEntranceAnimation(1)} className="bg-bg-panel border border-border-subtle p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-2">
              <span className="text-sm font-bold text-text-primary flex items-center gap-2">
                <Flame className="w-4 h-4 text-sync-green" />
                PACING INSIGHT
              </span>
              <span className="text-[10px] font-bold text-text-muted uppercase">DEADLINE: {new Date(examConfig.phase1EndDate).toLocaleDateString()}</span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <span className="text-[10px] font-bold text-text-muted uppercase">REMAINING</span>
                <div className="text-2xl font-black mt-1 text-text-primary">{totalHoursRemaining.toFixed(1)}h</div>
              </div>
              <div className="border-x border-border-subtle">
                <span className="text-[10px] font-bold text-text-muted uppercase">DAYS</span>
                <div className="text-2xl font-black mt-1 text-sync-green">{daysToPhase1}</div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-text-muted uppercase">SPEED</span>
                <div className="text-2xl font-black mt-1 text-sync-green">{paceHoursPerDay.toFixed(1)}h</div>
              </div>
            </div>
          </motion.div>

          {/* Subjects Card */}
          <div className="bg-bg-panel border border-border-subtle p-6 rounded-2xl space-y-4">
            <span className="text-sm font-bold text-text-primary flex items-center gap-2 pb-2 border-b border-border-subtle">
              <BookOpen className="w-4 h-4 text-sync-green" />
              SUBJECT SECTORS
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link to="/physics" className="bg-bg-panel-raised border border-border-subtle rounded-xl p-4 flex flex-col items-center hover:border-sync-green transition-colors">
                <SyncRing percentage={stats.physics.percentage} size={50} strokeWidth={4} label="" />
                <span className="text-xs font-extrabold mt-3 text-text-primary">PHYSICS</span>
                <span className="text-[10px] text-text-muted mt-1">{stats.physics.completedLectures} LECS</span>
              </Link>
              <Link to="/chemistry" className="bg-bg-panel-raised border border-border-subtle rounded-xl p-4 flex flex-col items-center hover:border-sync-green transition-colors">
                <SyncRing percentage={stats.chemistry.percentage} size={50} strokeWidth={4} label="" />
                <span className="text-xs font-extrabold mt-3 text-text-primary">CHEMISTRY</span>
                <span className="text-[10px] text-text-muted mt-1">{stats.chemistry.completedLectures} LECS</span>
              </Link>
              <Link to="/maths" className="bg-bg-panel-raised border border-border-subtle rounded-xl p-4 flex flex-col items-center hover:border-sync-green transition-colors">
                <SyncRing percentage={stats.maths.percentage} size={50} strokeWidth={4} label="" />
                <span className="text-xs font-extrabold mt-3 text-text-primary">MATHS</span>
                <span className="text-[10px] text-text-muted mt-1">{stats.maths.completedLectures} LECS</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Sync Card */}
        <motion.div {...getEntranceAnimation(2)} className="lg:col-span-4 bg-bg-panel border border-border-subtle p-6 rounded-2xl flex flex-col items-center justify-center text-center">
          <span className="text-xs font-bold text-text-muted tracking-wider uppercase mb-4">TOTAL SYNAPSE</span>
          <SyncRing percentage={stats.overallPercentage} size={130} strokeWidth={10} label="" />
          <h4 className="text-lg font-black text-text-primary mt-4 uppercase">
            {Math.round(stats.overallPercentage)}% HARMONIZED
          </h4>
          <span className="text-[10px] text-text-muted mt-2 font-mono-tech uppercase">
            {stats.completedLectures} / {stats.totalLectures} lectures finalized
          </span>
        </motion.div>
      </div>
    </div>
  );
}
