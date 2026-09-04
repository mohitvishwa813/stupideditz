import React, { useState, useEffect } from 'react';
import { CourseSession, RegisteredStudent, StudentSubmission, VideoAsset, UserProfile, Course, HeroShowcaseOption, YouTubeBreakdown, BundlePromo } from '../types';
import { StorageService } from '../services/storageService';
import { DbService } from '../services/dbService';

import { 
  Plus, 
  Edit3, 
  Trash2, 
  Link2, 
  ExternalLink, 
  Check, 
  Users, 
  Calendar, 
  Award, 
  FileText, 
  Clock, 
  RotateCcw, 
  ShieldCheck, 
  Search,
  DownloadCloud,
  FolderOpen,
  ArrowRight,
  LogOut,
  Send,
  Sliders,
  DollarSign,
  TrendingUp,
  MessageSquare,
  Sparkles,
  Video,
  CheckCircle2,
  BellRing,
  AlertCircle,
  GraduationCap,
  BookOpen,
  Tv,
  Save
} from 'lucide-react';
import { soundFx } from '../utils/soundEffects';
import { AddEditSessionModal } from './modals/AddEditSessionModal';
import { AddStudentModal } from './modals/AddStudentModal';
import { EditStudentModal } from './modals/EditStudentModal';
import { EditAssetModal } from './modals/EditAssetModal';
import { AddEditCourseModal } from './modals/AddEditCourseModal';
import { AddEditBreakdownModal } from './modals/AddEditBreakdownModal';
import confetti from 'canvas-confetti';

interface AdminConsoleProps {
  sessions: CourseSession[];
  onUpdateSessions: (sessions: CourseSession[]) => void;
  currentUser: UserProfile;
  onNavigateToStudentPortal: () => void;
  onLogout: () => void;
  assets: VideoAsset[];
  onUpdateAssets: (assets: VideoAsset[]) => void;
  courses: Course[];
  onUpdateCourses: (courses: Course[]) => void;
  heroOptions?: HeroShowcaseOption[];
  onUpdateHeroOptions?: (options: HeroShowcaseOption[]) => void;
  youtubeBreakdowns?: YouTubeBreakdown[];
  onUpdateYoutubeBreakdowns?: (breakdowns: YouTubeBreakdown[]) => void;
  bundlePromo?: BundlePromo;
  onUpdateBundlePromo?: (promo: BundlePromo) => void;
}

