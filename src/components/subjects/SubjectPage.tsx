import React, { useState } from 'react';
import { useChapters, useLectures, useAppSettings } from '../../hooks/useDbQueries';
import { toggleLecture, toggleLectureDts, bulkToggleLectures } from '../../data/dataAccess';
import SyncRing from '../common/SyncRing';
import { Search, ChevronDown, ChevronUp, CheckSquare, Square, Trash, AlertTriangle } from 'lucide-react';
import type { Chapter, Lecture } from '../../types';
import { motion } from 'motion/react';
import { useTheme } from '../../context/ThemeContext';
import { themeRegistry } from '../../themes/themeRegistry';

interface SubjectPageProps {
  subject: 'Physics' | 'Chemistry' | 'Maths';
}

export default function SubjectPage({ subject }: SubjectPageProps) {
  const chapters = useChapters(subject);
  const lectures = useLectures();
  const settings = useAppSettings();
  const { currentThemeId, prefersReducedMotion } = useTheme();
  const theme = themeRegistry[currentThemeId] || themeRegistry['nerv-terminal'];

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

  const [searchQuery, setSearchQuery] = useState('');
  const [domainTab, setDomainTab] = useState<'Physical' | 'Inorganic' | 'Organic'>('Physical');
  const [expandedChapterId, setExpandedChapterId] = useState<string | null>(null);
  
  // Bulk Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; chapterId: string | null; action: 'complete' | 'reset' }>({
    isOpen: false,
    chapterId: null,
    action: 'complete',
  });

  if (!settings) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-text-muted font-mono-tech animate-pulse">
        RE-CONNECTING SUB-SYSTEM DATA...
      </div>
    );
  }

  // Filter chapters by Domain for Chemistry
  let filteredChapters = chapters;
  if (subject === 'Chemistry') {
    filteredChapters = chapters.filter(c => c.domain === domainTab);
  }

  // Filter chapters by Search Query
  if (searchQuery.trim() !== '') {
    const q = searchQuery.toLowerCase();
    filteredChapters = filteredChapters.filter(c =>
      c.chapterName.toLowerCase().includes(q) ||
      `ch-${c.slNo}`.includes(q)
    );
  }

  // Group lectures by chapterId for quick lookup
  const lecturesByChapter: Record<string, Lecture[]> = {};
  lectures.forEach(l => {
    if (!lecturesByChapter[l.chapterId]) {
      lecturesByChapter[l.chapterId] = [];
    }
    lecturesByChapter[l.chapterId].push(l);
  });

  // Sort lectures inside each chapter by lectureNumber numerically
  Object.keys(lecturesByChapter).forEach(chapterId => {
    lecturesByChapter[chapterId].sort((a, b) => a.lectureNumber - b.lectureNumber);
  });

  const getChapterHours = (chapter: Chapter): number => {
    if (subject === 'Physics') {
      return chapter.durationHours || 0;
    }
    if (subject === 'Chemistry') {
      const prefSpeed = settings.chemPreferredSpeed || '1.25x';
      const key = `x${prefSpeed.replace('x', '_')}` as 'x1' | 'x1_25' | 'x1_5' | 'x1_75' | 'x2';
      return chapter.chemDurationHours ? (chapter.chemDurationHours[key] || 0) : 0;
    }
    // Maths (computed live)
    return chapter.totalLectures * (settings.mathsAvgLectureMinutes / 60);
  };

  const handleToggle = async (lectureId: string, currentStatus: boolean) => {
    await toggleLecture(lectureId, !currentStatus);
  };

  const handleDtsToggle = async (lectureId: string, currentStatus: boolean) => {
    await toggleLectureDts(lectureId, !currentStatus);
  };

  const openBulkConfirm = (chapterId: string, action: 'complete' | 'reset') => {
    setConfirmModal({ isOpen: true, chapterId, action });
  };

  const handleBulkAction = async () => {
    const { chapterId, action } = confirmModal;
    if (chapterId) {
      await bulkToggleLectures(chapterId, action === 'complete');
    }
    setConfirmModal({ isOpen: false, chapterId: null, action: 'complete' });
  };

  return (
    <div className="space-y-6 font-rajdhani select-none animate-fadeIn">
      {/* Subject Header - High Density Layout */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-subtle pb-6 lg:pb-3 lg:border-none">
        <div className="lg:hidden">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-nerv-orange rounded-full"></span>
            <span className="text-[10px] font-bold tracking-[0.25em] text-text-muted font-orbitron">CLASSIFICATION: SYLLABUS GRID</span>
          </div>
          <h2 className="text-3xl font-black font-orbitron tracking-widest text-text-primary mt-1 flex items-center gap-2">
            {subject.toUpperCase()}
          </h2>
        </div>

        {/* Search Field */}
        <div className="relative w-full md:w-80 ml-auto">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-dim">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="FILTER BY CHAPTER NAME..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
            className="w-full bg-bg-panel border border-border-subtle focus:border-nerv-orange rounded px-3 py-1.5 pl-9 text-xs font-mono-tech tracking-wider text-text-primary placeholder:text-text-dim outline-none transition-all uppercase"
          />
        </div>
      </div>

      {/* Chemistry Domain Tabs */}
      {subject === 'Chemistry' && (
        <div className="flex border-b border-border-subtle font-orbitron text-xs">
          {(['Physical', 'Inorganic', 'Organic'] as const).map(domain => {
            const isActive = domainTab === domain;
            return (
              <button
                key={domain}
                onClick={() => setDomainTab(domain)}
                className={`px-6 py-3 border-b-2 font-bold tracking-widest transition-all cursor-pointer ${
                  isActive
                    ? 'border-nerv-orange text-nerv-orange bg-nerv-orange/5'
                    : 'border-transparent text-text-muted hover:text-text-primary'
                }`}
              >
                {domain.toUpperCase()}
              </button>
            );
          })}
        </div>
      )}

      {/* Chapters Grid / Empty States */}
      {filteredChapters.length === 0 ? (
        <div className="text-center p-12 text-text-muted font-mono-tech border border-border-subtle rounded bg-bg-panel/30">
          SYSTEM SCAN COMPLETE: ZERO MATCHING CHAPTERS REGISTERED
        </div>
      ) : (
        <theme.ChapterListLayout
          chapters={filteredChapters}
          lecturesByChapter={lecturesByChapter}
          getChapterHours={getChapterHours}
          expandedChapterId={expandedChapterId}
          setExpandedChapterId={setExpandedChapterId}
          handleToggle={handleToggle}
          handleDtsToggle={handleDtsToggle}
          openBulkConfirm={openBulkConfirm}
          prefersReducedMotion={prefersReducedMotion}
        />
      )}


      {/* Confirmation Dialog Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-void/85 animate-fadeIn">
          <div className="bg-bg-panel border border-hazard-yellow w-full max-w-md rounded overflow-hidden shadow-2xl font-rajdhani">
            {/* Header / Hazard Striping */}
            <div className="h-1.5 hazard-stripe"></div>
            <div className="p-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 flex items-center justify-center rounded border border-hazard-yellow bg-hazard-yellow/15 text-hazard-yellow shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-md font-bold font-orbitron tracking-widest text-text-primary uppercase">
                    SYSTEM OVERRIDE CONFIRMATION REQUIRED
                  </h3>
                  <p className="text-sm text-text-muted mt-2 leading-relaxed">
                    You are attempting a bulk database modification across all lectures in this sector. This will rewrite lecture history records.
                  </p>
                  <div className="mt-4 p-3 bg-bg-void border border-border-subtle rounded font-mono-tech text-xs">
                    <div className="flex justify-between">
                      <span className="text-text-muted">OVERRIDE TARGET:</span>
                      <span className="text-text-primary font-bold">
                        {chapters.find(c => c.id === confirmModal.chapterId)?.chapterName.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-text-muted">DIRECTIVE:</span>
                      <span className={confirmModal.action === 'complete' ? 'text-sync-green font-bold' : 'text-alert-red font-bold'}>
                        {confirmModal.action === 'complete' ? 'BULK COMPLETE ALL LECTURES' : 'RESET ALL LECTURES TO PENDING'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  onClick={() => setConfirmModal({ isOpen: false, chapterId: null, action: 'complete' })}
                  className="px-4 py-1.5 border border-border-subtle text-text-muted hover:text-text-primary hover:bg-bg-panel-raised text-xs font-bold tracking-widest rounded transition-colors cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleBulkAction}
                  className={`px-4 py-1.5 font-bold tracking-widest text-xs uppercase rounded transition-all cursor-pointer border ${
                    confirmModal.action === 'complete'
                      ? 'bg-sync-green text-bg-void border-sync-green hover:bg-transparent hover:text-sync-green'
                      : 'bg-alert-red text-white border-alert-red hover:bg-transparent hover:text-alert-red'
                  }`}
                >
                  EXECUTE DIRECTIVE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
