import Dexie, { type Table } from 'dexie';
import type { Chapter, Lecture, ProblemSession, Test, PdfAttachment, ExamConfig, AppSettings } from '../types';

export class ProjectZDatabase extends Dexie {
  chapters!: Table<Chapter, string>;
  lectures!: Table<Lecture, string>;
  problemSessions!: Table<ProblemSession, string>;
  tests!: Table<Test, string>;
  pdfAttachments!: Table<PdfAttachment, string>;
  examConfig!: Table<ExamConfig, string>;
  appSettings!: Table<AppSettings, string>;

  constructor() {
    super('AkshayPragyaanTracker');
    this.version(1).stores({
      chapters: 'id, subject, domain, slNo',
      lectures: 'id, chapterId, lectureNumber, completed',
      tests: 'id, date, *subjects, analysisDone',
      pdfAttachments: 'id, testId',
      examConfig: 'id',
      appSettings: 'id'
    });

    this.version(2).stores({
      chapters: 'id, subject, domain, slNo',
      lectures: 'id, chapterId, lectureNumber, completed',
      problemSessions: 'id, sessionNumber, completed',
      tests: 'id, date, *subjects, analysisDone',
      pdfAttachments: 'id, testId',
      examConfig: 'id',
      appSettings: 'id'
    });

    this.version(3).stores({
      chapters: 'id, subject, domain, slNo',
      lectures: 'id, chapterId, lectureNumber, completed, dtsCompleted',
      problemSessions: 'id, sessionNumber, completed',
      tests: 'id, date, *subjects, analysisDone',
      pdfAttachments: 'id, testId',
      examConfig: 'id',
      appSettings: 'id'
    }).upgrade(async (tx) => {
      await tx.table('lectures').toCollection().modify((lecture) => {
        if (lecture.dtsCompleted === undefined) lecture.dtsCompleted = false;
        if (lecture.dtsCompletedAt === undefined) lecture.dtsCompletedAt = null;
      });
      await tx.table('appSettings').toCollection().modify((settings) => {
        settings.theoryTargetDate ||= '2026-12-31';
        settings.plannedLecturesPerDay ??= 2;
        settings.physicsLecturesPerDay ??= null;
        settings.chemistryLecturesPerDay ??= null;
        settings.mathsLecturesPerDay ??= null;
      });
    });
  }
}

export const db = new ProjectZDatabase();
