import type { Chapter, Lecture, AppSettings } from '../types';

export function calculateCountdown(targetTimeMs: number, currentTimeMs: number) {
  const difference = targetTimeMs - currentTimeMs;
  let days = 0, hours = 0, minutes = 0, seconds = 0;

  if (difference > 0) {
    days = Math.floor(difference / (1000 * 60 * 60 * 24));
    hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    seconds = Math.floor((difference % (1000 * 60)) / 1000);
  }

  return { days, hours, minutes, seconds, difference };
}

export function calculatePace(phase1TargetTimeMs: number, currentTimeMs: number, totalHoursRemaining: number) {
  const msToPhase1 = phase1TargetTimeMs - currentTimeMs;
  const daysToPhase1 = msToPhase1 > 0 ? Math.ceil(msToPhase1 / (1000 * 60 * 60 * 24)) : 0;
  
  const paceHoursPerDay = daysToPhase1 > 0 ? totalHoursRemaining / daysToPhase1 : 0;

  return { daysToPhase1, paceHoursPerDay };
}

// Re-export types here if needed, but they are imported from '../types'
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

export function calculateOverallStats(chapters: Chapter[], lectures: Lecture[], settings: AppSettings): AppOverallStats {
  // Create lookup for completed lectures count by chapterId
  const completedCountByChapter: Record<string, number> = {};
  lectures.forEach(l => {
    if (l.completed) {
      completedCountByChapter[l.chapterId] = (completedCountByChapter[l.chapterId] || 0) + 1;
    }
  });

  const stats: Record<'Physics' | 'Chemistry' | 'Maths', SubjectStats> = {
    Physics: { subject: 'Physics', totalLectures: 0, completedLectures: 0, totalHours: 0, completedHours: 0, percentage: 0 },
    Chemistry: { subject: 'Chemistry', totalLectures: 0, completedLectures: 0, totalHours: 0, completedHours: 0, percentage: 0 },
    Maths: { subject: 'Maths', totalLectures: 0, completedLectures: 0, totalHours: 0, completedHours: 0, percentage: 0 },
  };

  const speed = settings.chemPreferredSpeed || '1.25x';

  chapters.forEach(c => {
    const s = stats[c.subject];
    s.totalLectures += c.totalLectures;
    const completed = completedCountByChapter[c.id] || 0;
    s.completedLectures += completed;

    // Calculate Hours
    let chapterHours = 0;
    if (c.subject === 'Physics') {
      chapterHours = c.durationHours || 0;
    } else if (c.subject === 'Chemistry') {
      const chemSpeed = `x${speed.replace('x', '_')}` as 'x1' | 'x1_25' | 'x1_5' | 'x1_75' | 'x2';
      chapterHours = c.chemDurationHours ? (c.chemDurationHours[chemSpeed] || 0) : 0;
    } else if (c.subject === 'Maths') {
      // computed live
      chapterHours = c.totalLectures * (settings.mathsAvgLectureMinutes / 60);
    }

    s.totalHours += chapterHours;
    const completedRatio = c.totalLectures > 0 ? completed / c.totalLectures : 0;
    s.completedHours += completedRatio * chapterHours;
  });

  // Calculate percentages
  Object.keys(stats).forEach(k => {
    const s = stats[k as 'Physics' | 'Chemistry' | 'Maths'];
    s.percentage = s.totalHours > 0 ? (s.completedHours / s.totalHours) * 100 : 0;
  });

  const totalLectures = stats.Physics.totalLectures + stats.Chemistry.totalLectures + stats.Maths.totalLectures;
  const completedLectures = stats.Physics.completedLectures + stats.Chemistry.completedLectures + stats.Maths.completedLectures;
  const totalHours = stats.Physics.totalHours + stats.Chemistry.totalHours + stats.Maths.totalHours;
  const completedHours = stats.Physics.completedHours + stats.Chemistry.completedHours + stats.Maths.completedHours;
  const overallPercentage = totalHours > 0 ? (completedHours / totalHours) * 100 : 0;

  return {
    physics: stats.Physics,
    chemistry: stats.Chemistry,
    maths: stats.Maths,
    totalLectures,
    completedLectures,
    totalHours,
    completedHours,
    overallPercentage,
  };
}

const DAY_MS = 24 * 60 * 60 * 1000;

function parseIsoDateToUtcDay(dateString: string): number {
  const [year, month, day] = dateString.split('-').map(Number);
  if (!year || !month || !day) return Number.NaN;
  return Date.UTC(year, month - 1, day);
}

function currentLocalDateToUtcDay(currentTime: Date): number {
  return Date.UTC(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate());
}

