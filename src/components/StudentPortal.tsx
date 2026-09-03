import React, { useState, useEffect } from 'react';
import { CourseSession, StudentSubmission, UserProfile, EnrolledCourseInfo } from '../types';
import { 
  Award, 
  MessageSquare, 
  Star, 
  LogOut, 
  ExternalLink, 
  Clock, 
  Globe, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  FolderDown, 
  Play, 
  CheckCircle2, 
  Sparkles,
  Info,
  Calendar,
  Layers,
  ArrowRight,
  Video,
  FileText,
  HelpCircle,
  Download,
  Flame,
  Zap,
  Bookmark,
  Check,
  Send,
  Sliders,
  Filter,
  GraduationCap,
  FolderLock,
  ArrowLeft,
  BookOpen,
  Volume2,
  Film
} from 'lucide-react';
import { soundFx } from '../utils/soundEffects';
import { SubmitAssignmentModal } from './modals/SubmitAssignmentModal';
import { SessionRatingModal } from './modals/SessionRatingModal';
import { RecordingModal } from './modals/RecordingModal';
import { MockTestModal } from './modals/MockTestModal';
import { AskQuestionModal } from './modals/AskQuestionModal';
import { INITIAL_ASSETS, INITIAL_BUNDLE_PROMO } from '../data/initialData';

import { Receipt, Settings, User, Phone, Mail, Lock, CreditCard } from 'lucide-react';
import { StorageService } from '../services/storageService';