export const AdminConsole: React.FC<AdminConsoleProps> = ({
  sessions,
  onUpdateSessions,
  currentUser,
  onNavigateToStudentPortal,
  onLogout,
  assets,
  onUpdateAssets,
  courses,
  onUpdateCourses,
  heroOptions,
  onUpdateHeroOptions,
  youtubeBreakdowns,
  onUpdateYoutubeBreakdowns,
  bundlePromo,
  onUpdateBundlePromo,
}) => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'students' | 'assets' | 'courses' | 'hero' | 'promos'>('schedule');
  const [heroOptionsList, setHeroOptionsList] = useState<HeroShowcaseOption[]>(
    heroOptions
  );
  const [selectedBatchFilter, setSelectedBatchFilter] = useState<'All' | 'September' | 'October'>('All');
  const [studentBatchFilter, setStudentBatchFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [sessionToEdit, setSessionToEdit] = useState<CourseSession | null>(null);

  // Student Modals & Actions
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<RegisteredStudent | null>(null);

  // Asset Modals & Actions
  const [assetToEdit, setAssetToEdit] = useState<VideoAsset | null>(null);

  // Course Modals & Actions
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState<Course | null>(null);

  // Breakdown Modals & Actions
  const [isBreakdownModalOpen, setIsBreakdownModalOpen] = useState(false);
  const [breakdownToEdit, setBreakdownToEdit] = useState<YouTubeBreakdown | null>(null);

  const handleSaveBreakdown = async (savedBreakdown: YouTubeBreakdown) => {
    soundFx.playClick();
    if (youtubeBreakdowns && onUpdateYoutubeBreakdowns) {
      let updatedList = [...youtubeBreakdowns];
      const existingIdx = updatedList.findIndex(b => b.id === savedBreakdown.id);
      if (existingIdx >= 0) {
        updatedList[existingIdx] = savedBreakdown;
      } else {
        updatedList.push(savedBreakdown);
      }
      onUpdateYoutubeBreakdowns(updatedList);
      
      // Save to cloud
      await DbService.saveYouTubeBreakdownToDb(savedBreakdown, updatedList.length);
      
      // Re-fetch
      const liveData = await DbService.getYouTubeBreakdowns();
      if (liveData && liveData.length > 0) {
        onUpdateYoutubeBreakdowns(liveData);
      }
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
    }
  };

  const handleDeleteBreakdown = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this breakdown?")) {
      soundFx.playPop();
      if (youtubeBreakdowns && onUpdateYoutubeBreakdowns) {
        onUpdateYoutubeBreakdowns(youtubeBreakdowns.filter(b => b.id !== id));
        await DbService.deleteYouTubeBreakdownFromDb(id);
      }
    }
  };

  const handleSaveCourse = async (savedCourse: Course) => {
    // 1. Instantly update Local Storage and React State so new course card & batch display immediately
    const updatedList = StorageService.addCourse(savedCourse);
    onUpdateCourses(updatedList);

    // 2. Persist to Turso Cloud Database
    await DbService.saveCourseToDb(savedCourse);

    // 3. Re-fetch live courses directly from Turso Cloud Database
    const liveCourses = await DbService.getCourses();
    if (liveCourses && liveCourses.length >= updatedList.length) {
      onUpdateCourses(liveCourses);
    }
    confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
  };

  const handleDeleteCourse = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this masterclass course card?')) {
      soundFx.playPop();
      await DbService.deleteCourseFromDb(id);
      const liveCourses = await DbService.getCourses();
      onUpdateCourses(liveCourses);
    }
  };

  // Submissions and Students state
  const [submissions, setSubmissions] = useState<StudentSubmission[]>(() => StorageService.getSubmissions());
  const [students, setStudents] = useState<RegisteredStudent[]>([]);
  const [broadcastMessage, setBroadcastMessage] = useState('🔥 Doubt clearing session starts at 3:30 PM IST on Google Meet. Bring your timeline .dra files!');
  const [broadcastSentToast, setBroadcastSentToast] = useState(false);

  // Sync Students live from Turso DB on mount
  useEffect(() => {
    let isMounted = true;
    async function loadLiveStudents() {
      try {
        const dbStudents = await DbService.getStudents();
        if (isMounted && dbStudents) {
          setStudents(dbStudents);
        }
      } catch (err) {
        console.warn('Failed loading students from Turso:', err);
      }
    }
    loadLiveStudents();
    return () => { isMounted = false; };
  }, []);

  // Student CRUD
  const handleAddStudent = async (newStudent: RegisteredStudent) => {
    await DbService.saveStudentToDb(newStudent);
    const fresh = await DbService.getStudents();
    setStudents(fresh);
    StorageService.addStudent(newStudent);
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
  };

  const handleSaveStudent = async (updatedStudent: RegisteredStudent) => {
    await DbService.saveStudentToDb(updatedStudent);
    const fresh = await DbService.getStudents();
    setStudents(fresh);
    StorageService.saveStudents(fresh);
  };

  const handleDeleteStudent = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this student from the cohort roster?')) {
      soundFx.playPop();
      await DbService.deleteStudentFromDb(id);
      const fresh = await DbService.getStudents();
      setStudents(fresh);
      StorageService.saveStudents(fresh);
    }
  };

  // Asset CRUD
  const handleSaveAsset = async (updatedAsset: VideoAsset) => {
    await DbService.saveAssetToDb(updatedAsset);
    const freshAssets = await DbService.getAssets();
    onUpdateAssets(freshAssets);
  };

  const handleDeleteAsset = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this asset from the library?')) {
      soundFx.playPop();
      await DbService.deleteAssetFromDb(id);
      const freshAssets = await DbService.getAssets();
      onUpdateAssets(freshAssets);
    }
  };

  const handleSaveHeroOptions = async () => {
    soundFx.playPop();
    for (let i = 0; i < heroOptionsList.length; i++) {
      await DbService.saveHeroOptionToDb(heroOptionsList[i], i + 1);
    }
    const fresh = await DbService.getHeroOptions();
    setHeroOptionsList(fresh);
    if (onUpdateHeroOptions) onUpdateHeroOptions(fresh);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
  };

  const [selectedBatchForNewSession, setSelectedBatchForNewSession] = useState<string>('');

  // Masterclass Course Cards is the ONLY SINGLE SOURCE OF TRUTH for batches
  const masterclassBatches = Array.from(new Set(
    courses.map(c => c.batch).filter((b): b is string => Boolean(b && b.trim()))
  ));

  const dynamicCohortBatches = ['All', ...masterclassBatches];

  // Helper for batch normalization
  const normalizeBatch = (str: string) => str.toLowerCase().replace(/cohort|batch|live/g, '').trim();

  // Filter students strictly by batch
  const filteredStudents = students.filter(st => {
    if (studentBatchFilter === 'All') return true;
    const filterNorm = normalizeBatch(studentBatchFilter);
    const studentNorm = normalizeBatch(st.batch);
    return (
      st.batch === studentBatchFilter ||
      studentNorm === filterNorm ||
      st.batch.toLowerCase().includes(studentBatchFilter.toLowerCase()) ||
      studentBatchFilter.toLowerCase().includes(st.batch.toLowerCase()) ||
      (filterNorm.length > 0 && studentNorm.includes(filterNorm))
    );
  });

  // Filter sessions based on batch & search
  const filteredSessions = sessions.filter(session => {
    const matchesBatch = 
      selectedBatchFilter === 'All' 
        ? true 
        : (session.batch === selectedBatchFilter || session.batch.toLowerCase().includes(selectedBatchFilter.toLowerCase()));
    const matchesSearch = 
      session.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.dayCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.dateFormatted.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBatch && matchesSearch;
  });

  const handleOpenAddSession = (batchName?: string) => {
    soundFx.playClick();
    if (batchName && batchName !== 'All') {
      setSelectedBatchForNewSession(batchName);
    } else {
      setSelectedBatchForNewSession(masterclassBatches[0] || 'September 2026 Live Cohort');
    }
    setSessionToEdit(null);
    setSessionModalOpen(true);
  };

  const handleOpenEditSession = (session: CourseSession) => {
    soundFx.playClick();
    setSessionToEdit(session);
    setSessionModalOpen(true);
  };

  const handleDeleteSession = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this session from the schedule?')) {
      soundFx.playPop();
      await DbService.deleteSession(id);
      const updated = sessions.filter(s => s.id !== id);
      onUpdateSessions(updated);
    }
  };

  const handleSaveSession = async (savedSession: CourseSession) => {
    soundFx.playPop();
    let updated: CourseSession[];
    if (sessionToEdit) {
      await DbService.updateSession(savedSession.id, savedSession);
      updated = sessions.map(s => s.id === savedSession.id ? { ...s, ...savedSession } : s);
    } else {
      const created = await DbService.addSession(savedSession);
      updated = [...sessions, created];
    }
    onUpdateSessions(updated);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  const handleGradeSubmission = (subId: string, grade: string) => {
    const updated = submissions.map(s => s.id === subId ? { ...s, status: 'Reviewed' as const, grade } : s);
    setSubmissions(updated);
    localStorage.setItem('stupideditz_submissions_v1', JSON.stringify(updated));
    soundFx.playPop();
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.5 }
    });
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playWhoosh();
    setBroadcastSentToast(true);
    setTimeout(() => setBroadcastSentToast(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] pb-16">
      {/* Studio Header Bar */}
      <div className="bg-[#111422] border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-widest bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded font-mono">
                  STUDIO COMMAND CENTER
                </span>
                <span className="text-xs text-slate-400 font-mono">DaVinci Masterclass CMS</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 tracking-tight">
                Cohort Admin Studio
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Instructor console for <strong>{currentUser.name}</strong> ({currentUser.email})
              </p>
            </div>

            {/* Top Right Studio Actions */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => {
                  soundFx.playClick();
                  setCourseToEdit(null);
                  setIsCourseModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5"
                id="admin-add-course-btn"
              >
                <Plus className="w-4 h-4" />
                <span>Add Masterclass Card</span>
              </button>

              <button
                onClick={handleOpenAddSession}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5"
                id="admin-add-session-btn"
              >
                <Plus className="w-4 h-4" />
                <span>Add Class Session</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Strip (Dynamically Calculated) */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#141726] p-3.5 rounded-xl border border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400">Total Enrolled</div>
                <div className="text-base font-bold text-white font-mono">{students.length} Students</div>
              </div>
            </div>

            <div className="bg-[#141726] p-3.5 rounded-xl border border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400">Scheduled Sessions</div>
                <div className="text-base font-bold text-emerald-400 font-mono">{sessions.length} Classes</div>
              </div>
            </div>

            <div className="bg-[#141726] p-3.5 rounded-xl border border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400">Pending Homework Reviews</div>
                <div className="text-base font-bold text-amber-300 font-mono">
                  {submissions.filter(s => s.status === 'Pending').length} Submissions
                </div>
              </div>
            </div>

            <div className="bg-[#141726] p-3.5 rounded-xl border border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400">Classes Completed</div>
                <div className="text-base font-bold text-white font-mono">
                  {sessions.filter(s => s.status === 'completed').length} / {sessions.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Studio Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { id: 'schedule', label: 'Class Curriculum Studio', icon: Calendar },
              { id: 'courses', label: 'Masterclass Course Cards', icon: BookOpen },
              { id: 'students', label: 'Student Directory & CRM', icon: Users },
              { id: 'assets', label: 'Asset Vault Catalog', icon: FolderOpen },
              { id: 'hero', label: 'Hero Showcase Options', icon: Tv },
              { id: 'promos', label: 'Deconstructions & Promos', icon: Tv },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    soundFx.playClick();
                    setActiveTab(tab.id as any);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-[#121522] text-slate-400 hover:text-slate-200 hover:bg-[#181d30] border border-slate-800'
                  }`}
                  id={`admin-tab-${tab.id}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* TAB 1: CURRICULUM STUDIO */}
        {activeTab === 'schedule' && (
          <div className="mt-6 space-y-6">
            {/* Filter bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
                <span className="text-xs font-semibold text-slate-400 uppercase font-mono shrink-0">Batch:</span>
                {dynamicCohortBatches.map(b => (
                  <button
                    key={b}
                    onClick={() => {
                      soundFx.playClick();
                      setSelectedBatchFilter(b);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                      selectedBatchFilter === b
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-[#121522] text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {b === 'All' ? 'All Cohorts' : b}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search sessions..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#121522] border border-slate-700/80 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  onClick={() => handleOpenAddSession(selectedBatchFilter !== 'All' ? selectedBatchFilter : undefined)}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Class Session</span>
                </button>
              </div>
            </div>

            {/* Sessions Management Table / Cards */}
            <div className="space-y-3">
              {filteredSessions.map(session => (
                <div
                  key={session.id}
                  className="p-4 rounded-xl bg-[#111422] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="px-2.5 py-2 rounded-xl bg-[#181d2e] border border-slate-700 text-center font-mono shrink-0">
                      <div className="text-[10px] text-slate-400 font-bold">{session.dayCode}</div>
                      <div className="text-xs font-bold text-white">{session.dateFormatted.split(' ')[0]}</div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{session.topic}</span>
                        <span className={`px-2 py-0.2 rounded text-[9px] font-bold uppercase ${
                          session.type === 'Live Class' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {session.type}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{session.batch}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                        {session.agenda}
                      </p>
                    </div>
                  </div>

                  {/* Links & Quick Edit Buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleOpenEditSession(session)}
                      className="px-3 py-1.5 rounded-xl bg-[#181d2e] hover:bg-[#232b42] text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteSession(session.id)}
                      className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 transition-colors"
                      title="Delete Session"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: STUDENT DIRECTORY DATA TABLE */}
        {activeTab === 'students' && (
          <div className="mt-6 space-y-6">
            <div className="bg-[#111422] p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Enrolled Student Roster Table ({filteredStudents.length} Members)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Interactive CRM table to manage student details, progress, assigned cohorts, and statuses.
                  </p>
                </div>

                <button
                  onClick={() => {
                    soundFx.playClick();
                    setIsAddStudentModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs shrink-0"
                  id="admin-add-student-btn"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Student to Batch</span>
                </button>
              </div>

              {/* Batch Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-2 border-t border-slate-800">
                <span className="text-xs font-semibold text-slate-400 uppercase font-mono mr-1 shrink-0">Batch:</span>
                {dynamicCohortBatches.map(b => (
                  <button
                    key={b}
                    onClick={() => {
                      soundFx.playClick();
                      setStudentBatchFilter(b);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                      studentBatchFilter === b
                        ? 'bg-emerald-500 text-slate-950 shadow-xs'
                        : 'bg-[#151928] text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {b === 'All' ? 'All Batches' : b}
                  </button>
                ))}
              </div>

              {/* Full Interactive Student Data Table */}
              <div className="overflow-x-auto border border-slate-800 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#161a2b] border-b border-slate-800 text-slate-300 font-mono uppercase text-[10px]">
                      <th className="py-3 px-4 font-semibold">Student Name</th>
                      <th className="py-3 px-4 font-semibold">Email</th>
                      <th className="py-3 px-4 font-semibold">Assigned Cohort</th>
                      <th className="py-3 px-4 font-semibold">Progress</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 bg-[#121524]">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500 font-mono text-xs">
                          No students found matching current batch filter.
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map(st => (
                        <tr key={st.id} className="hover:bg-[#181d32] transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <img src={st.avatar} alt={st.name} className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-700" />
                              <span className="font-semibold text-white truncate max-w-[150px]">{st.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-300 truncate max-w-[180px]">
                            {st.email}
                          </td>
                          <td className="py-3 px-4">
                            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-md font-semibold text-[11px]">
                              {st.batch}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-300">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                                <div 
                                  className="h-full bg-emerald-400 rounded-full" 
                                  style={{ width: `${Math.min(100, ((st.completedDays || 0) / 26) * 100)}%` }} 
                                />
                              </div>
                              <span className="text-[11px] font-semibold">{st.completedDays || 0}/26 Days</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase font-mono ${
                              st.status === 'Active' || !st.status
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}>
                              {st.status || 'Active'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  soundFx.playClick();
                                  setStudentToEdit(st);
                                }}
                                className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 transition-all"
                                title="Edit Student Details"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteStudent(st.id)}
                                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all"
                                title="Delete Student"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ASSETS CATALOG DATA TABLE */}
        {activeTab === 'assets' && (
          <div className="mt-6 space-y-6">
            <div className="bg-[#111422] p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Creator Asset Vault Manager Table ({assets.length} Items)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Manage pricing, category labels, file sizes, and asset catalog items.
                  </p>
                </div>
              </div>

              {/* Full Interactive Asset Data Table */}
              <div className="overflow-x-auto border border-slate-800 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#161a2b] border-b border-slate-800 text-slate-300 font-mono uppercase text-[10px]">
                      <th className="py-3 px-4 font-semibold">Asset Item</th>
                      <th className="py-3 px-4 font-semibold">Category</th>
                      <th className="py-3 px-4 font-semibold">Format</th>
                      <th className="py-3 px-4 font-semibold">File Size</th>
                      <th className="py-3 px-4 font-semibold">Price (INR)</th>
                      <th className="py-3 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 bg-[#121524]">
                    {assets.map(a => (
                      <tr key={a.id} className="hover:bg-[#181d32] transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img src={a.thumbnail} alt={a.title} className="w-12 h-8 rounded object-cover ring-1 ring-slate-700" />
                            <span className="font-semibold text-white truncate max-w-[180px]">{a.title}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono text-[11px]">
                            {a.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-300">
                          {a.format}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-400">
                          {a.fileSize}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-amber-300">
                            {a.isFreeSample ? 'Free Sample' : `₹${a.price}`}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                soundFx.playClick();
                                setAssetToEdit(a);
                              }}
                              className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-all"
                              title="Edit Asset Details"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteAsset(a.id)}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all"
                              title="Delete Asset"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MASTERCLASS COURSE CARDS CMS */}
        {activeTab === 'courses' && (
          <div className="mt-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Masterclass Cohort Catalog & Cards
                </h3>
                <p className="text-xs text-slate-400">
                  Create, update, and manage course cards displayed on the student landing page.
                </p>
              </div>

              <button
                onClick={() => {
                  soundFx.playClick();
                  setCourseToEdit(null);
                  setIsCourseModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Masterclass</span>
              </button>
            </div>

            {/* Courses Interactive Data Table */}
            <div className="bg-[#111422] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#161a2b] text-slate-400 font-mono uppercase tracking-wider border-b border-slate-800">
                      <th className="py-3 px-4">Masterclass Course</th>
                      <th className="py-3 px-4">Cohort Batch</th>
                      <th className="py-3 px-4">Level</th>
                      <th className="py-3 px-4">Offer Price</th>
                      <th className="py-3 px-4">Instructor</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-200">
                    {courses.map((course) => (
                      <tr key={course.id} className="hover:bg-[#151928] transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={course.thumbnail}
                              alt={course.title}
                              className="w-12 h-8 rounded-lg object-cover bg-slate-900 border border-slate-700/60"
                            />
                            <div>
                              <div className="font-bold text-white flex items-center gap-1.5">
                                <span>{course.title}</span>
                                {course.isPopular && (
                                  <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono text-[9px]">
                                    POPULAR
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 truncate max-w-xs">{course.subtitle || course.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-300">
                          {course.batch}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono text-[10px]">
                            {course.level}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                          ₹{course.price.toLocaleString('en-IN')}
                          {course.originalPrice && (
                            <span className="text-[10px] text-slate-500 line-through ml-1 font-normal">
                              ₹{course.originalPrice.toLocaleString('en-IN')}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">
                          {course.instructorName}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                soundFx.playClick();
                                setSelectedBatchForNewSession(course.batch);
                                setSelectedBatchFilter(course.batch);
                                setSessionToEdit(null);
                                setSessionModalOpen(true);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all flex items-center gap-1 shrink-0"
                              title="Add new class session to this cohort curriculum"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add to Curriculum</span>
                            </button>

                            <button
                              onClick={() => {
                                soundFx.playClick();
                                setCourseToEdit(course);
                                setIsCourseModalOpen(true);
                              }}
                              className="p-1.5 text-blue-400 hover:text-white hover:bg-blue-600/20 rounded-lg transition-colors"
                              title="Edit Course Card"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCourse(course.id)}
                              className="p-1.5 text-rose-400 hover:text-white hover:bg-rose-600/20 rounded-lg transition-colors"
                              title="Delete Course Card"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: HERO SHOWCASE MANAGER */}
        {activeTab === 'hero' && (
          <div className="mt-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#141726] border border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Tv className="w-5 h-5 text-blue-400" />
                  Hero Interactive Timeline Showcase (3 Options)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Directly edit the 3 interactive options shown on the Hero landing page video player (Titles, Cover Image URLs, and Track Labels).
                </p>
              </div>
              <button
                onClick={handleSaveHeroOptions}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-2 shrink-0"
              >
                <Save className="w-4 h-4" />
                <span>Save All 3 Options to DB</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {heroOptionsList.map((opt, idx) => (
                <div key={opt.id} className="p-5 rounded-2xl bg-[#111422] border border-slate-800 space-y-4 shadow-lg">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs font-bold font-mono text-blue-400 uppercase">
                      OPTION 0{idx + 1}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{opt.id}</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1 font-mono">
                      Tab Button Label
                    </label>
                    <input
                      type="text"
                      value={opt.tabName}
                      onChange={e => {
                        const updated = [...heroOptionsList];
                        updated[idx] = { ...updated[idx], tabName: e.target.value };
                        setHeroOptionsList(updated);
                      }}
                      className="w-full bg-[#161a29] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1 font-mono">
                      Lesson / Video Title
                    </label>
                    <input
                      type="text"
                      value={opt.title}
                      onChange={e => {
                        const updated = [...heroOptionsList];
                        updated[idx] = { ...updated[idx], title: e.target.value };
                        setHeroOptionsList(updated);
                      }}
                      className="w-full bg-[#161a29] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1 font-mono">
                      Preview Image URL
                    </label>
                    <input
                      type="url"
                      value={opt.imageUrl}
                      onChange={e => {
                        const updated = [...heroOptionsList];
                        updated[idx] = { ...updated[idx], imageUrl: e.target.value };
                        setHeroOptionsList(updated);
                      }}
                      className="w-full bg-[#161a29] border border-slate-700/80 rounded-xl px-3 py-2 text-[11px] text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                    {opt.imageUrl && (
                      <img src={opt.imageUrl} alt={opt.tabName} className="mt-2 w-full h-24 object-cover rounded-lg border border-slate-800" />
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1 font-mono">
                      Badge Specs Overlay
                    </label>
                    <input
                      type="text"
                      value={opt.badgeText}
                      onChange={e => {
                        const updated = [...heroOptionsList];
                        updated[idx] = { ...updated[idx], badgeText: e.target.value };
                        setHeroOptionsList(updated);
                      }}
                      className="w-full bg-[#161a29] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>

                  <div className="space-y-2 border-t border-slate-800/80 pt-3">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase font-mono block">Track / Node Labels</span>
                    <input
                      type="text"
                      placeholder="Track 1"
                      value={opt.label1}
                      onChange={e => {
                        const updated = [...heroOptionsList];
                        updated[idx] = { ...updated[idx], label1: e.target.value };
                        setHeroOptionsList(updated);
                      }}
                      className="w-full bg-[#161a29] border border-slate-700/80 rounded-xl px-3 py-1.5 text-[11px] text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                    <input
                      type="text"
                      placeholder="Track 2"
                      value={opt.label2}
                      onChange={e => {
                        const updated = [...heroOptionsList];
                        updated[idx] = { ...updated[idx], label2: e.target.value };
                        setHeroOptionsList(updated);
                      }}
                      className="w-full bg-[#161a29] border border-slate-700/80 rounded-xl px-3 py-1.5 text-[11px] text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                    <input
                      type="text"
                      placeholder="Track 3"
                      value={opt.label3}
                      onChange={e => {
                        const updated = [...heroOptionsList];
                        updated[idx] = { ...updated[idx], label3: e.target.value };
                        setHeroOptionsList(updated);
                      }}
                      className="w-full bg-[#161a29] border border-slate-700/80 rounded-xl px-3 py-1.5 text-[11px] text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                    <input
                      type="text"
                      placeholder="Track 4"
                      value={opt.label4 || ''}
                      onChange={e => {
                        const updated = [...heroOptionsList];
                        updated[idx] = { ...updated[idx], label4: e.target.value };
                        setHeroOptionsList(updated);
                      }}
                      className="w-full bg-[#161a29] border border-slate-700/80 rounded-xl px-3 py-1.5 text-[11px] text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROMOS & YOUTUBE BREAKDOWNS TAB */}
        {activeTab === 'promos' && bundlePromo && onUpdateBundlePromo && (
          <div className="animate-fade-in space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Tv className="w-5 h-5 text-blue-500" />
                  Deconstructions & Promos
                </h3>
                <p className="text-sm text-slate-400">Manage the All-in-one bundle promo displayed in the Asset Vault.</p>
              </div>
              <button
                onClick={async () => {
                  soundFx.playClick();
                  // Save Bundle Promo to Turso
                  if (bundlePromo) {
                    await DbService.saveBundlePromoToDb(bundlePromo);
                    alert("Bundle Promo Saved to Database Successfully!");
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                <Check className="w-4 h-4" />
                Save Changes to Cloud
              </button>
            </div>

            <div className="bg-[#121522] border border-slate-800 rounded-2xl p-6">
              <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider text-slate-400">Bundle Promo Settings</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Badge Text</label>
                  <input
                    type="text"
                    value={bundlePromo.badgeText}
                    onChange={e => onUpdateBundlePromo({ ...bundlePromo, badgeText: e.target.value })}
                    className="w-full bg-[#161a29] border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 font-medium transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Title</label>
                  <input
                    type="text"
                    value={bundlePromo.title}
                    onChange={e => onUpdateBundlePromo({ ...bundlePromo, title: e.target.value })}
                    className="w-full bg-[#161a29] border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 font-medium transition-colors"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                  <textarea
                    rows={3}
                    value={bundlePromo.description}
                    onChange={e => onUpdateBundlePromo({ ...bundlePromo, description: e.target.value })}
                    className="w-full bg-[#161a29] border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 font-medium transition-colors resize-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Current Price (₹)</label>
                  <input
                    type="number"
                    value={bundlePromo.currentPrice}
                    onChange={e => onUpdateBundlePromo({ ...bundlePromo, currentPrice: Number(e.target.value) })}
                    className="w-full bg-[#161a29] border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 font-mono transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Original Price (₹)</label>
                  <input
                    type="number"
                    value={bundlePromo.originalPrice}
                    onChange={e => onUpdateBundlePromo({ ...bundlePromo, originalPrice: Number(e.target.value) })}
                    className="w-full bg-[#161a29] border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 font-mono transition-colors"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Google Drive Link</label>
                  <input
                    type="text"
                    value={bundlePromo.driveLink}
                    onChange={e => onUpdateBundlePromo({ ...bundlePromo, driveLink: e.target.value })}
                    className="w-full bg-[#161a29] border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 font-mono transition-colors"
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-[#121522] border border-slate-800 rounded-2xl p-6 mt-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">YouTube Breakdowns</h4>
                <button
                  onClick={() => {
                    soundFx.playPop();
                    setBreakdownToEdit(null);
                    setIsBreakdownModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-lg text-xs font-semibold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Breakdown
                </button>
              </div>

              {(!youtubeBreakdowns || youtubeBreakdowns.length === 0) ? (
                <div className="text-center p-8 border border-dashed border-slate-700 rounded-xl text-slate-500 text-sm">
                  No YouTube Breakdowns added yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {youtubeBreakdowns.map(breakdown => (
                    <div key={breakdown.id} className="bg-[#161a29] border border-slate-700 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="w-24 h-14 bg-slate-800 rounded-lg overflow-hidden shrink-0 relative">
                          <img src={breakdown.thumbnailUrl} alt={breakdown.title} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h5 className="font-bold text-white text-sm line-clamp-1">{breakdown.title}</h5>
                          <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                            <span className="flex items-center gap-1"><Tv className="w-3 h-3" /> {breakdown.views}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {breakdown.duration}</span>
                            <span className="flex items-center gap-1 text-blue-400 font-semibold">{breakdown.timelineMarkers.length} Markers</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 w-full md:w-auto mt-3 md:mt-0 pt-3 md:pt-0 border-t border-slate-800 md:border-0 justify-end">
                        <button
                          onClick={() => {
                            soundFx.playPop();
                            setBreakdownToEdit(breakdown);
                            setIsBreakdownModalOpen(true);
                          }}
                          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                          title="Edit Breakdown"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBreakdown(breakdown.id)}
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                          title="Delete Breakdown"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Session Modal */}
      {sessionModalOpen && (
        <AddEditSessionModal
          isOpen={sessionModalOpen}
          sessionToEdit={sessionToEdit}
          availableBatches={dynamicCohortBatches.filter(b => b !== 'All')}
          initialBatch={selectedBatchForNewSession}
          onClose={() => setSessionModalOpen(false)}
          onSave={handleSaveSession}
        />
      )}

      {/* Add / Edit Masterclass Course Card Modal */}
      {isCourseModalOpen && (
        <AddEditCourseModal
          isOpen={isCourseModalOpen}
          courseToEdit={courseToEdit}
          onClose={() => {
            setIsCourseModalOpen(false);
            setCourseToEdit(null);
          }}
          onSave={handleSaveCourse}
        />
      )}

      {/* Add Student to Batch Modal */}
      {isAddStudentModalOpen && (
        <AddStudentModal
          isOpen={isAddStudentModalOpen}
          availableBatches={dynamicCohortBatches.filter(b => b !== 'All')}
          onClose={() => setIsAddStudentModalOpen(false)}
          onAddStudent={handleAddStudent}
        />
      )}

      {/* Edit Student Modal */}
      {studentToEdit && (
        <EditStudentModal
          isOpen={Boolean(studentToEdit)}
          student={studentToEdit}
          availableBatches={dynamicCohortBatches.filter(b => b !== 'All')}
          onClose={() => setStudentToEdit(null)}
          onSave={handleSaveStudent}
        />
      )}

      {/* Edit Asset Modal */}
      {assetToEdit && (
        <EditAssetModal
          isOpen={Boolean(assetToEdit)}
          asset={assetToEdit}
          onClose={() => setAssetToEdit(null)}
          onSave={handleSaveAsset}
        />
      )}

      {/* Add / Edit Breakdown Modal */}
      {isBreakdownModalOpen && (
        <AddEditBreakdownModal
          isOpen={isBreakdownModalOpen}
          breakdownToEdit={breakdownToEdit}
          onClose={() => {
            setIsBreakdownModalOpen(false);
            setBreakdownToEdit(null);
          }}
          onSave={handleSaveBreakdown}
        />
      )}
    </div>
  );
};
