import React from 'react';
import { Calendar, Trash, Edit, FileText, AlertCircle } from 'lucide-react';
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
    <div className="space-y-4 select-none">
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
            className="bg-bg-panel border-2 border-border-subtle hover:border-text-primary rounded-lg p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors font-sans"
          >
            {/* Left Section: Numbering & Basic Info */}
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className="text-3xl font-black font-orbitron text-text-dim shrink-0 leading-none">
                #{String(index + 1).padStart(2, '0')}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-base font-bold font-orbitron tracking-tight text-text-primary uppercase truncate max-w-xs">
                    {test.name}
                  </h4>
                  <span className="text-[9px] font-mono-tech px-2 py-0.5 bg-bg-void border border-border-subtle rounded text-text-dim font-bold uppercase shrink-0">
                    {test.type}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-text-muted mt-1 font-mono-tech uppercase">
                  <span>SOURCE: {test.source}</span>
                  <span>&bull;</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(test.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Section: Scores and Badges */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 shrink-0 w-full sm:w-auto">
              {/* Score Display */}
              <div className="bg-bg-void px-4 py-2 border border-border-subtle rounded flex flex-col items-center min-w-[90px]">
                <span className="text-[9px] font-mono-tech text-text-muted font-bold block leading-none uppercase">SCORE</span>
                <span className="font-mono-tech font-black text-sm mt-1 leading-none">
                  <span className={isHigh ? 'text-sync-green' : isLow ? 'text-alert-red' : 'text-hazard-yellow'}>
                    {test.marksObtained}
                  </span>
                  <span className="text-text-dim">/{test.maxMarks}</span>
                </span>
                <span className={`text-[9px] font-mono-tech font-bold mt-1 ${isHigh ? 'text-sync-green/80' : isLow ? 'text-alert-red/80' : 'text-hazard-yellow/80'}`}>
                  {scorePercent}%
                </span>
              </div>

              {/* Percentile and Rank Metrics */}
              <div className="flex gap-4 text-xs font-mono-tech">
                <div>
                  <span className="text-text-dim block text-[9px] uppercase font-bold">PERCENTILE</span>
                  <strong className="text-text-primary text-sm font-bold">{test.percentile !== null ? `${test.percentile}%` : 'N/A'}</strong>
                </div>
                <div className="border-l border-border-subtle/50 pl-4">
                  <span className="text-text-dim block text-[9px] uppercase font-bold">RANK</span>
                  <strong className="text-text-primary text-sm font-bold">{test.rank !== null ? test.rank : 'N/A'}</strong>
                </div>
              </div>

              {/* Status Tags */}
              <div className="flex items-center gap-2">
                {test.analysisDone ? (
                  <span className="text-[10px] font-orbitron font-bold text-sync-green bg-sync-green/10 px-2 py-1 rounded border border-sync-green/20 uppercase tracking-wider">
                    ANALYSED
                  </span>
                ) : (
                  <span className="text-[10px] font-orbitron font-bold text-alert-red bg-alert-red/10 px-2 py-1 rounded border border-alert-red/20 uppercase tracking-wider animate-pulse flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    PENDING EVAL
                  </span>
                )}
                {test.pdfAttachmentId && (
                  <span className="text-[10px] font-mono-tech text-text-muted border border-border-subtle px-1.5 py-0.5 rounded uppercase flex items-center gap-0.5">
                    <FileText className="w-3 h-3 text-nerv-orange" />
                    <span>PDF</span>
                  </span>
                )}
              </div>
            </div>

            {/* Right Section: Action Controls */}
            <div className="flex sm:flex-col justify-end gap-2 w-full sm:w-auto border-t sm:border-t-0 border-border-subtle/50 pt-3 sm:pt-0">
              <button
                onClick={() => onEdit(test)}
                className="p-2 text-text-muted hover:text-text-primary border border-border-subtle rounded hover:bg-bg-panel-raised transition-colors flex-1 sm:flex-initial flex justify-center items-center cursor-pointer"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(test.id)}
                className="p-2 text-alert-red/70 hover:text-alert-red border border-border-subtle hover:border-alert-red/30 rounded hover:bg-alert-red/5 transition-colors flex-1 sm:flex-initial flex justify-center items-center cursor-pointer"
              >
                <Trash className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
