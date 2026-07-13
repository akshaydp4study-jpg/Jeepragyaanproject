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
    <div className="space-y-3 font-serif select-none">
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
            className="bg-bg-panel border-2 border-text-primary hover:shadow-[4px_4px_0px_#2a2a30] p-4 rounded-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all"
          >
            {/* Information Block */}
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <span className="w-6 h-6 bg-hazard-yellow border border-text-primary text-bg-void font-bold flex items-center justify-center text-xs font-mono-tech shrink-0 rotate-45">
                <span className="-rotate-45 font-orbitron">{index + 1}</span>
              </span>
              <div className="min-w-0 font-sans">
                <h4 className="text-base font-bold text-text-primary uppercase tracking-tight truncate">
                  {test.name}
                </h4>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted font-mono-tech mt-0.5 uppercase">
                  <span>SOURCE: {test.source}</span>
                  <span>&bull;</span>
                  <span>TYPE: {test.type}</span>
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 w-full sm:w-auto font-sans shrink-0">
              <div className="flex gap-4 text-xs font-mono-tech uppercase">
                <div>
                  <span className="text-text-muted block text-[9px] font-bold">SCORE RATIO</span>
                  <strong className="text-text-primary text-sm font-bold">
                    <span className={isHigh ? 'text-sync-green' : isLow ? 'text-alert-red' : 'text-hazard-yellow'}>
                      {test.marksObtained}
                    </span>
                    /{test.maxMarks}
                  </strong>
                </div>
                <div className="border-l border-border-subtle pl-4">
                  <span className="text-text-muted block text-[9px] font-bold">PERCENTILE</span>
                  <strong className="text-text-primary text-sm font-bold">{test.percentile ?? 'N/A'}</strong>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {test.analysisDone ? (
                  <span className="text-[10px] font-bold text-sync-green bg-sync-green/10 border border-sync-green/20 px-2 py-0.5 rounded uppercase font-mono-tech">
                    RECORD VALIDATED
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-alert-red bg-alert-red/10 border border-alert-red/20 px-2 py-0.5 rounded uppercase font-mono-tech animate-pulse flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    PENDING EVAL
                  </span>
                )}
                {test.pdfAttachmentId && (
                  <span className="text-[9px] border border-border-subtle px-1 rounded uppercase font-mono-tech text-text-muted flex items-center gap-0.5">
                    <FileText className="w-3 h-3 text-nerv-orange" />
                    <span>PDF</span>
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex sm:flex-col justify-end gap-2 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-border-subtle/50">
              <button
                onClick={() => onEdit(test)}
                className="p-1.5 text-text-muted hover:text-text-primary border border-text-primary rounded hover:bg-bg-panel-raised transition-colors flex-1 sm:flex-initial flex justify-center items-center cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(test.id)}
                className="p-1.5 text-alert-red/70 hover:text-alert-red border border-text-primary hover:border-alert-red/30 rounded hover:bg-alert-red/5 transition-colors flex-1 sm:flex-initial flex justify-center items-center cursor-pointer"
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
