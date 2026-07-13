import { describe, it, expect, beforeEach } from 'vitest';
import { db } from './db';
import { seedDatabase } from './seed';
import { PHYSICS_SEED, MATHS_SEED, CHEMISTRY_SEED } from './seedData';

describe('seedDatabase', () => {
  beforeEach(async () => {
    // Clear database before each test
    await db.chapters.clear();
    await db.lectures.clear();
    await db.problemSessions.clear();
    await db.examConfig.clear();
    await db.appSettings.clear();
    await db.tests.clear();
  });

  it('should seed the database correctly on the first run', async () => {
    await seedDatabase();

    const config = await db.examConfig.get('singleton');
    expect(config).toBeDefined();

    const settings = await db.appSettings.get('singleton');
    expect(settings).toBeDefined();

    const chapters = await db.chapters.toArray();
    expect(chapters.length).toBe(PHYSICS_SEED.length + MATHS_SEED.length + CHEMISTRY_SEED.length);

    const lectures = await db.lectures.toArray();
    
    // Calculate expected total lectures
    const expectedTotalLectures = [...PHYSICS_SEED, ...MATHS_SEED, ...CHEMISTRY_SEED]
      .reduce((total, chapter) => total + chapter.lectures.length, 0);

    expect(expectedTotalLectures).toBe(295);
    expect(lectures.length).toBe(expectedTotalLectures);

    const problemSessions = await db.problemSessions.toArray();
    expect(problemSessions.length).toBe(48);
    expect(problemSessions[0].title).toBe('Problem Solving Session 01');
  });

  it('should be idempotent (not create duplicates on second run)', async () => {
    // First run
    await seedDatabase();
    const chaptersCountFirst = await db.chapters.count();
    const lecturesCountFirst = await db.lectures.count();
    const sessionsCountFirst = await db.problemSessions.count();

    // Modify a value to ensure it is not overwritten if we don't want it to be
    // Actually the seed function just checks if chapter exists
    // Let's just run it again
    await seedDatabase();
    
    const chaptersCountSecond = await db.chapters.count();
    const lecturesCountSecond = await db.lectures.count();
    const sessionsCountSecond = await db.problemSessions.count();

    expect(chaptersCountSecond).toBe(chaptersCountFirst);
    expect(lecturesCountSecond).toBe(lecturesCountFirst);
    expect(sessionsCountSecond).toBe(sessionsCountFirst);
  });

  it('backfills the theory start date without overwriting existing settings', async () => {
    await db.appSettings.put({
      id: 'singleton',
      mathsAvgLectureMinutes: 135,
      chemPreferredSpeed: '1.5x',
      activeThemeId: 'urban-wild',
    } as any);

    await seedDatabase();

    const settings = await db.appSettings.get('singleton');
    expect(settings?.theoryPlanStartDate).toBe('2026-07-04');
    expect(settings?.mathsAvgLectureMinutes).toBe(135);
    expect(settings?.chemPreferredSpeed).toBe('1.5x');
    expect(settings?.activeThemeId).toBe('urban-wild');
  });

});
