-- ========================================================
-- Seed Data Insertion Script for Stupid Editz Database
-- ========================================================

-- 1. Insert Initial Users
INSERT OR IGNORE INTO users (id, email, password_hash, full_name, avatar_url, role, status) VALUES
('user-admin-1', 'admin@stupideditz.com', 'scrypt_hashed_password', 'Arjun Rajput (Admin)', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', 'admin', 'active'),
('user-stud-1', 'alex.creator@stupideditz.com', 'scrypt_hashed_password', 'Alex Rivera', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80', 'student', 'active'),
('user-stud-2', 'priya.edits@gmail.com', 'scrypt_hashed_password', 'Priya Sharma', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', 'student', 'active'),
('user-stud-3', 'marcus.visuals@outlook.com', 'scrypt_hashed_password', 'Marcus Chen', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80', 'student', 'active'),
('user-stud-4', 'devon.vance@studio.io', 'scrypt_hashed_password', 'Devon Vance', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', 'student', 'active');

-- Insert User Profiles
INSERT OR IGNORE INTO user_profiles (user_id, phone, bio, youtube_handle, portfolio_url, editing_software_primary) VALUES
('user-admin-1', '+91 9876543210', 'Lead Documentary Editor & Motion Director', '@stupideditz_pro', 'https://stupideditz.com', 'DaVinci Resolve Studio 19'),
('user-stud-1', '+1 555-0192', 'Content Creator & Documentary Enthusiast', '@alexrivera_vlogs', 'https://youtube.com/@alexrivera', 'DaVinci Resolve 19');

-- 2. Insert Courses Catalog
INSERT OR IGNORE INTO courses (id, slug, title, subtitle, level, thumbnail_url, price, original_price, rating, reviews_count, students_count, instructor_name, instructor_role, instructor_avatar, is_popular, is_published) VALUES
('course-davinci-26', 'davinci-resolve-19-masterclass', 'DaVinci Resolve 19: High-Retention Masterclass', 'From zero to advanced documentary & YouTube editing. Cut Page speed, Fairlight audio, Node color grading & Zem TV pacing.', 'Beginner to Advanced Pro', 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80', 249.00, 499.00, 4.98, 384, 1420, 'Arjun Rajput', 'Lead Documentary Editor & Motion Director', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', 1, 1),
('course-fusion-3d', 'fusion-3d-zem-tv-bootcamp', 'Fusion 3D & Zem TV Motion Graphics Bootcamp', 'Master node-based compositing, 3D camera projections, kinetic title callouts, planar tracking, and documentary map animations.', 'Intermediate to Advanced', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80', 179.00, 349.00, 4.95, 196, 890, 'Vikram Mehta', 'Senior VFX & Motion Designer', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', 0, 1),
('course-fairlight-audio', 'fairlight-sound-design-mastery', 'Documentary Sound Design & Fairlight Mixing', 'Craft immersive sonic landscapes. Voice isolation, surgical dynamic EQ, -14 LUFS YouTube mastering, and sub-bass impact risers.', 'All Levels', 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80', 129.00, 249.00, 4.92, 142, 650, 'Sarah Jenkins', 'Audio Engineer & Sound Designer', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', 0, 1);

-- Insert Course Highlights
INSERT OR IGNORE INTO course_highlights (course_id, highlight_text, display_order) VALUES
('course-davinci-26', '26 Days of Interactive Live Classes (Mon–Fri, 3:30 PM IST)', 1),
('course-davinci-26', 'Every Saturday Dedicated Doubt Clearing & Timeline Review', 2),
('course-davinci-26', 'Direct 1-on-1 Feedback on Your Rendered Project Timelines', 3),
('course-davinci-26', 'Freelance Client Acquisition Playbook: Landing ₹2,00,000–₹4,00,000/mo Editing Retainers', 4),
('course-fusion-3d', '14 High-Density Node Compositing Sessions', 1),
('course-fusion-3d', '3D Camera Tracking & Realistic Map Animations', 2),
('course-fusion-3d', 'Zem TV & Vox Style Dynamic Explainer Graphics', 3),
('course-fairlight-audio', '10 Practical Fairlight Page Masterclasses', 1),
('course-fairlight-audio', 'AI Voice Isolator vs Surgical Parametric EQ Workflows', 2),
('course-fairlight-audio', '-14 LUFS Integrated Loudness Standards for YouTube & Streaming', 3);

-- Insert Course Tags
INSERT OR IGNORE INTO course_tags (course_id, tag_name) VALUES
('course-davinci-26', 'DaVinci Resolve 19'), ('course-davinci-26', 'Live 90-Min Classes'), ('course-davinci-26', 'Documentary Editing'),
('course-fusion-3d', 'Fusion Nodes'), ('course-fusion-3d', '3D Motion'), ('course-fusion-3d', 'Planar Tracking'),
('course-fairlight-audio', 'Fairlight Audio'), ('course-fairlight-audio', 'LUFS Loudness'), ('course-fairlight-audio', 'Voice EQ');

-- 3. Insert Cohort Batches
INSERT OR IGNORE INTO batches (id, course_id, name, start_date, end_date, max_seats, status) VALUES
('batch-sep-2026', 'course-davinci-26', 'September 2026 Live Cohort', '2026-09-15', '2026-10-20', 100, 'ongoing'),
('batch-oct-2026', 'course-fusion-3d', 'October 2026 Cohort', '2026-10-10', '2026-10-28', 75, 'upcoming');

-- 4. Insert Student Enrollments
INSERT OR IGNORE INTO enrollments (id, user_id, course_id, batch_id, progress_percent, completed_days, status, enrolled_at, payment_reference) VALUES
('enroll-1', 'user-stud-1', 'course-davinci-26', 'batch-sep-2026', 68, 12, 'active', '2026-09-10 10:00:00', 'PAY_REF_98124'),
('enroll-2', 'user-stud-2', 'course-davinci-26', 'batch-sep-2026', 38, 10, 'active', '2026-08-18 14:20:00', 'PAY_REF_98125'),
('enroll-3', 'user-stud-3', 'course-davinci-26', 'batch-sep-2026', 35, 9, 'active', '2026-08-20 16:45:00', 'PAY_REF_98126'),
('enroll-4', 'user-stud-4', 'course-davinci-26', 'batch-sep-2026', 30, 8, 'active', '2026-08-22 11:30:00', 'PAY_REF_98127');

-- 5. Insert Sample Curriculum Sessions
INSERT OR IGNORE INTO course_sessions (id, course_id, batch_name, week_number, day_number, day_code, date_formatted, date_iso, time_ist, duration_minutes, type, topic, agenda, deck_url, files_drive_url, meet_url, recording_url, assignment_url, status) VALUES
('s-1', 'course-davinci-26', 'September 2026', 1, '1', 'D1', '15 Sep (Tue)', '2026-09-15', '3:30 PM IST', 90, 'Live Class', 'DaVinci Resolve Installation + Interface Overview', 'System Requirements + Installation + Full 7-Page Interface Tour & Project Settings', 'https://docs.google.com/presentation/d/stupideditz-day01-intro/edit', 'https://drive.google.com/drive/folders/stupideditz-batch1-day01-assets', 'https://meet.google.com/std-edit-day01', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://forms.gle/stupideditz-asgn-d1', 'completed'),
('s-2', 'course-davinci-26', 'September 2026', 1, '2', 'D2', '16 Sep (Wed)', '2026-09-16', '3:30 PM IST', 90, 'Live Class', 'Importing & Organizing Media + Cut Page Basics', 'Mastering Media Pool Smart Bins + Rapid Cut Page Trimming', 'https://docs.google.com/presentation/d/stupideditz-day02-cutpage/edit', 'https://drive.google.com/drive/folders/stupideditz-batch1-day02-assets', 'https://meet.google.com/std-edit-day02', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://forms.gle/stupideditz-asgn-d2', 'completed'),
('s-3', 'course-davinci-26', 'September 2026', 1, '3', 'D3', '17 Sep (Thu)', '2026-09-17', '3:30 PM IST', 90, 'Live Class', 'Cut Page Full Editing + Keyboard Shortcuts', 'Source Overwrite, Dynamic Trimming & Keyboard-Only Speed Editing', 'https://docs.google.com/presentation/d/stupideditz-day03-shortcuts/edit', 'https://drive.google.com/drive/folders/stupideditz-batch1-day03-assets', 'https://meet.google.com/std-edit-day03', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://forms.gle/stupideditz-asgn-d3', 'completed'),
('s-4', 'course-davinci-26', 'September 2026', 1, '4', 'D4', '18 Sep (Fri)', '2026-09-18', '3:30 PM IST', 90, 'Live Class', 'Edit Page Full Editing + Keyboard Shortcuts (Part 1)', 'Timeline Mastery: Trim, Ripple, Roll, Slip & Slide Explained', 'https://docs.google.com/presentation/d/stupideditz-day04-editpage1/edit', 'https://drive.google.com/drive/folders/stupideditz-batch1-day04-assets', 'https://meet.google.com/std-edit-day04', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://forms.gle/stupideditz-asgn-d4', 'completed'),
('s-5', 'course-davinci-26', 'September 2026', 2, '5', 'D5', '21 Sep (Mon)', '2026-09-21', '3:30 PM IST', 90, 'Live Class', 'Edit Page Advanced Tools + Keyboard Shortcuts (Part 2)', 'Compound Clips, Nested Timelines & Retime Controls Speed Mastery', 'https://docs.google.com/presentation/d/stupideditz-day05-edit2/edit', 'https://drive.google.com/drive/folders/stupideditz-batch1-day05-assets', 'https://meet.google.com/std-edit-day05', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://forms.gle/stupideditz-asgn-d5', 'completed'),
('s-6', 'course-davinci-26', 'September 2026', 2, '6', 'D6', '22 Sep (Tue)', '2026-09-22', '3:30 PM IST', 90, 'Live Class', 'Audio Editing Basics — Fairlight Page', 'Fairlight Audio Mixing, Noise Reduction, EQ & Auto-Sync', 'https://docs.google.com/presentation/d/stupideditz-day06-fairlight/edit', 'https://drive.google.com/drive/folders/stupideditz-batch1-day06-assets', 'https://meet.google.com/std-edit-day06', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://forms.gle/stupideditz-asgn-d6', 'completed'),
('s-7', 'course-davinci-26', 'September 2026', 2, '7', 'D7', '23 Sep (Wed)', '2026-09-23', '3:30 PM IST', 90, 'Live Class', 'Color Grading — Day 1: Primary Wheels & Basics', 'Lift/Gamma/Gain Wheels, Scopes & The Orange-Teal Theory', 'https://docs.google.com/presentation/d/stupideditz-day07-color1/edit', 'https://drive.google.com/drive/folders/stupideditz-batch1-day07-assets', 'https://meet.google.com/std-edit-day07', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://forms.gle/stupideditz-asgn-d7', 'completed'),
('s-8', 'course-davinci-26', 'September 2026', 2, '8', 'D8', '24 Sep (Thu)', '2026-09-24', '3:30 PM IST', 90, 'Live Class', 'Color Grading — Day 2: Color Matching & Practical Grading', 'Shot-to-Shot Matching, Custom LUTs & Practical YouTube Look', 'https://docs.google.com/presentation/d/stupideditz-day08-color2/edit', 'https://drive.google.com/drive/folders/stupideditz-batch1-day08-assets', 'https://meet.google.com/std-edit-day08', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://forms.gle/stupideditz-asgn-d8', 'completed');

-- 6. Insert YouTube Breakdowns & Timeline Markers
INSERT OR IGNORE INTO youtube_breakdowns (id, title, youtube_id, video_url, thumbnail_url, views_count, duration, description) VALUES
('yt-1', 'How I Edited a 1M+ View Video in DaVinci Resolve (Full Breakdown)', 'L_LUpnjgPso', 'https://www.youtube.com/embed/L_LUpnjgPso', 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80', '1.2M views', '18:42', 'Step-by-step breakdown of pacing, sound design layers, and Fusion node masking used in our most viral YouTube edit.'),
('yt-2', 'Zem TV Style Motion Graphics in Fusion: 0 to Pro', 'e-ORhEE9VVg', 'https://www.youtube.com/embed/e-ORhEE9VVg', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80', '640K views', '22:15', 'Recreating trending documentary animations, tracked callouts, and paper tear effects without After Effects.');

INSERT OR IGNORE INTO breakdown_timeline_markers (id, breakdown_id, timestamp, seconds, label, effect, display_order) VALUES
('mark-1', 'yt-1', '01:15', 75, 'The 3-Second Hook Cut', 'Cut Page Ripple Trim + Whoosh SFX', 1),
('mark-2', 'yt-1', '04:15', 255, 'Most Premium Motion Assets', 'Fusion Displace & Glow Macro', 2),
('mark-3', 'yt-1', '08:30', 510, 'Color Separation with Scopes', 'Lift/Gamma/Gain Balance', 3),
('mark-4', 'yt-2', '02:10', 130, 'Node Graph Foundation', 'MediaIn -> Transform -> Merge Flow', 1),
('mark-5', 'yt-2', '07:45', 465, 'Planar Tracking a Map Screen', 'Corner Pin & Planar Tracker', 2);

-- 7. Insert Site CMS Settings (Full Admin Editable Content)
INSERT OR IGNORE INTO site_settings (key, value_json, "group", description, updated_by) VALUES
('hero_headline', '"Master DaVinci Resolve 19 & High-Retention Video Editing"', 'hero', 'Main headline text on homepage hero section', 'user-admin-1'),
('hero_subheadline', '"Learn retention-focused documentary storytelling, Zem TV motion graphics, surgical Fairlight audio, and node color grading in 26 live days."', 'hero', 'Subheadline text on homepage hero section', 'user-admin-1'),
('banner_announcement', '{"text": "🚀 September 2026 Batch Enrolling — Only 14 Seats Remaining!", "link": "#courses-section", "isActive": true}', 'branding', 'Top floating announcement bar banner', 'user-admin-1'),
('contact_support_email', '"support@stupideditz.com"', 'footer', 'Support email address displayed in footer', 'user-admin-1');

-- 8. Insert Dashboard Widgets
INSERT OR IGNORE INTO dashboard_widgets (id, title, widget_type, is_visible, target_role, config_json, display_order) VALUES
('widget_live_class_banner', 'Upcoming Live Session Banner', 'banner', 1, 'student', '{"bgColor": "#1e293b", "showJoinButton": true}', 1),
('widget_syllabus_tracker', '26-Day Progress Bar', 'stats_card', 1, 'student', '{"showPercent": true}', 2),
('widget_admin_session_manager', 'Live Session & Curriculum Controller', 'shortcut_grid', 1, 'admin', '{"canEditAgenda": true}', 1);