interface StudentPortalProps {
  sessions: CourseSession[];
  currentUser: UserProfile;
  onLogout: () => void;
  onNavigateToAdmin?: () => void;
  onNavigateHome: () => void;
  onOpenEnroll?: (courseId?: string) => void;
  onUpdateUser?: (updatedUser: UserProfile) => void;
  initialTab?: 'enrolled-courses' | 'classroom' | 'doubts' | 'assets' | 'assignments' | 'mock-test' | 'orders' | 'account';
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  sessions,
  currentUser,
  onLogout,
  onNavigateToAdmin,
  onNavigateHome,
  onOpenEnroll,
  onUpdateUser,
  initialTab = 'enrolled-courses'
}) => {
  const [activeTab, setActiveTab] = useState<'enrolled-courses' | 'classroom' | 'doubts' | 'assets' | 'assignments' | 'mock-test' | 'notes' | 'orders' | 'account'>(initialTab);
  const [selectedWeek, setSelectedWeek] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTimezone, setSelectedTimezone] = useState<'IST' | 'Dubai' | 'London' | 'New York' | 'Singapore'>('IST');
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  // Profile Edit State for Account Details Tab
  const [profileName, setProfileName] = useState(currentUser.name || '');
  const [profilePhone, setProfilePhone] = useState(currentUser.phone || '');
  const [profileAvatar, setProfileAvatar] = useState(currentUser.avatar || '');
  const [profileSavedToast, setProfileSavedToast] = useState(false);

  // Sync initial tab if parent prop changes
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Modals state
  const [submittingSession, setSubmittingSession] = useState<CourseSession | null>(null);
  const [ratingSession, setRatingSession] = useState<CourseSession | null>(null);
  const [recordingSession, setRecordingSession] = useState<CourseSession | null>(null);
  const [isMockTestOpen, setIsMockTestOpen] = useState(false);
  const [isAskQuestionOpen, setIsAskQuestionOpen] = useState(false);
  const [askModalMode, setAskModalMode] = useState<'question' | 'feedback'>('question');

  // Student Local Notes State
  const [studentNotes, setStudentNotes] = useState<string>(() => {
    return localStorage.getItem('stupideditz_student_notes') || 
`# DaVinci Resolve Masterclass Notes
- **Cut Page Shortcuts**: 'W' and 'Q' to trim head/tail to playhead without switching tools.
- **Fusion Nodes**: Connect Background (Clean Plate) -> Merge -> Foreground (Actor Mask).
- **Color Wheels**: Lift (shadows) -> Gamma (midtones) -> Gain (highlights). Always check Parade Scopes.
- **Fairlight**: Voice Isolator at 65% removes room reverb cleanly without artificial distortion.
- **Saturday Doubt Session**: Ask Arjun about fixing GPU VRAM bottleneck during 4K Planar Tracking.`;
  });
  const [notesSavedToast, setNotesSavedToast] = useState(false);

  // Community Doubts State
  const [doubts, setDoubts] = useState<{ id: string; user: string; avatar: string; question: string; votes: number; answer?: string; tag: string }[]>([
    {
      id: 'd-1',
      user: 'Priya S.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      question: 'How do I prevent GPU memory full error when rendering 4K Fusion planar tracking?',
      votes: 14,
      answer: 'Go to Preferences > Memory and GPU > limit DaVinci Resolve RAM to 75% of your system RAM, and purge node render cache before tracking.',
      tag: 'Fusion'
    },
    {
      id: 'd-2',
      user: 'Rohan M.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      question: 'What is the best loudness LUFS standard for YouTube documentary dialogue in Fairlight?',
      votes: 19,
      answer: 'Aim for -14 LUFS integrated with dialogue peaks between -1.0 dB to -2.0 dB True Peak.',
      tag: 'Audio'
    }
  ]);
  const [newDoubtText, setNewDoubtText] = useState('');

  // Strict Access Control Check for Enrolled Masterclasses
  const isUserEnrolled = Boolean(
    currentUser?.isEnrolled && currentUser?.enrolledCourses && currentUser.enrolledCourses.length > 0
  );

  const enrolledCoursesList = isUserEnrolled ? (
    (currentUser.enrolledCourses || []).map((course: any) => {
      if (typeof course === 'string') {
        const catalog = StorageService.getCourses();
        const found = catalog.find(c => c.id === course) || catalog[0];
        if (!found) return null;
        return {
          courseId: found.id,
          courseTitle: found.title,
          batch: 'September 2026 Live Cohort',
          enrolledDate: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
          progressPercent: 18,
          completedDays: 2,
          totalDays: found.totalDays,
          nextSessionDay: 'Day 03',
          nextSessionTopic: 'Cut Page Full Editing + Keyboard Shortcuts',
          nextSessionTime: 'Upcoming 3:30 PM IST',
          meetUrl: 'https://meet.google.com/std-edit-live',
          status: 'Active',
          thumbnail: found.thumbnail,
          instructor: found.instructorName
        };
      }
      return course;
    }).filter(Boolean)
  ) : [];

  // Calculate Progress
  const completedCount = sessions.filter(s => s.status === 'completed').length;
  const progressPercent = Math.round((completedCount / sessions.length) * 100) || 68;

  const timezoneOffset: Record<string, string> = {
    IST: '3:30 PM IST',
    Dubai: '2:00 PM GST',
    London: '11:00 AM BST',
    'New York': '6:00 AM EDT',
    Singapore: '6:00 PM SGT',
  };

  const handleSaveNotes = (val: string) => {
    setStudentNotes(val);
    localStorage.setItem('stupideditz_student_notes', val);
    setNotesSavedToast(true);
    setTimeout(() => setNotesSavedToast(false), 2000);
  };

  const handleAddDoubt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoubtText.trim()) return;
    soundFx.playPop();
    const newD: (typeof doubts)[0] = {
      id: 'd-' + Date.now(),
      user: currentUser.name || 'You',
      avatar: currentUser.avatar,
      question: newDoubtText.trim(),
      votes: 1,
      tag: 'Live Doubt'
    };
    setDoubts([newD, ...doubts]);
    setNewDoubtText('');
  };

  const handleUpvoteDoubt = (id: string) => {
    soundFx.playClick();
    setDoubts(doubts.map(d => d.id === id ? { ...d, votes: d.votes + 1 } : d));
  };

  // Filtered Sessions
  const filteredSessions = sessions.filter(s => {
    const matchWeek = selectedWeek === 'all' || s.weekNumber === selectedWeek;
    const matchSearch = s.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.agenda.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.dayCode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchWeek && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#0a0c16] text-slate-100 pb-20">
      {/* Top Banner Navigation & Student Header */}
      <div className="bg-[#101424] border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Left Title & Back button */}
            <div className="flex items-center gap-3">
              <button
                onClick={onNavigateHome}
                className="p-2 rounded-xl bg-[#161a2e] hover:bg-[#1e243e] border border-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Back to Dashboard"
                id="portal-back-btn"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-[#00e5a3]/15 text-[#00e5a3] border border-[#00e5a3]/30">
                    STUDENT LEARNING HUB
                  </span>
                  {isUserEnrolled && currentUser.enrolledBatch && (
                    <span className="text-xs text-slate-400 font-mono">
                      Batch: {currentUser.enrolledBatch}
                    </span>
                  )}
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold font-sans text-white mt-1">
                  Welcome back, {currentUser.name}
                </h1>
              </div>
            </div>
          </div>

          {/* Student Portal Navigation Tabs (4 Main Headers + Sub-Headers) */}
          <div className="mt-6 border-t border-slate-800/80 pt-4 space-y-3">
            {/* 1. Main Navigation Headers */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  soundFx.playClick();
                  setActiveTab('enrolled-courses');
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'enrolled-courses' || activeTab === 'classroom' || activeTab === 'doubts' || activeTab === 'notes'
                    ? 'bg-blue-600 text-white shadow-md font-bold ring-1 ring-blue-400/40'
                    : 'bg-[#141829] text-slate-400 hover:text-white hover:bg-[#1c223a]'
                }`}
                id="tab-enrolled-courses"
              >
                <GraduationCap className="w-4 h-4 text-blue-300" />
                <span>Enrolled Courses</span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                  activeTab === 'enrolled-courses' ? 'bg-blue-900/60 text-blue-200' : 'bg-slate-800 text-slate-400'
                }`}>
                  {enrolledCoursesList.length}
                </span>
              </button>

              <button
                onClick={() => {
                  soundFx.playClick();
                  setActiveTab('assets');
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'assets'
                    ? 'bg-blue-600 text-white shadow-md font-bold ring-1 ring-blue-400/40'
                    : 'bg-[#141829] text-slate-400 hover:text-white hover:bg-[#1c223a]'
                }`}
                id="tab-your-assets"
              >
                <FolderLock className="w-4 h-4 text-emerald-400" />
                <span>Your Assets</span>
              </button>

              <button
                onClick={() => {
                  soundFx.playClick();
                  setActiveTab('orders');
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'orders'
                    ? 'bg-blue-600 text-white shadow-md font-bold ring-1 ring-blue-400/40'
                    : 'bg-[#141829] text-slate-400 hover:text-white hover:bg-[#1c223a]'
                }`}
                id="tab-orders-purchases"
              >
                <Receipt className="w-4 h-4 text-amber-400" />
                <span>Orders & Purchases</span>
              </button>

              <button
                onClick={() => {
                  soundFx.playClick();
                  setActiveTab('account');
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'account'
                    ? 'bg-blue-600 text-white shadow-md font-bold ring-1 ring-blue-400/40'
                    : 'bg-[#141829] text-slate-400 hover:text-white hover:bg-[#1c223a]'
                }`}
                id="tab-account-details"
              >
                <Settings className="w-4 h-4 text-indigo-400" />
                <span>Account Details</span>
              </button>
            </div>

            {/* 2. Sub-Headers (Shown ONLY if student is enrolled) */}
            {isUserEnrolled && (activeTab === 'enrolled-courses' || activeTab === 'classroom' || activeTab === 'doubts' || activeTab === 'notes') && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 border-t border-slate-800/50">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold mr-1 shrink-0">Sub-Sections:</span>
                
                <button
                  onClick={() => {
                    soundFx.playClick();
                    setActiveTab('enrolled-courses');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all shrink-0 ${
                    activeTab === 'enrolled-courses'
                      ? 'bg-[#00e5a3] text-slate-950 shadow-xs'
                      : 'bg-[#161a2c] text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  Course Overview
                </button>

                <button
                  onClick={() => {
                    soundFx.playClick();
                    setActiveTab('classroom');
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all shrink-0 ${
                    activeTab === 'classroom'
                      ? 'bg-[#ff5722] text-white shadow-xs'
                      : 'bg-[#161a2c] text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>26-Day Schedule & Lessons</span>
                </button>


              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* ============================================================ */}
        {/* TAB 1: ENROLLED COURSES */}
        {/* ============================================================ */}
        {activeTab === 'enrolled-courses' && (
          <div className="space-y-8 animate-fadeIn" id="enrolled-courses-view">
            {!isUserEnrolled ? (
              <div className="bg-[#101424] border border-slate-800/80 rounded-3xl p-8 text-center max-w-2xl mx-auto my-12 space-y-4 shadow-2xl relative overflow-hidden">
                <div className="w-16 h-16 rounded-2xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 mx-auto shadow-inner">
                  <FolderLock className="w-8 h-8" />
                </div>
                
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-blue-400">
                    PREMIUM LIVE BOOTCAMP ACCESS
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-white">
                    No Active Masterclass Enrollment
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                    All Stupid Editz cohorts are premium live masterclasses. Enroll in an active cohort to unlock the 26-Day Schedule, Saturday Doubts & Q&A, and personal DaVinci notes.
                  </p>
                </div>

                <div className="pt-3">
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      onNavigateHome();
                      setTimeout(() => {
                        const elem = document.getElementById('courses-section');
                        if (elem) {
                          elem.scrollIntoView({ behavior: 'smooth' });
                        }
                      }, 100);
                    }}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 mx-auto shadow-lg shadow-blue-600/25 transition-all hover:scale-[1.02]"
                    id="explore-masterclasses-btn"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Explore Masterclasses & Enroll Now</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    My Enrolled Courses & Masterclasses
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Access your active cohort classrooms, live Google Meet sessions, recordings, and project files.
                  </p>
                </div>

            {/* Enrolled Courses Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {enrolledCoursesList.map((course, idx) => (
                <div
                  key={course.courseId || idx}
                  className="bg-[#121627] border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between"
                  id={`enrolled-course-${course.courseId}`}
                >
                  {/* Decorative background glow */}
                  <div className="absolute top-0 right-0 w-48 h-48 bg-[#00e5a3]/5 blur-[80px] pointer-events-none" />

                  <div>
                    {/* Header with thumbnail & badge */}
                    <div className="flex gap-4 items-start">
                      <img
                        src={course.thumbnail}
                        alt={course.courseTitle}
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-1 ring-slate-700 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="px-2.5 py-0.5 rounded-full bg-[#00e5a3]/20 text-[#00e5a3] text-[10px] font-extrabold uppercase tracking-wide border border-[#00e5a3]/30">
                            {course.status} Cohort
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            {course.batch}
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-extrabold text-white font-sans leading-tight">
                          {course.courseTitle}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                          <span>Instructor: <strong className="text-slate-200">{course.instructor}</strong></span>
                          <span>•</span>
                          <span>{course.totalDays} Total Days</span>
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-6 bg-[#0c0e18] p-4 rounded-2xl border border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-300">Cohort Completion Progress</span>
                        <span className="text-[#00e5a3] font-mono font-bold">
                          {course.progressPercent}% ({course.completedDays}/{course.totalDays} Days)
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#00e5a3] to-[#00b884] rounded-full transition-all duration-500"
                          style={{ width: `${course.progressPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Next Live Session Alert */}
                    <div className="mt-4 p-4 rounded-2xl bg-[#171d30] border border-slate-700/80 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#ff5722]/15 border border-[#ff5722]/30 flex items-center justify-center text-[#ff7043] shrink-0">
                          <Video className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-[10px] font-mono text-[#ff7043] font-bold uppercase">
                            Next Live Session • {course.nextSessionDay}
                          </div>
                          <div className="text-xs font-bold text-white truncate max-w-[200px] sm:max-w-xs">
                            {course.nextSessionTopic}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {course.nextSessionTime}
                          </div>
                        </div>
                      </div>
                      <a
                        href={course.meetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-[#ff5722] hover:bg-[#f4511e] text-white text-xs font-bold shrink-0 flex items-center gap-1 transition-all"
                      >
                        <span>Join</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {/* Actions Grid */}
                  <div className="mt-6 pt-4 border-t border-slate-800 grid grid-cols-1 gap-2">
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        setActiveTab('classroom');
                      }}
                      className="py-2.5 px-3 rounded-xl bg-[#192036] hover:bg-[#222b49] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-slate-700/80"
                      id={`enter-classroom-${course.courseId}`}
                    >
                      <Calendar className="w-3.5 h-3.5 text-[#ff7043]" />
                      <span>Classroom</span>
                    </button>
                  </div>
                </div>
              ))}

              {/* Add New Masterclass Card */}
              <div className="bg-[#101322]/60 border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-3xl p-6 flex flex-col items-center justify-center text-center p-8 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-[#161a2c] flex items-center justify-center text-[#ff7043] mb-4">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white font-['Syne',sans-serif]">
                  Expand Your Video Production Skills
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Enroll in specialized bootcamps for Fusion 3D motion graphics or Fairlight documentary audio mixing.
                </p>
                <button
                  onClick={() => {
                    soundFx.playClick();
                    if (onOpenEnroll) onOpenEnroll();
                  }}
                  className="mt-5 px-5 py-2.5 rounded-xl bg-[#161d32] hover:bg-[#202744] text-[#00e5a3] border border-[#00e5a3]/30 text-xs font-bold flex items-center gap-2 transition-colors"
                  id="browse-more-courses-btn"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Browse More Masterclasses</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    )}

        {/* ============================================================ */}
        {/* TAB 2: 26-DAY LIVE SCHEDULE & CLASSROOM */}
        {/* ============================================================ */}
        {activeTab === 'classroom' && (
          <div className="space-y-6 animate-fadeIn" id="schedule-classroom-view">
            {/* Header with Search and Week Filters */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-[#121627] p-4 rounded-2xl border border-slate-800">
              {/* Week filter pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setSelectedWeek('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedWeek === 'all'
                      ? 'bg-[#ff5722] text-white shadow-xs'
                      : 'bg-[#171b2d] text-slate-400 hover:text-white'
                  }`}
                >
                  All 26 Days
                </button>
                {[1, 2, 3, 4, 5, 6].map(w => (
                  <button
                    key={w}
                    onClick={() => setSelectedWeek(w)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedWeek === w
                        ? 'bg-[#ff5722] text-white shadow-xs'
                        : 'bg-[#171b2d] text-slate-400 hover:text-white'
                    }`}
                  >
                    Week {w}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search topics or shortcuts..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-[#171b2d] border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#ff5722]"
                />
              </div>
            </div>

            {/* Session Cards List */}
            <div className="space-y-4">
              {filteredSessions.map((session) => {
                const isExpanded = expandedSessionId === session.id;
                const isDoubt = session.type === 'Doubt Session';
                const isOff = session.type === 'Off';
                const isFuture = session.dateIso ? new Date(session.dateIso).setHours(0, 0, 0, 0) > new Date().setHours(0, 0, 0, 0) : false;

                return (
                  <div
                    key={session.id}
                    className={`rounded-2xl border transition-all ${
                      isOff 
                        ? 'bg-[#0d0f19]/60 border-slate-800/60 opacity-60' 
                        : isDoubt 
                        ? 'bg-[#1a1824] border-amber-500/30 shadow-lg shadow-amber-500/5' 
                        : 'bg-[#121627] border-slate-800 hover:border-slate-700 shadow-md'
                    }`}
                    id={`session-card-${session.id}`}
                  >
                    {/* Main Row */}
                    <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
                      {/* Left Date / Day Indicator */}
                      <div className="flex items-center gap-3.5">
                        <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-mono font-bold shrink-0 ${
                          isDoubt 
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' 
                            : isOff 
                            ? 'bg-slate-800 text-slate-500' 
                            : 'bg-[#ff5722]/20 text-[#ff7043] border border-[#ff5722]/40'
                        }`}>
                          <span className="text-[10px] uppercase">{session.monthShort || 'SEP'}</span>
                          <span className="text-base leading-none">{session.dayOfMonth || '15'}</span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-slate-400">
                              {session.dayCode} • {session.dateFormatted}
                            </span>
                            <span className={`text-[10px] font-extrabold px-2 py-0.2 rounded-full uppercase tracking-wider ${
                              isDoubt 
                                ? 'bg-amber-500/20 text-amber-400' 
                                : isOff 
                                ? 'bg-slate-800 text-slate-400' 
                                : 'bg-[#00e5a3]/20 text-[#00e5a3]'
                            }`}>
                              {session.type}
                            </span>
                          </div>
                          <h4 className="text-sm sm:text-base font-bold text-white mt-0.5">
                            {session.topic}
                          </h4>
                        </div>
                      </div>

                      {/* Right Action buttons */}
                      <div className="flex items-center gap-2">
                        {!isOff && session.meetUrl && (
                          <a
                            href={isFuture ? undefined : session.meetUrl}
                            target={isFuture ? undefined : "_blank"}
                            rel="noreferrer"
                            onClick={(e) => { if (isFuture) e.preventDefault(); }}
                            className={`px-3 py-1.5 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs ${
                              isFuture ? 'bg-slate-700/50 text-slate-400 cursor-not-allowed border border-slate-700' : 'bg-[#ff5722] hover:bg-[#f4511e]'
                            }`}
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Join Live</span>
                          </a>
                        )}

                        {!isOff && !isFuture && session.recordingUrl && (
                          <button
                            onClick={() => {
                              if (isFuture) return;
                              soundFx.playClick();
                              setRecordingSession(session);
                            }}
                            disabled={isFuture}
                            className={`px-3 py-1.5 rounded-xl text-[#00e5a3] text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-700 ${
                              isFuture ? 'bg-slate-800/50 text-slate-500 cursor-not-allowed' : 'bg-[#192036] hover:bg-[#222b49]'
                            }`}
                          >
                            <Play className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Recording</span>
                          </button>
                        )}

                        {!isOff && !isFuture && (
                          <button
                            onClick={() => {
                              if (isFuture) return;
                              soundFx.playClick();
                              setSubmittingSession(session);
                            }}
                            disabled={isFuture}
                            className={`px-3 py-1.5 rounded-xl text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-700 ${
                              isFuture ? 'bg-slate-800/50 text-slate-500 cursor-not-allowed' : 'bg-[#192036] hover:bg-[#222b49]'
                            }`}
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Homework</span>
                          </button>
                        )}

                        <button
                          onClick={() => setExpandedSessionId(isExpanded ? null : session.id)}
                          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                          title="Toggle details"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Subtopics & Materials */}
                    {isExpanded && (
                      <div className="px-5 pb-5 pt-2 border-t border-slate-800/80 bg-[#0e111d] rounded-b-2xl space-y-4">
                        <div>
                          <span className="text-[11px] font-mono text-slate-400 font-bold uppercase">
                            Session Agenda & Subtopics:
                          </span>
                          <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                            {session.subtopics?.map((sub, i) => (
                              <li key={i} className="flex items-start gap-2 bg-[#141829] p-2.5 rounded-xl border border-slate-800">
                                <Check className="w-3.5 h-3.5 text-[#00e5a3] shrink-0 mt-0.5" />
                                <span>{sub}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Resources row */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                          <div className="flex items-center gap-3 text-xs">
                            {session.deckUrl && (
                              <a
                                href={isFuture ? undefined : session.deckUrl}
                                target={isFuture ? undefined : "_blank"}
                                rel="noreferrer"
                                onClick={(e) => { if (isFuture) e.preventDefault(); }}
                                className={`flex items-center gap-1 ${isFuture ? 'text-slate-600 cursor-not-allowed' : 'text-blue-400 hover:underline'}`}
                              >
                                <ExternalLink className="w-3 h-3" />
                                Presentation Slides
                              </a>
                            )}
                            {session.filesDriveUrl && (
                              <a
                                href={isFuture ? undefined : session.filesDriveUrl}
                                target={isFuture ? undefined : "_blank"}
                                rel="noreferrer"
                                onClick={(e) => { if (isFuture) e.preventDefault(); }}
                                className={`flex items-center gap-1 ${isFuture ? 'text-slate-600 cursor-not-allowed' : 'text-[#00e5a3] hover:underline'}`}
                              >
                                <Download className="w-3 h-3" />
                                Practice Raw Media (.zip)
                              </a>
                            )}
                          </div>

                          <button
                            onClick={() => {
                              if (isFuture) return;
                              setRatingSession(session);
                            }}
                            disabled={isFuture}
                            className={`text-xs flex items-center gap-1 ${isFuture ? 'text-slate-600 cursor-not-allowed' : 'text-amber-400 hover:underline'}`}
                          >
                            <Star className={`w-3.5 h-3.5 ${isFuture ? 'fill-slate-600' : 'fill-amber-400'}`} />
                            Rate this Class
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: SATURDAY DOUBTS & Q&A */}
        {/* ============================================================ */}
        {activeTab === 'doubts' && (
          <div className="space-y-6 animate-fadeIn" id="doubts-view">
            <div className="bg-[#121627] p-6 rounded-3xl border border-slate-800">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold uppercase mb-2">
                <Flame className="w-4 h-4" />
                Live Every Saturday at 4:00 PM IST
              </div>
              <h2 className="text-2xl font-extrabold text-white font-sans">
                Saturday Doubt-Clearing Session Hub
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Post your DaVinci Resolve editing roadblocks, render glitches, or color node questions. Arjun will review and answer each live on Saturdays.
              </p>

              {/* Add Doubt Box */}
              <form onSubmit={handleAddDoubt} className="mt-6 flex gap-3">
                <input
                  type="text"
                  placeholder="Ask a question for Saturday's live session (e.g., Fixing audio clipping in Fairlight)..."
                  value={newDoubtText}
                  onChange={e => setNewDoubtText(e.target.value)}
                  className="flex-1 bg-[#171b2d] border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#ff5722]"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ff5722] to-[#ff7043] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Question</span>
                </button>
              </form>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {doubts.map(d => (
                <div key={d.id} className="bg-[#121627] border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img src={d.avatar} alt={d.user} className="w-7 h-7 rounded-full object-cover" />
                      <span className="text-xs font-bold text-white">{d.user}</span>
                      <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                        {d.tag}
                      </span>
                    </div>

                    <button
                      onClick={() => handleUpvoteDoubt(d.id)}
                      className="px-2.5 py-1 rounded-lg bg-[#192036] hover:bg-[#232b49] text-xs font-mono font-bold text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors border border-slate-700"
                    >
                      <span>▲ Upvote</span>
                      <span className="text-[#00e5a3]">{d.votes}</span>
                    </button>
                  </div>

                  <p className="text-sm text-slate-200 font-medium">
                    {d.question}
                  </p>

                  {d.answer && (
                    <div className="p-3 bg-[#172033] rounded-xl border border-blue-500/20 text-xs text-blue-200 flex items-start gap-2">
                      <span className="font-bold text-blue-400 shrink-0">Arjun (Instructor):</span>
                      <span>{d.answer}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: YOUR ASSETS */}
        {/* ============================================================ */}
        {activeTab === 'assets' && (
          <div className="space-y-6 animate-fadeIn" id="vault-view">
            {(!currentUser.purchasedAssets || currentUser.purchasedAssets.length === 0) ? (
              <div className="bg-[#101424] border border-slate-800/80 rounded-3xl p-8 text-center max-w-2xl mx-auto my-12 space-y-4 shadow-2xl relative overflow-hidden">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto shadow-inner">
                  <FolderLock className="w-8 h-8" />
                </div>
                
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400">
                    CREATOR ASSET VAULT
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-white">
                    No Purchased Creator Assets Yet
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                    You have not purchased any standalone asset packs yet. Browse the Creator Vault on our homepage to get instant access to 4K film grains, 3D LUTs, and DaVinci Fusion macros.
                  </p>
                </div>

                <div className="pt-3">
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      onNavigateHome();
                      setTimeout(() => {
                        const elem = document.getElementById('asset-vault-section');
                        if (elem) elem.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs flex items-center gap-2 mx-auto shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02]"
                    id="explore-assets-cta-btn"
                  >
                    <FolderDown className="w-4 h-4" />
                    <span>Explore Creator Asset Vault</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {currentUser.purchasedAssets.includes(INITIAL_BUNDLE_PROMO.id) && (
                  <div className="bg-[#121627] p-6 rounded-3xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-mono text-[#00e5a3] font-bold uppercase">
                        VIP STUDENT LOCKER
                      </span>
                      <h2 className="text-2xl font-extrabold text-white font-sans mt-1">
                        {INITIAL_BUNDLE_PROMO.title}
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-400 mt-1">
                        Download all licensed sound design assets, 3D LUTs, DaVinci Fusion macros, and project timelines.
                      </p>
                    </div>

                    <a
                      href={INITIAL_BUNDLE_PROMO.driveLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center gap-2 transition-colors border border-blue-500/50"
                    >
                      <Download className="w-4 h-4" />
                      <span>Access Bundle Drive</span>
                    </a>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {INITIAL_ASSETS.filter(a => currentUser.purchasedAssets?.includes(a.id)).map((asset) => (
                    <div key={asset.id} className="bg-[#121627] border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between">
                      <div className="relative aspect-video">
                        <img src={asset.thumbnail} alt={asset.title} className="w-full h-full object-cover" />
                        <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 flex items-center gap-1.5 text-[10px] font-bold text-white">
                          <FolderLock className="w-3 h-3 text-blue-400" />
                          {asset.category}
                        </div>
                      </div>
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-white">{asset.title}</h3>
                          <p className="text-xs text-slate-400 mt-2 line-clamp-2">{asset.description}</p>
                        </div>
                        <div className="pt-4 mt-4 border-t border-slate-800 flex justify-between items-center">
                          <span className="text-[10px] text-slate-500 font-mono">{asset.fileSize} • {asset.format}</span>
                          <a
                            href={asset.downloadUrl || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Download
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 5: STUDENT NOTES */}
        {/* ============================================================ */}
        {activeTab === 'notes' && (
          <div className="space-y-4 animate-fadeIn" id="notes-view">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-white font-sans">
                  Personal DaVinci Resolve Scratchpad
                </h2>
                <p className="text-xs text-slate-400">
                  Notes are automatically saved locally on your browser.
                </p>
              </div>
              {notesSavedToast && (
                <span className="text-xs text-[#00e5a3] font-bold bg-[#00e5a3]/10 px-3 py-1 rounded-full border border-[#00e5a3]/30">
                  ✓ Notes Saved
                </span>
              )}
            </div>

            <textarea
              rows={12}
              value={studentNotes}
              onChange={e => handleSaveNotes(e.target.value)}
              className="w-full bg-[#121627] border border-slate-800 rounded-2xl p-4 text-xs sm:text-sm font-mono text-slate-200 focus:outline-none focus:border-[#ff5722] leading-relaxed shadow-inner"
              placeholder="Type keyboard shortcuts, project render notes, or questions here..."
            />
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 6: ORDERS & PURCHASES */}
        {/* ============================================================ */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fadeIn" id="orders-view">
            <div>
              <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
                RAZORPAY PAYMENT HISTORY
              </span>
              <h2 className="text-2xl font-extrabold text-white font-sans mt-1">
                Orders & Confirmed Invoices
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                View your confirmed masterclass enrollments and creator asset purchases.
              </p>
            </div>

            {(!currentUser.orderHistory || currentUser.orderHistory.length === 0) ? (
              <div className="bg-[#121627] border border-slate-800 rounded-3xl p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-800/80 flex items-center justify-center text-slate-400 mx-auto">
                  <CreditCard className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white">No Confirmed Orders Yet</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  You have not completed any masterclass or asset pack purchases yet. Confirmed Razorpay transactions will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {currentUser.orderHistory.map(order => (
                  <div
                    key={order.id}
                    className="bg-[#121627] border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                          order.status.toLowerCase() === 'paid' 
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                            : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        }`}>
                          {order.status.toLowerCase() === 'paid' ? '✓ SUCCESSFUL' : order.status.toUpperCase()}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">{order.id}</span>
                      </div>

                      <h4 className="text-sm font-bold text-white">
                        {order.itemType === 'bundle' 
                          ? INITIAL_BUNDLE_PROMO.title 
                          : order.itemType === 'asset' 
                            ? INITIAL_ASSETS.find(a => a.id === order.itemId)?.title || 'Digital Asset'
                            : 'Masterclass Course'}
                      </h4>
                      
                      <div className="text-xs text-slate-400 font-mono space-x-3">
                        <span>Date: <strong className="text-slate-200">{new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</strong></span>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                      <div className="text-base font-black text-emerald-400 font-mono">
                        {order.currency} {order.amount}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 7: ACCOUNT DETAILS */}
        {/* ============================================================ */}
        {activeTab === 'account' && (
          <div className="space-y-6 animate-fadeIn max-w-2xl" id="account-view">
            <div>
              <span className="text-xs font-mono text-indigo-400 font-bold uppercase tracking-wider">
                STUDENT PROFILE
              </span>
              <h2 className="text-2xl font-extrabold text-white font-sans mt-1">
                Account Settings
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Manage your personal details, phone number, and avatar image.
              </p>
            </div>

            {profileSavedToast && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Account details saved successfully!</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                soundFx.playPop();
                const updated: UserProfile = {
                  ...currentUser,
                  name: profileName.trim() || currentUser.name,
                  phone: profilePhone.trim(),
                  avatar: profileAvatar.trim() || currentUser.avatar,
                };
                StorageService.setCurrentUser(updated);
                if (onUpdateUser) onUpdateUser(updated);
                setProfileSavedToast(true);
                setTimeout(() => setProfileSavedToast(false), 2500);
              }}
              className="bg-[#121627] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5"
            >
              {/* Avatar Preview & URL */}
              <div className="flex items-center gap-4 bg-[#171b2d] p-4 rounded-2xl border border-slate-800">
                <img
                  src={profileAvatar || currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                  alt="Avatar Preview"
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-blue-500/40 shrink-0"
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase font-mono">
                    Avatar Image URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={profileAvatar}
                    onChange={e => setProfileAvatar(e.target.value)}
                    className="w-full bg-[#10131f] border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Verma"
                    value={profileName}
                    onChange={e => setProfileName(e.target.value)}
                    className="w-full bg-[#171b2d] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={profilePhone}
                    onChange={e => setProfilePhone(e.target.value)}
                    className="w-full bg-[#171b2d] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Email Address (READ-ONLY DISABLED WITH LOCK) */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 font-mono flex items-center justify-between">
                  <span>Email Address</span>
                  <span className="text-[10px] text-amber-400 font-normal flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Cannot be edited
                  </span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    disabled
                    value={currentUser.email}
                    className="w-full bg-[#10131f] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-400 font-mono cursor-not-allowed opacity-75"
                  />
                </div>
              </div>

              {/* Save Button */}
              <button
                type="submit"
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99] mt-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Profile Details</span>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Embedded Modals */}
      {submittingSession && (
        <SubmitAssignmentModal
          isOpen={true}
          onClose={() => setSubmittingSession(null)}
          session={submittingSession}
          studentName={currentUser.name}
          studentEmail={currentUser.email}
          onSubmitSuccess={() => {
            soundFx.playPop();
            setSubmittingSession(null);
          }}
        />
      )}

      {ratingSession && (
        <SessionRatingModal
          isOpen={true}
          onClose={() => setRatingSession(null)}
          session={ratingSession}
          onRatingSuccess={() => {
            soundFx.playPop();
            setRatingSession(null);
          }}
        />
      )}

      {recordingSession && (
        <RecordingModal
          isOpen={true}
          onClose={() => setRecordingSession(null)}
          session={recordingSession}
        />
      )}

      {isMockTestOpen && (
        <MockTestModal
          isOpen={true}
          onClose={() => setIsMockTestOpen(false)}
        />
      )}
    </div>
  );
};
