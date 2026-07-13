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
    hidden: { opacity: 0, y: 10 },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: (index % 10) * 0.04,
        duration: 0.3,
        ease: 'easeOut',
      },
    }),
  };

  return (
    <div className="space-y-2 font-mono-tech">
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
            className={`bg-bg-panel border border-border-subtle overflow-hidden rounded-sm transition-all ${
              isExpanded ? 'bg-bg-panel-raised' : 'hover:bg-bg-panel-raised/50'
            }`}
          >
            <div
              onClick={() => setExpandedChapterId(isExpanded ? null : chapter.id)}
              className="p-3.5 flex items-center justify-between gap-4 cursor-pointer select-none"
            >
              <div className="flex items-center gap-4 min-w-0">
                <span className="text-xs font-bold text-text-muted">
                  #{String(chapter.slNo).padStart(2, '0')}
                </span>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider truncate">
                    {chapter.chapterName}
                  </h4>
                  <div className="flex gap-4 text-[10px] text-text-dim mt-0.5">
                    <span>LEC: {completedCount}/{chapter.totalLectures}</span>
                    <span>T-REMAINING: {remainingHours.toFixed(1)}h</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <SyncRing percentage={percentage} size={36} strokeWidth={3} label="" />
                <button className="text-text-muted p-1">
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {isExpanded && (
              <div className="border-t border-border-subtle bg-bg-void/10 p-4 space-y-3">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-text-dim">OVERRIDE COMMANDS:</span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openBulkConfirm(chapter.id, 'complete');
                      }}
                      className="px-2 py-0.5 border border-sync-green/30 bg-sync-green/5 text-sync-green hover:bg-sync-green/10 rounded cursor-pointer uppercase text-[9px]"
                    >
                      MARK ALL COMPLETED
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openBulkConfirm(chapter.id, 'reset');
                      }}
                      className="px-2 py-0.5 border border-alert-red/30 bg-alert-red/5 text-alert-red hover:bg-alert-red/10 rounded cursor-pointer uppercase text-[9px]"
                    >
                      RESET ALL
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  {chapLectures.map((lecture) => (
                    <button
                      key={lecture.id}
                      onClick={() => handleToggle(lecture.id, lecture.completed)}
                      className={`flex items-center gap-2 p-2 border text-left transition-all cursor-pointer min-h-[38px] ${
                        lecture.completed
                          ? 'border-sync-green bg-sync-green/5 text-sync-green'
                          : 'border-border-subtle bg-bg-panel hover:bg-bg-panel-raised text-text-muted'
                      }`}
                    >
                      {lecture.completed ? (
                        <CheckSquare className="w-3.5 h-3.5 shrink-0 text-sync-green" />
                      ) : (
                        <Square className="w-3.5 h-3.5 shrink-0 text-text-dim" />
                      )}
                      <div className="min-w-0 flex-1 leading-none text-[11px]">
                        <span className="block font-bold">{lecture.code ?? `LEC-${lecture.lectureNumber}`}</span>
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
