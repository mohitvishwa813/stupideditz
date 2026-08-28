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
import { UserProfile, Course } from '../types';
import { soundFx } from '../utils/soundEffects';

interface HeroSectionProps {
  onExploreCurriculum: () => void;
  onExploreAssets: () => void;
  onOpenStudentPortal: (tab?: 'enrolled-courses' | 'classroom') => void;
  onOpenEnroll: (courseId?: string) => void;
  currentUser: UserProfile | null;
  sessionsCount?: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreCurriculum,
  onExploreAssets,
  onOpenStudentPortal,
  onOpenEnroll,
  currentUser,
  sessionsCount
}) => {
  // Compute total cohort days dynamically from database sessions list
  const totalDaysCount = sessionsCount && sessionsCount > 0 ? sessionsCount : 26;

  // Interactive DaVinci Studio Workbench State (Clean desktop view, no phone frames)
  const [selectedLut, setSelectedLut] = useState<'raw' | 'teal-orange' | 'kodak' | 'cyberpunk'>('teal-orange');
  const [activeTab, setActiveTab] = useState<'timeline' | 'nodes' | 'fairlight'>('timeline');
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [scrubberPos, setScrubberPos] = useState(38); // percentage

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
        {/* Top Cohort Announcement Pill */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2.5 px-4.5 py-1.5 rounded-full bg-[#121626]/80 backdrop-blur-md border border-slate-700/60 shadow-xl text-xs font-semibold text-slate-300 pulse-glow-border hover:scale-105 transition-transform cursor-pointer"
            onClick={onExploreCurriculum}
          >
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
            </span>
            <span className="text-white font-medium">Registration Open for September 2026 Batch</span>
            <span className="text-slate-600">•</span>
            <span className="text-blue-400 font-mono font-bold">26 Days Live Masterclass</span>
          </div>
        </div>

        {/* Hero Main Headline & Value Proposition */}
        <div className="text-center max-w-4xl mx-auto space-y-5">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.12] text-white">
            Stop Cutting Boring Videos.{' '}
            <span className="animate-gradient-text block sm:inline mt-1 sm:mt-0">
              Master High-Retention DaVinci Editing.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            The complete 26-Day live cohort for creators and documentary editors. 
            Learn rapid keyboard rough cuts, the <strong className="text-emerald-400 font-semibold">Zem TV motion aesthetic</strong>, Hollywood node color grading, and Fairlight sound design.
          </p>

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
                DaVinci Resolve 19 — Masterclass_Project.dra [4K 23.976fps]
              </span>
            </div>

            {/* Workbench Mode Tabs */}
            <div className="flex items-center gap-1 bg-[#0b0e18] p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => {
                  soundFx.playClick();
                  setActiveTab('timeline');
                }}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  activeTab === 'timeline'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                id="hero-tab-timeline"
              >
                Cut & Edit Page
              </button>
              <button
                onClick={() => {
                  soundFx.playClick();
                  setActiveTab('nodes');
                }}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  activeTab === 'nodes'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                id="hero-tab-nodes"
              >
                Color Nodes & LUTs
              </button>
              <button
                onClick={() => {
                  soundFx.playClick();
                  setActiveTab('fairlight');
                }}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  activeTab === 'fairlight'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                id="hero-tab-fairlight"
              >
                Fairlight Audio SFX
              </button>
            </div>
          </div>

          {/* Main Interactive Stage */}
          <div className="p-4 sm:p-6 bg-[#0c0e18]">
            {activeTab === 'timeline' && (
              <div className="space-y-4">
                {/* Video Monitor Box */}
                <div className="relative aspect-video max-h-[300px] w-full rounded-xl bg-black overflow-hidden border border-slate-800 group">
                  <img
                    src="https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80"
                    alt="DaVinci Video Monitor Preview"
                    className={`w-full h-full object-cover transition-all duration-500 ${
                      selectedLut === 'teal-orange' ? 'contrast-125 saturate-125 hue-rotate-[-10deg]' :
                      selectedLut === 'kodak' ? 'contrast-110 sepia-[0.25] saturate-110 brightness-95' :
                      selectedLut === 'cyberpunk' ? 'contrast-130 hue-rotate-[90deg] saturate-150' : 'saturate-50 contrast-90 brightness-90'
                    }`}
                  />
                  
                  {/* Overlay Video Specs */}
                  <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 text-[10px] font-mono text-emerald-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    REC 709 • 00:04:18:12 • 4K DCI
                  </div>

                  <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 text-[10px] font-mono text-slate-300">
                    LUT: {selectedLut.toUpperCase()}
                  </div>

                  <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white flex items-center gap-2">
                    <Flame className="w-3.5 h-3.5 text-blue-400" />
                    <span>Zem TV Fast-Paced Cut Technique • Day 04 Lesson</span>
                  </div>
                </div>

                {/* Timeline Multi-Track Visualizer */}
                <div className="bg-[#111422] rounded-xl p-3 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>TIMELINE TRACKS</span>
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

                  {/* Track 1: Video Track */}
                  <div className="grid grid-cols-12 gap-1 text-[10px] font-mono">
                    <div className="col-span-3 bg-blue-900/40 border border-blue-500/30 text-blue-200 p-1.5 rounded truncate">
                      V2: Title_Callout.drfx
                    </div>
                    <div className="col-span-4 bg-indigo-900/40 border border-indigo-500/30 text-indigo-200 p-1.5 rounded truncate">
                      V1: 4K_A-Roll_Interview.mov
                    </div>
                    <div className="col-span-5 bg-slate-800 border border-slate-700 text-slate-200 p-1.5 rounded truncate">
                      V1: B-Roll_Cinematic_Bldgs.mov
                    </div>
                  </div>

                  {/* Track 2: Audio FX Track */}
                  <div className="grid grid-cols-12 gap-1 text-[10px] font-mono">
                    <div className="col-span-2 bg-emerald-950 border border-emerald-500/30 text-emerald-300 p-1 rounded truncate">
                      A1: Voice_Isolate
                    </div>
                    <div className="col-span-4 bg-cyan-950 border border-cyan-500/30 text-cyan-300 p-1 rounded truncate">
                      A2: Cinema_Whoosh_01.wav
                    </div>
                    <div className="col-span-3 bg-emerald-950 border border-emerald-500/30 text-emerald-300 p-1 rounded truncate">
                      A3: Sub_Bass_Impact.wav
                    </div>
                    <div className="col-span-3 bg-cyan-950 border border-cyan-500/30 text-cyan-300 p-1 rounded truncate">
                      A4: Ambient_Tape_Hiss.wav
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'nodes' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 bg-[#121524] p-3 rounded-xl border border-slate-800">
                  <span className="text-xs font-semibold text-slate-300">
                    Live Color Grading Grade Styles:
                  </span>
                  <div className="flex items-center gap-2">
                    {(['raw', 'teal-orange', 'kodak', 'cyberpunk'] as const).map(lut => (
                      <button
                        key={lut}
                        onClick={() => {
                          soundFx.playPop();
                          setSelectedLut(lut);
                        }}
                        className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-all ${
                          selectedLut === lut
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {lut}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Node Graph Tree Representation */}
                <div className="p-4 bg-[#111424] rounded-xl border border-slate-800 flex flex-wrap items-center justify-around gap-4 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-center">
                    <div className="text-[10px] text-slate-400 font-semibold">NODE 01</div>
                    <div className="text-white font-semibold mt-1">Noise Reduction</div>
                    <span className="text-[9px] text-emerald-400">Temporal 3-frame</span>
                  </div>
                  <div className="text-slate-500">→</div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-center">
                    <div className="text-[10px] text-slate-400 font-semibold">NODE 02</div>
                    <div className="text-white font-semibold mt-1">Primary Exposure</div>
                    <span className="text-[9px] text-amber-400">Lift / Gamma / Gain</span>
                  </div>
                  <div className="text-slate-500">→</div>
                  <div className="p-3 rounded-xl bg-[#162038] border border-blue-500/50 text-center shadow-xs">
                    <div className="text-[10px] text-blue-400 font-semibold">NODE 03</div>
                    <div className="text-white font-semibold mt-1">Teal & Orange LUT</div>
                    <span className="text-[9px] text-blue-300">3D Cube Matrix</span>
                  </div>
                  <div className="text-slate-500">→</div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-center">
                    <div className="text-[10px] text-slate-400 font-semibold">NODE 04</div>
                    <div className="text-white font-semibold mt-1">35mm Film Grain</div>
                    <span className="text-[9px] text-indigo-400">4K Grain Overlay</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'fairlight' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-400">
                  Click any studio sound sample to audition the exact Foley used in high-retention documentary editing:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { name: 'Cinematic Whoosh', type: 'whoosh', color: 'text-amber-400' },
                    { name: 'Sub-Bass Impact', type: 'impact', color: 'text-blue-400' },
                    { name: 'Glitch Transition', type: 'glitch', color: 'text-indigo-400' },
                    { name: 'UI Pop Click', type: 'pop', color: 'text-emerald-400' }
                  ].map(sfx => (
                    <button
                      key={sfx.name}
                      onClick={() => triggerSfx(sfx.type)}
                      className="p-3 bg-[#131728] hover:bg-[#1c223c] border border-slate-800 hover:border-slate-700 rounded-xl text-left transition-all group"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <Volume2 className={`w-4 h-4 ${sfx.color} group-hover:scale-110 transition-transform`} />
                        <span className="text-[9px] font-mono text-slate-500 uppercase">24-bit WAV</span>
                      </div>
                      <div className="text-xs font-semibold text-white truncate">{sfx.name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Click to Play 🔊</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Metric Counter Bar */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
          <div className="glass-card p-4 rounded-2xl border border-slate-700/60 text-center glass-card-hover">
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{totalDaysCount} Days</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Live 90-Min Daily Cohort</div>
          </div>

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
