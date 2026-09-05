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

        {/* Courses Container */}
        <div className="flex flex-col gap-8">
          {activeCoursesList.map((course) => {
            const isEnrolled = currentUser?.enrolledCourses?.some(c => c.courseId === course.id);

            return (
              <div 
                key={course.id}
                className="glass-card glass-card-hover border border-slate-700/60 rounded-2xl overflow-hidden shadow-xl flex flex-col lg:flex-row transition-all duration-300 group w-full"
                id={`course-card-${course.id}`}
              >
                {/* Left side: Thumbnail */}
                <div className="relative w-full lg:w-5/12 h-[240px] lg:h-auto overflow-hidden bg-black shrink-0">
                  <img 
                    src={course.thumbnail} 
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111422] via-[#111422]/20 to-black/40" />
                  
                  {/* Badge */}
                  <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
                    {course.isPopular && (
                      <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-[11px] font-bold uppercase tracking-wider shadow-lg shadow-blue-500/30">
                        Most Popular
                      </span>
                    )}
                    <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-slate-200 text-[11px] font-mono border border-white/10 font-semibold">
                      {course.level}
                    </span>
                  </div>

                  {isEnrolled && (
                    <div className="absolute top-4 right-4 bg-emerald-500 text-slate-950 px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-500/30">
                      <CheckCircle2 className="w-4 h-4" />
                      Enrolled
                    </div>
                  )}

                  {/* Batch Date Overlay */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-slate-200 font-mono">
                    <span className="flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-3 py-1 rounded border border-white/10 font-semibold">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      {course.batch}
                    </span>
                  </div>
                </div>

                {/* Right side: Content & Actions */}
                <div className="flex-1 p-6 lg:p-8 flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl lg:text-3xl font-bold text-white leading-tight group-hover:text-blue-400 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-sm text-slate-400 mt-3 leading-relaxed">
                      {course.subtitle}
                    </p>

                    {/* Highlights list */}
                    <div className="mt-6 space-y-2.5">
                      {course.highlights.slice(0, 4).map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="text-sm text-slate-300">{item}</span>
                        </div>
                      ))}
                    </div>

                    {course.whatYouWillLearnLink && (
                      <div className="mt-6">
                        <button
                          onClick={() => window.open(course.whatYouWillLearnLink, '_blank')}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-xl text-blue-400 text-sm font-semibold transition-all pulse-glow-border group-hover:border-blue-400/50"
                        >
                          <GraduationCap className="w-4 h-4" />
                          What you will learn
                          <ArrowRight className="w-4 h-4 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Card Footer Actions */}
                  <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-3xl font-extrabold text-white font-mono">
                          ₹{course.price.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 font-semibold uppercase tracking-wider">
                          50% OFF Early Bird
                        </span>
                      </div>
                      <span className="text-sm text-slate-500 line-through font-mono">
                        ₹{course.originalPrice.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="sm:w-auto w-full">
                      {isEnrolled ? (
                        <button
                          onClick={() => {
                            soundFx.playWhoosh();
                            onOpenStudentPortal('enrolled-courses');
                          }}
                          className="w-full sm:w-auto py-3.5 px-6 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
                          id={`enter-course-${course.id}`}
                        >
                          <GraduationCap className="w-5 h-5" />
                          <span>Enter Classroom</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            soundFx.playClick();
                            onOpenEnroll(course);
                          }}
                          className="w-full sm:w-auto py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20"
                          id={`enroll-course-${course.id}`}
                        >
                          <span>Enroll Now</span>
                          <ArrowRight className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
