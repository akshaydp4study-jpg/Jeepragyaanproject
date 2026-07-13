import { db } from '../db/db';
import type { Chapter, Lecture, ProblemSession, Test, PdfAttachment, ExamConfig, AppSettings } from '../types';
import { APP_SETTINGS_DEFAULT } from '../db/seedData';

export async function getChaptersBySubject(subject: 'Physics' | 'Chemistry' | 'Maths'): Promise<Chapter[]> {
  return db.chapters.where('subject').equals(subject).sortBy('slNo');
}

export async function getLecturesByChapter(chapterId: string): Promise<Lecture[]> {
  return db.lectures.where('chapterId').equals(chapterId).sortBy('lectureNumber');
}

export async function toggleLecture(lectureId: string, completed: boolean): Promise<void> {
  const completedAt = completed ? new Date().toISOString() : null;
  await db.lectures.update(lectureId, { completed, completedAt });
}

export async function bulkToggleLectures(chapterId: string, completed: boolean): Promise<void> {
  const completedAt = completed ? new Date().toISOString() : null;
  const lectures = await db.lectures.where('chapterId').equals(chapterId).toArray();
  const updates = lectures.map(l => db.lectures.update(l.id, { completed, completedAt }));
  await Promise.all(updates);
}

export async function getExamConfig(): Promise<ExamConfig> {
  const config = await db.examConfig.get('singleton');
  if (!config) {
    throw new Error('Exam config not initialized');
  }
  return config;
}

export async function updateExamConfig(patch: Partial<ExamConfig>): Promise<void> {
  await db.examConfig.update('singleton', patch);
}

export async function getAppSettings(): Promise<AppSettings> {
  const settings = await db.appSettings.get('singleton');
  if (!settings) {
    throw new Error('App settings not initialized');
  }
  return settings;
}

export async function updateAppSettings(patch: Partial<AppSettings>): Promise<void> {
  await db.appSettings.update('singleton', patch);
}

export async function toggleProblemSession(sessionId: string, completed: boolean): Promise<void> {
  await db.problemSessions.update(sessionId, {
    completed,
    completedAt: completed ? new Date().toISOString() : null,
  });
}

export async function bulkToggleProblemSessions(completed: boolean): Promise<void> {
  const completedAt = completed ? new Date().toISOString() : null;
  const sessions = await db.problemSessions.toArray();
  await Promise.all(sessions.map((session) =>
    db.problemSessions.update(session.id, { completed, completedAt })
  ));
}

// Tests section CRUD
export async function getAllTests(): Promise<Test[]> {
  return db.tests.orderBy('date').reverse().toArray();
}

export async function getPdfAttachment(id: string): Promise<PdfAttachment | undefined> {
  return db.pdfAttachments.get(id);
}

export async function addTest(
  testData: Omit<Test, 'id' | 'createdAt' | 'updatedAt' | 'pdfAttachmentId'>,
  pdfFile: File | null
): Promise<string> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  let pdfAttachmentId: string | null = null;

  if (pdfFile) {
    // Validation
    if (pdfFile.type !== 'application/pdf') {
      throw new Error('Only PDF files are allowed');
    }
    if (pdfFile.size > 15 * 1024 * 1024) {
      throw new Error('File exceeds the 15MB limit');
    }

    pdfAttachmentId = crypto.randomUUID();
    const attachment: PdfAttachment = {
      id: pdfAttachmentId,
      testId: id,
      blob: pdfFile,
      fileName: pdfFile.name,
      fileSizeBytes: pdfFile.size,
      mimeType: 'application/pdf',
      uploadedAt: now,
    };
    await db.pdfAttachments.put(attachment);
  }

  const test: Test = {
    ...testData,
    id,
    pdfAttachmentId,
    createdAt: now,
    updatedAt: now,
  };

  await db.tests.put(test);
  return id;
}

