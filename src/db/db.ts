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
  }
}

export const db = new ProjectZDatabase();
