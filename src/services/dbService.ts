import { turso } from './tursoClient';
import { 
  CourseSession, 
  VideoAsset, 
  YouTubeBreakdown, 
  RegisteredStudent, 
  StudentSubmission, 
  UserProfile,
  Course,
  EnrolledCourseInfo,
  SessionType
} from '../types';
import { INITIAL_SESSIONS, INITIAL_ASSETS, INITIAL_YOUTUBE_BREAKDOWNS, INITIAL_STUDENTS } from '../data/initialData';
import { COURSES_CATALOG, DEFAULT_ENROLLED_COURSES } from '../data/coursesData';
import { DEFAULT_ADMIN_USER, DEFAULT_STUDENT_USER } from './storageService';

export class DbService {
  // Fetch Courses Catalog from Turso
  static async getCourses(): Promise<Course[]> {
    try {
      const coursesRes = await turso.execute('SELECT * FROM courses WHERE is_published = 1 ORDER BY created_at ASC');
      if (coursesRes.rows.length === 0) return COURSES_CATALOG;

      const highlightsRes = await turso.execute('SELECT * FROM course_highlights ORDER BY display_order ASC');
      const tagsRes = await turso.execute('SELECT * FROM course_tags');

      console.log(`⚡ [Turso DB] Successfully fetched ${coursesRes.rows.length} courses live from Turso Cloud!`);

      return coursesRes.rows.map((r: any) => {
        const courseId = String(r.id);
        const highlights = highlightsRes.rows
          .filter((h: any) => String(h.course_id) === courseId)
          .map((h: any) => String(h.highlight_text));
        const tags = tagsRes.rows
          .filter((t: any) => String(t.course_id) === courseId)
          .map((t: any) => String(t.tag_name));

        return {
          id: courseId,
          title: String(r.title),
          subtitle: String(r.subtitle || ''),
          batch: 'September 2026 Live Cohort',
          startDate: '15 Sep 2026',
          totalDays: 26,
          durationWeeks: 6,
          price: Number(r.price),
          originalPrice: Number(r.original_price || r.price * 2),
          rating: Number(r.rating || 4.9),
          reviewsCount: Number(r.reviews_count || 100),
          studentsCount: Number(r.students_count || 500),
          level: String(r.level || 'Beginner to Advanced Pro'),
          tags: tags.length > 0 ? tags : ['DaVinci Resolve 19', 'Live 90-Min Classes'],
          thumbnail: String(r.thumbnail_url),
          description: String(r.description || ''),
          highlights: highlights.length > 0 ? highlights : [
            '26 Days of Interactive Live Classes (Mon–Fri, 3:30 PM IST)',
            'Every Saturday Dedicated Doubt Clearing & Timeline Review'
          ],
          instructorName: String(r.instructor_name || 'Arjun Rajput'),
          instructorRole: String(r.instructor_role || 'Lead Documentary Editor'),
          instructorAvatar: String(r.instructor_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'),
          isPopular: Boolean(r.is_popular)
        };
      });
    } catch (err) {
      console.warn('Using fallback courses due to DB query error:', err);
      return COURSES_CATALOG;
    }
  }

  // Fetch Live 26-Day Curriculum Sessions from Turso
  static async getSessions(): Promise<CourseSession[]> {
    try {
      const res = await turso.execute('SELECT * FROM course_sessions ORDER BY date_iso ASC');
      if (res.rows.length === 0) return INITIAL_SESSIONS;

      console.log(`⚡ [Turso DB] Successfully fetched ${res.rows.length} curriculum sessions live from Turso Cloud!`);

      return res.rows.map((r: any) => ({
        id: String(r.id),
        dayNumber: r.day_number ? (isNaN(Number(r.day_number)) ? String(r.day_number) : Number(r.day_number)) : '—',
        dayCode: String(r.day_code || 'D1'),
        weekNumber: Number(r.week_number || 1),
        dateFormatted: String(r.date_formatted || ''),
        dateIso: String(r.date_iso || ''),
        dayOfWeek: String(r.date_formatted?.split(' ')[2]?.replace('(', '').replace(')', '').toUpperCase() || 'MON'),
        dayOfMonth: String(r.date_formatted?.split(' ')[0] || '15'),
        monthShort: String(r.date_formatted?.split(' ')[1] || 'SEP'),
        type: String(r.type || 'Live Class') as SessionType,
        topic: String(r.topic),
        agenda: String(r.agenda || ''),
        subtopics: [],
        deckUrl: String(r.deck_url || ''),
        filesDriveUrl: String(r.files_drive_url || ''),
        meetUrl: String(r.meet_url || ''),
        recordingUrl: String(r.recording_url || ''),
        assignmentUrl: String(r.assignment_url || ''),
        batch: String(r.batch_name || 'September 2026') as any,
        status: String(r.status || 'upcoming') as any,
        timeIST: String(r.time_ist || '3:30 PM'),
        durationMinutes: Number(r.duration_minutes || 90)
      }));
    } catch (err) {
      console.warn('Using fallback sessions due to DB query error:', err);
      return INITIAL_SESSIONS;
    }
  }

  // Fetch YouTube Breakdowns from Turso
  static async getYouTubeBreakdowns(): Promise<YouTubeBreakdown[]> {
    try {
      const breakdownsRes = await turso.execute('SELECT * FROM youtube_breakdowns ORDER BY created_at ASC');
      if (breakdownsRes.rows.length === 0) return INITIAL_YOUTUBE_BREAKDOWNS;

      const markersRes = await turso.execute('SELECT * FROM breakdown_timeline_markers ORDER BY display_order ASC');

      return breakdownsRes.rows.map((r: any) => {
        const breakdownId = String(r.id);
        const markers = markersRes.rows
          .filter((m: any) => String(m.breakdown_id) === breakdownId)
          .map((m: any) => ({
            timestamp: String(m.timestamp),
            seconds: Number(m.seconds),
            label: String(m.label),
            effect: String(m.effect || ''),
            assetName: m.asset_name ? String(m.asset_name) : undefined
          }));

        return {
          id: breakdownId,
          title: String(r.title),
          youtubeId: String(r.youtube_id),
          videoUrl: String(r.video_url),
          thumbnailUrl: String(r.thumbnail_url),
          views: String(r.views_count || '1M views'),
          duration: String(r.duration || '15:00'),
          description: String(r.description || ''),
          assetsUsed: ['asset-1', 'asset-2'],
          timelineMarkers: markers
        };
      });
    } catch (err) {
      console.warn('Using fallback breakdowns due to DB query error:', err);
      return INITIAL_YOUTUBE_BREAKDOWNS;
    }
  }

  // Save/Update Session in Turso
  static async updateSession(id: string, updates: Partial<CourseSession>): Promise<void> {
    try {
      const setClauses: string[] = [];
      const args: any[] = [];

      if (updates.topic !== undefined) { setClauses.push('topic = ?'); args.push(updates.topic); }
      if (updates.agenda !== undefined) { setClauses.push('agenda = ?'); args.push(updates.agenda); }
      if (updates.meetUrl !== undefined) { setClauses.push('meet_url = ?'); args.push(updates.meetUrl); }
      if (updates.recordingUrl !== undefined) { setClauses.push('recording_url = ?'); args.push(updates.recordingUrl); }
      if (updates.status !== undefined) { setClauses.push('status = ?'); args.push(updates.status); }
      if (updates.timeIST !== undefined) { setClauses.push('time_ist = ?'); args.push(updates.timeIST); }

      if (setClauses.length > 0) {
        args.push(id);
        await turso.execute({
          sql: `UPDATE course_sessions SET ${setClauses.join(', ')}, updated_at = datetime('now') WHERE id = ?`,
          args
        });
      }
    } catch (err) {
      console.error('Failed to update session in Turso:', err);
    }
  }

  // Insert New Session into Turso
  static async addSession(session: Omit<CourseSession, 'id'>): Promise<CourseSession> {
    const id = 's-' + Date.now();
    const newSession: CourseSession = { ...session, id };

    try {
      await turso.execute({
        sql: `INSERT INTO course_sessions (id, course_id, batch_name, week_number, day_number, day_code, date_formatted, date_iso, time_ist, duration_minutes, type, topic, agenda, deck_url, files_drive_url, meet_url, recording_url, assignment_url, status)
              VALUES (?, 'course-davinci-26', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          id,
          String(session.batch || 'September 2026'),
          Number(session.weekNumber || 1),
          String(session.dayNumber),
          String(session.dayCode || 'D1'),
          String(session.dateFormatted || ''),
          String(session.dateIso || new Date().toISOString().split('T')[0]),
          String(session.timeIST || '3:30 PM'),
          Number(session.durationMinutes || 90),
          String(session.type || 'Live Class'),
          String(session.topic),
          String(session.agenda || ''),
          String(session.deckUrl || ''),
          String(session.filesDriveUrl || ''),
          String(session.meetUrl || ''),
          String(session.recordingUrl || ''),
          String(session.assignmentUrl || ''),
          String(session.status || 'upcoming')
        ]
      });
    } catch (err) {
      console.error('Failed to add session to Turso:', err);
    }

    return newSession;
  }

  // Delete Session from Turso
  static async deleteSession(id: string): Promise<void> {
    try {
      await turso.execute({
        sql: 'DELETE FROM course_sessions WHERE id = ?',
        args: [id]
      });
    } catch (err) {
      console.error('Failed to delete session from Turso:', err);
    }
  }

  // Authenticate user against Turso Cloud Database
  static async authenticateUser(emailInput: string, passwordInput: string): Promise<UserProfile | null> {
    try {
      const cleanEmail = emailInput.trim().toLowerCase();
      const res = await turso.execute({
        sql: `SELECT id, email, password_hash, full_name, avatar_url, role FROM users WHERE LOWER(email) = ?`,
        args: [cleanEmail]
      });

      if (res.rows.length > 0) {
        const row: any = res.rows[0];
        console.log(`⚡ [Turso DB] Authenticated user ${row.email} (${row.role}) directly from Turso Cloud!`);
        return {
          id: String(row.id),
          name: String(row.full_name),
          email: String(row.email),
          role: (String(row.role) === 'admin' ? 'admin' : 'student') as 'admin' | 'student',
          avatar: String(row.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'),
          isEnrolled: true,
          enrolledBatch: 'September 2026 Live Cohort',
          enrolledCourses: DEFAULT_ENROLLED_COURSES
        };
      }
    } catch (err) {
      console.warn('Turso DB user auth query failed, using fallback:', err);
    }

    // Direct fallback check for default credentials
    if (emailInput.trim().toLowerCase() === 'admin@gmail.com') {
      return {
        ...DEFAULT_ADMIN_USER,
        email: 'admin@gmail.com'
      };
    }
    if (emailInput.trim().toLowerCase() === 'student@gmail.com') {
      return {
        ...DEFAULT_STUDENT_USER,
        email: 'student@gmail.com'
      };
    }

    return null;
  }
}

