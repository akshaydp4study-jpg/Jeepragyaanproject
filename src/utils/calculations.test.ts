import { describe, it, expect } from 'vitest';
import { calculateCountdown, calculatePace, calculateOverallStats, calculateTheoryCoverageProjection } from './calculations';
import type { Chapter, Lecture, AppSettings } from '../types';

describe('calculations utilities', () => {
  describe('calculateCountdown', () => {
    it('should correctly calculate days, hours, minutes, and seconds', () => {
      // 1 day, 2 hours, 3 minutes, 4 seconds
      const diffMs = (1 * 24 * 60 * 60 * 1000) + (2 * 60 * 60 * 1000) + (3 * 60 * 1000) + (4 * 1000);
      const currentTimeMs = Date.now();
      const targetTimeMs = currentTimeMs + diffMs;

      const result = calculateCountdown(targetTimeMs, currentTimeMs);
      
      expect(result.days).toBe(1);
      expect(result.hours).toBe(2);
      expect(result.minutes).toBe(3);
      expect(result.seconds).toBe(4);
      expect(result.difference).toBe(diffMs);
    });

    it('should handle dates in the past (targetTime < currentTime)', () => {
      const currentTimeMs = Date.now();
      const targetTimeMs = currentTimeMs - 10000; // 10 seconds in the past

      const result = calculateCountdown(targetTimeMs, currentTimeMs);
      
      expect(result.days).toBe(0);
      expect(result.hours).toBe(0);
      expect(result.minutes).toBe(0);
      expect(result.seconds).toBe(0);
      expect(result.difference).toBe(-10000);
    });
  });

  describe('calculatePace', () => {
    it('should calculate the correct hours per day', () => {
      const currentTimeMs = Date.now();
      const targetTimeMs = currentTimeMs + (10 * 24 * 60 * 60 * 1000); // 10 days away
      const totalHoursRemaining = 50; // 50 hours left

      const result = calculatePace(targetTimeMs, currentTimeMs, totalHoursRemaining);
      
      // Math.ceil of (10 days in MS / MS per day) -> 10 days
      expect(result.daysToPhase1).toBe(10);
      expect(result.paceHoursPerDay).toBe(5); // 50 / 10 = 5
    });

    it('should return 0 when target date is in the past', () => {
      const currentTimeMs = Date.now();
      const targetTimeMs = currentTimeMs - (2 * 24 * 60 * 60 * 1000); // 2 days ago
      const totalHoursRemaining = 50;

      const result = calculatePace(targetTimeMs, currentTimeMs, totalHoursRemaining);
      
      expect(result.daysToPhase1).toBe(0);
      expect(result.paceHoursPerDay).toBe(0);
    });

    it('should correctly ceil partial days', () => {
      const currentTimeMs = Date.now();
      const targetTimeMs = currentTimeMs + (1.5 * 24 * 60 * 60 * 1000); // 1.5 days away
      const totalHoursRemaining = 10;

      const result = calculatePace(targetTimeMs, currentTimeMs, totalHoursRemaining);
      
      expect(result.daysToPhase1).toBe(2);
      expect(result.paceHoursPerDay).toBe(5); // 10 / 2 = 5
    });
  });

  describe('calculateOverallStats', () => {
    it('should calculate weighted completion percentage correctly', () => {
      const chapters: Chapter[] = [
        { id: 'phy-1', subject: 'Physics', slNo: 1, chapterName: 'Physics 1', totalLectures: 4, durationHours: 10 },
        { id: 'mat-1', subject: 'Maths', slNo: 1, chapterName: 'Maths 1', totalLectures: 5 },
      ];
      
      const lectures: Lecture[] = [
        { id: 'phy-1-L1', chapterId: 'phy-1', lectureNumber: 1, completed: true, completedAt: null },
        { id: 'phy-1-L2', chapterId: 'phy-1', lectureNumber: 2, completed: true, completedAt: null },
        { id: 'phy-1-L3', chapterId: 'phy-1', lectureNumber: 3, completed: false, completedAt: null },
        { id: 'phy-1-L4', chapterId: 'phy-1', lectureNumber: 4, completed: false, completedAt: null },
        { id: 'mat-1-L1', chapterId: 'mat-1', lectureNumber: 1, completed: true, completedAt: null },
      ];

      const settings: AppSettings = {
        id: 'singleton',
        chemPreferredSpeed: '1x',
        mathsAvgLectureMinutes: 120, // 2 hours per lecture
        theoryPlanStartDate: '2026-07-04',
      };

      const result = calculateOverallStats(chapters, lectures, settings);

      // Physics logic:
      // total lectures: 4. completed: 2.
      // total hours: 10. completed hours: (2/4) * 10 = 5.
      expect(result.physics.totalLectures).toBe(4);
      expect(result.physics.completedLectures).toBe(2);
      expect(result.physics.totalHours).toBe(10);
      expect(result.physics.completedHours).toBe(5);
      expect(result.physics.percentage).toBe(50);

      // Maths logic:
      // total lectures: 5. completed: 1.
      // total hours: 5 * (120/60) = 10.
      // completed hours: (1/5) * 10 = 2.
      expect(result.maths.totalLectures).toBe(5);
      expect(result.maths.completedLectures).toBe(1);
      expect(result.maths.totalHours).toBe(10);
      expect(result.maths.completedHours).toBe(2);
      expect(result.maths.percentage).toBe(20);

      // Overall:
      // total lectures: 9. completed: 3.
      // total hours: 20. completed hours: 7.
      // percentage: 7 / 20 * 100 = 35.
      expect(result.totalLectures).toBe(9);
      expect(result.completedLectures).toBe(3);
      expect(result.totalHours).toBe(20);
      expect(result.completedHours).toBe(7);
      expect(result.overallPercentage).toBe(35);
    });
  });

  describe('calculateTheoryCoverageProjection', () => {
    it('compares planned coverage with actual lectures and projects the finish date', () => {
      const result = calculateTheoryCoverageProjection(
        '2026-01-01',
        '2026-01-10',
        new Date(2026, 0, 5, 12, 0, 0),
        100,
        40,
      );

      expect(result.totalPlanDays).toBe(10);
      expect(result.elapsedPlanDays).toBe(5);
      expect(result.plannedPercentage).toBe(50);
      expect(result.plannedLectures).toBe(50);
      expect(result.actualPercentage).toBe(40);
      expect(result.lectureGap).toBe(-10);
      expect(result.actualLecturesPerDay).toBe(8);
      expect(result.projectedCompletionDate).toBe('2026-01-13');
      expect(result.projectedDaysFromTarget).toBe(3);
      expect(result.status).toBe('behind');
    });

    it('handles a plan that has not started yet', () => {
      const result = calculateTheoryCoverageProjection(
        '2026-02-01',
        '2026-02-10',
        new Date(2026, 0, 20, 12, 0, 0),
        100,
        0,
      );

      expect(result.elapsedPlanDays).toBe(0);
      expect(result.plannedPercentage).toBe(0);
      expect(result.projectedCompletionDate).toBeNull();
      expect(result.status).toBe('not-started');
    });

    it('reports completed theory as complete', () => {
      const result = calculateTheoryCoverageProjection(
        '2026-01-01',
        '2026-01-10',
        new Date(2026, 0, 8, 12, 0, 0),
        100,
        100,
      );

      expect(result.actualPercentage).toBe(100);
      expect(result.status).toBe('complete');
      expect(result.projectedCompletionDate).toBe('2026-01-08');
      expect(result.projectedDaysFromTarget).toBe(-2);
    });
  });

});
