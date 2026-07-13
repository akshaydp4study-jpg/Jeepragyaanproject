import React, { useState } from 'react';
import { useExamConfig, useAppSettings } from '../../hooks/useDbQueries';
import {
  updateExamConfig,
  updateAppSettings,
  exportAllData,
  importData,
  ExportData,
} from '../../data/dataAccess';
import {
  Settings,
  Calendar,
  Layers,
  Sliders,
  Download,
  Upload,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  FileJson,
  X,
  Palette,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function SettingsPage() {
  const examConfig = useExamConfig();
  const settings = useAppSettings();
  const { themes, currentThemeId, setTheme } = useTheme();

  // Local state for edits
  const [s1Date, setS1Date] = useState('');
  const [s1Official, setS1Official] = useState(false);
  const [s2Date, setS2Date] = useState('');
  const [s2Official, setS2Official] = useState(false);
  const [advDate, setAdvDate] = useState('');
  const [advOfficial, setAdvOfficial] = useState(false);
  const [phase1Date, setPhase1Date] = useState('');

  const [theoryStartDate, setTheoryStartDate] = useState('');
  const [theoryTargetDate, setTheoryTargetDate] = useState('');
  const [plannedLecturesPerDay, setPlannedLecturesPerDay] = useState('');
  const [physicsLecturesPerDay, setPhysicsLecturesPerDay] = useState('');
  const [chemistryLecturesPerDay, setChemistryLecturesPerDay] = useState('');
  const [mathsLecturesPerDay, setMathsLecturesPerDay] = useState('');
  const [mathsMinutes, setMathsMinutes] = useState('');
  const [chemSpeed, setChemSpeed] = useState<'1x' | '1.25x' | '1.5x' | '1.75x' | '2x'>('1.25x');

  // Load status
  const [isLoaded, setIsLoaded] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Import preview state
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<{
    isOpen: boolean;
    jsonData: string;
    chaptersCount: number;
    lecturesCount: number;
    testsCount: number;
    phase1End: string;
    error: string | null;
  }>({
    isOpen: false,
    jsonData: '',
    chaptersCount: 0,
    lecturesCount: 0,
    testsCount: 0,
    phase1End: '',
    error: null,
  });

  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null);

  if (!examConfig || !settings) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-text-muted font-mono-tech animate-pulse">
        RE-CONNECTING SYSTEM PARAMETERS...
      </div>
    );
  }

  // Sync db values to local state once loaded
  if (!isLoaded) {
    setS1Date(examConfig.jeeMainS1Date);
    setS1Official(examConfig.jeeMainS1Official);
    setS2Date(examConfig.jeeMainS2Date);
    setS2Official(examConfig.jeeMainS2Official);
    setAdvDate(examConfig.jeeAdvancedDate);
    setAdvOfficial(examConfig.jeeAdvancedOfficial);
    setPhase1Date(examConfig.phase1EndDate);

    setTheoryStartDate(settings.theoryPlanStartDate || '2026-07-04');
    setTheoryTargetDate(settings.theoryTargetDate || examConfig.phase1EndDate);
    setPlannedLecturesPerDay(String(settings.plannedLecturesPerDay ?? 2));
    setPhysicsLecturesPerDay(settings.physicsLecturesPerDay == null ? '' : String(settings.physicsLecturesPerDay));
    setChemistryLecturesPerDay(settings.chemistryLecturesPerDay == null ? '' : String(settings.chemistryLecturesPerDay));
    setMathsLecturesPerDay(settings.mathsLecturesPerDay == null ? '' : String(settings.mathsLecturesPerDay));
    setMathsMinutes(settings.mathsAvgLectureMinutes.toString());
    setChemSpeed(settings.chemPreferredSpeed);
    setIsLoaded(true);
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(false);

    const parsedMathsMin = parseInt(mathsMinutes, 10);
    const parsedPlannedLectures = parseFloat(plannedLecturesPerDay);
    const parseOptionalPace = (value: string) => value.trim() === '' ? null : parseFloat(value);
    if (isNaN(parsedMathsMin) || parsedMathsMin <= 0) {
      alert('Maths Average Lecture Minutes must be a valid positive number.');
      return;
    }

    if (!theoryStartDate || !theoryTargetDate || theoryStartDate > theoryTargetDate) {
      alert('Plan Start Date must be on or before the Target Syllabus Completion Date.');
      return;
    }

    if (isNaN(parsedPlannedLectures) || parsedPlannedLectures <= 0) {
      alert('Planned lectures per day must be a valid positive number.');
      return;
    }

    try {
      await updateExamConfig({
        jeeMainS1Date: s1Date,
        jeeMainS1Official: s1Official,
        jeeMainS2Date: s2Date,
        jeeMainS2Official: s2Official,
        jeeAdvancedDate: advDate,
        jeeAdvancedOfficial: advOfficial,
        phase1EndDate: phase1Date,
      });

      await updateAppSettings({
        theoryPlanStartDate: theoryStartDate,
        theoryTargetDate,
        plannedLecturesPerDay: parsedPlannedLectures,
        physicsLecturesPerDay: parseOptionalPace(physicsLecturesPerDay),
        chemistryLecturesPerDay: parseOptionalPace(chemistryLecturesPerDay),
        mathsLecturesPerDay: parseOptionalPace(mathsLecturesPerDay),
        mathsAvgLectureMinutes: parsedMathsMin,
        chemPreferredSpeed: chemSpeed,
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert('Failed to save settings: ' + err);
    }
  };

  const handleExport = async () => {
    try {
      const dataStr = await exportAllData();
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `project_z_tactical_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Export failed: ' + err);
    }
  };

  // Preview import file
  const handleImportFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImportStatus(null);
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text) as ExportData;

        // Validation
        if (!parsed || typeof parsed !== 'object') throw new Error('Malformed JSON schema');
        if (parsed.version !== 1 && parsed.version !== 2 && parsed.version !== 3) throw new Error(`Unsupported export version: ${parsed.version}`);
        if (!Array.isArray(parsed.chapters) || !Array.isArray(parsed.lectures) || !Array.isArray(parsed.tests)) {
          throw new Error('Data vectors missing required chapter, lecture, or test tables');
        }

        setImportPreview({
          isOpen: true,
          jsonData: text,
          chaptersCount: parsed.chapters.length,
          lecturesCount: parsed.lectures.length,
          testsCount: parsed.tests.length,
          phase1End: parsed.examConfig?.phase1EndDate || 'Unspecified',
          error: null,
        });
      } catch (err: any) {
        setImportPreview({
          isOpen: true,
          jsonData: '',
          chaptersCount: 0,
          lecturesCount: 0,
          testsCount: 0,
          phase1End: '',
          error: err?.message || 'Failed to parse file as Project Z Backup.',
        });
      }
    };
    reader.readAsText(file);
    // Reset file input value
    e.target.value = '';
  };

  const executeImport = async () => {
    try {
      const result = await importData(importPreview.jsonData);
      setImportStatus(result);
      setImportPreview(prev => ({ ...prev, isOpen: false }));
      // Trigger a local reload so the state resets
      setIsLoaded(false);
    } catch (err: any) {
      setImportStatus({ success: false, message: err?.message || 'Import failed.' });
    }
  };

  return (
    <div className="space-y-6 font-rajdhani select-none animate-fadeIn">
      {/* Header - Hidden on desktop */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-subtle pb-6 lg:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-nerv-orange rounded-full"></span>
            <span className="text-[10px] font-bold tracking-[0.25em] text-text-muted font-orbitron">SYSTEM OVERRIDE ENCLAVE</span>
          </div>
          <h2 className="text-3xl font-black font-orbitron tracking-widest text-text-primary mt-1">
            CONTROL SETTINGS
          </h2>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 bg-sync-green/10 border border-sync-green text-sync-green text-xs font-mono-tech rounded flex items-center gap-2">
          <CheckCircle className="w-4.5 h-4.5" />
          <span>TACTICAL DATABASE SYNCHRONIZATION: OPERATIONAL PARAMETERS SUCCESSFULLY REGISTERED</span>
        </div>
      )}

      {importStatus && (
        <div className={`p-3.5 border text-xs font-mono-tech rounded flex items-start gap-2.5 ${
          importStatus.success
            ? 'bg-sync-green/10 border-sync-green text-sync-green'
            : 'bg-alert-red/10 border-alert-red text-alert-red'
        }`}>
          <AlertTriangle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
          <div>
            <strong className="font-orbitron tracking-wider block uppercase">
              {importStatus.success ? 'RESTORATION SECURED' : 'RESTORATION ABORTED'}
            </strong>
            <p className="mt-1 leading-relaxed">{importStatus.message}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Hand: Config forms */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section A: JEE Target Date Management */}
          <div className="bg-bg-panel border border-border-subtle p-5 rounded-lg space-y-4">
            <h3 className="text-sm font-bold font-orbitron tracking-widest text-text-primary flex items-center gap-2 border-b border-border-subtle pb-3">
              <Calendar className="w-4 h-4 text-nerv-orange" />
              JEE EXAM CHRONOMETER COORDINATES
            </h3>

            <div className="space-y-4">
              {/* JEE Main S1 */}
              <div className="p-4 bg-bg-panel-raised/50 border border-border-subtle rounded-md grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-4">
                  <h4 className="font-orbitron font-bold text-text-primary tracking-wider">JEE MAIN SESSION 1</h4>
                  <p className="text-[10px] text-text-muted uppercase leading-tight mt-0.5">ESTIMATED LAUNCH MATRIX</p>
                </div>
                <div className="md:col-span-5">
                  <input
                    type="date"
                    required
                    value={s1Date}
                    onChange={(e) => setS1Date(e.target.value)}
                    className="w-full bg-bg-void border border-border-subtle focus:border-nerv-orange rounded px-3 py-1.5 text-text-primary font-mono-tech text-xs outline-none"
                  />
                </div>
                <div className="md:col-span-3">
                  <button
                    type="button"
                    onClick={() => setS1Official(!s1Official)}
                    className={`w-full py-1.5 border font-orbitron font-bold tracking-widest text-[9px] rounded uppercase transition-all cursor-pointer ${
                      s1Official
                        ? 'border-sync-green text-sync-green bg-sync-green/5'
                        : 'border-hazard-yellow text-hazard-yellow bg-hazard-yellow/5'
                    }`}
                  >
                    {s1Official ? '✓ OFFICIAL' : '⚠ ESTIMATED'}
                  </button>
                </div>
              </div>

              {/* JEE Main S2 */}
              <div className="p-4 bg-bg-panel-raised/50 border border-border-subtle rounded-md grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-4">
                  <h4 className="font-orbitron font-bold text-text-primary tracking-wider">JEE MAIN SESSION 2</h4>
                  <p className="text-[10px] text-text-muted uppercase leading-tight mt-0.5">SECONDARY LAUNCH GRID</p>
                </div>
                <div className="md:col-span-5">
                  <input
                    type="date"
                    required
                    value={s2Date}
                    onChange={(e) => setS2Date(e.target.value)}
                    className="w-full bg-bg-void border border-border-subtle focus:border-nerv-orange rounded px-3 py-1.5 text-text-primary font-mono-tech text-xs outline-none"
                  />
                </div>
                <div className="md:col-span-3">
                  <button
                    type="button"
                    onClick={() => setS2Official(!s2Official)}
                    className={`w-full py-1.5 border font-orbitron font-bold tracking-widest text-[9px] rounded uppercase transition-all cursor-pointer ${
                      s2Official
                        ? 'border-sync-green text-sync-green bg-sync-green/5'
                        : 'border-hazard-yellow text-hazard-yellow bg-hazard-yellow/5'
                    }`}
                  >
                    {s2Official ? '✓ OFFICIAL' : '⚠ ESTIMATED'}
                  </button>
                </div>
              </div>

              {/* JEE Advanced */}
              <div className="p-4 bg-bg-panel-raised/50 border border-border-subtle rounded-md grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-4">
                  <h4 className="font-orbitron font-bold text-text-primary tracking-wider">JEE ADVANCED 2027</h4>
                  <p className="text-[10px] text-text-muted uppercase leading-tight mt-0.5">FINAL STRATEGIC OBJECTIVE</p>
                </div>
                <div className="md:col-span-5">
                  <input
                    type="date"
                    required
                    value={advDate}
                    onChange={(e) => setAdvDate(e.target.value)}
                    className="w-full bg-bg-void border border-border-subtle focus:border-nerv-orange rounded px-3 py-1.5 text-text-primary font-mono-tech text-xs outline-none"
                  />
                </div>
                <div className="md:col-span-3">
                  <button
                    type="button"
                    onClick={() => setAdvOfficial(!advOfficial)}
                    className={`w-full py-1.5 border font-orbitron font-bold tracking-widest text-[9px] rounded uppercase transition-all cursor-pointer ${
                      advOfficial
                        ? 'border-sync-green text-sync-green bg-sync-green/5'
                        : 'border-hazard-yellow text-hazard-yellow bg-hazard-yellow/5'
                    }`}
                  >
                    {advOfficial ? '✓ OFFICIAL' : '⚠ ESTIMATED'}
                  </button>
                </div>
              </div>

              {/* Phase 1 Deadline */}
              <div className="p-4 bg-bg-panel-raised/50 border border-border-subtle rounded-md grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-4">
                  <h4 className="font-orbitron font-bold text-text-primary tracking-wider">PHASE 1 SYLLABUS DEADLINE</h4>
                  <p className="text-[10px] text-text-muted uppercase leading-tight mt-0.5">USER DEFINED THRESHOLD</p>
                </div>
                <div className="md:col-span-8">
                  <input
                    type="date"
                    required
                    value={phase1Date}
                    onChange={(e) => setPhase1Date(e.target.value)}
                    className="w-full bg-bg-void border border-border-subtle focus:border-nerv-orange rounded px-3 py-1.5 text-text-primary font-mono-tech text-xs outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section B: Course Constants Config */}
          <div className="bg-bg-panel border border-border-subtle p-5 rounded-lg space-y-4">
            <h3 className="text-sm font-bold font-orbitron tracking-widest text-text-primary flex items-center gap-2 border-b border-border-subtle pb-3">
              <Sliders className="w-4 h-4 text-nerv-orange" />
              DYNAMIC COURSE PLANNING ALGORITHM CONSTANTS
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Theory Plan Start Date */}
              <div className="space-y-1 sm:col-span-2">
                <label className="block font-orbitron font-bold text-text-muted uppercase tracking-wider">
                  THEORETICAL COVERAGE PLAN START DATE
                </label>
                <input
                  type="date"
                  required
                  value={theoryStartDate}
                  max={phase1Date || undefined}
                  onChange={(e) => setTheoryStartDate(e.target.value)}
                  className="w-full bg-bg-void border border-border-subtle focus:border-nerv-orange rounded px-3 py-2 text-text-primary outline-none font-mono-tech"
                />
                <span className="text-[10px] text-text-dim uppercase leading-relaxed block pt-1">
                  Used with the Phase 1 deadline to calculate expected lecture coverage and your projected theory completion date.
                </span>
              </div>


              <div className="space-y-1">
                <label className="block font-orbitron font-bold text-text-muted uppercase tracking-wider">TARGET SYLLABUS COMPLETION DATE</label>
                <input type="date" required value={theoryTargetDate} min={theoryStartDate || undefined} onChange={(e) => setTheoryTargetDate(e.target.value)} className="w-full bg-bg-void border border-border-subtle focus:border-nerv-orange rounded px-3 py-2 text-text-primary outline-none font-mono-tech" />
              </div>
              <div className="space-y-1">
                <label className="block font-orbitron font-bold text-text-muted uppercase tracking-wider">PLANNED LECTURES PER DAY</label>
                <input type="number" step="0.1" min="0.1" required value={plannedLecturesPerDay} onChange={(e) => setPlannedLecturesPerDay(e.target.value)} className="w-full bg-bg-void border border-border-subtle focus:border-nerv-orange rounded px-3 py-2 text-text-primary outline-none font-mono-tech" />
              </div>
              <div className="space-y-1"><label className="block font-orbitron font-bold text-text-muted uppercase tracking-wider">OPTIONAL PHYSICS LECTURES/DAY</label><input type="number" step="0.1" min="0" value={physicsLecturesPerDay} onChange={(e) => setPhysicsLecturesPerDay(e.target.value)} className="w-full bg-bg-void border border-border-subtle focus:border-nerv-orange rounded px-3 py-2 text-text-primary outline-none font-mono-tech" /></div>
              <div className="space-y-1"><label className="block font-orbitron font-bold text-text-muted uppercase tracking-wider">OPTIONAL CHEMISTRY LECTURES/DAY</label><input type="number" step="0.1" min="0" value={chemistryLecturesPerDay} onChange={(e) => setChemistryLecturesPerDay(e.target.value)} className="w-full bg-bg-void border border-border-subtle focus:border-nerv-orange rounded px-3 py-2 text-text-primary outline-none font-mono-tech" /></div>
              <div className="space-y-1"><label className="block font-orbitron font-bold text-text-muted uppercase tracking-wider">OPTIONAL MATHEMATICS LECTURES/DAY</label><input type="number" step="0.1" min="0" value={mathsLecturesPerDay} onChange={(e) => setMathsLecturesPerDay(e.target.value)} className="w-full bg-bg-void border border-border-subtle focus:border-nerv-orange rounded px-3 py-2 text-text-primary outline-none font-mono-tech" /></div>

              {/* Maths Avg Minutes */}
              <div className="space-y-1">
                <label className="block font-orbitron font-bold text-text-muted uppercase tracking-wider">
                  MATHEMATICS AVERAGE LECTURE MINUTES
                </label>
                <input
                  type="number"
                  required
                  value={mathsMinutes}
                  onChange={(e) => setMathsMinutes(e.target.value)}
                  className="w-full bg-bg-void border border-border-subtle focus:border-nerv-orange rounded px-3 py-2 text-text-primary outline-none font-mono-tech"
                />
                <span className="text-[10px] text-text-dim uppercase leading-relaxed block pt-1">
                  Updates computed hour vectors live across all Maths chapters (Default 150m).
                </span>
              </div>

              {/* Chemistry Preferred Speed */}
              <div className="space-y-1">
                <label className="block font-orbitron font-bold text-text-muted uppercase tracking-wider">
                  CHEMISTRY PREFERRED PLAYBACK SPEED
                </label>
                <select
                  value={chemSpeed}
                  onChange={(e) => setChemSpeed(e.target.value as any)}
                  className="w-full bg-bg-void border border-border-subtle focus:border-nerv-orange rounded px-3 py-2 text-text-primary outline-none uppercase"
                >
                  <option value="1x">1.00X PLAYBACK SPEED (BASE)</option>
                  <option value="1.25x">1.25X PLAYBACK SPEED (OPTIMIZED)</option>
                  <option value="1.5x">1.50X PLAYBACK SPEED (RAPID)</option>
                  <option value="1.75x">1.75X PLAYBACK SPEED (EXCEL)</option>
                  <option value="2x">2.00X PLAYBACK SPEED (OVERLOAD)</option>
                </select>
                <span className="text-[10px] text-text-dim uppercase leading-relaxed block pt-1">
                  Selects the specific index column to compute total and remaining hour statistics.
                </span>
              </div>
            </div>
          </div>

          {/* Section C: Cognitive Chassis Visual Preset Theme */}
          <div className="bg-bg-panel border border-border-subtle p-5 rounded-lg space-y-4">
            <h3 className="text-sm font-bold font-orbitron tracking-widest text-text-primary flex items-center gap-2 border-b border-border-subtle pb-3">
              <Palette className="w-4 h-4 text-nerv-orange" />
              COGNITIVE CHASSIS VISUAL PRESETS
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {themes.map((theme) => {
                const isSelected = theme.id === currentThemeId;
                return (
                  <div
                    key={theme.id}
                    onClick={() => setTheme(theme.id)}
                    className={`group relative p-4 bg-bg-panel-raised/40 border cursor-pointer transition-all duration-300 flex flex-col justify-between hover:border-nerv-orange ${
                      isSelected
                        ? 'border-nerv-orange ring-1 ring-nerv-orange/50'
                        : 'border-border-subtle hover:bg-bg-panel-raised'
                    }`}
                  >
                    {/* Top Info */}
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-orbitron font-bold text-xs text-text-primary tracking-wider group-hover:text-nerv-orange transition-colors">
                          {theme.name}
                        </span>
                        {isSelected && (
                          <span className="text-[9px] font-black font-orbitron px-1.5 py-0.5 bg-nerv-orange/20 text-nerv-orange border border-nerv-orange/30 rounded uppercase tracking-widest leading-none">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-text-muted mt-1 leading-relaxed uppercase">
                        {theme.inspiration}
                      </p>
                      <p className="text-[10px] text-text-dim mt-0.5 leading-snug">
                        {theme.mood}
                      </p>
                    </div>

                    {/* Color preview cluster */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-border-subtle/50">
                      {/* Swatch dots */}
                      <div className="flex gap-1.5">
                        <span className="w-4.5 h-4.5 rounded border border-border-subtle/80 block" style={{ backgroundColor: theme.colors.bgVoid }} title="Void" />
                        <span className="w-4.5 h-4.5 rounded border border-border-subtle/80 block" style={{ backgroundColor: theme.colors.bgPanel }} title="Panel" />
                        <span className="w-4.5 h-4.5 rounded border border-border-subtle/80 block" style={{ backgroundColor: theme.colors.accentPrimary }} title="Primary" />
                        <span className="w-4.5 h-4.5 rounded border border-border-subtle/80 block" style={{ backgroundColor: theme.colors.accentSecondary }} title="Secondary" />
                      </div>
                      
                      {/* Font family preview */}
                      <span className="text-[10px] font-mono text-text-dim uppercase tracking-wider">
                        {theme.typography.displayFont}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <p className="text-[10px] text-text-dim uppercase leading-relaxed block pt-1 font-mono-tech">
              🔒 MASTER OVERLAY INTERFACE WILL SYNCHRONIZE COLOR, TYPOGRAPHY & MOTIFS TO ACTIVE PROFILE IMMEDIATELY.
            </p>
          </div>
        </div>

        {/* Right Hand: Backup Terminals */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-bg-panel border border-border-subtle p-5 rounded-lg space-y-5 h-full flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold font-orbitron tracking-widest text-text-primary flex items-center gap-2 border-b border-border-subtle pb-3">
                <Layers className="w-4 h-4 text-nerv-orange" />
                SYSTEM COGNITIVE BACKUP
              </h3>
              <p className="text-xs text-text-muted leading-relaxed mt-2 uppercase font-rajdhani">
                Since all records live entirely inside your local browser sandbox, export daily backups to secure your syllabus completion matrices against cache purge.
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4">
              {/* Export backup */}
              <button
                type="button"
                onClick={handleExport}
                className="w-full flex items-center justify-center gap-2.5 p-3 bg-sync-green/10 border border-sync-green hover:bg-sync-green hover:text-bg-void text-sync-green font-bold font-orbitron tracking-widest text-xs transition-all rounded-sm cursor-pointer uppercase"
              >
                <Download className="w-4.5 h-4.5" />
                EXPORT SECURE backup.json
              </button>

              {/* Import backup */}
              <div className="relative">
                <input
                  type="file"
                  accept="application/json"
                  onChange={handleImportFileSelect}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                />
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-2.5 p-3 bg-bg-void hover:bg-bg-panel-raised border border-border-subtle hover:border-nerv-orange text-text-muted hover:text-text-primary font-bold font-orbitron tracking-widest text-xs transition-all rounded-sm cursor-pointer uppercase"
                >
                  <Upload className="w-4.5 h-4.5" />
                  IMPORT SECURE backup.json
                </button>
              </div>

              <div className="text-[10px] font-mono-tech text-text-dim text-center uppercase leading-tight pt-1">
                ⚠️ NOTICE: Standard JSON backup vectors exclude compiled PDF document blobs to preserve file efficiency.
              </div>
            </div>

            {/* Final Save Core */}
            <div className="border-t border-border-subtle pt-5 mt-auto">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2.5 p-3.5 bg-nerv-orange border border-nerv-orange hover:bg-transparent text-bg-void hover:text-nerv-orange font-bold font-orbitron tracking-widest text-xs transition-all rounded-sm cursor-pointer uppercase shadow-lg shadow-nerv-orange/10 active:scale-95"
              >
                <Settings className="w-4.5 h-4.5" />
                SYNCHRONIZE MASTER PARAMETERS
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Import Preview Modal */}
      {importPreview.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-void/85 animate-fadeIn">
          <div className="bg-bg-panel border border-alert-red w-full max-w-md rounded overflow-hidden shadow-2xl font-rajdhani">
            <div className="h-1.5 hazard-stripe"></div>
            <div className="p-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 flex items-center justify-center rounded border border-alert-red bg-alert-red/15 text-alert-red shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-md font-bold font-orbitron tracking-widest text-text-primary uppercase">
                    DESTRUCTIVE SYSTEM OVERRIDE OVERVIEW
                  </h3>
                  <p className="text-sm text-text-muted mt-1 leading-relaxed">
                    Executing this import will permanently wipe all local database indexes and replace them with the following schema backup:
                  </p>

                  {importPreview.error ? (
                    <div className="mt-4 p-3 bg-alert-red/10 border border-alert-red text-alert-red rounded text-xs font-mono-tech uppercase">
                      <strong>RESTORATION VECTOR CORRUPTED:</strong>
                      <p className="mt-1">{importPreview.error}</p>
                    </div>
                  ) : (
                    <div className="mt-4 p-4 bg-bg-void border border-border-subtle rounded font-mono-tech text-xs space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-text-muted">CHAPTER RECORDS:</span>
                        <span className="text-text-primary font-bold">{importPreview.chaptersCount} INDEXED</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">LECTURE ROW ELEMENTS:</span>
                        <span className="text-text-primary font-bold">{importPreview.lecturesCount} ROWS</span>
                      </div>
                      <div className="flex justify-between font-bold text-sync-green">
                        <span>TEST LOG ENTRIES:</span>
                        <span>{importPreview.testsCount} ENTRIES</span>
                      </div>
                      <div className="flex justify-between border-t border-border-subtle/50 pt-1.5">
                        <span className="text-text-muted">PHASE 1 THRESHOLD:</span>
                        <span className="text-text-primary font-bold uppercase">{importPreview.phase1End}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  onClick={() => setImportPreview(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-1.5 border border-border-subtle text-text-muted hover:text-text-primary hover:bg-bg-panel-raised text-xs font-bold tracking-widest rounded transition-colors cursor-pointer"
                >
                  ABORT
                </button>
                {!importPreview.error && (
                  <button
                    type="button"
                    onClick={executeImport}
                    className="px-4 py-1.5 bg-alert-red border border-alert-red text-white hover:bg-transparent hover:text-alert-red font-bold tracking-widest text-xs uppercase rounded transition-all cursor-pointer"
                  >
                    OVERWRITE LOCAL STORAGE
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
