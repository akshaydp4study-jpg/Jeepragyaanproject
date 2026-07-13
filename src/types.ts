export interface Chapter {
  id: string;                // e.g. "phy-01", "che-12", "mat-08"
  subject: 'Physics' | 'Chemistry' | 'Maths';
  domain?: 'Inorganic' | 'Physical' | 'Organic'; // Chemistry only
  slNo: number;
  chapterName: string;
  totalLectures: number;
  durationHours?: number;         // Physics: fixed, from source data
  chemDurationHours?: {           // Chemistry only: all 5 speed variants
    x1: number;
    x1_25: number;
    x1_5: number;
    x1_75: number;
    x2: number;
  };
}

export interface Lecture {
  id: string;              // `${chapterId}-L${n}`
  chapterId: string;
  lectureNumber: number;
  code?: string;            // syllabus code shown in the UI, e.g. L-28 or L-0
  title?: string;           // full syllabus lecture title
  completed: boolean;
  completedAt: string | null;   // ISO timestamp
  dtsCompleted: boolean;
  dtsCompletedAt: string | null; // ISO timestamp for independent DTS completion
}

export interface ProblemSession {
  id: string;
  sessionNumber: number;
  title: string;
  completed: boolean;
  completedAt: string | null;
}

export interface Test {
  id: string;
  name: string;
  date: string;             // ISO date string
  type: 'Full Syllabus Mock' | 'Part Syllabus' | 'Subject Test' | 'Chapter Test' | 'PYQ Paper' | 'Other';
  subjects: Array<'Physics' | 'Chemistry' | 'Maths'>;
  source: string;           // free text: e.g., "PW", "Eduniti"
  marksObtained: number;
  maxMarks: number;
  percentile: number | null;
  rank: number | null;
  analysisDone: boolean;
  analysisNotes: string | null;
  pdfAttachmentId: string | null; // FK into pdfAttachments
  createdAt: string;
  updatedAt: string;
}

export interface PdfAttachment {
  id: string;
  testId: string;
  blob: Blob;
  fileName: string;
  fileSizeBytes: number;
  mimeType: 'application/pdf';
  uploadedAt: string;
}

export interface ExamConfig {
  id: 'singleton';
  jeeMainS1Date: string;   // ISO date string
  jeeMainS1Official: boolean;
  jeeMainS2Date: string;
  jeeMainS2Official: boolean;
  jeeAdvancedDate: string;
  jeeAdvancedOfficial: boolean;
  phase1EndDate: string;   // default 2026-12-31, editable
}

export interface AppSettings {
  id: 'singleton';
  mathsAvgLectureMinutes: number;   // default 150 (2.5h)
  chemPreferredSpeed: '1x' | '1.25x' | '1.5x' | '1.75x' | '2x'; // default '1.25x'
  theoryPlanStartDate: string; // ISO date used for planned-vs-actual theory projection
  theoryTargetDate?: string; // ISO date used for planned syllabus completion
  plannedLecturesPerDay?: number;
  physicsLecturesPerDay?: number | null;
  chemistryLecturesPerDay?: number | null;
  mathsLecturesPerDay?: number | null;
  activeThemeId?: string; // default 'nerv-terminal'
}
