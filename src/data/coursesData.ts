import { Course, EnrolledCourseInfo } from '../types';

export const COURSES_CATALOG: Course[] = [
  {
    id: 'course-davinci-26',
    title: 'DaVinci Resolve 19: High-Retention Masterclass',
    subtitle: 'From zero to advanced documentary & YouTube editing. Cut Page speed, Fairlight audio, Node color grading & Zem TV pacing.',
    batch: 'September 2026 Live Cohort',
    startDate: '15 Sep 2026',
    totalDays: 26,
    durationWeeks: 6,
    price: 249,
    originalPrice: 499,
    rating: 4.98,
    reviewsCount: 384,
    studentsCount: 1420,
    level: 'Beginner to Advanced Pro',
    tags: ['DaVinci Resolve 19', 'Live 90-Min Classes', 'Saturday Doubts', '40GB Vault'],
    thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80',
    description: 'The definitive 26-day live masterclass taught by senior documentary editors. Master the art of retention-focused storytelling, rapid keyboard-only rough cuts, surgical audio noise cancellation, cinematic color contrast, and 3D kinetic typography.',
    highlights: [
      '26 Days of Interactive Live Classes (Mon–Fri, 3:30 PM IST)',
      'Every Saturday Dedicated Doubt Clearing & Timeline Review',
      'Exclusive 40GB+ Sound Packs, Film Grains & .drfx Node Macros',
      'Direct 1-on-1 Feedback on Your Rendered Project Timelines',
      'Freelance Client Acquisition Playbook: Landing ₹2,00,000–₹4,00,000/mo Editing Retainers'
    ],
    instructorName: 'Arjun Rajput',
    instructorRole: 'Lead Documentary Editor & Motion Director',
    instructorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    isPopular: true
  },
  {
    id: 'course-fusion-3d',
    title: 'Fusion 3D & Zem TV Motion Graphics Bootcamp',
    subtitle: 'Master node-based compositing, 3D camera projections, kinetic title callouts, planar tracking, and documentary map animations.',
    batch: 'October 2026 Cohort',
    startDate: '10 Oct 2026',
    totalDays: 14,
    durationWeeks: 3,
    price: 179,
    originalPrice: 349,
    rating: 4.95,
    reviewsCount: 196,
    studentsCount: 890,
    level: 'Intermediate to Advanced',
    tags: ['Fusion Nodes', '3D Motion', 'Planar Tracking', 'Macro Building'],
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
    description: 'Deep-dive into DaVinci Fusion without relying on After Effects. Learn node logic, particle emitters, 3D text shading, planar surface replacement, and creating reusable .drfx motion templates.',
    highlights: [
      '14 High-Density Node Compositing Sessions',
      '3D Camera Tracking & Realistic Map Animations',
      'Zem TV & Vox Style Dynamic Explainer Graphics',
      'Build and Export Your Own Reusable .drfx Macros'
    ],
    instructorName: 'Vikram Mehta',
    instructorRole: 'Senior VFX & Motion Designer',
    instructorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    isPopular: false
  },
  {
    id: 'course-fairlight-audio',
    title: 'Documentary Sound Design & Fairlight Mixing',
    subtitle: 'Craft immersive sonic landscapes. Voice isolation, surgical dynamic EQ, -14 LUFS YouTube mastering, and sub-bass impact risers.',
    batch: 'Rolling Enrollment',
    startDate: 'Instant Access + Weekly Live Q&A',
    totalDays: 10,
    durationWeeks: 2,
    price: 129,
    originalPrice: 249,
    rating: 4.92,
    reviewsCount: 142,
    studentsCount: 650,
    level: 'All Levels',
    tags: ['Fairlight Audio', 'LUFS Loudness', 'Voice EQ', 'SFX Pacing'],
    thumbnail: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80',
    description: 'Audio is 50% of the video experience. Transform thin, muddy phone dialogue into broadcast-grade vocal presence. Master layering Foley, atmospheric drones, and dynamic volume ducking.',
    highlights: [
      '10 Practical Fairlight Page Masterclasses',
      'AI Voice Isolator vs Surgical Parametric EQ Workflows',
      '-14 LUFS Integrated Loudness Standards for YouTube & Streaming',
      'Includes 15GB Royalty-Free Uncompressed 24-bit WAV SFX Library'
    ],
    instructorName: 'Sarah Jenkins',
    instructorRole: 'Audio Engineer & Sound Designer',
    instructorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    isPopular: false
  }
];

export const DEFAULT_ENROLLED_COURSES: EnrolledCourseInfo[] = [
  {
    courseId: 'course-davinci-26',
    courseTitle: 'DaVinci Resolve 19: High-Retention Masterclass',
    batch: 'September 2026 Live Cohort',
    enrolledDate: '10 Sep 2026',
    progressPercent: 68,
    completedDays: 12,
    totalDays: 26,
    nextSessionDay: 'Day 08',
    nextSessionTopic: 'Secondary Color Grading & Shot Matching',
    nextSessionTime: 'Today at 3:30 PM IST',
    meetUrl: 'https://meet.google.com/std-edit-day08',
    status: 'Active',
    thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80',
    instructor: 'Arjun Rajput'
  }
];
