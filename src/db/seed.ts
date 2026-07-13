import { db } from './db';
import {
  PHYSICS_SEED,
  MATHS_SEED,
  CHEMISTRY_SEED,
  EXAM_CONFIG_DEFAULT,
  APP_SETTINGS_DEFAULT,
  type ChapterSeed,
} from './seedData';
import type { Chapter, Lecture, ProblemSession } from '../types';

const BASE_LECTURE_HOURS = 2;

function chemistryDurationHours(totalLectures: number) {
  const baseHours = totalLectures * BASE_LECTURE_HOURS;
  return {
    x1: baseHours,
    x1_25: baseHours / 1.25,
    x1_5: baseHours / 1.5,
    x1_75: baseHours / 1.75,
    x2: baseHours / 2,
  };
}

async function seedSubject(
  subject: 'Physics' | 'Chemistry' | 'Maths',
  chapters: ChapterSeed[],
) {
  for (let index = 0; index < chapters.length; index += 1) {
    const seed = chapters[index];
    const totalLectures = seed.lectures.length;
    const chapterRecord: Chapter = {
      id: seed.id,
      subject,
      domain: subject === 'Chemistry' ? seed.domain : undefined,
      slNo: index + 1,
      chapterName: seed.chapterName,
      totalLectures,
      durationHours: subject === 'Physics' ? totalLectures * BASE_LECTURE_HOURS : undefined,
      chemDurationHours: subject === 'Chemistry' ? chemistryDurationHours(totalLectures) : undefined,
    };

    const existingChapter = await db.chapters.get(seed.id);
    if (!existingChapter) {
      await db.chapters.put(chapterRecord);
    }

    const lectureRows: Lecture[] = seed.lectures.map((lecture, lectureIndex) => ({
      id: `${seed.id}-lecture-${lectureIndex + 1}`,
      chapterId: seed.id,
      lectureNumber: lectureIndex + 1,
      code: lecture.code,
      title: lecture.title,
      completed: false,
      completedAt: null,
      dtsCompleted: false,
      dtsCompletedAt: null,
    }));

    const existingLectureIds = new Set(
      (await db.lectures.bulkGet(lectureRows.map((lecture) => lecture.id)))
        .filter((lecture): lecture is Lecture => Boolean(lecture))
        .map((lecture) => lecture.id),
    );
    const missingLectures = lectureRows.filter((lecture) => !existingLectureIds.has(lecture.id));
    if (missingLectures.length > 0) {
      await db.lectures.bulkAdd(missingLectures);
    }
  }
}

async function seedProblemSessions() {
  const rows: ProblemSession[] = Array.from({ length: 48 }, (_, index) => ({
    id: `problem-session-${String(index + 1).padStart(2, '0')}`,
    sessionNumber: index + 1,
    title: `Problem Solving Session ${String(index + 1).padStart(2, '0')}`,
    completed: false,
    completedAt: null,
  }));

  const existingIds = new Set(
    (await db.problemSessions.bulkGet(rows.map((row) => row.id)))
      .filter((row): row is ProblemSession => Boolean(row))
      .map((row) => row.id),
  );
  const missingRows = rows.filter((row) => !existingIds.has(row.id));
  if (missingRows.length > 0) {
    await db.problemSessions.bulkAdd(missingRows);
  }
}

export async function seedDatabase() {
  const configExists = await db.examConfig.get('singleton');
  if (!configExists) {
    await db.examConfig.put(EXAM_CONFIG_DEFAULT);
  }

  const settingsExists = await db.appSettings.get('singleton');
  if (!settingsExists) {
    await db.appSettings.put(APP_SETTINGS_DEFAULT);
  } else {
    await db.appSettings.update('singleton', {
      theoryPlanStartDate: settingsExists.theoryPlanStartDate || APP_SETTINGS_DEFAULT.theoryPlanStartDate,
      theoryTargetDate: settingsExists.theoryTargetDate || APP_SETTINGS_DEFAULT.theoryTargetDate,
      plannedLecturesPerDay: settingsExists.plannedLecturesPerDay ?? APP_SETTINGS_DEFAULT.plannedLecturesPerDay,
      physicsLecturesPerDay: settingsExists.physicsLecturesPerDay ?? APP_SETTINGS_DEFAULT.physicsLecturesPerDay,
      chemistryLecturesPerDay: settingsExists.chemistryLecturesPerDay ?? APP_SETTINGS_DEFAULT.chemistryLecturesPerDay,
      mathsLecturesPerDay: settingsExists.mathsLecturesPerDay ?? APP_SETTINGS_DEFAULT.mathsLecturesPerDay,
    });
  }

  await db.lectures.filter((lecture) => lecture.dtsCompleted === undefined).modify({
    dtsCompleted: false,
    dtsCompletedAt: null,
  });

  await seedSubject('Physics', PHYSICS_SEED);
  await seedSubject('Chemistry', CHEMISTRY_SEED);
  await seedSubject('Maths', MATHS_SEED);
  await seedProblemSessions();
}
