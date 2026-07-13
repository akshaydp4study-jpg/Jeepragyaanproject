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
        delay: (index % 10) * 0.04,
        duration: 0.35,
        ease: 'easeOut',
      },
    }),
  };

  return (
    <div className="space-y-3 font-sans">
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
            className={`bg-bg-panel border border-border-subtle overflow-hidden rounded-md transition-all ${
              isExpanded ? 'border-nerv-orange' : 'hover:border-text-muted'
            }`}
          >
            <div
              onClick={() => setExpandedChapterId(isExpanded ? null : chapter.id)}
              className="p-4 flex items-center justify-between gap-4 cursor-pointer select-none"
            >
              <div className="flex items-center gap-4 min-w-0">
                <span className="w-5 h-5 bg-[#ff3838]/10 text-[#ff3838] border border-[#ff3838]/20 text-xs font-bold flex items-center justify-center rounded-full shrink-0">
                  {chapter.slNo}
                </span>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-text-primary uppercase tracking-wide truncate">
                    {chapter.chapterName}
                  </h4>
                  <div className="flex gap-4 text-xs text-text-muted mt-0.5">
                    <span>LECTURES: {completedCount}/{chapter.totalLectures}</span>
                    <span>REMAINING: {remainingHours.toFixed(1)}h</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <SyncRing percentage={percentage} size={38} strokeWidth={3.5} label="" />
                <button className="text-text-muted p-1">
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-nerv-orange" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {isExpanded && (
              <div className="border-t border-border-subtle bg-bg-void/5 p-4 space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-text-muted font-bold">STATION DIRECTIVES:</span>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openBulkConfirm(chapter.id, 'complete');
                      }}
                      className="px-3 py-1 bg-[#ff3838] hover:opacity-90 text-white font-bold rounded text-[10px] uppercase cursor-pointer"
                    >
                      MARK ALL FINALIZED
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openBulkConfirm(chapter.id, 'reset');
                      }}
                      className="px-3 py-1 bg-alert-red/10 text-alert-red border border-alert-red/20 font-bold rounded text-[10px] uppercase cursor-pointer"
                    >
                      RESET ALL
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
                  {chapLectures.map((lecture) => (
                    <button
                      key={lecture.id}
                      onClick={() => handleToggle(lecture.id, lecture.completed)}
                      className={`flex items-center gap-2 p-3 border rounded-md text-left transition-all cursor-pointer min-h-[44px] ${
                        lecture.completed
                          ? 'bg-sync-green/5 border-sync-green text-sync-green'
                          : 'bg-bg-panel border-border-subtle text-text-muted hover:border-text-dim'
                      }`}
                    >
                      {lecture.completed ? (
                        <CheckSquare className="w-4 h-4 shrink-0 text-sync-green" />
                      ) : (
                        <Square className="w-4 h-4 shrink-0 text-text-dim" />
                      )}
                      <div className="min-w-0 flex-1 leading-none font-mono-tech">
                        <span className="text-xs font-bold block leading-none">
                          {lecture.code ?? `LEC-${lecture.lectureNumber}`}
                        </span>
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
