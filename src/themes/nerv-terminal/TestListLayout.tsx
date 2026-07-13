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
    <div className="overflow-x-auto bg-bg-panel border border-border-subtle rounded-lg select-none">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-border-subtle bg-bg-panel-raised/50 font-orbitron font-bold tracking-widest text-text-muted">
            <th className="p-4">TEST PARAMETERS</th>
            <th className="p-4">DATE & CLASSIFICATION</th>
            <th className="p-4 text-center">SCORE SYNC</th>
            <th className="p-4 text-center">METRICS</th>
            <th className="p-4">COGNITIVE STATUS</th>
            <th className="p-4 text-right">SECURE CONTROL</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle font-rajdhani">
          {tests.map((test, index) => {
            const scorePercent = Math.round((test.marksObtained / test.maxMarks) * 100);
            const isHigh = scorePercent >= 75;
            const isLow = scorePercent < 45;

            return (
              <motion.tr
                key={test.id}
                variants={prefersReducedMotion ? {} : rowVariants}
                initial={prefersReducedMotion ? "visible" : "hidden"}
                whileInView={prefersReducedMotion ? "visible" : "visible"}
                viewport={{ once: true, margin: "-20px" }}
                custom={index}
                className="hover:bg-bg-panel-raised/40 transition-all"
              >
                {/* Name / Source */}
                <td className="p-4 max-w-xs">
                  <div className="font-bold text-text-primary font-orbitron uppercase tracking-wider truncate">
                    {test.name}
                  </div>
                  <div className="text-[10px] text-text-dim mt-0.5 font-mono-tech uppercase">
                    SOURCE: {test.source}
                  </div>
                </td>

                {/* Date / Type */}
                <td className="p-4">
                  <div className="flex items-center gap-1.5 text-text-muted font-mono-tech">
                    <Calendar className="w-3.5 h-3.5 text-text-dim" />
                    <span>{new Date(test.date).toLocaleDateString()}</span>
                  </div>
                  <div className="text-[10px] font-mono-tech text-text-dim mt-0.5 uppercase tracking-wider">
                    {test.type}
                  </div>
                </td>

                {/* Score */}
                <td className="p-4 text-center">
                  <div className="font-mono-tech font-black text-sm">
                    <span className={isHigh ? 'text-sync-green' : isLow ? 'text-alert-red' : 'text-hazard-yellow'}>
                      {test.marksObtained}
                    </span>
                    <span className="text-text-dim"> / {test.maxMarks}</span>
                  </div>
                  <div className={`text-[10px] font-mono-tech font-bold mt-0.5 ${isHigh ? 'text-sync-green/70' : isLow ? 'text-alert-red/70' : 'text-hazard-yellow/70'}`}>
                    {scorePercent}% SCORE
                  </div>
                </td>

                {/* Metrics */}
                <td className="p-4 text-center font-mono-tech">
                  <div className="flex justify-center gap-3 text-[11px]">
                    <div>
                      <span className="text-text-dim block">PCT:</span>
                      <strong className="text-text-primary">{test.percentile !== null ? `${test.percentile}%` : 'N/A'}</strong>
                    </div>
                    <div className="border-l border-border-subtle/50 pl-3">
                      <span className="text-text-dim block">RNK:</span>
                      <strong className="text-text-primary">{test.rank !== null ? test.rank : 'N/A'}</strong>
                    </div>
                  </div>
                </td>

                {/* Cognitive status */}
                <td className="p-4">
                  <div className="flex items-center gap-1.5">
                    {test.analysisDone ? (
                      <div className="flex items-center gap-1 text-sync-green font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-sync-green"></span>
                        <span className="text-[10px] uppercase font-orbitron">ANALYSED</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-alert-red font-bold animate-pulse">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span className="text-[10px] uppercase font-orbitron">PENDING EVAL</span>
                      </div>
                    )}
                    {test.pdfAttachmentId && (
                      <div className="flex items-center gap-0.5 text-text-muted bg-bg-panel-raised border border-border-subtle px-1 rounded text-[9px] font-mono-tech uppercase">
                        <FileText className="w-3 h-3 text-nerv-orange" />
                        <span>PDF</span>
                      </div>
                    )}
                  </div>
                  <div className="text-[10px] text-text-dim mt-1 font-mono-tech max-w-xs truncate uppercase">
                    {test.analysisNotes || 'NO CRITICAL ANNOTATIONS STORED'}
                  </div>
                </td>

                {/* Controls */}
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(test)}
                      className="p-1 text-text-muted hover:text-text-primary border border-border-subtle rounded hover:bg-bg-panel-raised transition-colors cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(test.id)}
                      className="p-1 text-alert-red/70 hover:text-alert-red border border-border-subtle hover:border-alert-red/30 rounded hover:bg-alert-red/5 transition-colors cursor-pointer"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
