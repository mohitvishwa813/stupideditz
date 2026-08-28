import React, { useState } from 'react';
import { CourseSession, RegisteredStudent, StudentSubmission, VideoAsset, UserProfile } from '../types';
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
  GraduationCap
} from 'lucide-react';
import { soundFx } from '../utils/soundEffects';
import { AddEditSessionModal } from './modals/AddEditSessionModal';
import { AddStudentModal } from './modals/AddStudentModal';
import { EditStudentModal } from './modals/EditStudentModal';
import { EditAssetModal } from './modals/EditAssetModal';
import confetti from 'canvas-confetti';

interface AdminConsoleProps {
  sessions: CourseSession[];
  onUpdateSessions: (sessions: CourseSession[]) => void;
  currentUser: UserProfile;
  onNavigateToStudentPortal: () => void;
  onLogout: () => void;
  assets: VideoAsset[];
  onUpdateAssets: (assets: VideoAsset[]) => void;
}

export const AdminConsole: React.FC<AdminConsoleProps> = ({
  sessions,
  onUpdateSessions,
  currentUser,
  onNavigateToStudentPortal,
  onLogout,
  assets,
  onUpdateAssets,
}) => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'submissions' | 'students' | 'assets' | 'broadcast'>('schedule');
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

  // Submissions and Students state
  const [submissions, setSubmissions] = useState<StudentSubmission[]>(() => StorageService.getSubmissions());
  const [students, setStudents] = useState<RegisteredStudent[]>(() => StorageService.getStudents());
  const [broadcastMessage, setBroadcastMessage] = useState('🔥 Doubt clearing session starts at 3:30 PM IST on Google Meet. Bring your timeline .dra files!');
  const [broadcastSentToast, setBroadcastSentToast] = useState(false);

  // Student CRUD
  const handleAddStudent = (newStudent: RegisteredStudent) => {
    const updated = [newStudent, ...students];
    setStudents(updated);
    StorageService.addStudent(newStudent);
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
  };

  const handleSaveStudent = (updatedStudent: RegisteredStudent) => {
    const updatedList = students.map(s => s.id === updatedStudent.id ? updatedStudent : s);
    setStudents(updatedList);
    StorageService.saveStudents(updatedList);
  };

  const handleDeleteStudent = (id: string) => {
    if (window.confirm('Are you sure you want to remove this student from the cohort roster?')) {
      soundFx.playPop();
      const updatedList = students.filter(s => s.id !== id);
      setStudents(updatedList);
      StorageService.saveStudents(updatedList);
    }
  };

  // Asset CRUD
  const handleSaveAsset = (updatedAsset: VideoAsset) => {
    const updatedList = assets.map(a => a.id === updatedAsset.id ? updatedAsset : a);
    onUpdateAssets(updatedList);
  };

  const handleDeleteAsset = (id: string) => {
    if (window.confirm('Are you sure you want to delete this asset from the library?')) {
      soundFx.playPop();
      const updatedList = assets.filter(a => a.id !== id);
      onUpdateAssets(updatedList);
    }
  };

  // Filter students by batch
  const filteredStudents = students.filter(st => {
    if (studentBatchFilter === 'All') return true;
    return st.batch.toLowerCase().includes(studentBatchFilter.toLowerCase());
  });

  // Filter sessions based on batch & search
  const filteredSessions = sessions.filter(session => {
    const matchesBatch = 
      selectedBatchFilter === 'All' 
        ? true 
        : session.batch.includes(selectedBatchFilter);
    const matchesSearch = 
      session.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.dayCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.dateFormatted.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBatch && matchesSearch;
  });

  const handleOpenAddSession = () => {
    soundFx.playClick();
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
              { id: 'submissions', label: 'Homework Grading Station', icon: Award },
              { id: 'students', label: 'Student Directory & CRM', icon: Users },
              { id: 'assets', label: 'Asset Vault Catalog', icon: FolderOpen },
              { id: 'broadcast', label: 'Cohort Broadcaster', icon: BellRing },
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
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400 uppercase font-mono">Batch:</span>
                {(['All', 'September', 'October'] as const).map(b => (
                  <button
                    key={b}
                    onClick={() => {
                      soundFx.playClick();
                      setSelectedBatchFilter(b);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      selectedBatchFilter === b
                        ? 'bg-blue-600 text-white'
                        : 'bg-[#121522] text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {b} Cohort
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search sessions..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#121522] border border-slate-700/80 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500"
                />
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

        {/* TAB 2: SUBMISSIONS GRADING */}
        {activeTab === 'submissions' && (
          <div className="mt-6 space-y-6">
            <div className="bg-[#111422] p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-lg font-bold text-white">
                Student Project Review & Grading Desk
              </h3>
              <p className="text-xs text-slate-400">
                Click project Drive links, review render timelines, and assign grades with feedback.
              </p>

              <div className="space-y-3 pt-2">
                {submissions.map(sub => (
                  <div key={sub.id} className="p-4 rounded-xl bg-[#151928] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-white">{sub.studentName}</span>
                        <span className="text-xs text-slate-400 font-mono">({sub.studentEmail})</span>
                        <span className={`px-2 py-0.2 rounded text-[10px] font-bold uppercase ${
                          sub.status === 'Reviewed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {sub.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">
                        <strong>Student Notes:</strong> {sub.notes}
                      </p>
                      <a
                        href={sub.driveLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:underline pt-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open Rendered Project File ({sub.driveLink})</span>
                      </a>
                    </div>

                    {/* Grade Selector */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-semibold text-slate-400">Award Grade:</span>
                      {['A+', 'A', 'B'].map(grade => (
                        <button
                          key={grade}
                          onClick={() => handleGradeSubmission(sub.id, grade)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            sub.grade === grade
                              ? 'bg-emerald-500 text-slate-950 shadow-xs'
                              : 'bg-slate-800 text-slate-300 hover:text-white'
                          }`}
                        >
                          {grade}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
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
                <span className="text-xs font-semibold text-slate-400 uppercase font-mono mr-1">Batch:</span>
                {['All', 'July', 'August', 'September', 'October', 'November'].map(b => (
                  <button
                    key={b}
                    onClick={() => {
                      soundFx.playClick();
                      setStudentBatchFilter(b);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      studentBatchFilter === b
                        ? 'bg-emerald-500 text-slate-950 shadow-xs'
                        : 'bg-[#151928] text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {b === 'All' ? 'All Batches' : `${b} Batch`}
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

        {/* TAB 5: BROADCASTER */}
        {activeTab === 'broadcast' && (
          <div className="mt-6 space-y-6">
            <div className="bg-[#111422] p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-lg font-bold text-white">
                Broadcast Urgent Cohort Notification
              </h3>
              <p className="text-xs text-slate-400">
                Pushes a banner notice across all enrolled student learning dashboards.
              </p>

              <form onSubmit={handleSendBroadcast} className="space-y-4">
                <textarea
                  value={broadcastMessage}
                  onChange={e => setBroadcastMessage(e.target.value)}
                  rows={4}
                  className="w-full bg-[#151928] border border-slate-700/80 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-blue-500"
                />

                <div className="flex items-center justify-between">
                  {broadcastSentToast && (
                    <span className="text-xs font-semibold text-emerald-400 font-mono">
                      ✓ Broadcast published to student portals!
                    </span>
                  )}
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 shadow-xs ml-auto"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Announcement</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Session Modal */}
      {sessionModalOpen && (
        <AddEditSessionModal
          isOpen={sessionModalOpen}
          sessionToEdit={sessionToEdit}
          onClose={() => setSessionModalOpen(false)}
          onSave={handleSaveSession}
        />
      )}

      {/* Add Student to Batch Modal */}
      {isAddStudentModalOpen && (
        <AddStudentModal
          isOpen={isAddStudentModalOpen}
          onClose={() => setIsAddStudentModalOpen(false)}
          onAddStudent={handleAddStudent}
        />
      )}

      {/* Edit Student Modal */}
      {studentToEdit && (
        <EditStudentModal
          isOpen={Boolean(studentToEdit)}
          student={studentToEdit}
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
    </div>
  );
};
