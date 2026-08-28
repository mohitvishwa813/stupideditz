import React, { useState } from 'react';
import { X, CheckCircle2, Zap, ShieldCheck, Sparkles, Flame, Clock, CreditCard, Lock } from 'lucide-react';
import { soundFx } from '../../utils/soundEffects';
import confetti from 'canvas-confetti';

interface EnrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnrollSuccess: (batch: string, tier: string) => void;
}

export const EnrollModal: React.FC<EnrollModalProps> = ({
  isOpen,
  onClose,
  onEnrollSuccess,
}) => {
  const [selectedBatch, setSelectedBatch] = useState<'September 2026' | 'October 2026'>('September 2026');
  const [selectedTier, setSelectedTier] = useState<'pro' | 'mentorship'>('pro');
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const basePrice = selectedTier === 'pro' ? 19999 : 39999;
  const discount = couponApplied ? Math.round(basePrice * 0.2) : 0;
  const finalPrice = basePrice - discount;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.trim().toUpperCase() === 'STUPID20' || couponCode.trim().toUpperCase() === 'EARLYBIRD') {
      soundFx.playPop();
      setCouponApplied(true);
    } else {
      soundFx.playGlitch();
      alert('Invalid coupon code. Try using "EARLYBIRD" for 20% off!');
    }
  };

  const handleCompleteEnrollment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !studentEmail.trim()) {
      alert('Please fill in your name and email.');
      return;
    }
    soundFx.playWhoosh();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
      });
      onEnrollSuccess(selectedBatch, selectedTier);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-[#11131c] border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl text-slate-100 p-6 sm:p-8 relative"
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

        {/* Header */}
        <div className="text-center max-w-md mx-auto mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono font-semibold uppercase tracking-wider mb-2">
            <Flame className="w-3.5 h-3.5" />
            Limited Cohort Capacity (30 Seats)
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Secure Your Seat in the Masterclass
          </h2>
          <p className="text-xs text-slate-400 mt-1.5">
            Full lifetime access to live interactive sessions, 40GB+ asset vault, and doubt-clearing sessions.
          </p>
        </div>

        <form onSubmit={handleCompleteEnrollment} className="space-y-6">
          {/* Cohort Batch Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 font-mono">
              1. Select Starting Cohort Batch
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setSelectedBatch('September 2026');
                }}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  selectedBatch === 'September 2026'
                    ? 'bg-blue-500/10 border-blue-500 ring-1 ring-blue-500'
                    : 'bg-[#161a27] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-white">September 2026 Cohort</span>
                  <span className="bg-blue-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    Filling Fast
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Starts Sep 15 • 6 Seats Left</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setSelectedBatch('October 2026');
                }}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  selectedBatch === 'October 2026'
                    ? 'bg-blue-500/10 border-blue-500 ring-1 ring-blue-500'
                    : 'bg-[#161a27] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-white">October 2026 Cohort</span>
                  <span className="bg-slate-700 text-slate-300 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    Early Bird
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Starts Oct 20 • 24 Seats Open</p>
              </button>
            </div>
          </div>

          {/* Tier Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 font-mono">
              2. Choose Membership Tier
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setSelectedTier('pro');
                }}
                className={`p-4 rounded-xl border text-left transition-all relative ${
                  selectedTier === 'pro'
                    ? 'bg-[#1a2035] border-emerald-500 ring-1 ring-emerald-500'
                    : 'bg-[#161a27] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-base text-white">Cohort Pro Pass</span>
                  <span className="text-lg font-bold text-emerald-400">₹19,999</span>
                </div>
                <ul className="mt-3 space-y-1.5 text-xs text-slate-300">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    All 26 Live Masterclass Sessions
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    40GB+ Sound FX & LUT Vault
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Saturday Doubt Clearing Access
                  </li>
                </ul>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setSelectedTier('mentorship');
                }}
                className={`p-4 rounded-xl border text-left transition-all relative ${
                  selectedTier === 'mentorship'
                    ? 'bg-[#1a2035] border-blue-500 ring-1 ring-blue-500'
                    : 'bg-[#161a27] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="absolute -top-2.5 right-3 bg-blue-600 text-white text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full shadow-xs">
                  Most Popular
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-base text-white">VIP 1-on-1 Mentorship</span>
                  <span className="text-lg font-bold text-blue-400">₹39,999</span>
                </div>
                <ul className="mt-3 space-y-1.5 text-xs text-slate-300">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                    Everything in Pro Pass
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                    2x 1-on-1 Video Portfolio Reviews
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                    Direct WhatsApp & Discord DM access
                  </li>
                </ul>
              </button>
            </div>
          </div>

          {/* Student Info Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Your Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Alex Rivera"
                value={studentName}
                onChange={e => setStudentName(e.target.value)}
                className="w-full bg-[#161a27] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                id="enroll-name-input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Your Email Address</label>
              <input
                type="email"
                required
                placeholder="alex@example.com"
                value={studentEmail}
                onChange={e => setStudentEmail(e.target.value)}
                className="w-full bg-[#161a27] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                id="enroll-email-input"
              />
            </div>
          </div>

          {/* Promo Code Box */}
          <div className="bg-[#161a27] p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
            <div className="flex-1 flex items-center gap-2">
              <input
                type="text"
                placeholder="Have a promo code? (try EARLYBIRD)"
                value={couponCode}
                onChange={e => setCouponCode(e.target.value)}
                disabled={couponApplied}
                className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none uppercase font-mono w-full"
                id="enroll-coupon-input"
              />
            </div>
            <button
              type="button"
              onClick={handleApplyCoupon}
              disabled={couponApplied || !couponCode.trim()}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                couponApplied
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-700 hover:bg-slate-600 text-white'
              }`}
              id="apply-coupon-btn"
            >
              {couponApplied ? 'Applied (-20%)' : 'Apply'}
            </button>
          </div>

          {/* Price Summary & Submit */}
          <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs text-slate-400 font-mono">Total Investment</div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-white">
                  ₹{finalPrice.toLocaleString('en-IN')}
                </span>
                {couponApplied && (
                  <span className="text-sm line-through text-slate-500 font-mono">
                    ₹{basePrice.toLocaleString('en-IN')}
                  </span>
                )}
                <span className="text-[11px] text-emerald-400 font-mono">One-time payment</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-xs flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              id="complete-enroll-btn"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Securing Enrollment...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Instant Cohort Enrollment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
