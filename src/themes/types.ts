import { Chapter, Lecture, Test, ExamConfig, AppSettings } from '../types';

export interface NavigationProps {
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
}

export interface DashboardCompositionProps {
  stats: any;
  examConfig: ExamConfig;
  settings: AppSettings;
  currentTime: Date;
  calculateCountdown: (targetTime: number, currentTime: number) => { days: number; hours: number; minutes: number; seconds: number; difference: number };
  calculatePace: (phaseEnd: number, current: number, remaining: number) => { daysToPhase1: number; paceHoursPerDay: number };
}

export interface ChapterListLayoutProps {
  chapters: Chapter[];
  lecturesByChapter: Record<string, Lecture[]>;
  getChapterHours: (chapter: Chapter) => number;
  expandedChapterId: string | null;
  setExpandedChapterId: (id: string | null) => void;
  handleToggle: (lectureId: string, currentStatus: boolean) => Promise<void>;
  handleDtsToggle: (lectureId: string, currentStatus: boolean) => Promise<void>;
  openBulkConfirm: (chapterId: string, action: 'complete' | 'reset') => void;
  prefersReducedMotion?: boolean;
}

export interface TestListLayoutProps {
  tests: Test[];
  onEdit: (test: Test) => void;
  onDelete: (id: string) => void;
  prefersReducedMotion?: boolean;
}
