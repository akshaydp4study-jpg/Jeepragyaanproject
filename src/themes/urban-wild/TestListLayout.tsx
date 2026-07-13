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
  const cardVariants: any = {
    hidden: { opacity: 0, y: 15 },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: (index % 10) * 0.04,
        duration: 0.35,
        ease: 'easeOut',
      },
    }),
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {tests.map((test, index) => {
        const scorePercent = Math.round((test.marksObtained / test.maxMarks) * 100);
        const isHigh = scorePercent >= 75;
        const isLow = scorePercent < 45;

        return (
          <motion.div
            key={test.id}
            variants={prefersReducedMotion ? {} : cardVariants}
            initial={prefersReducedMotion ? "visible" : "hidden"}
            whileInView={prefersReducedMotion ? "visible" : "visible"}
            viewport={{ once: true, margin: "-20px" }}
            custom={index}
            className="bg-bg-panel border border-border-subtle hover:border-sync-green rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all hover:shadow-sm"
          >
            <div>
              <div className="flex justify-between items-start gap-2">
                <div>
                  <h4 className="text-sm font-extrabold text-text-primary uppercase tracking-tight">
                    {test.name}
                  </h4>
                  <span className="text-[9px] font-bold text-text-dim uppercase tracking-wider mt-0.5 block">
                    SOURCE: {test.source} &bull; {test.type}
                  </span>
                </div>
                {test.pdfAttachmentId && (
                  <span className="bg-sync-green/10 text-sync-green text-[9px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-0.5">
                    <FileText className="w-3 h-3" />
                    <span>PDF</span>
                  </span>
                )}
              </div>

              <div className="flex justify-between items-center bg-bg-void/40 p-3 rounded-xl mt-4 text-xs font-mono-tech">
                <div>
                  <span className="text-text-muted block text-[9px] uppercase font-bold">SCORE RATIO</span>
                  <span className="font-bold">
                    <span className={isHigh ? 'text-sync-green' : isLow ? 'text-alert-red' : 'text-hazard-yellow'}>
                      {test.marksObtained}
                    </span>
                    <span className="text-text-dim">/{test.maxMarks}</span>
                  </span>
                  <span className="text-text-dim ml-1">({scorePercent}%)</span>
                </div>
                <div className="border-l border-border-subtle pl-4">
                  <span className="text-text-muted block text-[9px] uppercase font-bold">METRICS</span>
                  <span>PCT: <strong>{test.percentile ?? 'N/A'}</strong> &bull; RNK: <strong>{test.rank ?? 'N/A'}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-border-subtle/50 text-[11px] text-text-dim">
              <div className="flex items-center gap-1.5 font-mono-tech">
                <Calendar className="w-3.5 h-3.5 text-text-dim" />
                <span>{new Date(test.date).toLocaleDateString()}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onEdit(test)}
                  className="p-1.5 text-text-muted hover:text-text-primary border border-border-subtle rounded-xl hover:bg-bg-panel-raised transition-colors cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDelete(test.id)}
                  className="p-1.5 text-alert-red/70 hover:text-alert-red border border-border-subtle hover:border-alert-red/30 rounded-xl hover:bg-alert-red/5 transition-colors cursor-pointer"
                >
                  <Trash className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
