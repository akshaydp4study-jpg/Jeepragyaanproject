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
        duration: 0.4,
        ease: 'easeOut',
      },
    }),
  };

  return (
    <div className="space-y-4">
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
            className={`bg-bg-panel border-2 rounded-lg overflow-hidden transition-all duration-300 ${
              isExpanded ? 'border-nerv-orange' : 'border-border-subtle hover:border-text-primary'
            }`}
          >
            {/* Chapter Header with Large Bold Numbering */}
            <div
              onClick={() => setExpandedChapterId(isExpanded ? null : chapter.id)}
              className="p-5 flex items-center justify-between gap-4 cursor-pointer select-none hover:bg-bg-panel-raised transition-colors"
            >
              <div className="flex items-center gap-5 min-w-0">
                <div className="text-3xl font-black font-orbitron text-text-dim shrink-0 leading-none">
                  #{String(index + 1).padStart(2, '0')}
                </div>
                <div className="min-w-0">
                  <h4 className="text-base font-bold tracking-tight text-text-primary font-orbitron uppercase truncate">
                    {chapter.chapterName}
                  </h4>
                  <div className="flex items-center gap-4 text-[11px] font-mono-tech text-text-muted mt-1 uppercase">
                    <span>
                      LECTURES: <strong className="text-text-primary">{completedCount}/{chapter.totalLectures}</strong>
                    </span>
                    {totalHours > 0 && (
                      <span>
                        HOURS LEFT: <strong className="text-sync-green">{remainingHours.toFixed(1)}h</strong> / {totalHours.toFixed(1)}h
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <SyncRing percentage={percentage} size={42} strokeWidth={4} label="" />
                <button className="text-text-muted p-1 cursor-pointer">
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-nerv-orange" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Checklist Drawer */}
            {isExpanded && (
              <div className="border-t-2 border-border-subtle bg-bg-void/30 p-5 space-y-4">
                {/* Control Action Buttons */}
                <div className="flex items-center justify-between gap-4 bg-bg-panel p-3 border border-border-subtle rounded-lg text-xs">
                  <span className="font-mono-tech font-bold text-text-dim">
                    OVERRIDE ACTIONS:
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openBulkConfirm(chapter.id, 'complete');
                      }}
                      className="px-3 py-1 bg-sync-green text-bg-void font-bold uppercase tracking-wider text-[10px] rounded hover:opacity-90 transition-opacity cursor-pointer"
                    >
                      MARK ALL COMPLETE
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openBulkConfirm(chapter.id, 'reset');
                      }}
                      className="px-3 py-1 bg-alert-red text-text-primary font-bold uppercase tracking-wider text-[10px] rounded hover:opacity-90 transition-opacity cursor-pointer"
                    >
                      RESET ALL
                    </button>
                  </div>
                </div>

                {/* Checkbox Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {chapLectures.map((lecture) => (
                    <button
                      key={lecture.id}
                      onClick={() => handleToggle(lecture.id, lecture.completed)}
                      className={`flex items-center gap-2 p-3 border-2 rounded text-left transition-all cursor-pointer min-h-[44px] ${
                        lecture.completed
                          ? 'bg-sync-green/10 border-sync-green text-sync-green'
                          : 'bg-bg-panel-raised border-border-subtle text-text-muted hover:border-text-dim'
                      }`}
                    >
                      {lecture.completed ? (
                        <CheckSquare className="w-4 h-4 shrink-0 text-sync-green" />
                      ) : (
                        <Square className="w-4 h-4 shrink-0 text-text-dim" />
                      )}
                      <div className="min-w-0 flex-1 leading-none">
                        <span className="font-mono-tech text-xs font-bold block leading-none">
                          {lecture.code ?? `LEC-${String(lecture.lectureNumber).padStart(2, '0')}`}
                        </span>
                        {lecture.completedAt && (
                          <span className="text-[8px] opacity-50 font-mono-tech block mt-0.5 truncate">
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
