import React from 'react';
import { ChevronUp, ChevronDown, CheckSquare, Square } from 'lucide-react';
import { motion } from 'motion/react';
import SyncRing from '../../components/common/SyncRing';
import type { ChapterListLayoutProps } from '../types';

export default function ChapterListLayout({
  chapters,
  lecturesByChapter,
  getChapterHours,
  expandedChapterId,
  setExpandedChapterId,
  handleToggle,
  openBulkConfirm,
  prefersReducedMotion = false,
}: ChapterListLayoutProps) {
  const cardVariants: any = {
    hidden: { opacity: 0, y: 15 },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: (index % 10) * 0.05,
        duration: 0.35,
        ease: 'easeOut',
      },
    }),
  };

  return (
    <div className="space-y-3">
      {chapters.map((chapter, index) => {
        const chapLectures = lecturesByChapter[chapter.id] || [];
        const completedCount = chapLectures.filter(l => l.completed).length;
        const percentage = chapLectures.length > 0 ? (completedCount / chapLectures.length) * 100 : 0;
        const isExpanded = expandedChapterId === chapter.id;

        const totalHours = getChapterHours(chapter);
        const remainingHours = totalHours * (1 - (completedCount / (chapter.totalLectures || 1)));

        return (
          <motion.div
            key={chapter.id}
            variants={prefersReducedMotion ? {} : cardVariants}
            initial={prefersReducedMotion ? "visible" : "hidden"}
            whileInView={prefersReducedMotion ? "visible" : "visible"}
            viewport={{ once: true, margin: "-50px" }}
            custom={index}
            className={`bg-bg-panel border border-border-subtle rounded-2xl overflow-hidden transition-all duration-300 ${
              isExpanded ? 'border-sync-green shadow-[0_4px_12px_rgba(57,255,20,0.04)]' : 'hover:border-text-muted hover:shadow-sm'
            }`}
          >
            {/* Header */}
            <div
              onClick={() => setExpandedChapterId(isExpanded ? null : chapter.id)}
              className="p-4 flex items-center justify-between gap-4 cursor-pointer select-none hover:bg-bg-panel-raised/50 transition-colors"
            >
              <div className="flex items-center gap-4 min-w-0">
                <span className="text-[11px] font-bold text-sync-green bg-sync-green/10 px-3 py-1 rounded-full uppercase font-mono-tech shrink-0">
                  CH {chapter.slNo}
                </span>
                <div className="min-w-0">
                  <h4 className="text-sm font-extrabold text-text-primary uppercase tracking-tight truncate">
                    {chapter.chapterName}
                  </h4>
                  <div className="flex items-center gap-3 text-[11px] text-text-muted mt-0.5">
                    <span>LECTURES: <strong>{completedCount}/{chapter.totalLectures}</strong></span>
                    {totalHours > 0 && (
                      <span className="text-sync-green">REMAINING: <strong>{remainingHours.toFixed(1)}h</strong></span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <SyncRing percentage={percentage} size={42} strokeWidth={4} label="" />
                <button className="text-text-muted p-1">
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-sync-green" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Checklist Box */}
            {isExpanded && (
              <div className="border-t border-border-subtle bg-bg-void/10 p-5 space-y-4">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-text-muted font-bold uppercase tracking-wider font-mono-tech">BATCH UPDATE SECTOR</span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openBulkConfirm(chapter.id, 'complete');
                      }}
                      className="px-3 py-1 bg-sync-green/10 hover:bg-sync-green/20 text-sync-green border border-sync-green/20 font-bold uppercase rounded-full text-[10px] transition-colors cursor-pointer"
                    >
                      COMPLETE ALL
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openBulkConfirm(chapter.id, 'reset');
                      }}
                      className="px-3 py-1 bg-alert-red/10 hover:bg-alert-red/20 text-alert-red border border-alert-red/20 font-bold uppercase rounded-full text-[10px] transition-colors cursor-pointer"
                    >
                      RESET
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
                  {chapLectures.map((lecture) => (
                    <button
                      key={lecture.id}
                      onClick={() => handleToggle(lecture.id, lecture.completed)}
                      className={`flex items-center gap-2 p-3 border rounded-xl text-left transition-all cursor-pointer min-h-[44px] ${
                        lecture.completed
                          ? 'bg-sync-green/10 border-sync-green text-sync-green'
                          : 'bg-bg-panel border-border-subtle text-text-muted hover:border-text-dim'
                      }`}
                    >
                      {lecture.completed ? (
                        <CheckSquare className="w-4 h-4 shrink-0 text-sync-green" />
                      ) : (
                        <Square className="w-4 h-4 shrink-0 text-text-dim" />
                      )}
                      <div className="min-w-0 flex-1 leading-none">
                        <span className="text-xs font-bold block leading-none font-mono-tech">
                          {lecture.code ?? `LEC-${lecture.lectureNumber}`}
                        </span>
                        {lecture.completedAt && (
                          <span className="text-[8px] opacity-60 font-mono-tech block mt-0.5 truncate">
                            {new Date(lecture.completedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
