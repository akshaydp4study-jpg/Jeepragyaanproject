import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import type { Chapter, Lecture, ProblemSession, Test, ExamConfig, AppSettings } from '../types';
import { calculateOverallStats } from '../utils/calculations';

export function useAppSettings(): AppSettings | undefined {
  return useLiveQuery(() => db.appSettings.get('singleton'));
}

export function useExamConfig(): ExamConfig | undefined {
  return useLiveQuery(() => db.examConfig.get('singleton'));
}

export function useChapters(subject?: 'Physics' | 'Chemistry' | 'Maths'): Chapter[] {
  return useLiveQuery(async () => {
    if (subject) {
      return db.chapters.where('subject').equals(subject).sortBy('slNo');
    }
    return db.chapters.orderBy('slNo').toArray();
  }, [subject]) || [];
}

export function useLectures(chapterId?: string): Lecture[] {
  return useLiveQuery(async () => {
    if (chapterId) {
      return db.lectures.where('chapterId').equals(chapterId).sortBy('lectureNumber');
    }
    return db.lectures.toArray();
  }, [chapterId]) || [];
}

export function useProblemSessions(): ProblemSession[] {
  return useLiveQuery(() => db.problemSessions.orderBy('sessionNumber').toArray()) || [];
}

export function useAllTests(): Test[] {
  return useLiveQuery(() => db.tests.orderBy('date').reverse().toArray()) || [];
}

// Compute comprehensive metrics (Weighted by Hours)
export interface SubjectStats {
  subject: 'Physics' | 'Chemistry' | 'Maths';
  totalLectures: number;
  completedLectures: number;
  totalHours: number;
  completedHours: number;
  percentage: number;
}

export interface AppOverallStats {
  physics: SubjectStats;
  chemistry: SubjectStats;
  maths: SubjectStats;
  totalLectures: number;
  completedLectures: number;
  totalHours: number;
  completedHours: number;
  overallPercentage: number;
}

export function useOverallStats(): AppOverallStats | null {
  const chapters = useChapters();
  const lectures = useLectures();
  const settings = useAppSettings();

  if (!chapters.length || !lectures.length || !settings) {
    return null;
  }

  return calculateOverallStats(chapters, lectures, settings);
}