function utcDayToIsoDate(utcDay: number): string {
  return new Date(utcDay).toISOString().slice(0, 10);
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

export type TheoryProjectionStatus = 'not-started' | 'ahead' | 'on-track' | 'behind' | 'complete';

export interface TheoryCoverageProjection {
  totalPlanDays: number;
  elapsedPlanDays: number;
  remainingPlanDays: number;
  plannedLectures: number;
  plannedPercentage: number;
  actualLectures: number;
  actualPercentage: number;
  lectureGap: number;
  actualLecturesPerDay: number;
  requiredLecturesPerDay: number;
  projectedCompletionDate: string | null;
  projectedDaysFromTarget: number | null;
  status: TheoryProjectionStatus;
}

/**
 * Compares a linear lecture plan against actual lecture completion.
 * Calendar days are inclusive so the start date and target date both count as usable study days.
 */
export function calculateTheoryCoverageProjection(
  theoryStartDate: string,
  theoryTargetDate: string,
  currentTime: Date,
  totalLectures: number,
  completedLectures: number,
): TheoryCoverageProjection {
  const startDay = parseIsoDateToUtcDay(theoryStartDate);
  const targetDay = parseIsoDateToUtcDay(theoryTargetDate);
  const today = currentLocalDateToUtcDay(currentTime);
  const safeTotalLectures = Math.max(0, totalLectures);
  const safeCompletedLectures = clamp(completedLectures, 0, safeTotalLectures);

  if (!Number.isFinite(startDay) || !Number.isFinite(targetDay) || targetDay < startDay) {
    return {
      totalPlanDays: 0,
      elapsedPlanDays: 0,
      remainingPlanDays: 0,
      plannedLectures: 0,
      plannedPercentage: 0,
      actualLectures: safeCompletedLectures,
      actualPercentage: safeTotalLectures > 0 ? (safeCompletedLectures / safeTotalLectures) * 100 : 0,
      lectureGap: safeCompletedLectures,
      actualLecturesPerDay: 0,
      requiredLecturesPerDay: 0,
      projectedCompletionDate: null,
      projectedDaysFromTarget: null,
      status: safeCompletedLectures >= safeTotalLectures && safeTotalLectures > 0 ? 'complete' : 'not-started',
    };
  }

  const totalPlanDays = Math.floor((targetDay - startDay) / DAY_MS) + 1;
  const elapsedSinceStartDays = today < startDay
    ? 0
    : Math.floor((today - startDay) / DAY_MS) + 1;
  const elapsedPlanDays = clamp(elapsedSinceStartDays, 0, totalPlanDays);
  const remainingPlanDays = today > targetDay
    ? 0
    : Math.floor((targetDay - Math.max(today, startDay)) / DAY_MS) + 1;

  const plannedPercentage = totalPlanDays > 0
    ? clamp((elapsedPlanDays / totalPlanDays) * 100, 0, 100)
    : 0;
  const plannedLectures = safeTotalLectures * (plannedPercentage / 100);
  const actualPercentage = safeTotalLectures > 0
    ? (safeCompletedLectures / safeTotalLectures) * 100
    : 0;
  const lectureGap = safeCompletedLectures - plannedLectures;
  const actualLecturesPerDay = elapsedSinceStartDays > 0
    ? safeCompletedLectures / elapsedSinceStartDays
    : 0;
  const remainingLectures = Math.max(0, safeTotalLectures - safeCompletedLectures);
  const requiredLecturesPerDay = remainingPlanDays > 0
    ? remainingLectures / remainingPlanDays
    : 0;

  let projectedCompletionDate: string | null = null;
  let projectedDaysFromTarget: number | null = null;

  if (safeTotalLectures > 0 && safeCompletedLectures >= safeTotalLectures) {
    projectedCompletionDate = utcDayToIsoDate(today);
    projectedDaysFromTarget = Math.round((today - targetDay) / DAY_MS);
  } else if (actualLecturesPerDay > 0) {
    const projectedDurationDays = Math.ceil(safeTotalLectures / actualLecturesPerDay);
    const projectedDay = startDay + Math.max(0, projectedDurationDays - 1) * DAY_MS;
    projectedCompletionDate = utcDayToIsoDate(projectedDay);
    projectedDaysFromTarget = Math.round((projectedDay - targetDay) / DAY_MS);
  }

  let status: TheoryProjectionStatus;
  if (safeTotalLectures > 0 && safeCompletedLectures >= safeTotalLectures) {
    status = 'complete';
  } else if (today < startDay) {
    status = 'not-started';
  } else if (lectureGap >= 1) {
    status = 'ahead';
  } else if (lectureGap <= -1) {
    status = 'behind';
  } else {
    status = 'on-track';
  }

  return {
    totalPlanDays,
    elapsedPlanDays,
    remainingPlanDays,
    plannedLectures,
    plannedPercentage,
    actualLectures: safeCompletedLectures,
    actualPercentage,
    lectureGap,
    actualLecturesPerDay,
    requiredLecturesPerDay,
    projectedCompletionDate,
    projectedDaysFromTarget,
    status,
  };
}
