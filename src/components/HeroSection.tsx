import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Sparkles, 
  Sliders, 
  Volume2, 
  Layers, 
  Zap, 
  Film, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  DownloadCloud, 
  Clock, 
  Flame,
  Award,
  Video,
  MonitorPlay,
  RotateCcw,
  GraduationCap,
  Calendar,
  Check
} from 'lucide-react';
import { CourseSession, RegisteredStudent, VideoAsset, BundlePromo, UserProfile, Course, HeroShowcaseOption } from '../types';

import { soundFx } from '../utils/soundEffects';

interface HeroSectionProps {
  onExploreCurriculum: () => void;
  onExploreAssets: () => void;
  onOpenStudentPortal: (tab?: 'enrolled-courses' | 'classroom') => void;
  onOpenEnroll: (courseId?: string) => void;
  currentUser: UserProfile | null;
  sessionsCount?: number;
  heroOptions?: HeroShowcaseOption[];
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreCurriculum,
  onExploreAssets,
  onOpenStudentPortal,
  onOpenEnroll,
  currentUser,
  sessionsCount,
  heroOptions
}) => {
  // Compute total cohort days dynamically from database sessions list
  const totalDaysCount = sessionsCount && sessionsCount > 0 ? sessionsCount : 26;

  // Hero Showcase Options derived from DB or default
  const options = heroOptions;

  // Interactive DaVinci Studio Workbench State (Clean desktop view, no phone frames)
  const [selectedLut, setSelectedLut] = useState<'raw' | 'teal-orange' | 'kodak' | 'cyberpunk'>('teal-orange');
  const [activeTabIdx, setActiveTabIdx] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [scrubberPos, setScrubberPos] = useState(38); // percentage

  const currentOpt = options[activeTabIdx] || options[0];

  const isEnrolled = currentUser?.isEnrolled && (currentUser.enrolledCourses?.length || 0) > 0;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setScrubberPos(prev => (prev >= 98 ? 2 : prev + 0.7 * playbackSpeed));
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  const triggerSfx = (type: string) => {
    soundFx.playByType(type);
  };

  return (
    <section className="relative pt-8 pb-16 md:pt-14 md:pb-24 overflow-hidden bg-[#07090e] text-slate-100">
      {/* Dynamic Ambient Glowing Aura Lights */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[400px] glow-spot-blue blur-[130px] rounded-full pointer-events-none animate-float" />
      <div className="absolute top-40 left-1/4 w-[450px] h-[250px] glow-spot-emerald blur-[110px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Cohort Announcement Pill removed as per request */}
        {/* Hero Main Headline & Value Proposition */}
        <div className="text-center max-w-4xl mx-auto space-y-5">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.12] text-white">
            Stop Cutting Boring Videos.{' '}
            <span className="animate-gradient-text block sm:inline mt-1 sm:mt-0">
              Master High-Retention DaVinci Editing.
            </span>
          </h1>


          {/* Primary Action Buttons */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3.5">
            {isEnrolled ? (
              <button
                onClick={() => {
                  soundFx.playWhoosh();
                  onOpenStudentPortal('enrolled-courses');
                }}
                className="px-7 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm sm:text-base shadow-lg shadow-emerald-500/25 flex items-center gap-2.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
                id="hero-enrolled-continue-btn"
              >
                <GraduationCap className="w-5 h-5" />
                Go to My Enrolled Courses
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => {
                  soundFx.playWhoosh();
                  onOpenEnroll('course-davinci-26');
                }}
                className="px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-blue-600/30 flex items-center gap-2.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
                id="hero-enroll-cta"
              >
                <Flame className="w-5 h-5 text-blue-200" />
                Enroll in September Cohort
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => {
                soundFx.playClick();
                onExploreCurriculum();
              }}
              className="px-6 py-3.5 rounded-xl bg-[#141826] hover:bg-[#1c2236] text-slate-200 hover:text-white border border-slate-700/80 font-semibold text-sm sm:text-base transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
              id="hero-curriculum-btn"
            >
              <Calendar className="w-4 h-4 text-blue-400" />
              Explore Cohort Courses
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                onExploreAssets();
              }}
              className="px-5 py-3.5 rounded-xl bg-[#111e1c] hover:bg-[#162926] text-emerald-400 border border-emerald-500/30 font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
              id="hero-vault-btn"
            >
              <DownloadCloud className="w-4 h-4" />
              Creator Asset Pack
            </button>
          </div>

          {/* Guarantee & Highlights Badges */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>26 Daily 90-Min Live Classes</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Every Saturday Doubt Clearing</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Downloadable Creator Assets</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>1-on-1 Timeline Reviews</span>
            </div>
          </div>
        </div>

        {/* Studio Timeline & Color Grading Interactive Simulator (Clean Widescreen Desktop Card) */}
        {options && options.length > 0 ? (
        <div className="mt-12 max-w-5xl mx-auto glass-card rounded-2xl border border-slate-700/60 shadow-2xl overflow-hidden pulse-glow-border">
          {/* Header Controls */}
          <div className="bg-[#141828] px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-xs font-mono font-semibold text-slate-300">
                DaVinci Resolve — Masterclass_Project.dra [4K 23.976fps]
              </span>
            </div>

            {/* Workbench Mode Tabs */}
            <div className="flex items-center gap-1 bg-[#0b0e18] p-1 rounded-xl border border-slate-800 text-xs overflow-x-auto">
              {options.map((opt, idx) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    soundFx.playClick();
                    setActiveTabIdx(idx);
                  }}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all whitespace-nowrap ${
                    activeTabIdx === idx
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  id={`hero-tab-${opt.id}`}
                >
                  {opt.tabName}
                </button>
              ))}
            </div>
          </div>

          {/* Main Interactive Stage */}
          <div className="p-4 sm:p-6 bg-[#0c0e18]">
            <div className="space-y-4">
              {/* Video Monitor Box */}
              <div className="relative aspect-video max-h-[300px] w-full rounded-xl bg-black overflow-hidden border border-slate-800 group">
                <img
                  src={currentOpt.imageUrl || "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80"}
                  alt={currentOpt.title}
                  className={`w-full h-full object-cover transition-all duration-500 ${
                    selectedLut === 'teal-orange' ? 'contrast-125 saturate-125 hue-rotate-[-10deg]' :
                    selectedLut === 'kodak' ? 'contrast-110 sepia-[0.25] saturate-110 brightness-95' :
                    selectedLut === 'cyberpunk' ? 'contrast-130 hue-rotate-[90deg] saturate-150' : 'saturate-50 contrast-90 brightness-90'
                  }`}
                />
                
                {/* Overlay Video Specs */}
                <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 text-[10px] font-mono text-emerald-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  {currentOpt.badgeText || 'REC 709 • 00:04:18:12 • 4K DCI'}
                </div>

                <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 text-[10px] font-mono text-slate-300">
                  LUT: {selectedLut.toUpperCase()}
                </div>

                <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white flex items-center gap-2">
                  <Flame className="w-3.5 h-3.5 text-blue-400" />
                  <span>{currentOpt.title}</span>
                </div>
              </div>

              {/* Timeline Multi-Track Visualizer */}
              <div className="bg-[#111422] rounded-xl p-3 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>TIMELINE TRACKS & LABELS</span>
                  <span className="text-blue-400">Playhead: {Math.round(scrubberPos)}%</span>
                </div>

                {/* Scrubber Bar */}
                <div className="relative w-full h-2 bg-slate-900 rounded-full overflow-hidden cursor-pointer"
                     onClick={(e) => {
                       const rect = e.currentTarget.getBoundingClientRect();
                       const clickX = e.clientX - rect.left;
                       setScrubberPos((clickX / rect.width) * 100);
                     }}>
                  <div className="h-full bg-blue-500" style={{ width: `${scrubberPos}%` }} />
                </div>

                {/* Track 1: Primary Labels */}
                <div className="grid grid-cols-12 gap-1 text-[10px] font-mono">
                  <div className="col-span-5 bg-blue-900/40 border border-blue-500/30 text-blue-200 p-1.5 rounded truncate">
                    {currentOpt.label1}
                  </div>
                  <div className="col-span-7 bg-indigo-900/40 border border-indigo-500/30 text-indigo-200 p-1.5 rounded truncate">
                    {currentOpt.label2}
                  </div>
                </div>

                {/* Track 2: Secondary Labels */}
                <div className="grid grid-cols-12 gap-1 text-[10px] font-mono">
                  <div className="col-span-6 bg-emerald-950 border border-emerald-500/30 text-emerald-300 p-1.5 rounded truncate">
                    {currentOpt.label3}
                  </div>
                  <div className="col-span-6 bg-cyan-950 border border-cyan-500/30 text-cyan-300 p-1.5 rounded truncate">
                    {currentOpt.label4 || 'Studio Audio Track'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        ) : null}

        {/* Dynamic Metric Counter Bar */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
          <div className="glass-card p-4 rounded-2xl border border-slate-700/60 text-center glass-card-hover">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">100% Live</div>
            <div className="text-xs text-slate-400 mt-1 font-medium font-mono">Saturday Doubt Clearing</div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-slate-700/60 text-center glass-card-hover">
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-400">Creator Assets</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">SFX, LUTs & Fusion Nodes</div>
          </div>
        </div>
      </div>
    </section>
  );
};
