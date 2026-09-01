import React, { useState, useEffect } from 'react';
import { Course, UserProfile } from '../../types';
import { ApiService } from '../../services/apiService';
import { 
  X, 
  CheckCircle2, 
  Flame, 
  CreditCard, 
  Lock, 
  User, 
  Mail, 
  Phone, 
  LogIn, 
  UserPlus, 
  Send, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { soundFx } from '../../utils/soundEffects';
import confetti from 'canvas-confetti';

interface EnrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  course?: Course | null;
  currentUser: UserProfile | null;
  onEnrollSuccess: (batch: string, tier: string) => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export const EnrollModal: React.FC<EnrollModalProps> = ({
  isOpen,
  onClose,
  course,
  currentUser,
  onEnrollSuccess,
  onLoginSuccess,
}) => {
  // Cohort & Tier selection
  const [selectedBatch, setSelectedBatch] = useState<string>(
    course?.batch || 'September 2026 Cohort'
  );
  
  // Coupon
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');

  // Embedded Auth State (for guests)
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');
  
  // Sign In Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // Processing Enrollment
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (course) {
      setSelectedBatch(course.batch || 'September 2026 Cohort');
    }
  }, [course]);

  // Resend OTP countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  if (!isOpen || !course) return null;

  // Dynamic Course Pricing
  const basePrice = course.price;
  const originalPrice = course.originalPrice;
  const discountAmount = couponApplied ? Math.round(basePrice * 0.2) : 0;
  const finalPrice = basePrice - discountAmount;

  // Apply Coupon
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    if (couponCode.trim().toUpperCase() === 'STUPID20' || couponCode.trim().toUpperCase() === 'EARLYBIRD') {
      soundFx.playPop();
      setCouponApplied(true);
    } else {
      soundFx.playGlitch();
      setCouponError('Invalid promo code. Use "EARLYBIRD" for 20% OFF!');
    }
  };

  // Handle Embedded Sign In
  const handleEmbeddedLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setAuthError('Please enter both Email and Password.');
      return;
    }

    setAuthLoading(true);
    soundFx.playClick();

    const res = await ApiService.loginUser(loginEmail.trim(), loginPassword);
    setAuthLoading(false);

    if (res.success && res.user) {
      soundFx.playPop();
      onLoginSuccess(res.user, 'none');
    } else {
      soundFx.playGlitch();
      setAuthError(res.message || 'Invalid credentials. Please try again.');
    }
  };

  // Handle Embedded Send OTP for Register
  const handleSendOtp = async () => {
    setAuthError('');
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setAuthError('Please enter a valid email address.');
      return;
    }

    setAuthLoading(true);
    soundFx.playClick();

    const res = await ApiService.sendRegisterOtp(regEmail.trim(), regName.trim() || 'Creator');
    setAuthLoading(false);

    if (res.success) {
      soundFx.playPop();
      setOtpSent(true);
      setResendTimer(60);
    } else {
      soundFx.playGlitch();
      setAuthError(res.message || 'Failed to send OTP email.');
    }
  };

  // Handle Embedded Verify OTP & Register
  const handleEmbeddedRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!regName.trim()) {
      setAuthError('Please enter your full name.');
      return;
    }
    if (!regEmail.trim()) {
      setAuthError('Please enter your email.');
      return;
    }
    if (!enteredOtp || enteredOtp.trim().length !== 6) {
      setAuthError('Please enter the 6-digit OTP sent to your email.');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      return;
    }

    setAuthLoading(true);
    soundFx.playClick();

    const res = await ApiService.verifyAndRegister(
      regName.trim(),
      regPhone.trim(),
      regEmail.trim(),
      regPassword,
      enteredOtp.trim()
    );

    setAuthLoading(false);

    if (res.success && res.user) {
      soundFx.playPop();
      onLoginSuccess(res.user, 'none');
    } else {
      soundFx.playGlitch();
      setAuthError(res.message || 'Invalid OTP code.');
    }
  };

  // Complete Enrollment & Razorpay Payment Proceed
  const handleCompleteEnrollment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setAuthError('Please Sign In or Register above to enable payment.');
      return;
    }

    soundFx.playWhoosh();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      confetti({
        particleCount: 140,
        spread: 90,
        origin: { y: 0.5 },
      });
      onEnrollSuccess(selectedBatch, 'pro');
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="bg-[#10131f] border border-slate-700/80 rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl text-slate-100 p-6 sm:p-8 relative"
        id="enrollment-modal-container"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          id="close-enroll-modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Dynamic Course Banner */}
        <div className="bg-[#161a29] border border-slate-800 rounded-2xl p-4 mb-6 flex items-center gap-4">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover ring-1 ring-slate-700 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <span className="px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 text-[10px] font-mono font-bold uppercase border border-blue-500/30">
              {selectedBatch}
            </span>
            <h3 className="text-base sm:text-lg font-extrabold text-white mt-1 leading-tight truncate">
              {course.title}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 truncate">
              Instructor: <span className="text-slate-200 font-semibold">{course.instructorName}</span>
            </p>
          </div>
        </div>

        {/* Modal Section Header */}
        <div className="text-center max-w-md mx-auto mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider mb-2">
            <Flame className="w-3.5 h-3.5" />
            Limited Cohort Seats Available
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Secure Your Seat
          </h2>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            {course.subtitle}
          </p>
        </div>

        {/* AUTH SECTION (IF LOGGED IN VS GUEST) */}
        <div className="mb-6">
          {currentUser ? (
            /* Signed In User Banner */
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                  alt={currentUser.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/40"
                />
                <div>
                  <div className="text-xs font-mono font-bold text-emerald-400 uppercase flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified Account
                  </div>
                  <div className="text-sm font-bold text-white">
                    {currentUser.name}
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    {currentUser.email}
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/30 font-bold hidden sm:inline-block">
                Ready to Enroll
              </span>
            </div>
          ) : (
            /* Embedded Auth Card for Guests */
            <div className="bg-[#141827] border border-blue-500/30 rounded-2xl p-5 space-y-4 shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-mono font-bold text-blue-400 uppercase flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> Authentication Required
                </span>

                {/* Auth Mode Toggle Buttons */}
                <div className="flex items-center gap-1 bg-[#0c0e18] p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setAuthMode('signin');
                      setAuthError('');
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      authMode === 'signin'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setAuthMode('register');
                      setAuthError('');
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      authMode === 'register'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Register
                  </button>
                </div>
              </div>

              {/* Error Banner */}
              {authError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
                  ⚠️ {authError}
                </div>
              )}

              {/* MODE A: EMBEDDED SIGN IN */}
              {authMode === 'signin' && (
                <form onSubmit={handleEmbeddedLogin} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase font-mono mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        placeholder="you@gmail.com"
                        value={loginEmail}
                        onChange={e => setLoginEmail(e.target.value)}
                        className="w-full bg-[#0c0e18] border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase font-mono mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={e => setLoginPassword(e.target.value)}
                        className="w-full bg-[#0c0e18] border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    {authLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" />
                        <span>Sign In to Unlock Payment</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* MODE B: EMBEDDED REGISTER WITH EMAIL OTP */}
              {authMode === 'register' && (
                <form onSubmit={handleEmbeddedRegister} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 uppercase font-mono mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Rahul Verma"
                        value={regName}
                        onChange={e => setRegName(e.target.value)}
                        className="w-full bg-[#0c0e18] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 uppercase font-mono mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={regPhone}
                        onChange={e => setRegPhone(e.target.value)}
                        className="w-full bg-[#0c0e18] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Email & Send OTP */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase font-mono mb-1">
                      Email Address
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        required
                        placeholder="you@gmail.com"
                        value={regEmail}
                        onChange={e => setRegEmail(e.target.value)}
                        className="flex-1 bg-[#0c0e18] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={authLoading || resendTimer > 0}
                        className="px-3 py-2 bg-[#1a2136] hover:bg-[#232c48] text-blue-400 border border-blue-500/30 font-bold text-xs rounded-xl shrink-0 transition-colors flex items-center gap-1"
                      >
                        {authLoading ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : resendTimer > 0 ? (
                          <span>Wait {resendTimer}s</span>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>{otpSent ? 'Resend' : 'Send OTP'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* OTP Input & Password (Revealed after Send OTP) */}
                  {otpSent && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 animate-fadeIn">
                      <div>
                        <label className="block text-[11px] font-bold text-emerald-400 uppercase font-mono mb-1">
                          Enter 6-Digit OTP
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="123456"
                          value={enteredOtp}
                          onChange={e => setEnteredOtp(e.target.value)}
                          className="w-full bg-[#0c0e18] border border-emerald-500/50 rounded-xl px-3 py-2 text-xs text-center font-mono font-bold text-emerald-400 placeholder-slate-600 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 uppercase font-mono mb-1">
                          Create Password
                        </label>
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          value={regPassword}
                          onChange={e => setRegPassword(e.target.value)}
                          className="w-full bg-[#0c0e18] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  )}

                  {otpSent && (
                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all mt-2"
                    >
                      {authLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          <span>Verify OTP & Unlock Payment</span>
                        </>
                      )}
                    </button>
                  )}
                </form>
              )}
            </div>
          )}
        </div>

        {/* Promo Code Input */}
        <div className="bg-[#161a29] border border-slate-800 rounded-2xl p-4 mb-6">
          <form onSubmit={handleApplyCoupon} className="flex gap-2">
            <input
              type="text"
              placeholder="HAVE A PROMO CODE? (TRY EARLYBIRD)"
              value={couponCode}
              onChange={e => setCouponCode(e.target.value)}
              className="flex-1 bg-[#10131f] border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs uppercase font-mono text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 rounded-xl transition-colors shrink-0"
            >
              Apply
            </button>
          </form>

          {couponApplied && (
            <p className="text-xs text-emerald-400 font-bold font-mono mt-2">
              ✓ Promo code "EARLYBIRD" applied: 20% Extra Discount!
            </p>
          )}

          {couponError && (
            <p className="text-xs text-rose-400 font-bold font-mono mt-2">
              ⚠️ {couponError}
            </p>
          )}
        </div>

        {/* Order Summary & Final Price */}
        <div className="bg-[#161a29] border border-slate-800 rounded-2xl p-4 mb-6 space-y-2">
          <div className="flex justify-between text-xs text-slate-400 font-mono">
            <span>Course Fee:</span>
            <span className="line-through text-slate-500">₹{originalPrice.toLocaleString('en-IN')}</span>
          </div>

          <div className="flex justify-between text-xs text-slate-300 font-mono">
            <span>Early Bird Discount:</span>
            <span className="text-emerald-400 font-bold">-50% OFF</span>
          </div>

          {couponApplied && (
            <div className="flex justify-between text-xs text-emerald-400 font-mono">
              <span>Promo Code Discount (20%):</span>
              <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
            </div>
          )}

          <div className="border-t border-slate-800 pt-2 flex justify-between items-center">
            <span className="text-sm font-bold text-white">Total Amount:</span>
            <span className="text-2xl font-black text-white font-mono">
              ₹{finalPrice.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Final Payment Form Submission */}
        <form onSubmit={handleCompleteEnrollment}>
          <button
            type="submit"
            disabled={!currentUser || isProcessing}
            className={`w-full py-4 px-6 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-xl ${
              !currentUser || isProcessing
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-600/30 active:scale-[0.99]'
            }`}
            id="proceed-payment-btn"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Redirecting to Razorpay Payment...</span>
              </>
            ) : !currentUser ? (
              <>
                <Lock className="w-4 h-4 text-slate-400" />
                <span>Sign In or Register Above to Pay (₹{finalPrice.toLocaleString('en-IN')})</span>
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                <span>Proceed to Razorpay Checkout (₹{finalPrice.toLocaleString('en-IN')})</span>
                <ArrowRight className="w-5 h-5 ml-1" />
              </>
            )}
          </button>
        </form>

        {/* Trust Badges */}
        <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-slate-400 font-mono">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> 256-bit Encrypted
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <CreditCard className="w-3.5 h-3.5 text-emerald-400" /> Razorpay Secured
          </span>
        </div>
      </div>
    </div>
  );
};
