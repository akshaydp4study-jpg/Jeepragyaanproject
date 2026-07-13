import React from 'react';
import { Calendar, Trash, Edit, AlertCircle, FileText } from 'lucide-react';
import { motion } from 'motion/react';
import type { TestListLayoutProps } from '../types';

export default function TestListLayout({
  tests,
  onEdit,
  onDelete,
  prefersReducedMotion = false,
}: TestListLayoutProps) {
  const rowVariants: any = {
    hidden: { opacity: 0, y: 10 },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: (index % 15) * 0.04,
        duration: 0.35,
        ease: 'easeOut',
      },
    }),
  };

  return (
    <div className="space-y-4 select-none font-sans">
      {tests.map((test, index) => {
        const scorePercent = Math.round((test.marksObtained / test.maxMarks) * 100);
        const isHigh = scorePercent >= 75;
        const isLow = scorePercent < 45;

        return (
          <motion.div
            key={test.id}
            variants={prefersReducedMotion ? {} : rowVariants}
            initial={prefersReducedMotion ? "visible" : "hidden"}
            whileInView={prefersReducedMotion ? "visible" : "visible"}
            viewport={{ once: true, margin: "-20px" }}
            custom={index}
            className="p-5 bg-bg-panel border border-border-subtle hover:border-[#ff3838]/60 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors"
          >
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <span className="w-5 h-5 bg-[#ff3838] shadow-[0_0_8px_rgba(255,56,56,0.3)] rounded-full flex items-center justify-center text-[10px] text-white font-bold font-orbitron shrink-0">
                {index + 1}
              </span>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-text-primary uppercase tracking-tight truncate">
                  {test.name}
                </h4>
                <div className="flex gap-3 text-[11px] text-text-dim uppercase mt-0.5">
                  <span>SOURCE: {test.source}</span>
                  <span>&bull;</span>
                  <span>{test.type}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6 shrink-0 w-full sm:w-auto text-xs text-text-muted">
              <div>
                <span>RESULT: </span>
                <span className={`font-bold ${isHigh ? 'text-sync-green' : isLow ? 'text-alert-red' : 'text-hazard-yellow'}`}>
                  {test.marksObtained}
                </span>
                <span>/{test.maxMarks}</span>
                <span className="text-[10px] text-text-dim"> ({scorePercent}%)</span>
              </div>

              <div className="flex gap-4">
                <span>PERCENTILE: <strong>{test.percentile ?? 'N/A'}</strong></span>
                <span>RANK: <strong>{test.rank ?? 'N/A'}</strong></span>
              </div>

              {test.analysisDone ? (
                <span className="text-[10px] text-sync-green bg-sync-green/10 border border-sync-green/20 px-2 py-0.5 rounded font-mono-tech uppercase">
                  RECORDED
                </span>
              ) : (
                <span className="text-[10px] text-alert-red bg-alert-red/10 border border-alert-red/20 px-2 py-0.5 rounded font-mono-tech uppercase animate-pulse">
                  PENDING
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onEdit(test)}
                className="p-1.5 text-text-dim hover:text-text-primary border border-border-subtle rounded cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(test.id)}
                className="p-1.5 text-alert-red/70 hover:text-alert-red border border-border-subtle hover:border-alert-red/30 rounded cursor-pointer"
              >
                <Trash className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
