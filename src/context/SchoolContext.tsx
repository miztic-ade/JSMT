import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  StudentProfile,
  Department,
  Programme,
  Course,
  AttendanceSession,
  LearningMaterial,
  Assignment,
  Quiz,
  AcademicResult,
  Invoice,
  AdmissionApplication,
  Announcement,
  AuditLog,
  SchoolInfo,
  PaymentTransaction,
  NotificationItem,
  NotificationPreferences,
  NotificationCategory,
} from '../types';
import {
  initialSchoolInfo,
  demoUsers,
  initialDepartments,
  initialProgrammes,
  initialCourses,
  initialStudentsList,
  currentStudentProfile,
  initialAttendanceSessions,
  initialMaterials,
  initialAssignments,
  initialQuizzes,
  initialAcademicResults,
  initialInvoices,
  initialApplications,
  initialAnnouncements,
  initialAuditLogs,
  initialNotifications,
  defaultNotificationPreferences,
} from '../data/mockData';
import { deleteFromStorage } from '../utils/supabaseStorage';

interface SchoolContextType {
  currentUser: User;
  allUsers: User[];
  schoolInfo: SchoolInfo;
  departments: Department[];
  programmes: Programme[];
  courses: Course[];
  students: StudentProfile[];
  currentStudent: StudentProfile;
  attendanceSessions: AttendanceSession[];
  materials: LearningMaterial[];
  assignments: Assignment[];
  quizzes: Quiz[];
  results: AcademicResult[];
  invoices: Invoice[];
  applications: AdmissionApplication[];
  announcements: Announcement[];
  auditLogs: AuditLog[];
  notifications: NotificationItem[];
  notificationPreferences: NotificationPreferences;
  unreadNotificationsCount: number;

