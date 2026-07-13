import React, { useState, useEffect } from 'react';
import { useAllTests } from '../../hooks/useDbQueries';
import { motion } from 'motion/react';
import { useTheme } from '../../context/ThemeContext';
import { themeRegistry } from '../../themes/themeRegistry';
import {
  addTest,
  updateTest,
  deleteTest,
  getPdfAttachment,
} from '../../data/dataAccess';
import {
  Plus,
  Filter,
  FileText,
  Calendar,
  Layers,
  Award,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Trash2,
  X,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import type { Test } from '../../types';

export default function TestsPage() {
  const tests = useAllTests();
  const { currentThemeId, prefersReducedMotion } = useTheme();
  const theme = themeRegistry[currentThemeId] || themeRegistry['nerv-terminal'];

  const rowVariants: any = {
    hidden: { opacity: 0, y: 10 },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: (index % 15) * 0.04,
        duration: 0.35,
        ease: 'easeOut',
      },
    }),
  };

  // Filters state
  const [subjectFilter, setSubjectFilter] = useState<'All' | 'Physics' | 'Chemistry' | 'Maths'>('All');
  const [analysisFilter, setAnalysisFilter] = useState<'All' | 'Pending' | 'Analyzed'>('All');

  // Form modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTestId, setEditingTestId] = useState<string | null>(null);

  // PDF Viewer state
  const [viewingPdf, setViewingPdf] = useState<{ isOpen: boolean; url: string | null; fileName: string | null }>({
    isOpen: false,
    url: null,
    fileName: null,
  });

  // Form fields
  const [formName, setFormName] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formType, setFormType] = useState<Test['type']>('Full Syllabus Mock');
  const [formSubjects, setFormSubjects] = useState<Array<'Physics' | 'Chemistry' | 'Maths'>>([]);
  const [formSource, setFormSource] = useState('');
  const [formMarksObtained, setFormMarksObtained] = useState('');
  const [formMaxMarks, setFormMaxMarks] = useState('');
  const [formPercentile, setFormPercentile] = useState('');
  const [formRank, setFormRank] = useState('');
  const [formAnalysisDone, setFormAnalysisDone] = useState(false);
  const [formAnalysisNotes, setFormAnalysisNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [dbWriteError, setDbWriteError] = useState<string | null>(null);

  // Handle PDF file selection & client-side validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setPdfError(null);

    if (file) {
      if (file.type !== 'application/pdf') {
        setPdfError('Only PDF files are permitted for archiving.');
        setSelectedFile(null);
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        setPdfError('File exceeds the secure 15MB threshold limit.');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
    }
  };

  // Open Form for Adding or Editing
  const openForm = (test?: Test) => {
    setPdfError(null);
    setDbWriteError(null);
    setSelectedFile(null);

    if (test) {
      setEditingTestId(test.id);
      setFormName(test.name);
      setFormDate(test.date);
      setFormType(test.type);
      setFormSubjects(test.subjects);
      setFormSource(test.source);
      setFormMarksObtained(test.marksObtained.toString());
      setFormMaxMarks(test.maxMarks.toString());
      setFormPercentile(test.percentile ? test.percentile.toString() : '');
      setFormRank(test.rank ? test.rank.toString() : '');
      setFormAnalysisDone(test.analysisDone);
      setFormAnalysisNotes(test.analysisNotes || '');
    } else {
      setEditingTestId(null);
      setFormName('');
      setFormDate(new Date().toISOString().split('T')[0]);
      setFormType('Full Syllabus Mock');
      setFormSubjects([]);
      setFormSource('');
      setFormMarksObtained('');
      setFormMaxMarks('');
      setFormPercentile('');
      setFormRank('');
      setFormAnalysisDone(false);
      setFormAnalysisNotes('');
    }
    setIsFormOpen(true);
  };

  // Close Form and cleanup
  const closeForm = () => {
    setIsFormOpen(false);
    setEditingTestId(null);
  };

  // Submit form handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDbWriteError(null);

    // Basic validation
    if (!formName.trim()) {
      setDbWriteError('Test Name is required.');
      return;
    }
    if (formSubjects.length === 0) {
      setDbWriteError('At least one subject must be selected.');
      return;
    }
    const marksObt = parseFloat(formMarksObtained);
    const maxMrk = parseFloat(formMaxMarks);

    if (isNaN(marksObt) || isNaN(maxMrk)) {
      setDbWriteError('Marks obtained and Maximum marks must be numeric.');
      return;
    }
    if (marksObt < 0 || maxMrk <= 0 || marksObt > maxMrk) {
      setDbWriteError('Invalid marks: Obtained marks cannot exceed maximum marks.');
      return;
    }

    try {
      const testPayload = {
        name: formName.trim(),
        date: formDate,
        type: formType,
        subjects: formSubjects,
        source: formSource.trim() || 'Unspecified',
        marksObtained: marksObt,
        maxMarks: maxMrk,
        percentile: formPercentile ? parseFloat(formPercentile) : null,
        rank: formRank ? parseInt(formRank, 10) : null,
        analysisDone: formAnalysisDone,
        analysisNotes: formAnalysisNotes.trim() || null,
      };

      if (editingTestId) {
        // If we are editing, selectedFile === null means leave unchanged or delete PDF?
        // Wait, to keep things simple: let's treat selectedFile as replacement if chosen
        await updateTest(editingTestId, testPayload, selectedFile || undefined);
      } else {
        await addTest(testPayload, selectedFile);
      }
      closeForm();
    } catch (err: any) {
      setDbWriteError(err?.message || 'Failed to save test. Local quota might be exceeded.');
    }
  };

  const handleSubjectCheckbox = (subject: 'Physics' | 'Chemistry' | 'Maths') => {
    if (formSubjects.includes(subject)) {
      setFormSubjects(formSubjects.filter(s => s !== subject));
    } else {
      setFormSubjects([...formSubjects, subject]);
    }
  };

  const handleDelete = async (testId: string) => {
    if (window.confirm('ARE YOU SURE YOU WANT TO PURGE THIS TEST RECORD FROM SECURE ENCLAVE?')) {
      await deleteTest(testId);
    }
  };

  // View PDF Attachment
  const handleViewPdf = async (attachmentId: string, fileName: string) => {
    try {
      const attachment = await getPdfAttachment(attachmentId);
      if (attachment) {
        const url = URL.createObjectURL(attachment.blob);
        setViewingPdf({ isOpen: true, url, fileName });
      } else {
        alert('Attachment file corrupted or deleted.');
      }
    } catch (err) {
      alert('Error loading PDF file: ' + err);
    }
  };

  // Close PDF Viewer and revoke Object URL
  const handleClosePdf = () => {
    if (viewingPdf.url) {
      URL.revokeObjectURL(viewingPdf.url);
    }
    setViewingPdf({ isOpen: false, url: null, fileName: null });
  };

  // Clean up PDF on unmount
  useEffect(() => {
    return () => {
      if (viewingPdf.url) {
        URL.revokeObjectURL(viewingPdf.url);
      }
    };
  }, [viewingPdf.url]);

  // Filter tests for Table
  const filteredTests = tests.filter((test) => {
    // Subject Filter
    if (subjectFilter !== 'All') {
      if (!test.subjects.includes(subjectFilter)) {
        return false;
      }
    }
    // Analysis Filter
    if (analysisFilter !== 'All') {
      const isPending = !test.analysisDone;
      if (analysisFilter === 'Pending' && !isPending) return false;
      if (analysisFilter === 'Analyzed' && isPending) return false;
    }
    return true;
  });

  // Prepare Chart Data: older tests to newer tests (asc order of date)
  const chartData = [...tests]
    .reverse() // oldest first
    .map((test) => ({
      name: test.name.substring(0, 15) + (test.name.length > 15 ? '...' : ''),
      date: new Date(test.date).toLocaleDateString(),
      percentage: Math.round((test.marksObtained / test.maxMarks) * 100),
    }));

  return (
    <div className="space-y-6 font-rajdhani select-none animate-fadeIn">
      {/* Header - High Density Layout */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-subtle pb-6 lg:pb-3 lg:border-none">
        <div className="lg:hidden">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-nerv-orange rounded-full"></span>
            <span className="text-[10px] font-bold tracking-[0.25em] text-text-muted font-orbitron">MODULE: COGNITIVE ANALYSIS</span>
          </div>
          <h2 className="text-3xl font-black font-orbitron tracking-widest text-text-primary mt-1">
            TEST EVALUATION LOGS
          </h2>
        </div>

        <button
          onClick={() => openForm()}
          className="flex items-center justify-center gap-2 px-5 py-2 bg-nerv-orange border border-nerv-orange text-bg-void font-bold font-orbitron tracking-widest text-xs transition-all hover:bg-transparent hover:text-nerv-orange active:scale-95 cursor-pointer rounded-sm shrink-0 ml-auto"
        >
          <Plus className="w-4 h-4 text-current" />
          LOG NEW TEST SESSION
        </button>
      </div>

      {/* Chart Section */}
      {chartData.length >= 2 ? (
        <div className="bg-bg-panel border border-border-subtle p-5 rounded-lg space-y-4">
          <h3 className="text-sm font-bold font-orbitron tracking-widest text-text-primary flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-nerv-orange" />
            SCORE TREND ANALYTICS (%)
          </h3>
          <div className="w-full h-64 font-mono-tech text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f1f24" />
                <XAxis dataKey="date" stroke="#8a8a8a" tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#8a8a8a" tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#16161a', borderColor: '#ff6600', color: '#e8e8e8' }}
                  labelStyle={{ color: '#ff6600', fontWeight: 'bold' }}
                />
                <Line
                  type="monotone"
                  dataKey="percentage"
                  name="Score %"
                  stroke="#39ff14"
                  strokeWidth={2.5}
                  activeDot={{ r: 6 }}
                  dot={{ r: 4, stroke: '#39ff14', strokeWidth: 1 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="bg-bg-panel/50 border border-border-subtle p-6 rounded-lg text-center text-text-muted font-mono-tech text-xs">
          DATA BUFFER DEFLATED: LOG AT LEAST 2 TESTS TO MAP DYNAMIC SCORE PERFORMANCE TRENDS
        </div>
      )}

      {/* Filter and Table Section */}
      <div className="space-y-4">
        {/* Filters Panel */}
        <div className="flex flex-wrap items-center gap-4 bg-bg-panel/60 p-4 border border-border-subtle rounded-lg text-xs font-mono-tech">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-nerv-orange" />
            <span className="font-orbitron font-bold tracking-widest uppercase">FILTERS:</span>
          </div>

          {/* Subject Filter */}
          <div className="flex items-center gap-2">
            <span className="text-text-muted uppercase">SUBJECT SCOPE:</span>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value as any)}
              className="bg-bg-void border border-border-subtle rounded px-2.5 py-1 text-text-primary focus:border-nerv-orange outline-none uppercase"
            >
              <option value="All">ALL SUBJECTS</option>
              <option value="Physics">PHYSICS ONLY</option>
              <option value="Chemistry">CHEMISTRY ONLY</option>
              <option value="Maths">MATHEMATICS ONLY</option>
            </select>
          </div>

          {/* Analysis status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-text-muted uppercase">ANALYSIS STATE:</span>
            <select
              value={analysisFilter}
              onChange={(e) => setAnalysisFilter(e.target.value as any)}
              className="bg-bg-void border border-border-subtle rounded px-2.5 py-1 text-text-primary focus:border-nerv-orange outline-none uppercase"
            >
              <option value="All">ALL LOGS</option>
              <option value="Pending">PENDING COGNITIVE ANALYSIS</option>
              <option value="Analyzed">COMPLETED ANALYSIS</option>
            </select>
          </div>

          <div className="flex-1 text-right text-[10px] text-text-dim uppercase">
            SECURE RE-QUERIES: {filteredTests.length} LOGS RETRIEVED
          </div>
        </div>

        {/* Tests Table Layout */}
        {filteredTests.length === 0 ? (
          <div className="p-12 text-center text-text-muted font-mono-tech border border-border-subtle rounded bg-bg-panel/20 text-xs">
            SYSTEM SCAN: ZERO MATCHING TEST SESSIONS FOUND UNDER SPECIFIED FILTERS
          </div>
        ) : (
          <theme.TestListLayout
            tests={filteredTests}
            onEdit={openForm}
            onDelete={handleDelete}
            prefersReducedMotion={prefersReducedMotion}
          />
        )}

      </div>

      {/* Log/Edit Test Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-void/85 overflow-y-auto animate-fadeIn">
          <div className="bg-bg-panel border border-border-subtle w-full max-w-lg rounded-lg overflow-hidden shadow-2xl font-rajdhani my-8">
            {/* Header */}
            <div className="p-4 bg-bg-panel-raised border-b border-border-subtle flex justify-between items-center">
              <h3 className="text-sm font-bold font-orbitron tracking-widest text-nerv-orange">
                {editingTestId ? 'MODIFY EVALUATION PARAMETERS' : 'LOG SESSION PARAMETERS'}
              </h3>
              <button
                onClick={closeForm}
                className="p-1 text-text-muted hover:text-alert-red transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 font-rajdhani text-xs">
              {dbWriteError && (
                <div className="p-3 bg-alert-red/10 border border-alert-red text-alert-red rounded flex items-center gap-2 font-mono-tech">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{dbWriteError}</span>
                </div>
              )}

              {/* Row: Name */}
              <div className="space-y-1">
                <label className="block font-orbitron font-bold text-text-muted uppercase tracking-wider">
                  TEST TITLE / PARAMETERS *
                </label>
                <input
                  type="text"
                  required
                  placeholder="E.G., PW ALL INDIA TEST SERIES - MOCK 01"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value.toUpperCase())}
                  className="w-full bg-bg-void border border-border-subtle focus:border-nerv-orange rounded px-3 py-2 text-text-primary placeholder:text-text-dim outline-none uppercase transition-all"
                />
              </div>

              {/* Row: Date / Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-orbitron font-bold text-text-muted uppercase tracking-wider">
                    TEST DATE *
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-bg-void border border-border-subtle focus:border-nerv-orange rounded px-3 py-2 text-text-primary outline-none transition-all font-mono-tech"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-orbitron font-bold text-text-muted uppercase tracking-wider">
                    SESSION CATEGORY *
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="w-full bg-bg-void border border-border-subtle focus:border-nerv-orange rounded px-3 py-2 text-text-primary outline-none uppercase transition-all"
                  >
                    <option value="Full Syllabus Mock">FULL SYLLABUS MOCK</option>
                    <option value="Part Syllabus">PART SYLLABUS</option>
                    <option value="Subject Test">SUBJECT TEST</option>
                    <option value="Chapter Test">CHAPTER TEST</option>
                    <option value="PYQ Paper">PYQ PAPER</option>
                    <option value="Other">OTHER</option>
                  </select>
                </div>
              </div>

              {/* Row: Subjects Multi-select */}
              <div className="space-y-1.5">
                <label className="block font-orbitron font-bold text-text-muted uppercase tracking-wider">
                  SUBJECT ENCLAVES INCLUDED *
                </label>
                <div className="flex flex-wrap gap-4 p-2.5 bg-bg-void border border-border-subtle rounded">
                  {(['Physics', 'Chemistry', 'Maths'] as const).map((sub) => {
                    const isChecked = formSubjects.includes(sub);
                    return (
                      <button
                        type="button"
                        key={sub}
                        onClick={() => handleSubjectCheckbox(sub)}
                        className={`flex items-center gap-2 font-bold tracking-wider uppercase cursor-pointer ${
                          isChecked ? 'text-nerv-orange' : 'text-text-muted hover:text-text-primary'
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center text-[9px] ${
                          isChecked ? 'border-nerv-orange bg-nerv-orange/10' : 'border-text-dim'
                        }`}>
                          {isChecked && '✓'}
                        </span>
                        <span>{sub}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row: Source */}
              <div className="space-y-1">
                <label className="block font-orbitron font-bold text-text-muted uppercase tracking-wider">
                  TEST SOURCE / CONDUCTOR
                </label>
                <input
                  type="text"
                  placeholder="E.G., PW, EDUNITI, FIITJEE"
                  value={formSource}
                  onChange={(e) => setFormSource(e.target.value.toUpperCase())}
                  className="w-full bg-bg-void border border-border-subtle focus:border-nerv-orange rounded px-3 py-2 text-text-primary placeholder:text-text-dim outline-none uppercase transition-all"
                />
              </div>

              {/* Row: Marks Obtained / Max Marks */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-orbitron font-bold text-text-muted uppercase tracking-wider">
                    OBTAINED MARKS *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="E.G., 180"
                    value={formMarksObtained}
                    onChange={(e) => setFormMarksObtained(e.target.value)}
                    className="w-full bg-bg-void border border-border-subtle focus:border-nerv-orange rounded px-3 py-2 text-text-primary outline-none transition-all font-mono-tech"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-orbitron font-bold text-text-muted uppercase tracking-wider">
                    MAXIMUM MARKS *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="E.G., 300"
                    value={formMaxMarks}
                    onChange={(e) => setFormMaxMarks(e.target.value)}
                    className="w-full bg-bg-void border border-border-subtle focus:border-nerv-orange rounded px-3 py-2 text-text-primary outline-none transition-all font-mono-tech"
                  />
                </div>
              </div>

              {/* Row: Percentile / Rank */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-orbitron font-bold text-text-muted uppercase tracking-wider">
                    PERCENTILE (OPTIONAL)
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    placeholder="E.G., 99.85"
                    value={formPercentile}
                    onChange={(e) => setFormPercentile(e.target.value)}
                    className="w-full bg-bg-void border border-border-subtle focus:border-nerv-orange rounded px-3 py-2 text-text-primary outline-none transition-all font-mono-tech"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-orbitron font-bold text-text-muted uppercase tracking-wider">
                    AIR RANK (OPTIONAL)
                  </label>
                  <input
                    type="number"
                    placeholder="E.G., 1204"
                    value={formRank}
                    onChange={(e) => setFormRank(e.target.value)}
                    className="w-full bg-bg-void border border-border-subtle focus:border-nerv-orange rounded px-3 py-2 text-text-primary outline-none transition-all font-mono-tech"
                  />
                </div>
              </div>

              {/* PDF Archive Upload */}
              <div className="space-y-1">
                <label className="block font-orbitron font-bold text-text-muted uppercase tracking-wider">
                  PDF ATTACHMENT (MAX 15MB)
                </label>
                <div className="p-3 bg-bg-void border border-border-subtle rounded text-center relative">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                  />
                  <div className="space-y-1">
                    <div className="text-text-muted text-xs font-bold uppercase font-orbitron tracking-wide">
                      {selectedFile ? 'FILE ATTACHED' : 'DRAG & DROP OR CLICK TO UPLOAD'}
                    </div>
                    <div className="text-[10px] text-text-dim font-mono-tech uppercase">
                      {selectedFile
                        ? `${selectedFile.name} (${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)`
                        : 'PDF TYPE DOCUMENTS ONLY'}
                    </div>
                  </div>
                </div>
                {pdfError && <div className="text-alert-red text-[10px] font-mono-tech mt-1">{pdfError}</div>}
              </div>

              {/* Row: Analysis Checked / Notes */}
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={() => setFormAnalysisDone(!formAnalysisDone)}
                  className="flex items-center gap-2.5 font-orbitron font-bold text-text-primary tracking-wider cursor-pointer text-left"
                >
                  <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                    formAnalysisDone ? 'border-sync-green bg-sync-green/10 text-sync-green' : 'border-text-dim'
                  }`}>
                    {formAnalysisDone && '✓'}
                  </span>
                  <span>DECLARE COGNITIVE ERROR MATRIX ANALYZED</span>
                </button>

                <div className="space-y-1">
                  <label className="block font-orbitron font-bold text-text-muted uppercase tracking-wider">
                    COGNITIVE NOTES / ERROR ANALYSIS
                  </label>
                  <textarea
                    rows={3}
                    placeholder="LOG SILLY ERRORS, FORMULA WEAKNESSES, CONCEPT REVIEWS NEEDED..."
                    value={formAnalysisNotes}
                    onChange={(e) => setFormAnalysisNotes(e.target.value.toUpperCase())}
                    className="w-full bg-bg-void border border-border-subtle focus:border-nerv-orange rounded px-3 py-2 text-text-primary placeholder:text-text-dim outline-none uppercase transition-all"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-5 py-2 border border-border-subtle text-text-muted hover:text-text-primary text-xs font-bold tracking-widest font-orbitron rounded-sm cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-nerv-orange border border-nerv-orange hover:bg-transparent text-bg-void hover:text-nerv-orange text-xs font-bold tracking-widest font-orbitron rounded-sm transition-all cursor-pointer"
                >
                  SAVE RECORD
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PDF View Modal */}
      {viewingPdf.isOpen && viewingPdf.url && (
        <div className="fixed inset-0 z-50 flex flex-col p-4 bg-bg-void/90 animate-fadeIn font-rajdhani">
          <div className="flex justify-between items-center bg-bg-panel p-4 border border-border-subtle rounded-t-lg max-w-5xl w-full mx-auto">
            <div className="min-w-0">
              <span className="text-[10px] text-text-muted font-bold font-orbitron tracking-wider">SECURE PDF ARCHIVE CONTAINER</span>
              <h3 className="text-sm font-bold font-orbitron text-text-primary truncate uppercase mt-0.5">
                {viewingPdf.fileName}
              </h3>
            </div>
            <div className="flex gap-3">
              <a
                href={viewingPdf.url}
                download={viewingPdf.fileName || 'secured_test_attachment.pdf'}
                className="flex items-center gap-1.5 px-3 py-1 bg-sync-green text-bg-void text-xs font-bold font-orbitron tracking-widest rounded cursor-pointer border border-sync-green hover:bg-transparent hover:text-sync-green transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                DOWNLOAD
              </a>
              <button
                onClick={handleClosePdf}
                className="p-1 text-text-muted hover:text-alert-red transition-colors border border-border-subtle rounded cursor-pointer bg-bg-void"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex-1 bg-bg-panel border-x border-b border-border-subtle max-w-5xl w-full mx-auto rounded-b-lg overflow-hidden flex items-center justify-center p-2">
            <embed
              src={viewingPdf.url}
              type="application/pdf"
              className="w-full h-full border border-border-subtle rounded"
            />
          </div>
        </div>
      )}
    </div>
  );
}
