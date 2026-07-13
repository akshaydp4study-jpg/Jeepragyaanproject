import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { db } from './db/db';
import { seedDatabase } from './db/seed';
import AppShell from './components/layout/AppShell';
import Dashboard from './components/dashboard/Dashboard';
import SubjectPage from './components/subjects/SubjectPage';
import TestsPage from './components/tests/TestsPage';
import ProblemSolvingPage from './components/problem-solving/ProblemSolvingPage';
import SettingsPage from './components/settings/SettingsPage';
import ErrorBoundary from './components/common/ErrorBoundary';
import { RefreshCw } from 'lucide-react';

import { ThemeProvider } from './context/ThemeContext';

export default function App() {
  const [isDbReady, setIsDbReady] = useState(false);
  const [storageUnavailable, setStorageUnavailable] = useState(false);

  useEffect(() => {
    async function initializeApp() {
      try {
        // Try opening the database
        await db.open();
        // Run seeding (idempotent, skips if already seeded)
        await seedDatabase();
        setIsDbReady(true);
      } catch (err) {
        console.error('Core Database initialization failed (Incognito/Private Mode likely):', err);
        setStorageUnavailable(true);
        setIsDbReady(true); // Let the app render, warning banner will display
      }
    }
    initializeApp();
  }, []);

  if (!isDbReady) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] text-[#e8e8e8] flex flex-col items-center justify-center font-rajdhani select-none">
        <div className="flex flex-col items-center gap-4 text-center">
          <RefreshCw className="w-10 h-10 animate-spin text-[#ff6600]" />
          <div className="space-y-1">
            <h2 className="text-lg font-black font-orbitron tracking-widest text-[#ff6600] uppercase">
              NERV INTEGRATED COMMAND TERMINAL
            </h2>
            <p className="text-xs font-mono-tech text-[#8a8a8a] uppercase tracking-wider">
              ALIGNING MAGI PARALLEL PROFILES... SECURING LOCAL ENCLAVES
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppShell storageUnavailable={storageUnavailable}>
          <Routes>
            {/* 1. Dashboard Route */}
            <Route
              path="/"
              element={
                <ErrorBoundary sectionName="Dashboard Hub">
                  <Dashboard />
                </ErrorBoundary>
              }
            />

            {/* 2. Physics Chapter Tracking */}
            <Route
              path="/physics"
              element={
                <ErrorBoundary sectionName="Physics Sector">
                  <SubjectPage subject="Physics" />
                </ErrorBoundary>
              }
            />

            {/* 3. Chemistry Chapter Tracking */}
            <Route
              path="/chemistry"
              element={
                <ErrorBoundary sectionName="Chemistry Sector">
                  <SubjectPage subject="Chemistry" />
                </ErrorBoundary>
              }
            />

            {/* 4. Maths Chapter Tracking */}
            <Route
              path="/maths"
              element={
                <ErrorBoundary sectionName="Mathematics Sector">
                  <SubjectPage subject="Maths" />
                </ErrorBoundary>
              }
            />


            {/* 5. Problem-solving session checklist */}
            <Route
              path="/problem-solving"
              element={
                <ErrorBoundary sectionName="Problem Solving Sessions">
                  <ProblemSolvingPage />
                </ErrorBoundary>
              }
            />

            {/* 6. Test Records Enclave */}
            <Route
              path="/tests"
              element={
                <ErrorBoundary sectionName="Test Logs Terminal">
                  <TestsPage />
                </ErrorBoundary>
              }
            />

            {/* 7. Settings overrides */}
            <Route
              path="/settings"
              element={
                <ErrorBoundary sectionName="Override Settings">
                  <SettingsPage />
                </ErrorBoundary>
              }
            />
          </Routes>
        </AppShell>
      </BrowserRouter>
    </ThemeProvider>
  );
}
