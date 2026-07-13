import React from 'react';
import { AlertTriangle, Calendar, CheckCircle, Layers, Target, TrendingUp } from 'lucide-react';
import type { AppOverallStats } from '../../utils/calculations';
import { calculateTheoryCoverageProjection } from '../../utils/calculations';
import type { AppSettings, ExamConfig } from '../../types';

interface TheoryCoveragePanelProps {
  stats: AppOverallStats;
  settings: AppSettings;
  examConfig: ExamConfig;
  currentTime: Date;
}

function formatIsoDate(dateString: string): string {
  const [year, month, day] = dateString.split('-').map(Number);
  if (!year || !month || !day) return dateString;
  return new Date(year, month - 1, day).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function signedLectureGap(gap: number): string {
  const rounded = Math.round(gap);
  if (rounded > 0) return `+${rounded}`;
  return `${rounded}`;
}

export default function TheoryCoveragePanel({
  stats,
  settings,
  examConfig,
  currentTime,
}: TheoryCoveragePanelProps) {
  const projection = calculateTheoryCoverageProjection(
    settings.theoryPlanStartDate,
    settings.theoryTargetDate || examConfig.phase1EndDate,
    currentTime,
    stats.totalLectures,
    stats.completedLectures,
    settings.plannedLecturesPerDay,
  );

  const expectedLectures = Math.round(projection.plannedLectures);
  const roundedGap = Math.round(projection.lectureGap);
  const isAhead = projection.status === 'ahead' || projection.status === 'complete';
  const isBehind = projection.status === 'behind';

  const statusLabel = projection.status === 'complete'
    ? 'THEORY COMPLETE'
    : projection.status === 'not-started'
      ? 'PLAN NOT STARTED'
      : projection.status === 'ahead'
        ? `AHEAD BY ${Math.abs(roundedGap)} LECTURES`
        : projection.status === 'behind'
          ? `BEHIND BY ${Math.abs(roundedGap)} LECTURES`
          : 'ON TRACK';

  const statusClass = isBehind
    ? 'border-alert-red bg-alert-red/5 text-alert-red'
    : isAhead
      ? 'border-sync-green bg-sync-green/5 text-sync-green'
      : 'border-hazard-yellow bg-hazard-yellow/5 text-hazard-yellow';

  const projectionDelta = projection.projectedDaysFromTarget;
  const projectionDeltaLabel = projectionDelta === null
    ? 'Complete more lectures to unlock a reliable date'
    : projectionDelta < 0
      ? `${Math.abs(projectionDelta)} days before target`
      : projectionDelta > 0
        ? `${projectionDelta} days after target`
        : 'Exactly on the target date';

  return (
    <section className="mt-6 bg-bg-panel border border-border-subtle rounded-lg p-5 sm:p-6 space-y-5">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 border-b border-border-subtle pb-4">
        <div>
          <div className="flex items-center gap-2 text-nerv-orange">
            <TrendingUp className="w-4 h-4" />
            <span className="text-[10px] font-bold font-orbitron tracking-[0.2em] uppercase">
              Theory trajectory monitor
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-black font-orbitron tracking-wider text-text-primary uppercase mt-1">
            Planned coverage vs actual completion
          </h3>
          <p className="text-xs text-text-muted mt-1 max-w-3xl">
            Planned coverage uses your configured lectures-per-day plan from your theory start date to the Phase 1 deadline. Actual coverage uses the lecture toggles you complete.
          </p>
        </div>

        <div className={`shrink-0 border rounded px-3 py-2 flex items-center gap-2 font-orbitron text-[10px] font-bold tracking-wider ${statusClass}`}>
          {isBehind ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          {statusLabel}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 space-y-5">
          <div className="space-y-4">
            <div>
              <div className="flex items-end justify-between gap-3 mb-2">
                <div>
                  <span className="text-[10px] font-bold font-orbitron tracking-widest text-text-muted uppercase">
                    Planned theoretical coverage by today
                  </span>
                  <div className="text-sm font-mono-tech text-text-primary mt-0.5">
                    {expectedLectures} / {stats.totalLectures} lectures expected by today
                  </div>
                </div>
                <strong className="text-xl font-mono-tech text-hazard-yellow">
                  {projection.plannedPercentage.toFixed(1)}%
                </strong>
              </div>
              <div className="h-3 bg-bg-void border border-border-subtle rounded-sm overflow-hidden p-[2px]">
                <div
                  className="h-full bg-hazard-yellow transition-all duration-500"
                  style={{ width: `${Math.min(100, projection.plannedPercentage)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-end justify-between gap-3 mb-2">
                <div>
                  <span className="text-[10px] font-bold font-orbitron tracking-widest text-text-muted uppercase">
                    Actual theoretical completion
                  </span>
                  <div className="text-sm font-mono-tech text-text-primary mt-0.5">
                    {stats.completedLectures} / {stats.totalLectures} lectures completed
                  </div>
                </div>
                <strong className={`text-xl font-mono-tech ${isBehind ? 'text-alert-red' : 'text-sync-green'}`}>
                  {projection.actualPercentage.toFixed(1)}%
                </strong>
              </div>
              <div className={`h-3 bg-bg-void border rounded-sm overflow-hidden p-[2px] ${isBehind ? 'border-alert-red' : 'border-border-subtle'}`}>
                <div
                  className={`h-full transition-all duration-500 ${isBehind ? 'bg-alert-red' : 'bg-sync-green'}`}
                  style={{ width: `${Math.min(100, projection.actualPercentage)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-bg-panel-raised border border-border-subtle rounded p-4">
              <div className="flex items-center gap-2 text-text-muted">
                <Layers className="w-4 h-4 text-nerv-orange" />
                <span className="text-[10px] font-bold font-orbitron tracking-wider uppercase">Lecture difference</span>
              </div>
              <div className={`text-2xl font-black font-mono-tech mt-2 ${isBehind ? 'text-alert-red' : 'text-sync-green'}`}>
                {signedLectureGap(projection.lectureGap)}
              </div>
              <p className="text-[10px] text-text-dim uppercase mt-1">Actual minus expected lectures</p>
            </div>

            <div className="bg-bg-panel-raised border border-border-subtle rounded p-4">
              <div className="flex items-center gap-2 text-text-muted">
                <TrendingUp className="w-4 h-4 text-nerv-orange" />
                <span className="text-[10px] font-bold font-orbitron tracking-wider uppercase">Actual pace</span>
              </div>
              <div className="text-2xl font-black font-mono-tech text-text-primary mt-2">
                {projection.actualLecturesPerDay.toFixed(2)}
              </div>
              <p className="text-[10px] text-text-dim uppercase mt-1">Lectures per calendar day</p>
            </div>

            <div className="bg-bg-panel-raised border border-border-subtle rounded p-4">
              <div className="flex items-center gap-2 text-text-muted">
                <Target className="w-4 h-4 text-nerv-orange" />
                <span className="text-[10px] font-bold font-orbitron tracking-wider uppercase">Required from now</span>
              </div>
              <div className="text-2xl font-black font-mono-tech text-hazard-yellow mt-2">
                {projection.requiredLecturesPerDay.toFixed(2)}
              </div>
              <p className="text-[10px] text-text-dim uppercase mt-1">Lectures per remaining day</p>
            </div>
          </div>
        </div>

        <aside className="lg:col-span-4 bg-bg-void border border-border-subtle rounded p-5 flex flex-col justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 text-text-muted">
              <Calendar className="w-4 h-4 text-nerv-orange" />
              <span className="text-[10px] font-bold font-orbitron tracking-widest uppercase">
                Projected theoretical finish
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-orbitron text-text-primary mt-3 leading-tight">
              {projection.projectedCompletionDate
                ? formatIsoDate(projection.projectedCompletionDate)
                : 'NOT ENOUGH DATA'}
            </div>
            <p className={`text-xs font-mono-tech mt-2 ${projectionDelta !== null && projectionDelta > 0 ? 'text-alert-red' : 'text-sync-green'}`}>
              {projectionDeltaLabel}
            </p>
          </div>

          <div className="space-y-2 text-xs font-mono-tech border-t border-border-subtle pt-4">
            <div className="flex justify-between gap-3">
              <span className="text-text-muted">THEORY START</span>
              <strong className="text-text-primary">{formatIsoDate(settings.theoryPlanStartDate)}</strong>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-text-muted">TARGET FINISH</span>
              <strong className="text-text-primary">{formatIsoDate(settings.theoryTargetDate || examConfig.phase1EndDate)}</strong>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-text-muted">PLANNED LECTURES / DAY</span>
              <strong className="text-text-primary">{projection.configuredLecturesPerDay.toFixed(2)}</strong>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-text-muted">PLAN DAYS USED</span>
              <strong className="text-text-primary">{projection.elapsedPlanDays} / {projection.totalPlanDays}</strong>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
