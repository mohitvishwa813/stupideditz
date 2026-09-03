import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../types';
import { StorageService, DEFAULT_STUDENT_USER, DEFAULT_ADMIN_USER } from '../../services/storageService';
import { DbService } from '../../services/dbService';
import { ApiService } from '../../services/apiService';
import { X, ShieldCheck, GraduationCap, Lock, Mail, User, Phone, CheckCircle2, ArrowRight, AlertCircle, KeyRound, Key, RefreshCw, Sparkles, Eye, EyeOff } from 'lucide-react';
import { soundFx } from '../../utils/soundEffects';
import confetti from 'canvas-confetti';

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
  const [mode, setMode] = useState<'signin' | 'register' | 'forgot'>(initialMode);
  
  // Sign In state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Register state
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regOtp, setRegOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Forgot Password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isForgotOtpSent, setIsForgotOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Countdown timer effect for OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimer > 0) {
      timer = setInterval(() => setResendTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  if (!isOpen) return null;

  // -------------------------------------------------------------------------
  // HANDLER: SIGN IN
  // -------------------------------------------------------------------------
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    // 1. Try Express API Login
    const apiRes = await ApiService.loginUser(cleanEmail, cleanPass);
    if (apiRes.success && apiRes.user) {
      soundFx.playPop();
      let finalUser = { ...apiRes.user };
      if (finalUser.enrolledCourses && finalUser.enrolledCourses.length > 0 && typeof finalUser.enrolledCourses[0] === 'string') {
        const catalog = StorageService.getCourses();
        finalUser.enrolledCourses = finalUser.enrolledCourses.map((id: string) => {
          const course = catalog.find(c => c.id === id) || catalog[0];
          return {
            courseId: course.id,
            courseTitle: course.title,
            batch: 'September 2026 Live Cohort',
            enrolledDate: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
            progressPercent: 18,
            completedDays: 2,
            totalDays: course.totalDays,
            nextSessionDay: 'Day 03',
            nextSessionTopic: 'Cut Page Full Editing + Keyboard Shortcuts',
            nextSessionTime: 'Upcoming 3:30 PM IST',
            meetUrl: 'https://meet.google.com/std-edit-live',
            status: 'Active',
            thumbnail: course.thumbnail,
            instructor: course.instructorName
          };
        });
      }
      StorageService.setCurrentUser(finalUser);
      onLoginSuccess(finalUser, finalUser.role === 'admin' ? 'admin-console' : 'home');
      setIsLoading(false);
      onClose();
      return;
    }

    // Only backend API is allowed to authenticate
    setIsLoading(false);
    setErrorMsg(apiRes.message || 'Invalid email or password. Please check your credentials.');
  };

  // -------------------------------------------------------------------------
  // HANDLER: SEND REGISTRATION OTP
  // -------------------------------------------------------------------------
  const handleSendRegisterOtp = async () => {
    setErrorMsg('');
    setSuccessMsg('');

    if (!regName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    soundFx.playClick();

    const res = await ApiService.sendRegisterOtp(regEmail.trim().toLowerCase(), regName.trim());
    setIsLoading(false);

    if (res.success) {
      soundFx.playPop();
      setIsOtpSent(true);
      setResendTimer(60);
      setSuccessMsg(res.message || 'OTP verification code sent to your email.');
    } else {
      setErrorMsg(res.message || 'Failed to send verification OTP.');
    }
  };

  // -------------------------------------------------------------------------
  // HANDLER: VERIFY OTP & REGISTER
  // -------------------------------------------------------------------------
  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!isOtpSent) {
      setErrorMsg('Please click "Send OTP" first to receive your verification code.');
      return;
    }
    if (!regOtp.trim()) {
      setErrorMsg('Please enter the 6-digit OTP code sent to your email.');
      return;
    }
    if (!regPassword.trim() || regPassword.trim().length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    soundFx.playWhoosh();

    const res = await ApiService.verifyAndRegister(
      regName.trim(),
      regPhone.trim(),
      regEmail.trim().toLowerCase(),
      regPassword.trim(),
      regOtp.trim()
    );

    setIsLoading(false);

    if (res.success && res.user) {
      soundFx.playPop();
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      StorageService.setCurrentUser(res.user);
      onLoginSuccess(res.user, 'home');
      onClose();
    } else {
      setErrorMsg(res.message || 'OTP verification failed.');
    }
  };

  // -------------------------------------------------------------------------
  // HANDLER: SEND FORGOT PASSWORD OTP
  // -------------------------------------------------------------------------
  const handleSendForgotOtp = async () => {
    setErrorMsg('');
    setSuccessMsg('');

    if (!forgotEmail.trim() || !forgotEmail.includes('@')) {
      setErrorMsg('Please enter your registered email address.');
      return;
    }

    setIsLoading(true);
    soundFx.playClick();

    const res = await ApiService.sendForgotOtp(forgotEmail.trim().toLowerCase());
    setIsLoading(false);

    if (res.success) {
      soundFx.playPop();
      setIsForgotOtpSent(true);
      setResendTimer(60);
      setSuccessMsg(res.message || 'Password reset OTP sent to your email.');
    } else {
      setErrorMsg(res.message || 'Failed to send password reset OTP.');
    }
  };

  // -------------------------------------------------------------------------
  // HANDLER: VERIFY & RESET PASSWORD
  // -------------------------------------------------------------------------
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!isForgotOtpSent) {
      setErrorMsg('Please click "Send Reset OTP" first.');
      return;
    }
    if (!forgotOtp.trim()) {
      setErrorMsg('Please enter the 6-digit OTP code.');
      return;
    }
    if (!newPassword.trim() || newPassword.trim().length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    soundFx.playPop();

    const res = await ApiService.resetPassword(
      forgotEmail.trim().toLowerCase(),
      forgotOtp.trim(),
      newPassword.trim()
    );

    setIsLoading(false);

    if (res.success) {
      setSuccessMsg('Password reset successfully! You can now sign in with your new password.');
      setTimeout(() => {
        setMode('signin');
        setEmail(forgotEmail);
        setPassword(newPassword);
        setErrorMsg('');
        setSuccessMsg('');
      }, 1500);
    } else {
      setErrorMsg(res.message || 'Failed to reset password.');
    }
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
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
              SE
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-400 font-mono">
                STUPID EDITZ MASTERCLASS
              </span>
              <h3 className="text-sm sm:text-base font-bold text-white">
                {mode === 'signin' ? 'Sign In to Your Account' : mode === 'register' ? 'Create Student Account' : 'Reset Password'}
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
        {mode !== 'forgot' && (
          <div className="px-6 pt-5">
            <div className="flex bg-[#141726] p-1 rounded-xl border border-slate-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setMode('signin');
                  setErrorMsg('');
                  setSuccessMsg('');
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
                  setSuccessMsg('');
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
        )}

        {/* Notifications */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* FORM 1: SIGN IN */}
        {mode === 'signin' && (
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
                  className="w-full bg-[#161a29] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
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
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-[#161a29] border border-slate-700/80 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  id="login-password-input"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99] mt-2 disabled:opacity-50"
              id="submit-signin-btn"
            >
              <span>{isLoading ? 'Signing In...' : 'Sign In & Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Bottom Forgot Password Link */}
            <div className="pt-2 text-center border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setMode('forgot');
                  setForgotEmail(email);
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="text-xs text-slate-400 hover:text-blue-400 transition-colors font-medium"
                id="forgot-password-link"
              >
                Forgot Password? Reset via Email OTP
              </button>
            </div>
          </form>
        )}

        {/* FORM 2: REGISTER (FULL NAME, PHONE, EMAIL OTP, PASSWORD) */}
        {mode === 'register' && (
          <form onSubmit={handleVerifyAndRegister} className="p-6 space-y-3.5 max-h-[75vh] overflow-y-auto">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 font-mono">
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
                  className="w-full bg-[#161a29] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  id="register-name-input"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 font-mono">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={regPhone}
                  onChange={e => setRegPhone(e.target.value)}
                  className="w-full bg-[#161a29] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  id="register-phone-input"
                />
              </div>
            </div>

            {/* Email Address with Inline Send OTP Button */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 font-mono">
                Email Address
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="your.email@gmail.com"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    className="w-full bg-[#161a29] border border-slate-700/80 rounded-xl pl-10 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    id="register-email-input"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendRegisterOtp}
                  disabled={isLoading || resendTimer > 0}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-semibold text-xs transition-all shrink-0 font-mono shadow-xs"
                  id="send-otp-btn"
                >
                  {resendTimer > 0 ? `${resendTimer}s` : isOtpSent ? 'Resend' : 'Send OTP'}
                </button>
              </div>
            </div>

            {/* Create Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 font-mono">
                Create Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showRegPassword ? "text" : "password"}
                  required
                  placeholder="Minimum 6 characters"
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  className="w-full bg-[#161a29] border border-slate-700/80 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  id="reg-password-input"
                />
                <button 
                  type="button" 
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                >
                  {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Enter 6-Digit OTP (Enabled after Send OTP) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 font-mono flex items-center justify-between">
                <span>Enter 6-Digit OTP</span>
                {isOtpSent && <span className="text-emerald-400 text-[10px]">OTP Dispatched</span>}
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  maxLength={6}
                  disabled={!isOtpSent}
                  placeholder={isOtpSent ? "Enter 6-digit OTP code" : "Click 'Send OTP' first"}
                  value={regOtp}
                  onChange={e => setRegOtp(e.target.value)}
                  className="w-full bg-[#161a29] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono tracking-widest disabled:opacity-50"
                  id="register-otp-input"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !isOtpSent}
              className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50 mt-2"
              id="submit-register-btn"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isLoading ? 'Verifying OTP...' : 'Verify OTP & Complete Registration'}</span>
            </button>
          </form>
        )}

        {/* FORM 3: FORGOT PASSWORD RESET VIA OTP */}
        {mode === 'forgot' && (
          <form onSubmit={handleResetPassword} className="p-6 space-y-3.5">
            <div className="flex items-center gap-2 mb-1">
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold text-slate-300">
                Reset Password with Email OTP Verification
              </span>
            </div>

            {/* Email + Send Reset OTP */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 font-mono">
                Registered Email Address
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="your.email@gmail.com"
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    className="w-full bg-[#161a29] border border-slate-700/80 rounded-xl pl-10 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendForgotOtp}
                  disabled={isLoading || resendTimer > 0}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 text-slate-950 font-bold text-xs transition-all shrink-0 font-mono"
                >
                  {resendTimer > 0 ? `${resendTimer}s` : isForgotOtpSent ? 'Resend' : 'Send Reset OTP'}
                </button>
              </div>
            </div>

            {/* Enter 6-Digit Reset OTP */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 font-mono">
                Enter 6-Digit Reset OTP
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  maxLength={6}
                  disabled={!isForgotOtpSent}
                  placeholder={isForgotOtpSent ? "Enter 6-digit OTP code" : "Click 'Send Reset OTP' first"}
                  value={forgotOtp}
                  onChange={e => setForgotOtp(e.target.value)}
                  className="w-full bg-[#161a29] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono tracking-widest disabled:opacity-50"
                />
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 font-mono">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showNewPassword ? "text" : "password"}
                  required
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full bg-[#161a29] border border-slate-700/80 rounded-xl pl-10 pr-10 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
                <button 
                  type="button" 
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !isForgotOtpSent}
              className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50 mt-2"
            >
              <span>{isLoading ? 'Resetting Password...' : 'Reset Password & Sign In'}</span>
            </button>

            <div className="pt-2 text-center border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setMode('signin');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                ← Back to Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