export async function updateTest(
  testId: string,
  patch: Partial<Omit<Test, 'id' | 'createdAt' | 'updatedAt'>>,
  pdfFile: File | null | undefined // null means delete, undefined means leave unchanged, File means upload new
): Promise<void> {
  const now = new Date().toISOString();
  const existing = await db.tests.get(testId);
  if (!existing) {
    throw new Error(`Test with ID ${testId} not found`);
  }

  let pdfAttachmentId = existing.pdfAttachmentId;

  if (pdfFile === null) {
    // Delete existing PDF
    if (pdfAttachmentId) {
      await db.pdfAttachments.delete(pdfAttachmentId);
      pdfAttachmentId = null;
    }
  } else if (pdfFile instanceof File) {
    // Delete existing PDF if there is one
    if (pdfAttachmentId) {
      await db.pdfAttachments.delete(pdfAttachmentId);
    }

    // Validation
    if (pdfFile.type !== 'application/pdf') {
      throw new Error('Only PDF files are allowed');
    }
    if (pdfFile.size > 15 * 1024 * 1024) {
      throw new Error('File exceeds the 15MB limit');
    }

    pdfAttachmentId = crypto.randomUUID();
    const attachment: PdfAttachment = {
      id: pdfAttachmentId,
      testId,
      blob: pdfFile,
      fileName: pdfFile.name,
      fileSizeBytes: pdfFile.size,
      mimeType: 'application/pdf',
      uploadedAt: now,
    };
    await db.pdfAttachments.put(attachment);
  }

  await db.tests.update(testId, {
    ...patch,
    pdfAttachmentId,
    updatedAt: now,
  });
}

export async function deleteTest(testId: string): Promise<void> {
  const test = await db.tests.get(testId);
  if (test) {
    if (test.pdfAttachmentId) {
      await db.pdfAttachments.delete(test.pdfAttachmentId);
    }
    await db.tests.delete(testId);
  }
}

// Export / Import
export interface ExportData {
  version: number;
  chapters: Chapter[];
  lectures: Lecture[];
  problemSessions?: ProblemSession[];
  tests: Test[];
  examConfig: ExamConfig;
  appSettings: AppSettings;
}

export async function exportAllData(): Promise<string> {
  const chapters = await db.chapters.toArray();
  const lectures = await db.lectures.toArray();
  const problemSessions = await db.problemSessions.toArray();
  const tests = await db.tests.toArray();
  const examConfig = await db.examConfig.get('singleton');
  const appSettings = await db.appSettings.get('singleton');

  const exportPayload: ExportData = {
    version: 2,
    chapters,
    lectures,
    problemSessions,
    tests,
    examConfig: examConfig!,
    appSettings: appSettings!,
  };

  return JSON.stringify(exportPayload, null, 2);
}

export async function importData(jsonString: string): Promise<{ success: boolean; message: string }> {
  try {
    const data = JSON.parse(jsonString) as ExportData;

    // Validation checks
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid JSON structure');
    }
    if (data.version !== 1 && data.version !== 2) {
      throw new Error(`Unsupported export version: ${data.version}`);
    }
    if (!Array.isArray(data.chapters) || !Array.isArray(data.lectures) || !Array.isArray(data.tests)) {
      throw new Error('Missing chapters, lectures, or tests array');
    }
    if (!data.examConfig || data.examConfig.id !== 'singleton') {
      throw new Error('Invalid examConfig entry');
    }
    if (!data.appSettings || data.appSettings.id !== 'singleton') {
      throw new Error('Invalid appSettings entry');
    }

    // Perform database import inside a transaction
    await db.transaction('rw', [db.chapters, db.lectures, db.problemSessions, db.tests, db.examConfig, db.appSettings], async () => {
      // Clear existing records
      await db.chapters.clear();
      await db.lectures.clear();
      await db.problemSessions.clear();
      await db.tests.clear();
      await db.examConfig.clear();
      await db.appSettings.clear();

      // Put new records
      await db.chapters.bulkPut(data.chapters);
      await db.lectures.bulkPut(data.lectures);
      if (Array.isArray(data.problemSessions) && data.problemSessions.length > 0) {
        await db.problemSessions.bulkPut(data.problemSessions);
      } else {
        await db.problemSessions.bulkPut(Array.from({ length: 48 }, (_, index) => ({
          id: `problem-session-${String(index + 1).padStart(2, '0')}`,
          sessionNumber: index + 1,
          title: `Problem Solving Session ${String(index + 1).padStart(2, '0')}`,
          completed: false,
          completedAt: null,
        })));
      }
      await db.tests.bulkPut(data.tests);
      await db.examConfig.put(data.examConfig);
      await db.appSettings.put({
        ...data.appSettings,
        theoryPlanStartDate: data.appSettings.theoryPlanStartDate || APP_SETTINGS_DEFAULT.theoryPlanStartDate,
      });
    });

    return {
      success: true,
      message: `Successfully imported ${data.chapters.length} chapters, ${data.lectures.length} lectures, ${data.problemSessions?.length || 48} problem-solving sessions, and ${data.tests.length} tests.`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Import failed. File might be corrupted or incompatible.',
    };
  }
}
