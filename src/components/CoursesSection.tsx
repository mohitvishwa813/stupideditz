import React, { useState, useEffect } from 'react';
import { Course, UserProfile } from '../types';
import { COURSES_CATALOG } from '../data/coursesData';
import { DbService } from '../services/dbService';
import { 
  Flame, 
  Clock, 
  Calendar, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Star, 
  GraduationCap, 
  ShieldCheck, 
  DownloadCloud, 
  Users 
} from 'lucide-react';
import { soundFx } from '../utils/soundEffects';

interface CoursesSectionProps {
  courses?: Course[];
  onSelectCourse: (course: Course) => void;
  onOpenEnroll: (course: Course) => void;
  onOpenStudentPortal: (tab?: 'enrolled-courses' | 'classroom') => void;
  currentUser: UserProfile | null;
}

export const CoursesSection: React.FC<CoursesSectionProps> = ({
  courses: coursesProp,
  onSelectCourse,
  onOpenEnroll,
  onOpenStudentPortal,
  currentUser
}) => {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    let isMounted = true;
    async function loadCourses() {
      if (coursesProp && coursesProp.length > 0) return;
      try {
        const liveCourses = await DbService.getCourses();
        if (isMounted && liveCourses) {
          setCourses(liveCourses);
        }
      } catch (e) {
        console.warn('Failed loading courses from Turso:', e);
      }
    }
    loadCourses();
    return () => { isMounted = false; };
  }, [coursesProp]);

  const activeCoursesList = coursesProp ? coursesProp : courses;

  return (
    <section className="py-16 bg-[#0c0e18] text-slate-100 border-t border-slate-800" id="courses-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/15 text-blue-400 text-xs font-mono font-bold uppercase tracking-wider mb-3 border border-blue-500/30 pulse-glow-border">
            <Flame className="w-3.5 h-3.5" />
            Professional Video Editing Cohorts
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Master Every Stage of the <span className="animate-gradient-text">Video Pipeline</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-2.5">
            Interactive live classes taught by industry video editors. Select a cohort below to view full curriculum details and secure your seat.
          </p>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {activeCoursesList.map((course) => {
            const isEnrolled = currentUser?.enrolledCourses?.some(c => c.courseId === course.id);

            return (
              <div 
                key={course.id}
                className="glass-card glass-card-hover border border-slate-700/60 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between transition-all duration-300 group"
                id={`course-card-${course.id}`}
              >
                <div>
                  {/* Card Thumbnail */}
                  <div className="relative aspect-video w-full overflow-hidden bg-black">
                    <img 
                      src={course.thumbnail} 
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111422] via-transparent to-black/40" />
                    
                    {/* Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      {course.isPopular && (
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[11px] font-semibold uppercase tracking-wide shadow-xs">
                          Most Popular
                        </span>
                      )}
                      <span className="px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-slate-200 text-[11px] font-mono border border-white/10">
                        {course.level}
                      </span>
                    </div>

                    {isEnrolled && (
                      <div className="absolute top-3 right-3 bg-emerald-500 text-slate-950 px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 shadow-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Enrolled
                      </div>
                    )}

                    {/* Batch Date Overlay */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-300 font-mono">
                      <span className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded">
                        <Calendar className="w-3.5 h-3.5 text-blue-400" />
                        {course.batch}
                      </span>

                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white leading-snug group-hover:text-blue-400 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                      {course.subtitle}
                    </p>

                    {/* Highlights list */}
                    <div className="mt-4 space-y-2 border-t border-slate-800/80 pt-4 text-xs text-slate-300">
                      {course.highlights.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="truncate">{item}</span>
                        </div>
                      ))}
                    </div>

                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-6 pt-0">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-2xl font-extrabold text-white font-mono">
                        ₹{course.price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-slate-500 line-through ml-2 font-mono">
                        ₹{course.originalPrice.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 font-semibold">
                      50% OFF Early Bird
                    </span>
                  </div>

                  {isEnrolled ? (
                    <button
                      onClick={() => {
                        soundFx.playWhoosh();
                        onOpenStudentPortal('enrolled-courses');
                      }}
                      className="w-full py-3 px-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                      id={`enter-course-${course.id}`}
                    >
                      <GraduationCap className="w-4 h-4" />
                      <span>Already Enrolled — Enter Classroom</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        onOpenEnroll(course);
                      }}
                      className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
                      id={`enroll-course-${course.id}`}
                    >
                      <span>Enroll in {course.batch.split(' ')[0]} Cohort</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
