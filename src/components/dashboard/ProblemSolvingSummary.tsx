import React from 'react';
import { ArrowRight, BrainCircuit, CheckCircle2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useOverallStats, useProblemSessions } from '../../hooks/useDbQueries';

export default function ProblemSolvingSummary() {
  const sessions = useProblemSessions();
  const stats = useOverallStats();
  if (!stats || sessions.length === 0) return null;

  const completed = sessions.filter((session) => session.completed).length;
  const percentage = Math.round((completed / sessions.length) * 100);
  const theoryComplete = stats.completedLectures >= stats.totalLectures;

  return (
    <section className="mt-6 bg-bg-panel border border-border-subtle rounded-lg p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded bg-nerv-orange/10 border border-nerv-orange/30 grid place-items-center text-nerv-orange shrink-0">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-orbitron font-black text-text-primary tracking-wider uppercase">Problem-solving phase</h3>
            <div className={`mt-1 flex items-center gap-1.5 text-[10px] font-orbitron font-bold tracking-wider uppercase ${theoryComplete ? 'text-sync-green' : 'text-hazard-yellow'}`}>
              {theoryComplete ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
              {theoryComplete ? 'Active after theory completion' : 'Upcoming after theoretical syllabus'}
            </div>
          </div>
        </div>
        <Link to="/problem-solving" className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-nerv-orange/50 text-nerv-orange rounded text-xs font-orbitron font-bold tracking-wider uppercase hover:bg-nerv-orange/10">
          Open checklist <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="mt-4 flex items-center gap-4">
        <div className="flex-1 h-2 bg-bg-void border border-border-subtle rounded-sm overflow-hidden">
          <div className="h-full bg-nerv-orange transition-all duration-500" style={{ width: `${percentage}%` }} />
        </div>
        <div className="font-mono-tech font-bold text-text-primary whitespace-nowrap">{completed} / 48 <span className="text-text-muted">({percentage}%)</span></div>
      </div>
    </section>
  );
}
