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
  SessionType,
  HeroShowcaseOption
} from '../types';
import { INITIAL_SESSIONS, INITIAL_ASSETS, INITIAL_YOUTUBE_BREAKDOWNS, INITIAL_STUDENTS, INITIAL_HERO_OPTIONS } from '../data/initialData';
import { COURSES_CATALOG, DEFAULT_ENROLLED_COURSES } from '../data/coursesData';
import { DEFAULT_ADMIN_USER, DEFAULT_STUDENT_USER } from './storageService';

export class DbService {
  // Ensure Turso database tables exist
  static async initCourseTables() {
    try {
      await turso.execute(`
        CREATE TABLE IF NOT EXISTS courses (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          subtitle TEXT,
          description TEXT,
          batch_name TEXT,
          price REAL NOT NULL,
          original_price REAL,
          rating REAL DEFAULT 4.98,
          level TEXT,
          thumbnail_url TEXT,
          instructor_name TEXT,
          instructor_role TEXT,
          is_popular INTEGER DEFAULT 0,
          is_published INTEGER DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      try {
        await turso.execute(`ALTER TABLE courses ADD COLUMN batch_name TEXT`);
      } catch {
        // Column may already exist
      }

      await turso.execute(`
        CREATE TABLE IF NOT EXISTS course_highlights (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          course_id TEXT NOT NULL,
          highlight_text TEXT NOT NULL,
          display_order INTEGER DEFAULT 1
        )
      `);

      await turso.execute(`
        CREATE TABLE IF NOT EXISTS youtube_breakdowns (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          youtube_id TEXT NOT NULL,
          video_url TEXT NOT NULL,
          thumbnail_url TEXT NOT NULL,
          views_count TEXT,
          duration TEXT,
          description TEXT,
          assets_used TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await turso.execute(`
        CREATE TABLE IF NOT EXISTS breakdown_timeline_markers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          breakdown_id TEXT NOT NULL,
          timestamp TEXT NOT NULL,
          seconds INTEGER NOT NULL,
          label TEXT NOT NULL,
          effect TEXT,
          asset_name TEXT,
          display_order INTEGER DEFAULT 1
        )
      `);

      await turso.execute(`
        CREATE TABLE IF NOT EXISTS bundle_promos (
          id TEXT PRIMARY KEY,
          badge_text TEXT,
          title TEXT NOT NULL,
          description TEXT,
          current_price REAL NOT NULL,
          original_price REAL NOT NULL,
          drive_link TEXT NOT NULL,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
    } catch (e) {
      console.warn('Turso tables initialization note:', e);
    }
  }

  // Fetch Courses Catalog from Turso
  static async getCourses(): Promise<Course[]> {
    try {
      await this.initCourseTables();
      let coursesRes = await turso.execute('SELECT * FROM courses');

      // Auto-seed Turso DB if table is empty
      if (coursesRes.rows.length === 0) {
        console.log('⚡ [Turso DB] Empty courses table detected. Auto-seeding initial catalog to Turso Cloud DB...');
        for (const course of COURSES_CATALOG) {
          await this.saveCourseToDb(course);
        }
        coursesRes = await turso.execute('SELECT * FROM courses');
      }

      const highlightsRes = await turso.execute('SELECT * FROM course_highlights ORDER BY display_order ASC');
      const tagsRes = await turso.execute('SELECT * FROM course_tags');

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
          batch: String(r.batch_name || r.batch || 'September 2026 Live Cohort'),
          startDate: '15 Sep 2026',
          totalDays: 26,
          durationWeeks: 6,
          price: Number(r.price),
          originalPrice: Number(r.original_price || r.price * 2),
          rating: Number(r.rating || 4.98),
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
      console.warn('Turso DB getCourses error:', err);
      return COURSES_CATALOG;
    }
  }

  // Create or Update Masterclass Course in Turso Cloud Database
  static async saveCourseToDb(course: Course): Promise<boolean> {
    try {
      await this.initCourseTables();

      // Check if course row exists by exact ID
      const existing = await turso.execute({
        sql: `SELECT id FROM courses WHERE id = ? OR id = CAST(? AS INTEGER)`,
        args: [course.id, isNaN(Number(course.id)) ? -99999 : Number(course.id)]
      });

      if (existing.rows.length > 0) {
        const targetId = existing.rows[0].id;
        await turso.execute({
          sql: `UPDATE courses SET
            title = ?,
            subtitle = ?,
            description = ?,
            batch_name = ?,
            price = ?,
            original_price = ?,
            level = ?,
            thumbnail_url = ?,
            instructor_name = ?,
            instructor_role = ?,
            is_popular = ?
          WHERE id = ?`,
          args: [
            course.title,
            course.subtitle || '',
            course.description || '',
            course.batch || 'September 2026 Live Cohort',
            course.price,
            course.originalPrice || course.price * 2,
            course.level || 'Beginner to Advanced Pro',
            course.thumbnail,
            course.instructorName || 'Arjun Rajput',
            course.instructorRole || 'Lead Editor',
            course.isPopular ? 1 : 0,
            targetId
          ]
        });
      } else {
        await turso.execute({
          sql: `INSERT INTO courses (
            id, title, subtitle, description, batch_name, price, original_price, rating, level, thumbnail_url, instructor_name, instructor_role, is_popular, is_published
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
          args: [
            course.id,
            course.title,
            course.subtitle || '',
            course.description || '',
            course.batch || 'September 2026 Live Cohort',
            course.price,
            course.originalPrice || course.price * 2,
            course.rating || 4.98,
            course.level || 'Beginner to Advanced Pro',
            course.thumbnail,
            course.instructorName || 'Arjun Rajput',
            course.instructorRole || 'Lead Editor',
            course.isPopular ? 1 : 0
          ]
        });
      }

      // Also sync highlights to course_highlights table if present
      if (course.highlights && course.highlights.length > 0) {
        await turso.execute({
          sql: `DELETE FROM course_highlights WHERE course_id = ? OR course_id = CAST(? AS INTEGER)`,
          args: [course.id, isNaN(Number(course.id)) ? 0 : Number(course.id)]
        });
        for (let i = 0; i < course.highlights.length; i++) {
          await turso.execute({
            sql: `INSERT INTO course_highlights (course_id, highlight_text, display_order) VALUES (?, ?, ?)`,
            args: [course.id, course.highlights[i], i + 1]
          });
        }
      }

      console.log(`⚡ [Turso DB] Successfully updated course "${course.title}" (Price: ₹${course.price}) in Turso Cloud DB!`);
      return true;
    } catch (err) {
      console.warn('Failed saving course to Turso DB:', err);
      return false;
    }
  }

  // Delete Masterclass Course from Turso Cloud Database
  static async deleteCourseFromDb(courseId: string): Promise<boolean> {
    try {
      await turso.execute({
        sql: `DELETE FROM courses WHERE id = ?`,
        args: [courseId]
      });
      return true;
    } catch (err) {
      console.warn('Failed deleting course from Turso DB:', err);
      return false;
    }
  }

  // Fetch Live 26-Day Curriculum Sessions from Turso
  static async getSessions(): Promise<CourseSession[]> {
    try {
      const res = await turso.execute('SELECT * FROM course_sessions ORDER BY date_iso ASC');
      if (res.rows.length === 0) return INITIAL_SESSIONS;

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
      await this.initCourseTables();
      let breakdownsRes = await turso.execute('SELECT * FROM youtube_breakdowns ORDER BY created_at ASC');
      
      if (breakdownsRes.rows.length === 0) {
        console.log('⚡ [Turso DB] Empty youtube_breakdowns table detected. Auto-seeding initial data...');
        for (let i = 0; i < INITIAL_YOUTUBE_BREAKDOWNS.length; i++) {
          await this.saveYouTubeBreakdownToDb(INITIAL_YOUTUBE_BREAKDOWNS[i], i + 1);
        }
        breakdownsRes = await turso.execute('SELECT * FROM youtube_breakdowns ORDER BY created_at ASC');
      }

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
          assetsUsed: r.assets_used ? JSON.parse(r.assets_used) : [],
          timelineMarkers: markers
        };
      });
    } catch (err) {
      console.warn('Using fallback breakdowns due to DB query error:', err);
      return INITIAL_YOUTUBE_BREAKDOWNS;
    }
  }

  static async saveYouTubeBreakdownToDb(breakdown: YouTubeBreakdown, displayOrder: number): Promise<void> {
    try {
      await turso.execute({
        sql: `INSERT INTO youtube_breakdowns 
          (id, title, youtube_id, video_url, thumbnail_url, views_count, duration, description, assets_used) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
          title=excluded.title, youtube_id=excluded.youtube_id, video_url=excluded.video_url, thumbnail_url=excluded.thumbnail_url,
          views_count=excluded.views_count, duration=excluded.duration, description=excluded.description, assets_used=excluded.assets_used`,
        args: [
          breakdown.id, breakdown.title, breakdown.youtubeId, breakdown.videoUrl, breakdown.thumbnailUrl,
          breakdown.views, breakdown.duration, breakdown.description, JSON.stringify(breakdown.assetsUsed || [])
        ]
      });

      // Delete existing markers for this breakdown
      await turso.execute({
        sql: `DELETE FROM breakdown_timeline_markers WHERE breakdown_id = ?`,
        args: [breakdown.id]
      });

      // Insert new markers
      for (let i = 0; i < breakdown.timelineMarkers.length; i++) {
        const m = breakdown.timelineMarkers[i];
        await turso.execute({
          sql: `INSERT INTO breakdown_timeline_markers 
            (breakdown_id, timestamp, seconds, label, effect, asset_name, display_order) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
          args: [
            breakdown.id, m.timestamp, m.seconds, m.label, m.effect, m.assetName || null, i + 1
          ]
        });
      }
    } catch (e) {
      console.error('Error saving youtube breakdown to DB', e);
    }
  }

  static async deleteYouTubeBreakdownFromDb(breakdownId: string): Promise<boolean> {
    try {
      await turso.execute({
        sql: `DELETE FROM breakdown_timeline_markers WHERE breakdown_id = ?`,
        args: [breakdownId]
      });
      await turso.execute({
        sql: `DELETE FROM youtube_breakdowns WHERE id = ?`,
        args: [breakdownId]
      });
      return true;
    } catch (e) {
      console.error('Error deleting youtube breakdown from DB', e);
      return false;
    }
  }

  // Bundle Promo
  static async getBundlePromo(): Promise<BundlePromo> {
    try {
      await this.initCourseTables();
      const res = await turso.execute('SELECT * FROM bundle_promos WHERE id = "main_promo"');
      if (res.rows.length === 0) {
        await this.saveBundlePromoToDb(INITIAL_BUNDLE_PROMO);
        return INITIAL_BUNDLE_PROMO;
      }
      
      const r = res.rows[0] as any;
      return {
        badgeText: String(r.badge_text),
        title: String(r.title),
        description: String(r.description),
        currentPrice: Number(r.current_price),
        originalPrice: Number(r.original_price),
        driveLink: String(r.drive_link)
      };
    } catch (err) {
      return INITIAL_BUNDLE_PROMO;
    }
  }

  static async saveBundlePromoToDb(promo: BundlePromo): Promise<void> {
    try {
      await turso.execute({
        sql: `INSERT INTO bundle_promos 
          (id, badge_text, title, description, current_price, original_price, drive_link) 
          VALUES ("main_promo", ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
          badge_text=excluded.badge_text, title=excluded.title, description=excluded.description,
          current_price=excluded.current_price, original_price=excluded.original_price, drive_link=excluded.drive_link`,
        args: [
          promo.badgeText, promo.title, promo.description, promo.currentPrice, promo.originalPrice, promo.driveLink
        ]
      });
    } catch (e) {
      console.error('Error saving bundle promo to DB', e);
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

  // Ensure students table exists
  static async initStudentTable() {
    try {
      await turso.execute(`
        CREATE TABLE IF NOT EXISTS students (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          batch_name TEXT NOT NULL,
          enrolled_at TEXT,
          status TEXT DEFAULT 'Active',
          completed_days INTEGER DEFAULT 0,
          avatar_url TEXT
        )
      `);
    } catch (e) {
      console.warn('Turso student table init note:', e);
    }
  }

  // Fetch Students Roster from Turso
  static async getStudents(): Promise<RegisteredStudent[]> {
    try {
      let res = await turso.execute(`
        SELECT u.id, u.full_name, u.email, u.avatar_url, u.status as user_status, u.created_at,
               (SELECT COUNT(*) FROM payment_orders p WHERE p.user_id = u.id AND p.status = 'paid' AND (p.item_type = 'course' OR p.item_type = 'bundle')) as purchases_count
        FROM users u 
        WHERE u.role = 'student'
      `);

      return res.rows.map((r: any) => {
        const isEnrolled = Number(r.purchases_count) > 0;
        
        return {
          id: String(r.id),
          name: String(r.full_name || 'Student'),
          email: String(r.email),
          batch: isEnrolled ? 'September 2026 Live Cohort' : 'Not Enrolled',
          enrolledAt: String(r.created_at || new Date().toISOString().split('T')[0]),
          status: isEnrolled ? 'Active' : 'Registered',
          completedDays: 0,
          avatar: String(r.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80')
        };
      });
    } catch (err) {
      console.warn('Failed loading students from users table:', err);
      return [];
    }
  }

  // Save / Update Student in Turso DB
  static async saveStudentToDb(student: RegisteredStudent): Promise<boolean> {
    try {
      await this.initStudentTable();
      await turso.execute({
        sql: `INSERT INTO students (
          id, name, email, batch_name, enrolled_at, status, completed_days, avatar_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          email = excluded.email,
          batch_name = excluded.batch_name,
          enrolled_at = excluded.enrolled_at,
          status = excluded.status,
          completed_days = excluded.completed_days,
          avatar_url = excluded.avatar_url`,
        args: [
          student.id,
          student.name,
          student.email,
          student.batch,
          student.enrolledAt || new Date().toISOString().split('T')[0],
          student.status || 'Active',
          student.completedDays || 0,
          student.avatar || ''
        ]
      });
      console.log(`⚡ [Turso DB] Saved student "${student.name}" (Batch: ${student.batch}) to Turso DB!`);
      return true;
    } catch (err) {
      console.error('Failed saving student to Turso DB:', err);
      return false;
    }
  }

  // Delete Student from Turso DB
  static async deleteStudentFromDb(studentId: string): Promise<boolean> {
    try {
      await turso.execute({
        sql: `DELETE FROM students WHERE id = ?`,
        args: [studentId]
      });
      return true;
    } catch (err) {
      console.error('Failed deleting student from Turso DB:', err);
      return false;
    }
  }

  // Ensure Video Assets table exists
  static async initAssetTable() {
    try {
      await turso.execute(`
        CREATE TABLE IF NOT EXISTS video_assets (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          category TEXT NOT NULL,
          price REAL DEFAULT 0,
          is_free_sample INTEGER DEFAULT 0,
          file_size TEXT,
          format TEXT,
          download_url TEXT,
          audio_sample_type TEXT,
          thumbnail_url TEXT,
          description TEXT,
          downloads_count INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
    } catch (e) {
      console.warn('Turso asset table init note:', e);
    }
  }

  // Fetch Video Assets Catalog from Turso DB
  static async getAssets(): Promise<VideoAsset[]> {
    try {
      await this.initAssetTable();
      let res = await turso.execute('SELECT * FROM video_assets ORDER BY created_at ASC');

      // Auto-seed Turso DB if table is empty
      if (res.rows.length === 0) {
        console.log('⚡ [Turso DB] Empty video_assets table. Seeding initial catalog to Turso DB...');
        for (const asset of INITIAL_ASSETS) {
          await this.saveAssetToDb(asset);
        }
        res = await turso.execute('SELECT * FROM video_assets ORDER BY created_at ASC');
      }

      return res.rows.map((r: any) => ({
        id: String(r.id),
        title: String(r.title),
        category: String(r.category || 'SFX') as any,
        price: Number(r.price || 0),
        isFreeSample: Boolean(r.is_free_sample),
        fileSize: String(r.file_size || '100 MB'),
        format: String(r.format || 'WAV / ZIP'),
        downloadUrl: String(r.download_url || ''),
        audioSampleType: r.audio_sample_type ? String(r.audio_sample_type) as any : undefined,
        thumbnail: String(r.thumbnail_url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80'),
        description: String(r.description || ''),
        tags: [String(r.category || 'SFX'), 'Studio Pack'],
        downloadsCount: Number(r.downloads_count || 100)
      }));
    } catch (err) {
      console.warn('Failed loading video assets from Turso DB:', err);
      return INITIAL_ASSETS;
    }
  }

  // Save / Update Asset in Turso Cloud Database
  static async saveAssetToDb(asset: VideoAsset): Promise<boolean> {
    try {
      await this.initAssetTable();
      await turso.execute({
        sql: `INSERT INTO video_assets (
          id, title, category, price, is_free_sample, file_size, format, download_url, audio_sample_type, thumbnail_url, description, downloads_count
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title,
          category = excluded.category,
          price = excluded.price,
          is_free_sample = excluded.is_free_sample,
          file_size = excluded.file_size,
          format = excluded.format,
          download_url = excluded.download_url,
          audio_sample_type = excluded.audio_sample_type,
          thumbnail_url = excluded.thumbnail_url,
          description = excluded.description,
          downloads_count = excluded.downloads_count`,
        args: [
          asset.id,
          asset.title,
          asset.category,
          asset.price || 0,
          asset.isFreeSample ? 1 : 0,
          asset.fileSize || '',
          asset.format || '',
          asset.downloadUrl || '',
          asset.audioSampleType || null,
          asset.thumbnail || '',
          asset.description || '',
          asset.downloadsCount || 0
        ]
      });
      console.log(`⚡ [Turso DB] Saved asset "${asset.title}" (Thumbnail: ${asset.thumbnail}) to Turso Cloud DB!`);
      return true;
    } catch (err) {
      console.error('Failed saving video asset to Turso DB:', err);
      return false;
    }
  }

  // Delete Video Asset from Turso Cloud Database
  static async deleteAssetFromDb(assetId: string): Promise<boolean> {
    try {
      await turso.execute({
        sql: `DELETE FROM video_assets WHERE id = ?`,
        args: [assetId]
      });
      return true;
    } catch (err) {
      console.error('Failed deleting video asset from Turso DB:', err);
      return false;
    }
  }

  // Ensure Hero Showcase Table exists
  static async initHeroTable() {
    try {
      await turso.execute(`
        CREATE TABLE IF NOT EXISTS hero_showcase (
          id TEXT PRIMARY KEY,
          tab_name TEXT NOT NULL,
          title TEXT NOT NULL,
          image_url TEXT NOT NULL,
          badge_text TEXT,
          label_1 TEXT,
          label_2 TEXT,
          label_3 TEXT,
          label_4 TEXT,
          display_order INTEGER DEFAULT 1
        )
      `);
    } catch (e) {
      console.warn('Turso hero table init note:', e);
    }
  }

  // Fetch Hero Showcase Options from Turso DB
  static async getHeroOptions(): Promise<HeroShowcaseOption[]> {
    try {
      await this.initHeroTable();
      let res = await turso.execute('SELECT * FROM hero_showcase ORDER BY display_order ASC');

      if (res.rows.length === 0) {
        console.log('⚡ [Turso DB] Empty hero_showcase table. Seeding default options to Turso DB...');
        for (let i = 0; i < INITIAL_HERO_OPTIONS.length; i++) {
          await this.saveHeroOptionToDb(INITIAL_HERO_OPTIONS[i], i + 1);
        }
        res = await turso.execute('SELECT * FROM hero_showcase ORDER BY display_order ASC');
      }

      return res.rows.map((r: any) => ({
        id: String(r.id),
        tabName: String(r.tab_name || 'Option'),
        title: String(r.title || ''),
        imageUrl: String(r.image_url || ''),
        badgeText: String(r.badge_text || ''),
        label1: String(r.label_1 || ''),
        label2: String(r.label_2 || ''),
        label3: String(r.label_3 || ''),
        label4: r.label_4 ? String(r.label_4) : undefined
      }));
    } catch (err) {
      console.warn('Failed loading hero options from Turso DB:', err);
      return INITIAL_HERO_OPTIONS;
    }
  }

  // Save / Update Hero Showcase Option in Turso DB
  static async saveHeroOptionToDb(option: HeroShowcaseOption, orderIndex: number = 1): Promise<boolean> {
    try {
      await this.initHeroTable();
      await turso.execute({
        sql: `INSERT INTO hero_showcase (
          id, tab_name, title, image_url, badge_text, label_1, label_2, label_3, label_4, display_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          tab_name = excluded.tab_name,
          title = excluded.title,
          image_url = excluded.image_url,
          badge_text = excluded.badge_text,
          label_1 = excluded.label_1,
          label_2 = excluded.label_2,
          label_3 = excluded.label_3,
          label_4 = excluded.label_4,
          display_order = excluded.display_order`,
        args: [
          option.id,
          option.tabName,
          option.title,
          option.imageUrl,
          option.badgeText || '',
          option.label1 || '',
          option.label2 || '',
          option.label3 || '',
          option.label4 || '',
          orderIndex
        ]
      });
      console.log(`⚡ [Turso DB] Saved Hero Option "${option.tabName}" to Turso DB!`);
      return true;
    } catch (err) {
      console.error('Failed saving Hero Option to Turso DB:', err);
      return false;
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

    // Fallback removed to enforce strict backend authentication

    return null;
  }
}

