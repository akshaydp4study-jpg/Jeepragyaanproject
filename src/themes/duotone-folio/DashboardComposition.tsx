import React from 'react';
import { ArrowRight, Flame, BookOpen } from 'lucide-react';
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
  const { days, hours, minutes, seconds, difference } = calculateCountdown(targetTime, currentTime.getTime());

  const phase1TargetTime = new Date(examConfig.phase1EndDate + 'T23:59:59').getTime();
  const totalHoursRemaining = stats.totalHours - stats.completedHours;
  const { daysToPhase1, paceHoursPerDay } = calculatePace(phase1TargetTime, currentTime.getTime(), totalHoursRemaining);

  const isBehind = paceHoursPerDay > 4 || (daysToPhase1 <= 0 && totalHoursRemaining > 0);

  const getEntranceAnimation = (delayIndex: number = 0): any => {
    return {
      initial: { opacity: 0, y: 15 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1], delay: delayIndex * 0.06 }
    };
  };

  return (
    <div className="space-y-8 font-sans select-none animate-fadeIn">
      {/* Editorial Title Block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-text-primary pb-4">
        <div>
          <span className="text-xs font-bold tracking-[0.3em] text-nerv-orange font-orbitron uppercase">DUOTONE JOURNAL</span>
          <h1 className="text-4xl font-black tracking-tight text-text-primary uppercase mt-1 font-orbitron">
            THE PREPARATION RECORD
          </h1>
        </div>
        <div className="text-left md:text-right mt-2 md:mt-0 font-mono-tech text-xs text-text-muted uppercase">
          TICK: {currentTime.toLocaleDateString()} &mdash; {currentTime.toLocaleTimeString()}
        </div>
      </div>

      {/* Duotone Hero Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 border border-border-subtle rounded overflow-hidden">
        {/* Countdown Info Panel */}
        <motion.div
          {...getEntranceAnimation(0)}
          className="lg:col-span-7 bg-bg-panel p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-border-subtle"
        >
          <div>
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-nerv-orange font-orbitron tracking-wider">
              <span className="w-2 h-2 rounded-full bg-nerv-orange"></span>
              <span>ESTABLISHED FOCUS TIMELINE</span>
            </div>
            <h2 className="text-xl font-bold font-orbitron text-text-primary uppercase tracking-tight">
              T-MINUS COUNTDOWN: {activeDateObj.label}
            </h2>
          </div>

          <div className="my-8">
            {difference > 0 ? (
              <div className="flex gap-4 sm:gap-8 text-text-primary">
                <div>
                  <div className="text-5xl sm:text-7xl font-black font-orbitron tracking-tighter text-nerv-orange">
                    {String(days).padStart(3, '0')}
                  </div>
                  <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest font-orbitron mt-1">DAYS</div>
                </div>
                <div className="text-4xl sm:text-6xl font-light text-text-dim mt-1">:</div>
                <div>
                  <div className="text-5xl sm:text-7xl font-black font-orbitron tracking-tighter text-nerv-orange">
                    {String(hours).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest font-orbitron mt-1">HOURS</div>
                </div>
                <div className="text-4xl sm:text-6xl font-light text-text-dim mt-1">:</div>
                <div>
                  <div className="text-5xl sm:text-7xl font-black font-orbitron tracking-tighter text-nerv-orange">
                    {String(minutes).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest font-orbitron mt-1">MINS</div>
                </div>
              </div>
            ) : (
              <div className="text-2xl font-black text-sync-green font-orbitron uppercase tracking-widest">
                TARGET REACHED &bull; PREPARATION ACCOMPLISHED
              </div>
            )}
          </div>

          <div className="border-t border-border-subtle pt-4 space-y-1.5 text-xs text-text-muted font-mono-tech">
            {dates.map((d, index) => (
              <div key={d.key} className={`flex justify-between ${index === selectedDateIndex ? 'text-nerv-orange font-bold' : ''}`}>
                <span>{d.label}</span>
                <span>{new Date(d.dateStr).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Master Percent Block */}
        <motion.div
          {...getEntranceAnimation(1)}
          className="lg:col-span-5 bg-bg-panel-raised p-8 flex flex-col justify-center items-center text-center relative"
        >
          <div className="absolute top-4 left-4 text-xs font-bold font-orbitron text-text-dim tracking-widest">#01 INTEGRATION</div>
          <SyncRing percentage={stats.overallPercentage} size={160} strokeWidth={12} label="" />
          <h3 className="text-2xl font-black font-orbitron text-text-primary uppercase mt-4 tracking-tight">
            {Math.round(stats.overallPercentage)}% SYNC RATIO
          </h3>
          <p className="text-xs text-text-muted mt-2 max-w-xs font-mono-tech uppercase">
            Overall theoretical milestones complete. Tracking in real time.
          </p>
        </motion.div>
      </div>

      {/* Bento Grid - Numbered List Motif */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stat #02: Pace */}
        <motion.div
          {...getEntranceAnimation(2)}
          className="bg-bg-panel border border-border-subtle p-6 rounded relative flex flex-col justify-between min-h-[220px]"
        >
          <div>
            <div className="flex justify-between items-start">
              <span className="text-xs font-black font-orbitron text-nerv-orange tracking-widest">#02 PACING VELOCITY</span>
              <span className="text-[10px] font-mono-tech text-text-dim uppercase">TARGET END: {new Date(examConfig.phase1EndDate).toLocaleDateString()}</span>
            </div>
            <div className="mt-4">
              <div className="text-4xl font-black font-orbitron text-text-primary">{paceHoursPerDay.toFixed(1)}H/DAY</div>
              <p className="text-xs text-text-muted mt-1 uppercase font-mono-tech">
                Needed speed over {daysToPhase1} remaining days to fulfill Phase 1 syllabus blocks ({totalHoursRemaining.toFixed(1)}h left).
              </p>
            </div>
          </div>
          {isBehind && (
            <div className="mt-4 p-2.5 bg-alert-red/10 border border-alert-red rounded text-[10px] text-alert-red font-mono-tech uppercase">
              Velocity critical. Plan heavier daily study blocks.
            </div>
          )}
        </motion.div>

        {/* Stat #03: Metrics Count */}
        <motion.div
          {...getEntranceAnimation(3)}
          className="bg-bg-panel border border-border-subtle p-6 rounded relative flex flex-col justify-between min-h-[220px]"
        >
          <div>
            <span className="text-xs font-black font-orbitron text-nerv-orange tracking-widest">#03 SECURED QUANTITIES</span>
            <div className="mt-4 space-y-3 font-mono-tech text-xs uppercase">
              <div className="flex justify-between border-b border-border-subtle/50 pb-1">
                <span className="text-text-muted">LECTURES LOGGED</span>
                <span className="text-text-primary font-bold">{stats.completedLectures} / {stats.totalLectures}</span>
              </div>
              <div className="flex justify-between border-b border-border-subtle/50 pb-1">
                <span className="text-text-muted">ENERGY INVESTED</span>
                <span className="text-text-primary font-bold">{stats.completedHours.toFixed(1)} / {stats.totalHours.toFixed(1)}H</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">COMPLETION STATE</span>
                <span className="text-sync-green font-bold">ON TARGET</span>
              </div>
            </div>
          </div>
          <div className="text-[9px] text-text-dim font-mono-tech uppercase tracking-wider">
            SYSTEM RECORDS ENCRYPTED SECURELY
          </div>
        </motion.div>

        {/* Stat #04: Subject Pickers */}
        <motion.div
          {...getEntranceAnimation(4)}
          className="bg-bg-panel border border-border-subtle p-6 rounded relative flex flex-col justify-between min-h-[220px]"
        >
          <div>
            <span className="text-xs font-black font-orbitron text-nerv-orange tracking-widest">#04 CORE DISCIPLINES</span>
            <div className="mt-3 space-y-2">
              <Link to="/physics" className="flex items-center justify-between p-2 bg-bg-panel-raised border border-border-subtle rounded hover:border-nerv-orange transition-colors">
                <span className="text-xs font-bold font-orbitron text-text-primary">01 // PHYSICS</span>
                <span className="text-xs font-bold text-nerv-orange">{Math.round(stats.physics.percentage)}%</span>
              </Link>
              <Link to="/chemistry" className="flex items-center justify-between p-2 bg-bg-panel-raised border border-border-subtle rounded hover:border-nerv-orange transition-colors">
                <span className="text-xs font-bold font-orbitron text-text-primary">02 // CHEMISTRY</span>
                <span className="text-xs font-bold text-nerv-orange">{Math.round(stats.chemistry.percentage)}%</span>
              </Link>
              <Link to="/maths" className="flex items-center justify-between p-2 bg-bg-panel-raised border border-border-subtle rounded hover:border-nerv-orange transition-colors">
                <span className="text-xs font-bold font-orbitron text-text-primary">03 // MATHEMATICS</span>
                <span className="text-xs font-bold text-nerv-orange">{Math.round(stats.maths.percentage)}%</span>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
