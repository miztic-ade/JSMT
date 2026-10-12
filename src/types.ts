export type UserRole =
  | 'super_admin'
  | 'school_admin'
  | 'lecturer'
  | 'student'
  | 'finance_officer'
  | 'registrar';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  avatarStoragePath?: string;
  phone: string;
  status: 'active' | 'suspended';
  department?: string;
  joinedDate: string;
  staffId?: string;
  studentId?: string;
}

export interface StudentProfile {
  id: string;
  userId: string;
  fullName: string;
  studentId: string; // e.g. JSMT/2026/SWE/029
  email: string;
  phone: string;
  programmeId: string;
  programmeName: string;
  department: string;
  level: string; // 'Year 1 (Certificate)' | 'Year 2 (Diploma)' | 'Professional Masterclass'
  admissionDate: string;
  gender: 'Female' | 'Male';
  dateOfBirth: string;
  address: string;
  guardianName: string;
  guardianPhone: string;
  avatarUrl: string;
  avatarStoragePath?: string;
  currentGPA: number;
  totalCreditsEarned: number;
}

export interface LecturerProfile {
  id: string;
  userId: string;
  fullName: string;
  staffId: string; // e.g. JSMT/STF/008
  email: string;
  phone: string;
  department: string;
  designation: string; // 'Senior Lecturer' | 'Lead Instructor' | 'Head of Tech'
  qualification: string;
  assignedCourseIds: string[];
  avatarUrl?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  headOfDepartment: string;
  description: string;
  programmesCount: number;
}

export interface Programme {
  id: string;
  name: string;
  code: string;
  departmentId: string;
  departmentName: string;
  duration: string;
  award: string; // 'National Diploma (ND)' | 'Higher Diploma' | 'Professional Certification'
  tuitionPerTerm: number;
  totalCredits: number;
  description: string;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  programmeId: string;
  programmeName: string;
  credits: number;
  lecturerId: string;
  lecturerName: string;
  semester: string;
  scheduleDay: string;
  scheduleTime: string;
  venue: string;
  syllabus: string;
  enrolledStudentsCount: number;
}

export interface AttendanceRecordItem {
  studentId: string;
  studentName: string;
  matricNumber: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
}

export interface AttendanceSession {
  id: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  date: string;
  sessionTitle: string;
  lecturerName: string;
  records: AttendanceRecordItem[];
}

export interface LearningMaterial {
  id: string;
  courseId: string;
  courseCode: string;
  title: string;
  type: 'pdf' | 'slides' | 'notes' | 'code' | 'video';
  fileSize: string;
  uploadedBy: string;
  uploadDate: string;
  description: string;
  downloadUrl: string;
  storagePath?: string;
}

export interface AssignmentSubmission {
  id: string;
  studentId: string;
  studentName: string;
  matricNumber: string;
  submittedAt: string;
  content: string;
  attachmentName?: string;
  attachmentUrl?: string;
  storagePath?: string;
  score?: number;
  status: 'submitted' | 'graded' | 'late';
  feedback?: string;
}

export interface Assignment {
  id: string;
  courseId: string;
  courseCode: string;
  title: string;
  description: string;
  maxScore: number;
  dueDate: string;
  assignedBy: string;
  submissions: AssignmentSubmission[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface QuizAttempt {
  studentId: string;
  studentName: string;
  matricNumber: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  takenAt: string;
}

export interface Quiz {
  id: string;
  courseId: string;
  courseCode: string;
  title: string;
  durationMinutes: number;
  questions: QuizQuestion[];
  attempts: QuizAttempt[];
  isOpen: boolean;
}

export interface AcademicResult {
  id: string;
  studentId: string;
  studentName: string;
  matricNumber: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  credits: number;
  caScore: number; // Max 30
  examScore: number; // Max 70
  totalScore: number; // Max 100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  gradePoint: number;
  semester: string;
  session: string;
  published: boolean;
  remarks: string;
}

export interface PaymentTransaction {
  id: string;
  reference: string;
  amount: number;
  date: string;
  channel: 'Bank Transfer' | 'Paystack' | 'Remita' | 'Cash Deposit';
  receiptNo: string;
  recordedBy: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  studentId: string;
  studentName: string;
  matricNumber: string;
  programmeName: string;
  category: 'Tuition Fee' | 'Technology Lab Fee' | 'Registration & Matriculation' | 'Professional Exam Fee' | 'Library & Resources';
  amount: number;
  amountPaid: number;
  balance: number;
  status: 'paid' | 'partial' | 'pending' | 'overdue';
  dueDate: string;
  session: string;
  transactions: PaymentTransaction[];
}

export interface AdmissionApplication {
  id: string;
  applicationNumber: string;
  fullName: string;
  email: string;
  phone: string;
  gender: 'Female' | 'Male';
  dateOfBirth: string;
  stateOfOrigin: string;
  programmeAppliedId: string;
  programmeAppliedName: string;
  previousEducation: string;
  oLevelSummary: string;
  statementOfPurpose: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'correction_requested';
  appliedDate: string;
  reviewNotes?: string;
  assignedMatricNumber?: string;
  documentUrl?: string;
  documentStoragePath?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'academic' | 'administrative' | 'financial' | 'events';
  targetAudience: 'all' | 'students' | 'lecturers' | 'staff';
  date: string;
  author: string;
  isPinned?: boolean;
}

export interface AuditLog {
  id: string;
  actorName: string;
  actorRole: string;
  action: string;
  details: string;
  timestamp: string;
  category: 'AUTH' | 'STUDENT' | 'ACADEMIC' | 'FINANCE' | 'SYSTEM';
}

export interface SchoolInfo {
  name: string;
  shortName: string;
  address: string;
  city: string;
  state: string;
  country: string;
  phone: string;
  altPhone: string;
  email: string;
  website: string;
  currentSession: string;
  currentSemester: string;
  rectorName: string;
  registrarName: string;
  bursarName: string;
}

export type NotificationCategory =
  | 'assignment'
  | 'exam'
  | 'payment'
  | 'announcement'
  | 'academic'
  | 'system';

export type NotificationChannel = 'in_app' | 'email' | 'both';

export type NotificationPriority = 'urgent' | 'normal' | 'low';

export type NotificationRecipientRole = UserRole | 'all' | 'staff' | 'students' | 'lecturers';

export interface EmailDispatchRecord {
  to: string;
  subject: string;
  sentAt: string;
  previewText: string;
}

export interface NotificationItem {
  id: string;
  recipientId: string; // user ID or 'all'
  recipientRole?: NotificationRecipientRole;
  title: string;
  message: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  timestamp: string;
  isRead: boolean;
  targetTab?: string;
  channel: NotificationChannel;
  emailDispatched?: boolean;
  emailRecord?: EmailDispatchRecord;
}

export interface NotificationPreferenceSetting {
  inApp: boolean;
  email: boolean;
}

export interface NotificationPreferences {
  userId: string;
  inAppMaster: boolean;
  emailMaster: boolean;
  preferredEmail: string;
  digestFrequency: 'instant' | 'daily_digest';
  categories: {
    assignment: NotificationPreferenceSetting;
    exam: NotificationPreferenceSetting;
    payment: NotificationPreferenceSetting;
    announcement: NotificationPreferenceSetting;
    academic: NotificationPreferenceSetting;
    system: NotificationPreferenceSetting;
  };
}
