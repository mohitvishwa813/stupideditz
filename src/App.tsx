/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CourseSession, VideoAsset, YouTubeBreakdown, UserProfile, Course } from './types';
import { StorageService, DEFAULT_STUDENT_USER, DEFAULT_ADMIN_USER, GUEST_USER } from './services/storageService';
import { DbService } from './services/dbService';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { CoursesSection } from './components/CoursesSection';
import { AssetVaultSection } from './components/AssetVaultSection';
import { YouTubeBreakdownSection } from './components/YouTubeBreakdownSection';
import { CurriculumOverview } from './components/CurriculumOverview';
import { StudentPortal } from './components/StudentPortal';
import { AdminConsole } from './components/AdminConsole';
import { Footer } from './components/Footer';
import { LoginModal } from './components/modals/LoginModal';
import { EnrollModal } from './components/modals/EnrollModal';
import { soundFx } from './utils/soundEffects';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'student-portal' | 'admin-console' | 'assets' | 'breakdowns'>('home');
  const [studentPortalTab, setStudentPortalTab] = useState<'enrolled-courses' | 'classroom' | 'doubts' | 'assets' | 'assignments' | 'mock-test'>('enrolled-courses');
  
  const [sessions, setSessions] = useState<CourseSession[]>(() => StorageService.getSessions());
  const [assets, setAssets] = useState<VideoAsset[]>(() => StorageService.getAssets());
  const [youtubeBreakdowns, setYoutubeBreakdowns] = useState<YouTubeBreakdown[]>(() => StorageService.getYouTubeBreakdowns());
  const [courses, setCourses] = useState<Course[]>(() => StorageService.getCourses());
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => StorageService.getCurrentUser());
  
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginModalMode, setLoginModalMode] = useState<'signin' | 'register'>('signin');
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [enrollCourseId, setEnrollCourseId] = useState<string>('course-davinci-26');

  // Load live data from Turso Cloud on mount
  useEffect(() => {
    let isMounted = true;
    async function loadTursoData() {
      try {
        const [dbSessions, dbBreakdowns, dbCourses, dbStudents] = await Promise.all([
          DbService.getSessions(),
          DbService.getYouTubeBreakdowns(),
          DbService.getCourses(),
          DbService.getStudents()
        ]);
        if (isMounted) {
          if (dbSessions && dbSessions.length > 0) setSessions(dbSessions);
          if (dbBreakdowns && dbBreakdowns.length > 0) setYoutubeBreakdowns(dbBreakdowns);
          if (dbCourses && dbCourses.length > 0) setCourses(dbCourses);
        }
      } catch (err) {
        console.warn('Failed loading data from Turso, using local defaults:', err);
      }
    }
    loadTursoData();
    return () => { isMounted = false; };
  }, []);

  // Sync sessions when updated from Admin
  const handleUpdateSessions = (newSessions: CourseSession[]) => {
    setSessions(newSessions);
  };

  const handleUpdateAssets = (newAssets: VideoAsset[]) => {
    setAssets(newAssets);
    StorageService.saveAssets(newAssets);
  };

  const handleUpdateCourses = (newCourses: Course[]) => {
    setCourses(newCourses);
    StorageService.saveCourses(newCourses);
  };

  const handleNavigate = (
    view: 'home' | 'student-portal' | 'admin-console' | 'assets' | 'breakdowns',
    studentTab?: 'enrolled-courses' | 'classroom' | 'doubts' | 'assets' | 'assignments' | 'mock-test'
  ) => {
    soundFx.playClick();
    if (studentTab) {
      setStudentPortalTab(studentTab);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenLogin = (mode: 'signin' | 'register' = 'signin') => {
    setLoginModalMode(mode);
    setIsLoginModalOpen(true);
  };

  const handleLoginSuccess = (
    user: UserProfile, 
    redirectView?: 'home' | 'student-portal' | 'admin-console' | 'enrolled-courses'
  ) => {
    setCurrentUser(user);
    if (redirectView === 'admin-console' || user.role === 'admin') {
      setCurrentView('admin-console');
    } else {
      setStudentPortalTab('enrolled-courses');
      setCurrentView('student-portal');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    soundFx.playPop();
    StorageService.setCurrentUser(null);
    setCurrentUser(null);
    setCurrentView('home');
  };

  const handleOpenEnrollModal = (courseId?: string) => {
    if (courseId) setEnrollCourseId(courseId);
    setIsEnrollModalOpen(true);
  };

  const handleEnrollSuccess = (batch: string) => {
    const updatedUser = StorageService.enrollUserInCourse(enrollCourseId, batch);
    setCurrentUser(updatedUser);
    setStudentPortalTab('enrolled-courses');
    setCurrentView('student-portal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Studio Navigation */}
      <Navbar
        currentView={currentView}
        studentActiveTab={studentPortalTab}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        onOpenLogin={handleOpenLogin}
        onLogout={handleLogout}
        onOpenEnroll={() => handleOpenEnrollModal('course-davinci-26')}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {/* DASHBOARD PAGE (Default Landing View) */}
        {currentView === 'home' && (
          <>
            <HeroSection
              sessionsCount={sessions.length}
              onExploreCurriculum={() => {
                const elem = document.getElementById('courses-section');
                if (elem) elem.scrollIntoView({ behavior: 'smooth' });
              }}
              onExploreAssets={() => {
                const elem = document.getElementById('asset-vault-section');
                if (elem) elem.scrollIntoView({ behavior: 'smooth' });
              }}
              onOpenStudentPortal={(tab) => handleNavigate('student-portal', tab || 'enrolled-courses')}
              onOpenEnroll={(courseId) => handleOpenEnrollModal(courseId || 'course-davinci-26')}
              currentUser={currentUser}
            />

            {/* Courses Masterclass Catalog */}
            <CoursesSection
              courses={courses}
              onSelectCourse={(course) => handleOpenEnrollModal(course.id)}
              onOpenEnroll={(courseId) => handleOpenEnrollModal(courseId)}
              onOpenStudentPortal={(tab) => handleNavigate('student-portal', tab || 'enrolled-courses')}
              currentUser={currentUser}
            />

            {/* 26-Day Live Schedule & Syllabus - Hidden from landing page (code preserved) */}
            {/* 
            <CurriculumOverview
              sessions={sessions}
              onOpenPortal={() => handleNavigate('student-portal', 'classroom')}
              onOpenEnroll={() => handleOpenEnrollModal('course-davinci-26')}
            /> 
            */}

            {/* Free Sample & Creator Asset Vault */}
            <div id="asset-vault-section">
              <AssetVaultSection
                assets={assets}
                currentUser={currentUser}
                onOpenLoginModal={() => setIsLoginModalOpen(true)}
              />
            </div>

            {/* YouTube & Documentary Breakdown Deconstructions */}
            <YouTubeBreakdownSection breakdowns={youtubeBreakdowns} assets={assets} />
          </>
        )}

        {/* STANDALONE ASSET VAULT VIEW */}
        {currentView === 'assets' && (
          <div className="pt-6">
            <AssetVaultSection
              assets={assets}
              currentUser={currentUser}
              onOpenLoginModal={() => setIsLoginModalOpen(true)}
            />
          </div>
        )}

        {/* STANDALONE VIDEO BREAKDOWNS VIEW */}
        {currentView === 'breakdowns' && (
          <div className="pt-6">
            <YouTubeBreakdownSection breakdowns={youtubeBreakdowns} assets={assets} />
          </div>
        )}

        {/* STUDENT LEARNING HUB & ENROLLED COURSES VIEW */}
        {currentView === 'student-portal' && (
          <StudentPortal
            sessions={sessions}
            currentUser={currentUser || DEFAULT_STUDENT_USER}
            initialTab={studentPortalTab}
            onLogout={handleLogout}
            onNavigateToAdmin={() => handleNavigate('admin-console')}
            onNavigateHome={() => handleNavigate('home')}
            onOpenEnroll={handleOpenEnrollModal}
          />
        )}

        {/* ADMIN STUDIO CONSOLE (Protected & accessible when authenticated as Admin) */}
        {currentView === 'admin-console' && (
          <AdminConsole
            sessions={sessions}
            onUpdateSessions={handleUpdateSessions}
            currentUser={currentUser || DEFAULT_ADMIN_USER}
            onNavigateToStudentPortal={() => handleNavigate('student-portal', 'enrolled-courses')}
            onLogout={handleLogout}
            assets={assets}
            onUpdateAssets={handleUpdateAssets}
            courses={courses}
            onUpdateCourses={handleUpdateCourses}
          />
        )}
      </main>

      {/* Global Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenLogin={() => handleOpenLogin('signin')}
      />

      {/* Authentication Sign-In & Register Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        initialMode={loginModalMode}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Cohort Enrollment Modal */}
      <EnrollModal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        onEnrollSuccess={handleEnrollSuccess}
      />
    </div>
  );
}
