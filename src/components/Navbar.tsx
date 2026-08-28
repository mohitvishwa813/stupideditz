import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { UserProfile } from '../types';
import { 
  Film, 
  Sparkles, 
  BookOpen, 
  Shield, 
  User, 
  LogOut, 
  LogIn, 
  ChevronDown,
  DownloadCloud, 
  PlayCircle, 
  Flame, 
  GraduationCap, 
  Calendar,
  FolderLock,
  ArrowRight,
  ExternalLink,
  Layers,
  Award
} from 'lucide-react';
import { soundFx } from '../utils/soundEffects';

interface NavbarProps {
  currentView?: 'home' | 'student-portal' | 'admin-console' | 'assets' | 'breakdowns';
  studentActiveTab?: 'enrolled-courses' | 'classroom' | 'doubts' | 'assets' | 'assignments' | 'mock-test';
  onNavigate: (view: 'home' | 'student-portal' | 'admin-console' | 'assets' | 'breakdowns', studentTab?: 'enrolled-courses' | 'classroom' | 'doubts' | 'assets' | 'assignments' | 'mock-test') => void;
  currentUser: UserProfile | null;
  onOpenLogin: (initialMode?: 'signin' | 'register') => void;
  onLogout: () => void;
  onOpenEnroll?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView: currentViewProp,
  onNavigate,
  currentUser,
  onOpenLogin,
  onLogout,
  onOpenEnroll
}) => {
  const location = useLocation();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getActiveView = () => {
    if (location.pathname === '/breakdowns') return 'breakdowns';
    if (location.pathname === '/assets') return 'assets';
    if (location.pathname === '/student-portal') return 'student-portal';
    if (location.pathname === '/admin-console') return 'admin-console';
    return 'home';
  };
  const currentView = currentViewProp || getActiveView();

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isUserAuthenticated = currentUser && currentUser.role !== 'guest';
  const isAdmin = currentUser?.role === 'admin';

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0b0d14]/95 backdrop-blur-xl border-b border-slate-800 text-slate-100 shadow-md">
      {/* Top Notification Announcement Bar (Hidden - Code Preserved) */}
      {false && (
        <div className="bg-[#0e111c] border-b border-slate-800/80 text-slate-300 px-4 py-1.5 text-[11px] sm:text-xs font-medium flex items-center justify-between">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 overflow-hidden truncate">
              <span className="bg-blue-500/15 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-wider font-semibold shrink-0">
                Next Cohort
              </span>
              <span className="truncate text-slate-300">
                September 2026 Live Masterclass — <strong className="text-white font-semibold">26 Days of DaVinci Resolve Mastery</strong>
              </span>
            </div>
            {onOpenEnroll && (
              <button 
                onClick={() => {
                  soundFx.playClick();
                  onOpenEnroll();
                }}
                className="shrink-0 bg-blue-600 hover:bg-blue-500 text-white px-3 py-0.5 rounded-md text-[11px] font-semibold transition-all shadow-xs"
                id="topbar-enroll-btn"
              >
                Enroll Now →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <button 
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 group text-left focus:outline-none"
            id="brand-logo-btn"
          >
            <div className="relative w-9 h-9 rounded-xl bg-[#141828] border border-slate-700/80 flex items-center justify-center group-hover:border-blue-500/50 transition-colors shadow-xs">
              <Film className="w-4.5 h-4.5 text-blue-400" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full ring-2 ring-[#0b0d14]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-tight text-white text-base sm:text-lg">
                  STUPID<span className="text-blue-400">EDITZ</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider font-mono font-semibold bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
                  STUDIO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                DaVinci Resolve Mastery & Creator Assets
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#111422] p-1 rounded-xl border border-slate-800 text-xs font-semibold text-slate-300">
            <button
              onClick={() => onNavigate('home')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                currentView === 'home' 
                  ? 'bg-blue-600 text-white font-semibold shadow-xs' 
                  : 'hover:text-white hover:bg-slate-800/70'
              }`}
              id="nav-overview"
            >
              Dashboard
            </button>
            <button
              onClick={() => onNavigate('breakdowns')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                currentView === 'breakdowns' 
                  ? 'bg-blue-600 text-white font-semibold shadow-xs' 
                  : 'hover:text-white hover:bg-slate-800/70'
              }`}
              id="nav-breakdowns"
            >
              <PlayCircle className="w-3.5 h-3.5 text-blue-400" />
              Documentary Breakdowns
            </button>
          </nav>
        </div>

        {/* Right side Profile & Student Hub Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* If admin, show direct Preview as Student button */}
          {isAdmin ? (
            <button
              onClick={() => onNavigate('student-portal', 'enrolled-courses')}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30 transition-all shadow-xs"
              id="nav-preview-student-btn"
            >
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              <span>Preview as Student</span>
            </button>
          ) : isUserAuthenticated && (
            <button
              onClick={() => onNavigate('student-portal', 'enrolled-courses')}
              className={`hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                currentView === 'student-portal'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-xs'
                  : 'bg-[#111e1c] text-emerald-400 hover:bg-[#162926] border border-emerald-500/25'
              }`}
              id="nav-student-portal-btn"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student Portal</span>
            </button>
          )}

          {/* Profile Dropdown / Auth Buttons */}
          {isUserAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => {
                  soundFx.playClick();
                  setProfileDropdownOpen(!profileDropdownOpen);
                }}
                className="flex items-center gap-2 p-1.5 pl-2 pr-3 rounded-xl bg-[#141826] hover:bg-[#1c2236] border border-slate-700/80 transition-all text-xs focus:outline-none"
                id="user-profile-menu-btn"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-600"
                />
                <div className="text-left hidden md:block">
                  <div className="font-semibold text-slate-200 text-xs truncate max-w-[110px]">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {currentUser.role === 'admin' ? 'Studio Admin' : 'Student'}
                  </div>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-[#121522] border border-slate-700/90 rounded-2xl shadow-xl overflow-hidden py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {/* User Info Header */}
                  <div className="px-4 py-3 border-b border-slate-800 bg-[#161a2a]">
                    <p className="text-xs font-bold text-white truncate">
                      {currentUser.name}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono truncate">
                      {currentUser.email}
                    </p>
                    <div className="mt-2 flex items-center gap-1.5">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                        currentUser.role === 'admin' 
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {currentUser.role === 'admin' ? 'Instructor / Admin' : 'Enrolled Student'}
                      </span>
                    </div>
                  </div>

                  {/* Clean Options tailored for Admin vs Student */}
                  <div className="py-1">
                    {isAdmin ? (
                      <>
                        <button
                          onClick={() => {
                            soundFx.playClick();
                            setProfileDropdownOpen(false);
                            onNavigate('admin-console');
                          }}
                          className="w-full px-4 py-2.5 text-left text-xs font-semibold text-blue-300 hover:bg-[#1a2034] flex items-center gap-2.5 transition-colors"
                          id="dropdown-admin-console"
                        >
                          <Shield className="w-4 h-4 text-blue-400" />
                          <span>Admin Studio Console</span>
                        </button>
                        <button
                          onClick={() => {
                            soundFx.playClick();
                            setProfileDropdownOpen(false);
                            onNavigate('student-portal', 'enrolled-courses');
                          }}
                          className="w-full px-4 py-2.5 text-left text-xs font-semibold text-emerald-400 hover:bg-[#1a2034] flex items-center gap-2.5 transition-colors"
                          id="dropdown-preview-student"
                        >
                          <GraduationCap className="w-4 h-4 text-emerald-400" />
                          <span>Preview as Student</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            soundFx.playClick();
                            setProfileDropdownOpen(false);
                            onNavigate('student-portal', 'enrolled-courses');
                          }}
                          className="w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-200 hover:bg-[#1a2034] hover:text-emerald-400 flex items-center justify-between transition-colors"
                          id="dropdown-enrolled-courses"
                        >
                          <div className="flex items-center gap-2.5">
                            <GraduationCap className="w-4 h-4 text-emerald-400" />
                            <span>Enrolled Courses</span>
                          </div>
                        </button>
                        <button
                          onClick={() => {
                            soundFx.playClick();
                            setProfileDropdownOpen(false);
                            onNavigate('student-portal', 'classroom');
                          }}
                          className="w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-200 hover:bg-[#1a2034] hover:text-white flex items-center gap-2.5 transition-colors"
                          id="dropdown-classroom-schedule"
                        >
                          <Calendar className="w-4 h-4 text-blue-400" />
                          <span>26-Day Live Schedule</span>
                        </button>
                      </>
                    )}
                  </div>

                  {/* Sign Out */}
                  <div className="border-t border-slate-800 py-1">
                    <button
                      onClick={() => {
                        soundFx.playPop();
                        setProfileDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs font-semibold text-rose-400 hover:bg-rose-500/10 flex items-center gap-2.5 transition-colors"
                      id="dropdown-signout"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Guest Sign In / Register Buttons */
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  soundFx.playClick();
                  onOpenLogin('signin');
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-200 bg-[#141826] hover:bg-[#1c2236] border border-slate-700/80 rounded-xl transition-all shadow-xs"
                id="header-signin-btn"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </button>

              <button
                onClick={() => {
                  soundFx.playClick();
                  onOpenLogin('register');
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-xs"
                id="header-register-btn"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
