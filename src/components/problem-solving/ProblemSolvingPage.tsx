import React from 'react';
import { BrainCircuit, Check, CheckCircle2, Circle, RotateCcw, Sparkles } from 'lucide-react';
import { useOverallStats, useProblemSessions } from '../../hooks/useDbQueries';
import { bulkToggleProblemSessions, toggleProblemSession } from '../../data/dataAccess';

export default function ProblemSolvingPage() {
  const sessions = useProblemSessions();
  const stats = useOverallStats();

  if (!stats || sessions.length === 0) {
    return <div className="min-h-[320px] grid place-items-center text-text-muted font-mono-tech">LOADING 48-SESSION MATRIX...</div>;
  }

  const completed = sessions.filter((session) => session.completed).length;
  const percentage = Math.round((completed / sessions.length) * 100);
  const theoryComplete = stats.completedLectures >= stats.totalLectures;

  const handleBulk = async (nextStatus: boolean) => {
    const message = nextStatus
      ? 'Mark all 48 problem-solving sessions as complete?'
      : 'Reset all 48 problem-solving sessions?';
    if (window.confirm(message)) {
      await bulkToggleProblemSessions(nextStatus);
    }
  };

  return (
    <div className="space-y-6">
      <section className="bg-bg-panel border border-border-subtle rounded-lg p-5 sm:p-6 overflow-hidden relative">
        <div className="absolute inset-x-0 top-0 h-1 bg-nerv-orange" />
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 text-nerv-orange mb-2">
              <BrainCircuit className="w-5 h-5" />
              <span className="text-[11px] font-orbitron font-black tracking-[0.2em] uppercase">Phase 2 training matrix</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-orbitron tracking-wider text-text-primary uppercase">
              48 Problem-Solving Sessions
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-text-muted">
              This checklist is tracked separately from your 295 theoretical lectures. The phase is planned for after syllabus completion, but the checklist remains usable whenever you need it.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleBulk(true)}
              className="px-4 py-2 rounded border border-sync-green/50 bg-sync-green/10 text-sync-green text-xs font-orbitron font-bold uppercase tracking-wider hover:bg-sync-green/20 cursor-pointer"
            >
              Mark all complete
            </button>
            <button
              onClick={() => handleBulk(false)}
              className="px-4 py-2 rounded border border-border-subtle bg-bg-void text-text-muted text-xs font-orbitron font-bold uppercase tracking-wider hover:text-text-primary cursor-pointer flex items-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-bg-void border border-border-subtle rounded p-4">
            <div className="text-[10px] text-text-muted font-orbitron font-bold tracking-widest uppercase">Session completion</div>
            <div className="mt-1 text-3xl font-black font-mono-tech text-text-primary">{completed}<span className="text-base text-text-dim"> / 48</span></div>
          </div>
          <div className="bg-bg-void border border-border-subtle rounded p-4">
            <div className="text-[10px] text-text-muted font-orbitron font-bold tracking-widest uppercase">Progress</div>
            <div className="mt-1 text-3xl font-black font-mono-tech text-nerv-orange">{percentage}%</div>
          </div>
          <div className="bg-bg-void border border-border-subtle rounded p-4">
            <div className="text-[10px] text-text-muted font-orbitron font-bold tracking-widest uppercase">Phase status</div>
            <div className={`mt-2 inline-flex items-center gap-2 text-xs font-orbitron font-black tracking-wider uppercase ${theoryComplete ? 'text-sync-green' : 'text-hazard-yellow'}`}>
              {theoryComplete ? <CheckCircle2 className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              {theoryComplete ? 'Theory complete — active' : 'Upcoming after theory'}
            </div>
          </div>
        </div>

        <div className="mt-4 h-2.5 rounded-sm border border-border-subtle bg-bg-void overflow-hidden">
          <div className="h-full bg-nerv-orange transition-all duration-500" style={{ width: `${percentage}%` }} />
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {sessions.map((session) => (
          <button
            key={session.id}
            onClick={() => toggleProblemSession(session.id, !session.completed)}
            className={`group text-left border rounded-lg p-4 min-h-24 transition-all cursor-pointer ${
              session.completed
                ? 'border-sync-green/60 bg-sync-green/10'
                : 'border-border-subtle bg-bg-panel hover:border-nerv-orange/60 hover:bg-bg-panel-raised'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[10px] font-mono-tech text-text-dim uppercase tracking-widest">Session {String(session.sessionNumber).padStart(2, '0')}</div>
                <div className={`mt-2 text-sm font-orbitron font-bold tracking-wide ${session.completed ? 'text-sync-green' : 'text-text-primary'}`}>
                  {session.title}
                </div>
              </div>
              <span className={`shrink-0 w-7 h-7 rounded-full border grid place-items-center ${session.completed ? 'border-sync-green bg-sync-green text-bg-void' : 'border-border-subtle text-text-dim group-hover:border-nerv-orange group-hover:text-nerv-orange'}`}>
                {session.completed ? <Check className="w-4 h-4" /> : <Circle className="w-3.5 h-3.5" />}
              </span>
            </div>
          </button>
        ))}
      </section>
    </div>
  );
}
