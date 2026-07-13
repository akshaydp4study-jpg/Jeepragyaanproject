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
  handleDtsToggle,
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
        const dtsCompletedCount = chapLectures.filter(l => l.dtsCompleted).length;
        const dtsPendingCount = Math.max(0, chapLectures.length - dtsCompletedCount);
        const percentage = chapLectures.length > 0 ? (completedCount / chapLectures.length) * 100 : 0;
        const dtsPercentage = chapLectures.length > 0 ? (dtsCompletedCount / chapLectures.length) * 100 : 0;
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
            className={`bg-bg-panel border rounded overflow-hidden transition-all duration-300 ${
              isExpanded ? 'border-nerv-orange' : 'border-border-subtle hover:border-text-dim'
            }`}
          >
            {/* Chapter Card Header */}
            <div
              onClick={() => setExpandedChapterId(isExpanded ? null : chapter.id)}
              className="p-4 flex items-center justify-between gap-4 cursor-pointer select-none transition-colors hover:bg-bg-panel-raised"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="text-xs font-mono-tech text-text-dim font-bold bg-bg-void border border-border-subtle px-2 py-1 rounded">
                  CH-{String(chapter.slNo).padStart(2, '0')}
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold tracking-wider text-text-primary font-orbitron uppercase truncate">
                    {chapter.chapterName}
                  </h4>
                  <div className="flex items-center gap-4 text-[11px] font-mono-tech text-text-muted mt-1">
                    <span>
                      LECTURES: <strong className="text-text-primary">{completedCount}/{chapter.totalLectures}</strong>
                    </span>
                    <span>
                      DTS: <strong className="text-text-primary">{dtsCompletedCount}/{chapter.totalLectures}</strong>
                    </span>
                    <span>
                      DTS PENDING: <strong className="text-hazard-yellow">{dtsPendingCount}</strong>
                    </span>
                    <span>
                      CHAPTER DTS: <strong className="text-sync-green">{dtsPercentage.toFixed(1)}%</strong>
                    </span>
                    {totalHours > 0 && (
                      <span>
                        HOURS T-REMAINING: <strong className="text-sync-green">{remainingHours.toFixed(2)}h</strong> / {totalHours.toFixed(2)}h
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <SyncRing percentage={percentage} size={48} strokeWidth={4} label="" />
                <button className="text-text-muted p-1">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Checklist Expansion Panel */}
            {isExpanded && (
              <div className="border-t border-border-subtle bg-bg-void/40 p-4">
                {/* Chapter action bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-bg-panel p-3 border border-border-subtle rounded mb-4 text-xs">
                  <span className="font-mono-tech text-text-muted uppercase">
                    SECTOR CHECKSUM SYSTEM OVERRIDE
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openBulkConfirm(chapter.id, 'complete');
                      }}
                      className="px-3 py-1 bg-sync-green/10 border border-sync-green/30 hover:border-sync-green text-sync-green font-bold uppercase tracking-wider text-[10px] rounded transition-colors cursor-pointer"
                    >
                      MARK ALL COMPLETE
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openBulkConfirm(chapter.id, 'reset');
                      }}
                      className="px-3 py-1 bg-alert-red/10 border border-alert-red/30 hover:border-alert-red text-alert-red font-bold uppercase tracking-wider text-[10px] rounded transition-colors cursor-pointer"
                    >
                      RESET ALL
                    </button>
                  </div>
                </div>

                {/* Checkbox Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  {chapLectures.map((lecture) => (
                    <div
                      key={lecture.id}
                      className="flex flex-col gap-2 p-3 border rounded text-left transition-all min-h-[70px] bg-bg-panel-raised border-border-subtle text-text-muted"
                    >
                      <button
                        type="button"
                        onClick={() => handleToggle(lecture.id, lecture.completed)}
                        className={`flex items-center gap-2 text-left ${lecture.completed ? 'text-sync-green' : 'text-text-muted hover:text-text-primary'}`}
                        aria-pressed={lecture.completed}
                        aria-label={`Toggle lecture ${lecture.code ?? lecture.lectureNumber}`}
                      >
                        {lecture.completed ? (
                          <CheckSquare className="w-4 h-4 shrink-0 text-sync-green" />
                        ) : (
                          <Square className="w-4 h-4 shrink-0 text-text-dim" />
                        )}
                      <div className="min-w-0 flex-1 leading-none">
                        <span className="font-mono-tech text-xs block leading-none">
                          {lecture.code ?? `LEC-${String(lecture.lectureNumber).padStart(2, '0')}`}
                        </span>
                        {lecture.completedAt && (
                          <span className="text-[8px] opacity-40 font-mono-tech block mt-0.5 truncate">
                            {new Date(lecture.completedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDtsToggle(lecture.id, Boolean(lecture.dtsCompleted))}
                        className={`flex items-center gap-2 text-left text-[10px] font-mono-tech uppercase ${lecture.dtsCompleted ? 'text-sync-green' : 'text-hazard-yellow hover:text-text-primary'}`}
                        aria-pressed={Boolean(lecture.dtsCompleted)}
                        aria-label={`Toggle DTS ${lecture.code ?? lecture.lectureNumber}`}
                      >
                        {lecture.dtsCompleted ? <CheckSquare className="w-3.5 h-3.5 shrink-0" /> : <Square className="w-3.5 h-3.5 shrink-0" />}
                        DTS
                      </button>
                    </div>
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