  // Actions
  switchRole: (role: UserRole) => void;
  setCurrentUser: (user: User) => void;
  addUser: (userData: Partial<User>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  
  addCourse: (courseData: Omit<Course, 'id' | 'enrolledStudentsCount'>) => void;
  updateCourse: (id: string, updates: Partial<Course>) => void;
  deleteCourse: (id: string) => void;

  addDepartment: (deptData: Omit<Department, 'id' | 'programmesCount'>) => void;
  addProgramme: (progData: Omit<Programme, 'id'>) => void;

  recordAttendance: (sessionData: Omit<AttendanceSession, 'id'>) => void;
  
  addMaterial: (material: Omit<LearningMaterial, 'id' | 'uploadDate'>) => void;
  deleteMaterial: (id: string) => Promise<void> | void;

  createAssignment: (assignment: Omit<Assignment, 'id' | 'submissions'>) => void;
  submitAssignment: (assignmentId: string, studentId: string, content: string, attachmentName?: string, attachmentUrl?: string, storagePath?: string) => void;
  deleteSubmissionAttachment: (assignmentId: string, submissionId: string) => Promise<void>;
  gradeAssignment: (assignmentId: string, submissionId: string, score: number, feedback: string) => void;

  submitQuizAttempt: (quizId: string, score: number, totalQuestions: number) => void;

  saveOrUpdateResult: (resultData: Omit<AcademicResult, 'id'>) => void;
  publishResultsBatch: (semester: string, session: string) => void;

  recordPayment: (invoiceId: string, amount: number, channel: PaymentTransaction['channel'], reference?: string) => PaymentTransaction;
  createInvoice: (inv: Omit<Invoice, 'id' | 'invoiceNumber' | 'amountPaid' | 'balance' | 'status' | 'transactions'>) => void;

  submitAdmissionApplication: (appData: Omit<AdmissionApplication, 'id' | 'applicationNumber' | 'status' | 'appliedDate'>) => string;
  updateApplicationStatus: (id: string, status: AdmissionApplication['status'], notes?: string, assignedMatric?: string) => void;

  addAnnouncement: (item: Omit<Announcement, 'id' | 'date'>) => void;
  deleteAnnouncement: (id: string) => void;

  updateSchoolInfo: (info: Partial<SchoolInfo>) => void;
  updateStudentProfile: (studentId: string, updates: Partial<StudentProfile>) => void;
  deleteStudentAvatar: (studentId: string) => Promise<void>;

  // Notification Operations
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  sendNotification: (item: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'>) => void;
  updateNotificationPreferences: (prefs: Partial<NotificationPreferences>) => void;
  triggerTestNotification: (category: NotificationCategory) => void;

  logAudit: (action: string, details: string, category: AuditLog['category']) => void;
  resetToDefaults: () => void;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

const STORAGE_PREFIX = 'jsmt_sms_v1_';

export const SchoolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const getStored = <T,>(key: string, fallback: T): T => {
    try {
      const item = localStorage.getItem(STORAGE_PREFIX + key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  };

  const [allUsers, setAllUsers] = useState<User[]>(() => getStored('users', demoUsers));
  const [currentUser, setCurrentUser] = useState<User>(() => getStored('currentUser', demoUsers[0]));
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>(() => getStored('schoolInfo', initialSchoolInfo));
  const [departments, setDepartments] = useState<Department[]>(() => getStored('departments', initialDepartments));
  const [programmes, setProgrammes] = useState<Programme[]>(() => getStored('programmes', initialProgrammes));
  const [courses, setCourses] = useState<Course[]>(() => getStored('courses', initialCourses));
  const [students, setStudents] = useState<StudentProfile[]>(() => getStored('students', initialStudentsList));
  const [attendanceSessions, setAttendanceSessions] = useState<AttendanceSession[]>(() => getStored('attendance', initialAttendanceSessions));
  const [materials, setMaterials] = useState<LearningMaterial[]>(() => getStored('materials', initialMaterials));
  const [assignments, setAssignments] = useState<Assignment[]>(() => getStored('assignments', initialAssignments));
  const [quizzes, setQuizzes] = useState<Quiz[]>(() => getStored('quizzes', initialQuizzes));
  const [results, setResults] = useState<AcademicResult[]>(() => getStored('results', initialAcademicResults));
  const [invoices, setInvoices] = useState<Invoice[]>(() => getStored('invoices', initialInvoices));
  const [applications, setApplications] = useState<AdmissionApplication[]>(() => getStored('applications', initialApplications));
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => getStored('announcements', initialAnnouncements));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => getStored('auditLogs', initialAuditLogs));
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => getStored('notifications', initialNotifications));
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>(() =>
    getStored('notifPrefs', defaultNotificationPreferences)
  );

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PREFIX + 'users', JSON.stringify(allUsers));
      localStorage.setItem(STORAGE_PREFIX + 'currentUser', JSON.stringify(currentUser));
      localStorage.setItem(STORAGE_PREFIX + 'schoolInfo', JSON.stringify(schoolInfo));
      localStorage.setItem(STORAGE_PREFIX + 'departments', JSON.stringify(departments));
      localStorage.setItem(STORAGE_PREFIX + 'programmes', JSON.stringify(programmes));
      localStorage.setItem(STORAGE_PREFIX + 'courses', JSON.stringify(courses));
      localStorage.setItem(STORAGE_PREFIX + 'students', JSON.stringify(students));
      localStorage.setItem(STORAGE_PREFIX + 'attendance', JSON.stringify(attendanceSessions));
      localStorage.setItem(STORAGE_PREFIX + 'materials', JSON.stringify(materials));
      localStorage.setItem(STORAGE_PREFIX + 'assignments', JSON.stringify(assignments));
      localStorage.setItem(STORAGE_PREFIX + 'quizzes', JSON.stringify(quizzes));
      localStorage.setItem(STORAGE_PREFIX + 'results', JSON.stringify(results));
      localStorage.setItem(STORAGE_PREFIX + 'invoices', JSON.stringify(invoices));
      localStorage.setItem(STORAGE_PREFIX + 'applications', JSON.stringify(applications));
      localStorage.setItem(STORAGE_PREFIX + 'announcements', JSON.stringify(announcements));
      localStorage.setItem(STORAGE_PREFIX + 'auditLogs', JSON.stringify(auditLogs));
      localStorage.setItem(STORAGE_PREFIX + 'notifications', JSON.stringify(notifications));
      localStorage.setItem(STORAGE_PREFIX + 'notifPrefs', JSON.stringify(notificationPreferences));
    } catch (e) {
      console.warn('Storage sync issue:', e);
    }
  }, [allUsers, currentUser, schoolInfo, departments, programmes, courses, students, attendanceSessions, materials, assignments, quizzes, results, invoices, applications, announcements, auditLogs, notifications, notificationPreferences]);

  const logAudit = (action: string, details: string, category: AuditLog['category']) => {
    const newLog: AuditLog = {
      id: 'log_' + Date.now(),
      actorName: currentUser.name,
      actorRole: currentUser.role.replace('_', ' ').toUpperCase(),
      action,
      details,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      category,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const switchRole = (role: UserRole) => {
    const found = allUsers.find((u) => u.role === role);
    if (found) {
      setCurrentUser(found);
      logAudit('Switched User Role', `Switched active session to ${found.name} (${role})`, 'AUTH');
    }
  };

  const currentStudent = students.find((s) => s.userId === currentUser.id) || currentStudentProfile;

  const addUser = (userData: Partial<User>) => {
    const newUser: User = {
      id: 'usr_' + Date.now(),
      name: userData.name || 'New User',
      email: userData.email || `user${Date.now()}@jaroyschool.edu.ng`,
      role: userData.role || 'student',
      phone: userData.phone || '+234 800 000 0000',
      status: 'active',
      department: userData.department || 'General Administration',
      joinedDate: new Date().toISOString().split('T')[0],
      staffId: userData.role !== 'student' ? `JSMT/STF/${Math.floor(100 + Math.random() * 900)}` : undefined,
      studentId: userData.role === 'student' ? `JSMT/2026/GEN/${Math.floor(10 + Math.random() * 90)}` : undefined,
    };
    setAllUsers((prev) => [newUser, ...prev]);
    logAudit('Created User Account', `Created ${newUser.name} with role ${newUser.role}`, 'SYSTEM');
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setAllUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...updates } : u))
    );
    if (currentUser.id === id) {
      setCurrentUser((prev) => ({ ...prev, ...updates }));
    }
    logAudit('Updated User Account', `Updated profile fields for user ID ${id}`, 'SYSTEM');
  };

  const deleteUser = (id: string) => {
    const user = allUsers.find((u) => u.id === id);
    setAllUsers((prev) => prev.filter((u) => u.id !== id));
    logAudit('Deactivated User Account', `Removed user ${user?.name || id}`, 'SYSTEM');
  };

  const addCourse = (courseData: Omit<Course, 'id' | 'enrolledStudentsCount'>) => {
    const newCourse: Course = {
      ...courseData,
      id: 'crs_' + Date.now(),
      enrolledStudentsCount: 25,
    };
    setCourses((prev) => [newCourse, ...prev]);
    logAudit('Added New Course', `Created course ${newCourse.code}: ${newCourse.title}`, 'ACADEMIC');
  };

  const updateCourse = (id: string, updates: Partial<Course>) => {
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    logAudit('Updated Course', `Modified course details for course ID ${id}`, 'ACADEMIC');
  };

  const deleteCourse = (id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
    logAudit('Removed Course', `Deleted course ID ${id}`, 'ACADEMIC');
  };

  const addDepartment = (deptData: Omit<Department, 'id' | 'programmesCount'>) => {
    const newDept: Department = {
      ...deptData,
      id: 'dept_' + Date.now(),
      programmesCount: 1,
    };
    setDepartments((prev) => [...prev, newDept]);
    logAudit('Added Department', `Created department ${newDept.name}`, 'ACADEMIC');
  };

  const addProgramme = (progData: Omit<Programme, 'id'>) => {
    const newProg: Programme = {
      ...progData,
      id: 'prog_' + Date.now(),
    };
    setProgrammes((prev) => [...prev, newProg]);
    logAudit('Added Programme', `Created programme ${newProg.name}`, 'ACADEMIC');
  };

  const recordAttendance = (sessionData: Omit<AttendanceSession, 'id'>) => {
    const newSession: AttendanceSession = {
      ...sessionData,
      id: 'att_' + Date.now(),
    };
    setAttendanceSessions((prev) => [newSession, ...prev]);
    logAudit(
      'Recorded Class Attendance',
      `Marked attendance register for ${newSession.courseCode} on ${newSession.date}`,
      'ACADEMIC'
    );
  };

  const addMaterial = (material: Omit<LearningMaterial, 'id' | 'uploadDate'>) => {
    const newMat: LearningMaterial = {
      ...material,
      id: 'mat_' + Date.now(),
      uploadDate: new Date().toISOString().split('T')[0],
    };
    setMaterials((prev) => [newMat, ...prev]);
    logAudit(
      'Uploaded Learning Resource',
      `Uploaded resource "${newMat.title}" for ${newMat.courseCode}`,
      'ACADEMIC'
    );
  };

  const deleteMaterial = async (id: string) => {
    const mat = materials.find((m) => m.id === id);
    if (mat?.storagePath) {
      await deleteFromStorage(mat.storagePath);
    }
    setMaterials((prev) => prev.filter((m) => m.id !== id));
    logAudit('Deleted Learning Resource', `Removed resource ID ${id}`, 'ACADEMIC');
  };

  const createAssignment = (assignment: Omit<Assignment, 'id' | 'submissions'>) => {
    const newAsg: Assignment = {
      ...assignment,
      id: 'asg_' + Date.now(),
      submissions: [],
    };
    setAssignments((prev) => [newAsg, ...prev]);
    logAudit('Created Assignment', `Published assignment "${newAsg.title}" for ${newAsg.courseCode}`, 'ACADEMIC');

    // Auto-dispatch notification
    sendNotification({
      recipientId: 'all',
      recipientRole: 'students',
      title: `New Assignment: ${newAsg.title}`,
      message: `Coursework brief published for ${newAsg.courseCode}. Due Date: ${newAsg.dueDate}. Maximum marks: ${newAsg.maxScore}.`,
      category: 'assignment',
      priority: 'normal',
      targetTab: 'assignments',
      channel: notificationPreferences.emailMaster && notificationPreferences.categories.assignment.email ? 'both' : 'in_app',
      emailRecord: {
        to: currentStudent.email,
        subject: `[${newAsg.courseCode}] New Coursework: ${newAsg.title}`,
        sentAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
        previewText: `Lecturer ${currentUser.name} uploaded new assignment brief. Due: ${newAsg.dueDate}.`,
      },
    });
  };

  const submitAssignment = (
    assignmentId: string,
    studentId: string,
    content: string,
    attachmentName?: string,
    attachmentUrl?: string,
    storagePath?: string
  ) => {
    const stud = students.find((s) => s.id === studentId) || currentStudent;
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setAssignments((prev) =>
      prev.map((a) => {
        if (a.id !== assignmentId) return a;
        const existingIdx = a.submissions.findIndex((s) => s.studentId === studentId);
        const subData: AssignmentSubmission = {
          id: 'sub_' + Date.now(),
          studentId,
          studentName: stud.fullName,
          matricNumber: stud.studentId,
          submittedAt: now,
          content,
          attachmentName: attachmentName || 'Project_Submission.zip',
          attachmentUrl,
          storagePath,
          status: 'submitted' as const,
        };
        const updatedSubs = existingIdx >= 0
          ? a.submissions.map((s, idx) => (idx === existingIdx ? subData : s))
          : [...a.submissions, subData];
        return { ...a, submissions: updatedSubs };
      })
    );
    logAudit(
      'Submitted Assignment',
      `${stud.fullName} submitted coursework for assignment ID ${assignmentId}`,
      'STUDENT'
    );
  };

  const deleteSubmissionAttachment = async (assignmentId: string, submissionId: string) => {
    const asg = assignments.find((a) => a.id === assignmentId);
    const sub = asg?.submissions.find((s) => s.id === submissionId);
    if (sub?.storagePath) {
      await deleteFromStorage(sub.storagePath);
    }
    setAssignments((prev) =>
      prev.map((a) => {
        if (a.id !== assignmentId) return a;
        return {
          ...a,
          submissions: a.submissions.map((s) => {
            if (s.id !== submissionId) return s;
            const updated = { ...s };
            delete updated.attachmentName;
            delete updated.attachmentUrl;
            delete updated.storagePath;
            return updated;
          }),
        };
      })
    );
    logAudit('Removed Submission Attachment', `Removed file from submission ${submissionId}`, 'STUDENT');
  };

  const gradeAssignment = (
    assignmentId: string,
    submissionId: string,
    score: number,
    feedback: string
  ) => {
    setAssignments((prev) =>
      prev.map((a) => {
        if (a.id !== assignmentId) return a;
        return {
          ...a,
          submissions: a.submissions.map((sub) =>
            sub.id === submissionId
              ? { ...sub, score, feedback, status: 'graded' as const }
              : sub
          ),
        };
      })
    );
    logAudit(
      'Graded Assignment Submission',
      `Assigned score ${score} to submission ${submissionId}`,
      'ACADEMIC'
    );
  };

  const submitQuizAttempt = (
    quizId: string,
    score: number,
    totalQuestions: number
  ) => {
    const stud = currentStudent;
    const percentage = Math.round((score / totalQuestions) * 100);
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setQuizzes((prev) =>
      prev.map((q) => {
        if (q.id !== quizId) return q;
        const newAttempt = {
          studentId: stud.id,
          studentName: stud.fullName,
          matricNumber: stud.studentId,
          score,
          totalQuestions,
          percentage,
          takenAt: now,
        };
        return {
          ...q,
          attempts: [newAttempt, ...q.attempts.filter((att) => att.studentId !== stud.id)],
        };
      })
    );
    logAudit(
      'Completed Online Quiz',
      `${stud.fullName} scored ${score}/${totalQuestions} (${percentage}%) on Quiz ID ${quizId}`,
      'STUDENT'
    );
  };

  const saveOrUpdateResult = (resultData: Omit<AcademicResult, 'id'>) => {
    const existing = results.find(
      (r) =>
        r.studentId === resultData.studentId &&
        r.courseId === resultData.courseId &&
        r.semester === resultData.semester
    );

    if (existing) {
      setResults((prev) =>
        prev.map((r) => (r.id === existing.id ? { ...resultData, id: existing.id } : r))
      );
    } else {
      const newRes: AcademicResult = {
        ...resultData,
        id: 'res_' + Date.now(),
      };
      setResults((prev) => [newRes, ...prev]);
    }
    logAudit(
      'Updated Academic Result',
      `Entered grade for ${resultData.studentName} in ${resultData.courseCode} (Total: ${resultData.totalScore})`,
      'ACADEMIC'
    );
  };

  const publishResultsBatch = (semester: string, session: string) => {
    setResults((prev) =>
      prev.map((r) =>
        r.semester === semester && r.session === session ? { ...r, published: true } : r
      )
    );
    logAudit(
      'Published Semester Results',
      `Official publication of results for ${session} - ${semester}`,
      'ACADEMIC'
    );
  };

  const recordPayment = (
    invoiceId: string,
    amount: number,
    channel: PaymentTransaction['channel'],
    reference?: string
  ): PaymentTransaction => {
    const txNumber = 'REC-2026-' + Math.floor(1000 + Math.random() * 9000);
    const ref = reference || 'JSMT-PAY-' + Math.floor(10000000 + Math.random() * 90000000);
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const newTx: PaymentTransaction = {
      id: 'tx_' + Date.now(),
      reference: ref,
      amount,
      date: now,
      channel,
      receiptNo: txNumber,
      recordedBy: currentUser.name,
    };

    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== invoiceId) return inv;
        const newPaid = inv.amountPaid + amount;
        const newBal = Math.max(0, inv.amount - newPaid);
        const newStatus =
          newBal === 0 ? 'paid' : newPaid > 0 ? 'partial' : inv.status;
        return {
          ...inv,
          amountPaid: newPaid,
          balance: newBal,
          status: newStatus,
          transactions: [newTx, ...inv.transactions],
        };
      })
    );

    logAudit(
      'Processed Fee Payment',
      `Recorded payment of ₦${amount.toLocaleString()} for Invoice ${invoiceId} via ${channel} (${txNumber})`,
      'FINANCE'
    );

    return newTx;
  };

  const createInvoice = (
    inv: Omit<Invoice, 'id' | 'invoiceNumber' | 'amountPaid' | 'balance' | 'status' | 'transactions'>
  ) => {
    const newInv: Invoice = {
      ...inv,
      id: 'inv_' + Date.now(),
      invoiceNumber: 'INV-2026-' + Math.floor(1000 + Math.random() * 9000),
      amountPaid: 0,
      balance: inv.amount,
      status: 'pending',
      transactions: [],
    };
    setInvoices((prev) => [newInv, ...prev]);
    logAudit(
      'Generated Student Invoice',
      `Issued ${newInv.invoiceNumber} for ${newInv.studentName} (₦${newInv.amount.toLocaleString()})`,
      'FINANCE'
    );

    // Auto-dispatch notification
    sendNotification({
      recipientId: newInv.studentId,
      recipientRole: 'student',
      title: `Fee Due Date Notice: ${newInv.category} (₦${newInv.amount.toLocaleString()})`,
      message: `Invoice ${newInv.invoiceNumber} has been issued for ${newInv.studentName}. Due Date: ${newInv.dueDate}. Please verify bursary clearance.`,
      category: 'payment',
      priority: 'urgent',
      targetTab: 'fees',
      channel: notificationPreferences.emailMaster && notificationPreferences.categories.payment.email ? 'both' : 'in_app',
      emailRecord: {
        to: currentStudent.email,
        subject: `[JSMT Bursary] Fee Invoice & Payment Schedule Notice: ${newInv.invoiceNumber}`,
        sentAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
        previewText: `Official tuition & fees billing for ${newInv.category}. Billed Amount: ₦${newInv.amount.toLocaleString()}. Due Date: ${newInv.dueDate}.`,
      },
    });
  };

  const submitAdmissionApplication = (
    appData: Omit<AdmissionApplication, 'id' | 'applicationNumber' | 'status' | 'appliedDate'>
  ): string => {
    const appNum = 'APP-2026-' + Math.floor(1000 + Math.random() * 9000);
    const newApp: AdmissionApplication = {
      ...appData,
      id: 'app_' + Date.now(),
      applicationNumber: appNum,
      status: 'pending',
      appliedDate: new Date().toISOString().split('T')[0],
    };
    setApplications((prev) => [newApp, ...prev]);
    logAudit(
      'New Admission Application',
      `Applicant ${newApp.fullName} submitted application ${appNum} for ${newApp.programmeAppliedName}`,
      'STUDENT'
    );
    return appNum;
  };

  const updateApplicationStatus = (
    id: string,
    status: AdmissionApplication['status'],
    notes?: string,
    assignedMatric?: string
  ) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id !== id) return app;
        const matric =
          status === 'approved'
            ? assignedMatric || `JSMT/2026/${app.programmeAppliedId.slice(5).toUpperCase()}/${Math.floor(10 + Math.random() * 89)}`
            : app.assignedMatricNumber;
        return {
          ...app,
          status,
          reviewNotes: notes || app.reviewNotes,
          assignedMatricNumber: matric,
        };
      })
    );

    // If approved, create a student profile if not exists
    if (status === 'approved') {
      const app = applications.find((a) => a.id === id);
      if (app) {
        const prog = programmes.find((p) => p.id === app.programmeAppliedId);
        const matric = assignedMatric || `JSMT/2026/SWE/${Math.floor(10 + Math.random() * 89)}`;
        const newStud: StudentProfile = {
          id: 'stud_' + Date.now(),
          userId: 'usr_new_' + Date.now(),
          fullName: app.fullName,
          studentId: matric,
          email: app.email,
          phone: app.phone,
          programmeId: app.programmeAppliedId,
          programmeName: app.programmeAppliedName,
          department: prog?.departmentName || 'School of Computing',
          level: 'Year 1 (First Semester)',
          admissionDate: new Date().toISOString().split('T')[0],
          gender: app.gender,
          dateOfBirth: app.dateOfBirth,
          address: app.stateOfOrigin + ', Nigeria',
          guardianName: 'Parent / Guardian',
          guardianPhone: app.phone,
          avatarUrl: '',
          currentGPA: 0,
          totalCreditsEarned: 0,
        };
        setStudents((prev) => [newStud, ...prev]);
      }
    }

    logAudit(
      'Updated Admission Application',
      `Application ID ${id} set to status: ${status}`,
      'ACADEMIC'
    );
  };

  const addAnnouncement = (item: Omit<Announcement, 'id' | 'date'>) => {
    const newAnn: Announcement = {
      ...item,
      id: 'ann_' + Date.now(),
      date: new Date().toISOString().split('T')[0],
    };
    setAnnouncements((prev) => [newAnn, ...prev]);
    logAudit('Published Announcement', `Notice: "${newAnn.title}"`, 'SYSTEM');

    // Auto-dispatch notification
    sendNotification({
      recipientId: 'all',
      recipientRole: (newAnn.targetAudience === 'students' ? 'students' : newAnn.targetAudience === 'lecturers' ? 'staff' : 'all'),
      title: `Official Circular: ${newAnn.title}`,
      message: newAnn.content,
      category: 'announcement',
      priority: newAnn.isPinned ? 'urgent' : 'normal',
      targetTab: 'overview',
      channel: notificationPreferences.emailMaster && notificationPreferences.categories.announcement.email ? 'both' : 'in_app',
      emailRecord: {
        to: currentUser.email,
        subject: `[JSMT Institutional Circular] ${newAnn.title}`,
        sentAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
        previewText: newAnn.content.slice(0, 140) + '...',
      },
    });
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    logAudit('Removed Announcement', `Deleted notice ID ${id}`, 'SYSTEM');
  };

  const updateSchoolInfo = (info: Partial<SchoolInfo>) => {
    setSchoolInfo((prev) => ({ ...prev, ...info }));
    logAudit('Updated School Information', `Modified institutional profile details`, 'SYSTEM');
  };

  const updateStudentProfile = (studentId: string, updates: Partial<StudentProfile>) => {
    setStudents((prev) => prev.map((s) => (s.id === studentId ? { ...s, ...updates } : s)));
    logAudit('Updated Student Profile', `Updated profile record for ${studentId}`, 'STUDENT');
  };

  const deleteStudentAvatar = async (studentId: string) => {
    const stud = students.find((s) => s.id === studentId) || currentStudent;
    if (stud?.avatarStoragePath) {
      await deleteFromStorage(stud.avatarStoragePath);
    }
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? { ...s, avatarUrl: '', avatarStoragePath: undefined }
          : s
      )
    );
    if (currentUser.role === 'student') {
      setCurrentUser((prev) => ({ ...prev, avatar: '', avatarStoragePath: undefined }));
    }
    logAudit('Deleted Avatar Image', `Removed profile photo from storage for student ${studentId}`, 'STUDENT');
  };

  // Notification Operations
  const unreadNotificationsCount = notifications.filter((n) => {
    if (n.isRead) return false;
    if (n.recipientId === 'all') return true;
    if (n.recipientId === currentUser.id) return true;
    if (n.recipientRole === 'all') return true;
    if (currentUser.role === 'student' && n.recipientRole === 'students') return true;
    if (currentUser.role === 'lecturer' && (n.recipientRole === 'staff' || n.recipientRole === 'lecturers')) return true;
    if (currentUser.role === 'school_admin' || currentUser.role === 'super_admin') return true;
    return false;
  }).length;

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const sendNotification = (item: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'>) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const newNotif: NotificationItem = {
      ...item,
      id: 'notif_' + Date.now(),
      timestamp: now,
      isRead: false,
      emailDispatched: item.channel === 'email' || item.channel === 'both',
    };
    setNotifications((prev) => [newNotif, ...prev]);
    logAudit(
      'Dispatched Notification',
      `Sent notification "${newNotif.title}" via ${newNotif.channel}`,
      'SYSTEM'
    );
  };

  const updateNotificationPreferences = (prefs: Partial<NotificationPreferences>) => {
    setNotificationPreferences((prev) => ({ ...prev, ...prefs }));
    logAudit('Updated Notification Preferences', `Modified notification subscription settings`, 'SYSTEM');
  };

  const triggerTestNotification = (category: NotificationCategory) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    let sampleTitle = '';
    let sampleMsg = '';
    let targetTab = 'overview';
    let priority: NotificationItem['priority'] = 'normal';

    switch (category) {
      case 'assignment':
        sampleTitle = 'New Assignment: Cloud Native & Microservices Architecture';
        sampleMsg = 'Engr. Chidi Okafor uploaded the mid-term project brief. Submission deadline: in 10 days. Max Marks: 30.';
        targetTab = 'assignments';
        priority = 'normal';
        break;
      case 'exam':
        sampleTitle = 'Examination Hall Notice: Mid-Term Assessments';
        sampleMsg = 'Mid-term examinations commencement schedule verified. CSOC Lab and Innovation Hub 1 allocated.';
        targetTab = 'timetable';
        priority = 'urgent';
        break;
      case 'payment':
        sampleTitle = 'Payment Due Date Alert: Professional Certification Fee';
        sampleMsg = 'Reminder from Bursary Office: Outstanding balance of ₦15,000 is due. Please verify payment clearance.';
        targetTab = 'fees';
        priority = 'urgent';
        break;
      case 'announcement':
        sampleTitle = 'Administrative Circular: Campus Tech Lab Hours Extended';
        sampleMsg = 'Directorate of Information Technology announced 24/7 dedicated power & fiber internet for exam preparations.';
        targetTab = 'overview';
        priority = 'normal';
        break;
      case 'academic':
        sampleTitle = 'Continuous Assessment Grades Published';
        sampleMsg = 'Continuous Assessment grades for First Semester have been vetted by the Academic Board.';
        targetTab = 'results';
        priority = 'normal';
        break;
      case 'system':
        sampleTitle = 'System Security & Backup Verification';
        sampleMsg = 'Encrypted incremental database snapshot completed by Super Admin console.';
        targetTab = 'overview';
        priority = 'low';
        break;
    }

    sendNotification({
      recipientId: currentUser.id,
      recipientRole: currentUser.role,
      title: sampleTitle,
      message: sampleMsg,
      category,
      priority,
      targetTab,
      channel: notificationPreferences.emailMaster && notificationPreferences.categories[category]?.email ? 'both' : 'in_app',
      emailRecord: {
        to: notificationPreferences.preferredEmail || currentUser.email,
        subject: `[JSMT Portal Notice] ${sampleTitle}`,
        sentAt: now,
        previewText: sampleMsg,
      },
    });
  };

  const resetToDefaults = () => {
    localStorage.clear();
    setAllUsers(demoUsers);
    setCurrentUser(demoUsers[0]);
    setSchoolInfo(initialSchoolInfo);
    setDepartments(initialDepartments);
    setProgrammes(initialProgrammes);
    setCourses(initialCourses);
    setStudents(initialStudentsList);
    setAttendanceSessions(initialAttendanceSessions);
    setMaterials(initialMaterials);
    setAssignments(initialAssignments);
    setQuizzes(initialQuizzes);
    setResults(initialAcademicResults);
    setInvoices(initialInvoices);
    setApplications(initialApplications);
    setAnnouncements(initialAnnouncements);
    setAuditLogs(initialAuditLogs);
    setNotifications(initialNotifications);
    setNotificationPreferences(defaultNotificationPreferences);
    alert('System data reset to default demo records.');
  };

  return (
    <SchoolContext.Provider
      value={{
        currentUser,
        allUsers,
        schoolInfo,
        departments,
        programmes,
        courses,
        students,
        currentStudent,
        attendanceSessions,
        materials,
        assignments,
        quizzes,
        results,
        invoices,
        applications,
        announcements,
        auditLogs,
        notifications,
        notificationPreferences,
        unreadNotificationsCount,
        switchRole,
        setCurrentUser,
        addUser,
        updateUser,
        deleteUser,
        addCourse,
        updateCourse,
        deleteCourse,
        addDepartment,
        addProgramme,
        recordAttendance,
        addMaterial,
        deleteMaterial,
        createAssignment,
        submitAssignment,
        deleteSubmissionAttachment,
        gradeAssignment,
        submitQuizAttempt,
        saveOrUpdateResult,
        publishResultsBatch,
        recordPayment,
        createInvoice,
        submitAdmissionApplication,
        updateApplicationStatus,
        addAnnouncement,
        deleteAnnouncement,
        updateSchoolInfo,
        updateStudentProfile,
        deleteStudentAvatar,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        clearAllNotifications,
        sendNotification,
        updateNotificationPreferences,
        triggerTestNotification,
        logAudit,
        resetToDefaults,
      }}
    >
      {children}
    </SchoolContext.Provider>
  );
};

export const useSchool = (): SchoolContextType => {
  const context = useContext(SchoolContext);
  if (!context) {
    throw new Error('useSchool must be used within a SchoolProvider');
  }
  return context;
};
