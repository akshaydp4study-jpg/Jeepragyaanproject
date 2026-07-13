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
        delay: (index % 15) * 0.03,
        duration: 0.3,
        ease: 'easeOut',
      },
    }),
  };

  return (
    <div className="border border-border-subtle rounded-sm overflow-hidden divide-y divide-border-subtle select-none font-mono-tech">
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
            className="p-4 bg-bg-panel hover:bg-bg-panel-raised/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <span className="text-xs text-text-dim font-bold">
                [{String(index + 1).padStart(2, '0')}]
              </span>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider truncate">
                  {test.name}
                </h4>
                <div className="flex gap-3 text-[10px] text-text-dim uppercase mt-0.5">
                  <span>SRC: {test.source}</span>
                  <span>&bull;</span>
                  <span>{test.type}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 shrink-0 w-full sm:w-auto text-xs text-text-muted">
              <div>
                <span>SCORE: </span>
                <span className={`font-bold ${isHigh ? 'text-sync-green' : isLow ? 'text-alert-red' : 'text-hazard-yellow'}`}>
                  {test.marksObtained}
                </span>
                <span>/{test.maxMarks}</span>
                <span className="text-[10px] text-text-dim"> ({scorePercent}%)</span>
              </div>

              <div className="flex gap-3">
                <span>PCT: <strong>{test.percentile ?? 'N/A'}</strong></span>
                <span>RNK: <strong>{test.rank ?? 'N/A'}</strong></span>
              </div>

              {test.analysisDone ? (
                <span className="text-[9px] text-sync-green border border-sync-green/30 bg-sync-green/5 px-1 rounded">
                  ANALYSED
                </span>
              ) : (
                <span className="text-[9px] text-alert-red border border-alert-red/30 bg-alert-red/5 px-1 rounded animate-pulse">
                  PENDING
                </span>
              )}
            </div>

            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => onEdit(test)}
                className="p-1 text-text-dim hover:text-text-primary border border-border-subtle rounded-sm cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(test.id)}
                className="p-1 text-alert-red/70 hover:text-alert-red border border-border-subtle rounded-sm cursor-pointer"
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
