import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { StorageService, DEFAULT_STUDENT_USER, DEFAULT_ADMIN_USER } from '../../services/storageService';
import { DbService } from '../../services/dbService';
import { DEFAULT_ENROLLED_COURSES } from '../../data/coursesData';
import { X, ShieldCheck, GraduationCap, Lock, Mail, User, CheckCircle2, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { soundFx } from '../../utils/soundEffects';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile, redirectView?: 'home' | 'student-portal' | 'admin-console' | 'enrolled-courses') => void;
  initialMode?: 'signin' | 'register';
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'signin',
}) => {
  const [mode, setMode] = useState<'signin' | 'register'>(initialMode);
  
  // Sign In state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regBatch, setRegBatch] = useState('September 2026 Live Cohort');

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    // Query live Turso Database for user authentication
    const dbUser = await DbService.authenticateUser(cleanEmail, cleanPass);
    if (dbUser) {
      soundFx.playPop();
      StorageService.setCurrentUser(dbUser);
      onLoginSuccess(dbUser, dbUser.role === 'admin' ? 'admin-console' : 'student-portal');
      onClose();
      return;
    }

    setErrorMsg('Invalid email or password. Please check your credentials.');
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim()) {
      setErrorMsg('Please enter your full name and email address.');
      return;
    }

    soundFx.playPop();
    const newUser: UserProfile = {
      id: 'stud-' + Date.now(),
      name: regName.trim(),
      email: regEmail.trim().toLowerCase(),
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      isEnrolled: true,
      enrolledBatch: regBatch,
      enrolledCourses: DEFAULT_ENROLLED_COURSES
    };

    // Add to students list in storage
    StorageService.addStudent({
      name: newUser.name,
      email: newUser.email,
      batch: regBatch,
      enrolledAt: new Date().toISOString().substring(0, 10),
      status: 'Active',
      completedDays: 0,
      avatar: newUser.avatar
    });

    StorageService.setCurrentUser(newUser);
    onLoginSuccess(newUser, 'student-portal');
    onClose();
  };

  const autofillStudent = () => {
    setEmail('student@gmail.com');
    setPassword('Student@123');
    setErrorMsg('');
  };

  const autofillAdmin = () => {
    setEmail('admin@gmail.com');
    setPassword('Admin@123');
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-md bg-[#10131f] text-slate-100 rounded-3xl shadow-2xl border border-slate-700/80 overflow-hidden"
        id="auth-modal"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#141726] border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              SE
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-400 font-mono">
                STUPID EDITZ MASTERCLASS
              </span>
              <h3 className="text-sm sm:text-base font-bold text-white">
                {mode === 'signin' ? 'Sign In to Your Account' : 'Create Student Account'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            id="close-auth-modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="px-6 pt-5">
          <div className="flex bg-[#141726] p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setMode('signin');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                mode === 'signin' ? 'bg-blue-600 text-white shadow-xs font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
              id="tab-signin"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setMode('register');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                mode === 'register' ? 'bg-blue-600 text-white shadow-xs font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
              id="tab-register"
            >
              Register New Student
            </button>
          </div>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body */}
        {mode === 'signin' ? (
          <form onSubmit={handleSignIn} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-[#161a29] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  id="login-email-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-[#161a29] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  id="login-password-input"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99] mt-2"
              id="submit-signin-btn"
            >
              <span>Sign In & Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="p-6 space-y-4">
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
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  className="w-full bg-[#161a29] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  id="register-name-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="your.email@gmail.com"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  className="w-full bg-[#161a29] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  id="register-email-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                Create Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  className="w-full bg-[#161a29] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  id="register-password-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                Enroll in Cohort
              </label>
              <select
                value={regBatch}
                onChange={e => setRegBatch(e.target.value)}
                className="w-full bg-[#161a29] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                id="register-cohort-select"
              >
                <option value="September 2026 Live Cohort">DaVinci Resolve 19 — September 2026 Live Cohort</option>
                <option value="October 2026 Cohort">Fusion 3D Bootcamp — October 2026 Cohort</option>
                <option value="Rolling Enrollment">Documentary Sound Design — Instant Access</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
              id="submit-register-btn"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete Registration & Go to Portal</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
