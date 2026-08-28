import React, { useState } from 'react';
import { CourseSession } from '../types';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  Layers, 
  Flame, 
  FileText,
  Sparkles,
  ArrowRight,
  BookOpen,
  Video,
  HelpCircle
} from 'lucide-react';
import { soundFx } from '../utils/soundEffects';

interface CurriculumOverviewProps {
  sessions: CourseSession[];
  onOpenPortal: () => void;
  onOpenEnroll?: () => void;
}

export const CurriculumOverview: React.FC<CurriculumOverviewProps> = ({
  sessions,
  onOpenPortal,
  onOpenEnroll
}) => {
  const [activeWeek, setActiveWeek] = useState<number>(1);

  const weekTabs = [
    { num: 1, title: 'Week 1', label: 'Foundations & Cut Page Fast-Cut', dates: '15 Sep – 21 Sep' },
    { num: 2, title: 'Week 2', label: 'Edit Page, Fairlight Audio & Color', dates: '22 Sep – 28 Sep' },
    { num: 3, title: 'Week 3', label: 'Fusion Nodes & Zem TV Graphics', dates: '29 Sep – 5 Oct' },
    { num: 4, title: 'Week 4', label: '3D Text, Multicam & Speed Ramps', dates: '6 Oct – 12 Oct' },
    { num: 5, title: 'Week 5', label: '3x Speed Workflow & ₹4L/mo Freelancing', dates: '13 Oct – 19 Oct' },
    { num: 6, title: 'Week 6', label: 'Timed Mock Exam & Capstone Review', dates: '20 Oct' },
  ];

  const currentWeekSessions = sessions.filter(s => s.weekNumber === activeWeek);

  return (
    <section className="py-16 bg-[#090a0f] border-t border-slate-800 text-slate-100 relative" id="curriculum-overview-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/15 text-blue-400 text-xs font-semibold font-mono border border-blue-500/30 pulse-glow-border">
              <Calendar className="w-3.5 h-3.5" />
              COMPLETE 26-DAY LIVE SYLLABUS
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Syllabus Engineered for <span className="animate-gradient-text">High-Retention Editing</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              From zero to advanced DaVinci Resolve. Every Saturday features an intensive Doubt Clearing session with live timeline troubleshooting.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenPortal}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-all shadow-lg shadow-emerald-500/20 shrink-0 hover:scale-105"
              id="curriculum-portal-btn"
            >
              <span>Student Learning Hub</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Week Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {weekTabs.map((tab) => (
            <button
              key={tab.num}
              onClick={() => {
                soundFx.playClick();
                setActiveWeek(tab.num);
              }}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                activeWeek === tab.num
                  ? 'bg-[#151a2e] border-blue-500/70 shadow-lg shadow-blue-500/20 scale-[1.02]'
                  : 'bg-[#111420] border-slate-800 hover:border-slate-700 hover:bg-[#151928]'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                <span className={activeWeek === tab.num ? 'text-blue-400 font-bold' : 'text-slate-400'}>
                  {tab.title}
                </span>
                <span className="text-[9px] text-slate-500">{tab.dates}</span>
              </div>
              <p className="text-xs font-semibold text-slate-200 line-clamp-1">
                {tab.label}
              </p>
            </button>
          ))}
        </div>

        {/* Sessions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentWeekSessions.map((session) => {
            const isOff = session.type === 'Off';
            const isDoubt = session.type === 'Doubt Session';

            return (
              <div
                key={session.id}
                className={`p-5 rounded-2xl border transition-all glass-card-hover ${
                  isOff
                    ? 'bg-[#0e1017]/50 border-slate-800/60 text-slate-500'
                    : isDoubt
                    ? 'bg-[#181613] border-amber-500/30 text-slate-200 shadow-md'
                    : 'glass-card border-slate-700/60 text-slate-200 shadow-md'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-[#161a2b] text-[10px] font-mono font-semibold text-blue-400 border border-slate-700">
                      {session.dayCode}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {session.dateFormatted}
                    </span>
                  </div>
                  <span className={`px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide rounded-full ${
                    session.type === 'Live Class'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : session.type === 'Doubt Session'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {session.type}
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-white mb-1.5 leading-snug">
                  {session.topic}
                </h3>
                <p className="text-xs text-slate-400 mb-3 line-clamp-2 leading-relaxed">
                  {session.agenda}
                </p>

                {/* Subtopic bullet items */}
                {session.subtopics && session.subtopics.length > 0 && !isOff && (
                  <div className="pt-2 border-t border-slate-800/80 space-y-1">
                    {session.subtopics.slice(0, 2).map((sub, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-[11px] text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{sub}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
