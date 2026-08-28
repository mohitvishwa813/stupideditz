import { 
  CourseSession, 
  VideoAsset, 
  YouTubeBreakdown, 
  RegisteredStudent, 
  StudentSubmission, 
  UserProfile,
  EnrolledCourseInfo,
  Course
} from '../types';
import { INITIAL_SESSIONS, INITIAL_ASSETS, INITIAL_YOUTUBE_BREAKDOWNS, INITIAL_STUDENTS } from '../data/initialData';
import { COURSES_CATALOG, DEFAULT_ENROLLED_COURSES } from '../data/coursesData';

const STORAGE_KEYS = {
  SESSIONS: 'stupideditz_sessions_v2',
  ASSETS: 'stupideditz_assets_v2',
  YOUTUBE: 'stupideditz_youtube_v2',
  STUDENTS: 'stupideditz_students_v2',
  SUBMISSIONS: 'stupideditz_submissions_v2',
  USER: 'stupideditz_user_v2',
  RATINGS: 'stupideditz_ratings_v2',
  COURSES: 'stupideditz_courses_v2',
};

export const DEFAULT_STUDENT_USER: UserProfile = {
  id: 'stud-1',
  name: 'Alex Rivera',
  email: 'student@gmail.com',
  role: 'student',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
  isEnrolled: true,
  enrolledBatch: 'September 2026',
  enrolledCourses: DEFAULT_ENROLLED_COURSES
};

export const DEFAULT_ADMIN_USER: UserProfile = {
  id: 'admin-1',
  name: 'Arjun Rajput',
  email: 'admin@gmail.com',
  role: 'admin',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  isEnrolled: true,
  enrolledBatch: 'September 2026',
  enrolledCourses: DEFAULT_ENROLLED_COURSES
};

export const GUEST_USER: UserProfile = {
  id: 'guest',
  name: 'Guest Creator',
  email: '',
  role: 'guest',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
  isEnrolled: false,
  enrolledBatch: '',
  enrolledCourses: []
};

