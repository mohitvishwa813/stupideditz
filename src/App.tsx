/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { CourseSession, VideoAsset, YouTubeBreakdown, UserProfile, Course, HeroShowcaseOption, BundlePromo } from './types';
import { INITIAL_HERO_OPTIONS } from './data/initialData';
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
  const navigate = useNavigate();
  const [studentPortalTab, setStudentPortalTab] = useState<'enrolled-courses' | 'classroom' | 'doubts' | 'assets' | 'assignments' | 'mock-test' | 'orders' | 'account'>('enrolled-courses');
  
  const [sessions, setSessions] = useState<CourseSession[]>(() => StorageService.getSessions());
  const [assets, setAssets] = useState<VideoAsset[]>(() => StorageService.getAssets());
  const [youtubeBreakdowns, setYoutubeBreakdowns] = useState<YouTubeBreakdown[]>(() => StorageService.getYouTubeBreakdowns());
  const [bundlePromo, setBundlePromo] = useState<BundlePromo>(() => StorageService.getBundlePromo());
  const [courses, setCourses] = useState<Course[]>(() => StorageService.getCourses());
  const [heroOptions, setHeroOptions] = useState<HeroShowcaseOption[]>(INITIAL_HERO_OPTIONS);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => StorageService.getCurrentUser());
  
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginModalMode, setLoginModalMode] = useState<'signin' | 'register'>('signin');
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [enrollCourseId, setEnrollCourseId] = useState<string>('course-davinci-26');
  const [selectedEnrollCourse, setSelectedEnrollCourse] = useState<Course | null>(null);

  // Load live data from Turso Cloud on mount
  useEffect(() => {
    let isMounted = true;
    async function loadTursoData() {
      try {
        const [dbSessions, dbBreakdowns, dbPromo, dbCourses, dbStudents, dbAssets, dbHeroOptions] = await Promise.all([
          DbService.getSessions(),
          DbService.getYouTubeBreakdowns(),
          DbService.getBundlePromo(),
          DbService.getCourses(),
          DbService.getStudents(),
          DbService.getAssets(),
          DbService.getHeroOptions()
        ]);
        if (isMounted) {
          if (dbSessions && dbSessions.length > 0) setSessions(dbSessions);
          if (dbBreakdowns && dbBreakdowns.length > 0) setYoutubeBreakdowns(dbBreakdowns);
          if (dbPromo) setBundlePromo(dbPromo);
          if (dbCourses && dbCourses.length > 0) setCourses(dbCourses);
          if (dbAssets && dbAssets.length > 0) setAssets(dbAssets);
          if (dbHeroOptions && dbHeroOptions.length > 0) setHeroOptions(dbHeroOptions);
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
    const path = view === 'home' ? '/' : `/${view}`;
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenLogin = (mode: 'signin' | 'register' = 'signin') => {
    setLoginModalMode(mode);
    setIsLoginModalOpen(true);
  };

  const handleLoginSuccess = (
    user: UserProfile, 
    redirectView?: 'home' | 'student-portal' | 'admin-console' | 'enrolled-courses' | 'none'
  ) => {
    setCurrentUser(user);
    
    if (redirectView === 'none') return;

    if (redirectView === 'admin-console' || user.role === 'admin') {
      navigate('/admin-console');
    } else if (redirectView === 'student-portal' || redirectView === 'enrolled-courses') {
      setStudentPortalTab('enrolled-courses');
      navigate('/student-portal');
    } else if (redirectView === 'home') {
      navigate('/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    soundFx.playPop();
    StorageService.setCurrentUser(null);
    setCurrentUser(null);
    navigate('/');
  };

  const handleOpenEnrollModal = (courseOrId?: Course | string) => {
    if (typeof courseOrId === 'object' && courseOrId !== null) {
      setSelectedEnrollCourse(courseOrId);
      setEnrollCourseId(courseOrId.id);
    } else if (typeof courseOrId === 'string') {
      setEnrollCourseId(courseOrId);
      const found = courses.find(c => c.id === courseOrId);
      if (found) setSelectedEnrollCourse(found);
    }
    setIsEnrollModalOpen(true);
  };

  const handleEnrollSuccess = (batch: string) => {
    const updatedUser = StorageService.enrollUserInCourse(enrollCourseId, batch);
    setCurrentUser(updatedUser);
    setStudentPortalTab('enrolled-courses');
    navigate('/student-portal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Studio Navigation */}
      <Navbar
        studentActiveTab={studentPortalTab}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        onOpenLogin={handleOpenLogin}
        onLogout={handleLogout}
        onOpenEnroll={() => handleOpenEnrollModal('course-davinci-26')}
        onUpdateUser={(updated) => setCurrentUser(updated)}
      />

      {/* Main View Router */}
      <main className="flex-1">
        <Routes>
          {/* DASHBOARD PAGE (Default Landing View) */}
          <Route path="/" element={
            <>
              <HeroSection
                sessionsCount={sessions.length}
                heroOptions={heroOptions}
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

              {/* Free Sample & Creator Asset Vault */}
              <div id="asset-vault-section">
                <AssetVaultSection
                  assets={assets}
                  bundlePromo={bundlePromo}
                  currentUser={currentUser}
                  onOpenLoginModal={() => setIsLoginModalOpen(true)}
                />
              </div>

              {/* YouTube & Documentary Breakdown Deconstructions */}
              <YouTubeBreakdownSection
                breakdowns={youtubeBreakdowns}
                assets={assets}
                currentUser={currentUser}
                onOpenLoginModal={() => setIsLoginModalOpen(true)}
              />
            </>
          } />

          {/* STANDALONE ASSET VAULT VIEW */}
          <Route path="/assets" element={
            <div className="pt-6">
              <AssetVaultSection
                assets={assets}
                bundlePromo={bundlePromo}
                currentUser={currentUser}
                onOpenLoginModal={() => setIsLoginModalOpen(true)}
              />
            </div>
          } />

          {/* STANDALONE VIDEO BREAKDOWNS VIEW */}
          <Route path="/breakdowns" element={
            <div className="pt-6">
              <YouTubeBreakdownSection
                breakdowns={youtubeBreakdowns}
                assets={assets}
                currentUser={currentUser}
                onOpenLoginModal={() => setIsLoginModalOpen(true)}
              />
            </div>
          } />

          {/* STUDENT LEARNING HUB & ENROLLED COURSES VIEW */}
          <Route path="/student-portal" element={
            currentUser ? (
              <StudentPortal
                sessions={sessions}
                currentUser={currentUser}
                initialTab={studentPortalTab}
                onLogout={handleLogout}
                onNavigateToAdmin={() => handleNavigate('admin-console')}
                onNavigateHome={() => handleNavigate('home')}
                onOpenEnroll={handleOpenEnrollModal}
                onUpdateUser={(updated) => setCurrentUser(updated)}
              />
            ) : (
              <Navigate to="/" replace />
            )
          } />

          {/* ADMIN STUDIO CONSOLE */}
          <Route path="/admin-console" element={
            currentUser && currentUser.role === 'admin' ? (
              <AdminConsole
                sessions={sessions}
                onUpdateSessions={handleUpdateSessions}
                currentUser={currentUser}
                onNavigateToStudentPortal={() => handleNavigate('student-portal', 'enrolled-courses')}
                onLogout={handleLogout}
                assets={assets}
                onUpdateAssets={handleUpdateAssets}
                courses={courses}
                onUpdateCourses={handleUpdateCourses}
                heroOptions={heroOptions}
                onUpdateHeroOptions={(newHeroOptions) => setHeroOptions(newHeroOptions)}
                youtubeBreakdowns={youtubeBreakdowns}
                onUpdateYoutubeBreakdowns={(b) => setYoutubeBreakdowns(b)}
                bundlePromo={bundlePromo}
                onUpdateBundlePromo={(p) => setBundlePromo(p)}
              />
            ) : (
              <Navigate to="/" replace />
            )
          } />

          {/* Catch-all Fallback Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
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
        course={selectedEnrollCourse}
        currentUser={currentUser}
        onEnrollSuccess={handleEnrollSuccess}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          StorageService.setCurrentUser(user);
        }}
      />
    </div>
  );
}
