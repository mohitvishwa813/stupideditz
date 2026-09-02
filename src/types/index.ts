export type SessionType = 
  | 'Live Class' 
  | 'Doubt Session' 
  | 'Off' 
  | 'Concept' 
  | 'Kickoff' 
  | 'Demo' 
  | 'TA Pod' 
  | 'Hands-on';

export interface CourseSession {
  id: string;
  dayNumber: number | string; // e.g. 1, 2, 3 or '—'
  dayCode: string; // 'D1', 'D2', 'DOUBT', 'OFF', etc.
  weekNumber: number; // 1 to 6
  dateFormatted: string; // e.g. '15 Sep (Tue)'
  dateIso: string; // '2026-09-15'
  dayOfWeek: string; // 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'
  dayOfMonth: string; // '15', '16', etc.
  monthShort: string; // 'SEP', 'OCT'
  type: SessionType;
  topic: string;
  agenda: string;
  subtopics: string[];
  deckUrl: string;
  filesDriveUrl: string;
  meetUrl: string;
  recordingUrl: string;
  assignmentUrl: string;
  batch: 'September 2026' | 'October 2026' | 'All batches';
  status: 'upcoming' | 'live' | 'completed';
  timeIST: string;
  durationMinutes: number;
}

export type AssetCategory = 
  | 'SFX' 
  | 'LUTs' 
  | 'Fusion Nodes' 
  | 'Motion Graphics' 
  | 'Project Files' 
  | 'Sound Samples'
  | 'Transitions'
  | 'Titles';

export interface VideoAsset {
  id: string;
  title: string;
  category: AssetCategory;
  price: number; // 0 for free
  isFreeSample: boolean;
  fileSize: string;
  format: string; // '.zip', '.drfx', '.cube', '.wav', '.dra'
  downloadUrl: string;
  audioSampleType?: 'whoosh' | 'impact' | 'glitch' | 'riser' | 'click' | 'cinematic' | 'pop';
  thumbnail: string;
  description: string;
  tags: string[];
  downloadsCount: number;
  featuredInVideo?: string;
  usedInTimestamp?: string;
}

export interface YouTubeBreakdown {
  id: string;
  title: string;
  youtubeId: string;
  videoUrl: string;
  thumbnailUrl: string;
  views: string;
  duration: string;
  description: string;
  assetsUsed: string[]; // Asset IDs
  timelineMarkers: {
    timestamp: string;
    seconds: number;
    label: string;
    effect: string;
    assetName?: string;
  }[];
}

export interface BundlePromo {
  badgeText: string;
  title: string;
  description: string;
  currentPrice: number;
  originalPrice: number;
  driveLink: string;
}

export interface StudentSubmission {
  id: string;
  sessionId: string;
  studentName: string;
  studentEmail: string;
  driveLink: string;
  notes: string;
  submittedAt: string;
  status: 'Reviewed' | 'Pending' | 'Needs Revision';
  grade?: string;
}

export interface RegisteredStudent {
  id: string;
  name: string;
  email: string;
  batch: string;
  enrolledAt: string;
  status: 'Active' | 'Completed' | 'Pending';
  completedDays: number;
  avatar: string;
}

export interface MockTestQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  pageContext: 'Media' | 'Cut' | 'Edit' | 'Fusion' | 'Color' | 'Fairlight' | 'Deliver';
}

export interface EnrolledCourseInfo {
  courseId: string;
  courseTitle: string;
  batch: string;
  enrolledDate: string;
  progressPercent: number;
  completedDays: number;
  totalDays: number;
  nextSessionDay: string;
  nextSessionTopic: string;
  nextSessionTime: string;
  meetUrl: string;
  status: 'Active' | 'Completed' | 'Upcoming';
  thumbnail: string;
  instructor: string;
}

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  batch: string;
  startDate: string;
  totalDays: number;
  durationWeeks: number;
  price: number;
  originalPrice: number;
  rating: number;
  reviewsCount: number;
  studentsCount: number;
  level: string;
  tags: string[];
  thumbnail: string;
  description: string;
  highlights: string[];
  instructorName: string;
  instructorRole: string;
  instructorAvatar: string;
  isPopular?: boolean;
}

export interface PaymentOrder {
  id: string;
  amount: number;
  currency: string;
  itemType: string;
  itemId: string;
  status: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'student' | 'admin' | 'guest';
  avatar: string;
  isEnrolled: boolean;
  enrolledBatch?: string;
  enrolledCourses?: EnrolledCourseInfo[];
  purchasedAssets?: string[];
  orderHistory?: PaymentOrder[];
}

export interface HeroShowcaseOption {
  id: string;
  tabName: string;
  title: string;
  imageUrl: string;
  badgeText: string;
  label1: string;
  label2: string;
  label3: string;
  label4?: string;
}