export class StorageService {
  static getCourses(): Course[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COURSES);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    this.saveCourses(COURSES_CATALOG);
    return COURSES_CATALOG;
  }

  static saveCourses(courses: Course[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
    } catch (e) {
      console.error('Failed to save courses', e);
    }
  }

  static addCourse(course: Course): Course[] {
    const courses = this.getCourses();
    const existingIndex = courses.findIndex(c => c.id === course.id);
    if (existingIndex !== -1) {
      courses[existingIndex] = course;
    } else {
      courses.unshift(course);
    }
    this.saveCourses(courses);
    return courses;
  }

  static getSessions(): CourseSession[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    this.saveSessions(INITIAL_SESSIONS);
    return INITIAL_SESSIONS;
  }

  static saveSessions(sessions: CourseSession[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    } catch (e) {
      console.error('Failed to save sessions', e);
    }
  }

  static resetSessionsToDefault(): CourseSession[] {
    this.saveSessions(INITIAL_SESSIONS);
    return INITIAL_SESSIONS;
  }

  static addSession(session: Omit<CourseSession, 'id'>): CourseSession {
    const sessions = this.getSessions();
    const newSession: CourseSession = {
      ...session,
      id: 's-' + Date.now()
    };
    sessions.push(newSession);
    this.saveSessions(sessions);
    return newSession;
  }

  static updateSession(id: string, updates: Partial<CourseSession>): CourseSession[] {
    const sessions = this.getSessions();
    const index = sessions.findIndex(s => s.id === id);
    if (index !== -1) {
      sessions[index] = { ...sessions[index], ...updates };
      this.saveSessions(sessions);
    }
    return sessions;
  }

  static deleteSession(id: string): CourseSession[] {
    const sessions = this.getSessions().filter(s => s.id !== id);
    this.saveSessions(sessions);
    return sessions;
  }

  // Assets
  static getAssets(): VideoAsset[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ASSETS);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    this.saveAssets(INITIAL_ASSETS);
    return INITIAL_ASSETS;
  }

  static saveAssets(assets: VideoAsset[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(assets));
    } catch (e) {
      console.error('Failed to save assets', e);
    }
  }

  static addAsset(asset: Omit<VideoAsset, 'id'>): VideoAsset {
    const assets = this.getAssets();
    const newAsset: VideoAsset = {
      ...asset,
      id: 'asset-' + Date.now()
    };
    assets.unshift(newAsset);
    this.saveAssets(assets);
    return newAsset;
  }

  static deleteAsset(id: string): VideoAsset[] {
    const assets = this.getAssets().filter(a => a.id !== id);
    this.saveAssets(assets);
    return assets;
  }

  // YouTube Breakdowns
  static getYouTubeBreakdowns(): YouTubeBreakdown[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.YOUTUBE);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    return INITIAL_YOUTUBE_BREAKDOWNS;
  }

  // Students
  static getStudents(): RegisteredStudent[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    return INITIAL_STUDENTS;
  }

  static saveStudents(students: RegisteredStudent[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    } catch (e) {
      console.error('Failed to save students', e);
    }
  }

  static addStudent(student: Omit<RegisteredStudent, 'id'>): RegisteredStudent {
    const students = this.getStudents();
    const newStudent: RegisteredStudent = {
      ...student,
      id: 'stud-' + Date.now()
    };
    students.unshift(newStudent);
    try {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    } catch (e) {
      console.error(e);
    }
    return newStudent;
  }

  // Submissions
  static getSubmissions(): StudentSubmission[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    return [
      {
        id: 'sub-1',
        sessionId: 's-1',
        studentName: 'Alex Rivera',
        studentEmail: 'student@gmail.com',
        driveLink: 'https://drive.google.com/file/d/alex-day01-project/view',
        notes: 'Configured DaVinci Resolve GPU CUDA settings and exported the test timeline.',
        submittedAt: '2026-09-15 19:40',
        status: 'Reviewed',
        grade: 'A+'
      },
      {
        id: 'sub-2',
        sessionId: 's-3',
        studentName: 'Priya Sharma',
        studentEmail: 'priya.edits@gmail.com',
        driveLink: 'https://drive.google.com/file/d/priya-day03-shortcuts-cut/view',
        notes: '60-second video cut completely using Cut Page shortcuts only.',
        submittedAt: '2026-09-17 21:15',
        status: 'Reviewed',
        grade: 'A'
      }
    ];
  }

  static addSubmission(submission: Omit<StudentSubmission, 'id' | 'submittedAt' | 'status'>): StudentSubmission {
    const list = this.getSubmissions();
    const newSub: StudentSubmission = {
      ...submission,
      id: 'sub-' + Date.now(),
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'Pending'
    };
    list.unshift(newSub);
    try {
      localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }
    return newSub;
  }

  // User Profile Auth
  static getCurrentUser(): UserProfile | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    // Default to null so unauthenticated visitors start as guest and see Sign In / Register buttons
    return null;
  }

  static setCurrentUser(user: UserProfile | null) {
    try {
      if (!user) {
        localStorage.removeItem(STORAGE_KEYS.USER);
      } else {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      }
    } catch (e) {
      console.error(e);
    }
  }

  static enrollUserInCourse(courseId: string, batchName: string = 'September 2026 Live Cohort'): UserProfile {
    const current = this.getCurrentUser() || DEFAULT_STUDENT_USER;
    const course = COURSES_CATALOG.find(c => c.id === courseId) || COURSES_CATALOG[0];

    const alreadyEnrolled = current.enrolledCourses?.some(c => c.courseId === courseId);
    let updatedCourses = [...(current.enrolledCourses || [])];

    if (!alreadyEnrolled) {
      const newEnrollment: EnrolledCourseInfo = {
        courseId: course.id,
        courseTitle: course.title,
        batch: batchName,
        enrolledDate: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
        progressPercent: 10,
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
      updatedCourses.unshift(newEnrollment);
    }

    const updatedUser: UserProfile = {
      ...current,
      role: current.role === 'guest' ? 'student' : current.role,
      isEnrolled: true,
      enrolledBatch: batchName,
      enrolledCourses: updatedCourses
    };

    this.setCurrentUser(updatedUser);
    return updatedUser;
  }

  // Session Ratings
  static getRatings(): Record<string, { rating: number; feedback: string }> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RATINGS);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    return {};
  }

  static saveRating(sessionId: string, rating: number, feedback: string) {
    const ratings = this.getRatings();
    ratings[sessionId] = { rating, feedback };
    try {
      localStorage.setItem(STORAGE_KEYS.RATINGS, JSON.stringify(ratings));
    } catch (e) {
      console.error(e);
    }
  }
}
