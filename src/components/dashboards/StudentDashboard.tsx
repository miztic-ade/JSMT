import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Invoice, PaymentTransaction, Assignment, Quiz } from '../../types';
import {
  GraduationCap,
  BookOpen,
  FolderDown,
  CalendarDays,
  Clock,
  ClipboardList,
  Award,
  CreditCard,
  IdCard,
  Download,
  CheckCircle,
  FileText,
  AlertCircle,
  Send,
  Printer,
  ChevronRight,
  ShieldCheck,
  Loader2,
  Trash2,
  FileCheck,
  Paperclip,
} from 'lucide-react';
import { StudentIdCardModal } from '../modals/StudentIdCardModal';
import { TranscriptModal } from '../modals/TranscriptModal';
import { PaymentGatewayModal } from '../modals/PaymentGatewayModal';
import { OfficialReceiptModal } from '../modals/OfficialReceiptModal';
import { TakeQuizModal } from '../modals/TakeQuizModal';
import { StudentProfile } from './StudentProfile';
import { uploadToStorage, downloadFileByPath } from '../../utils/supabaseStorage';

interface StudentDashboardProps {
  activeTab: string;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ activeTab }) => {
  const {
    currentStudent,
    courses,
    materials,
    assignments,
    quizzes,
    results,
    invoices,
    attendanceSessions,
    announcements,
    schoolInfo,
    submitAssignment,
    deleteSubmissionAttachment,
    updateStudentProfile,
  } = useSchool();

  // Student specific data
  const myResults = results.filter((r) => r.studentId === currentStudent.id);
  const myInvoices = invoices.filter((inv) => inv.studentId === currentStudent.id);

  // Compute attendance stats
  let totalClassSessions = 0;
  let attendedSessions = 0;
  attendanceSessions.forEach((sess) => {
    const rec = sess.records.find((r) => r.studentId === currentStudent.id);
    if (rec) {
      totalClassSessions++;
      if (rec.status === 'present' || rec.status === 'late') {
        attendedSessions++;
      }
    }
  });
  const attendanceRate = totalClassSessions > 0 ? Math.round((attendedSessions / totalClassSessions) * 100) : 94;

  // Modals state
  const [showIdCardModal, setShowIdCardModal] = useState(false);
  const [showTranscriptModal, setShowTranscriptModal] = useState(false);
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);
  const [viewingReceiptInvoice, setViewingReceiptInvoice] = useState<Invoice | null>(null);
  const [viewingReceiptTx, setViewingReceiptTx] = useState<PaymentTransaction | undefined>(undefined);
  const [takingQuiz, setTakingQuiz] = useState<Quiz | null>(null);

  // Assignment submission form & Supabase Storage state
  const [submittingAssignmentId, setSubmittingAssignmentId] = useState<string | null>(null);
  const [submissionContent, setSubmissionContent] = useState('');
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [isUploadingSubmission, setIsUploadingSubmission] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [deletingAttachmentSubId, setDeletingAttachmentSubId] = useState<string | null>(null);

  // Profile edit
  const [profilePhone, setProfilePhone] = useState(currentStudent.phone);
  const [profileAddress, setProfileAddress] = useState(currentStudent.address);
  const [profileSaved, setProfileSaved] = useState(false);

  const handleSubmitAssignmentForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingAssignmentId || !submissionContent) return;
    setIsUploadingSubmission(true);
    setSubmissionError(null);

    try {
      let attachmentName = undefined;
      let attachmentUrl = undefined;
      let storagePath = undefined;

      if (submissionFile) {
        // Upload deliverable to private bucket app-files under {userId}/assignments/...
        const res = await uploadToStorage(submissionFile, 'assignments', currentStudent.userId);
        if (!res.success) {
          throw new Error(res.error || 'Failed to upload deliverable file to Supabase Storage');
        }
        attachmentName = res.fileName;
        attachmentUrl = res.signedUrl;
        storagePath = res.path;
      }

      submitAssignment(
        submittingAssignmentId,
        currentStudent.id,
        submissionContent,
        attachmentName,
        attachmentUrl,
        storagePath
      );

      setSubmittingAssignmentId(null);
      setSubmissionContent('');
      setSubmissionFile(null);
    } catch (err: any) {
      console.error('Submission failed:', err);
      setSubmissionError(err?.message || 'Failed to upload and submit assignment.');
    } finally {
      setIsUploadingSubmission(false);
    }
  };

  const handleDeleteAttachment = async (assignmentId: string, submissionId: string) => {
    if (!confirm('Are you sure you want to delete this submitted file? It will be removed from Supabase Storage.')) {
      return;
    }
    setDeletingAttachmentSubId(submissionId);
    try {
      await deleteSubmissionAttachment(assignmentId, submissionId);
    } catch (err) {
      console.error('Error deleting attachment:', err);
    } finally {
      setDeletingAttachmentSubId(null);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateStudentProfile(currentStudent.id, {
      phone: profilePhone,
      address: profileAddress,
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* OVERVIEW */}
      {(activeTab === 'overview' || !activeTab) && (
        <div className="space-y-6">
          
          {/* Welcome Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              {currentStudent.avatarUrl ? (
                <img
                  src={currentStudent.avatarUrl}
                  alt={currentStudent.fullName}
                  className="w-16 h-16 rounded-full object-cover border-2 border-blue-600 shadow-sm"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-blue-900 text-white font-bold text-xl flex items-center justify-center">
                  {currentStudent.fullName.charAt(0)}
                </div>
              )}
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">
                  Enrolled Student Portal
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {currentStudent.fullName}
                </h2>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <span className="font-mono font-bold text-blue-900">{currentStudent.studentId}</span>
                  <span aria-hidden="true">·</span>
                  <span>{currentStudent.programmeName}</span>
                  <span aria-hidden="true">·</span>
                  <span>{currentStudent.level}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowIdCardModal(true)}
                className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
              >
                <IdCard className="w-3.5 h-3.5" />
                <span>View Student ID</span>
              </button>
              <button
                onClick={() => setShowTranscriptModal(true)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Award className="w-3.5 h-3.5 text-blue-700" />
                <span>Semester Results</span>
              </button>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 block">Cumulative GPA</span>
              <span className="text-2xl font-black font-mono text-blue-950 tabular-nums">
                {currentStudent.currentGPA.toFixed(2)}
              </span>
              <span className="text-xs text-emerald-700 block mt-1">First Class Honours Equivalent</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 block">Class Attendance</span>
              <span className="text-2xl font-black font-mono text-slate-900 tabular-nums">
                {attendanceRate}%
              </span>
              <span className="text-xs text-emerald-700 block mt-1">Cleared for Examinations</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 block">Enrolled Courses</span>
              <span className="text-2xl font-black font-mono text-slate-900 tabular-nums">
                {courses.length}
              </span>
              <span className="text-xs text-slate-500 block mt-1">{schoolInfo.currentSemester}</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 block">Outstanding Fees</span>
              <span className="text-2xl font-black font-mono text-amber-900 tabular-nums">
                ₦{myInvoices.reduce((acc, i) => acc + i.balance, 0).toLocaleString()}
              </span>
              <span className="text-xs text-amber-700 block mt-1">Exam Fee Balance</span>
            </div>
          </div>

          {/* Important Notices */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Academic Notices & Announcements</h3>
              <span className="text-xs text-slate-500">{announcements.length} Bulletins</span>
            </div>
            <div className="space-y-3">
              {announcements.map((ann) => (
                <div key={ann.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>{ann.title}</span>
                    <span className="font-mono text-slate-400 font-normal">{ann.date}</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-[11px]">{ann.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MY COURSES TAB */}
      {activeTab === 'my_courses' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">My Registered Courses & Syllabus</h2>
            <p className="text-xs text-slate-500">Official course registration for {schoolInfo.currentSession}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map((crs) => (
              <div key={crs.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded-md">
                    {crs.code}
                  </span>
                  <span className="font-mono font-semibold text-slate-600">{crs.credits} Units</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm leading-snug">{crs.title}</h4>
                <p className="text-slate-600 text-xs leading-relaxed">{crs.syllabus}</p>
                <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-500 space-y-1">
                  <div>Lecturer: <strong className="text-slate-700">{crs.lecturerName}</strong></div>
                  <div>Schedule: <strong>{crs.scheduleDay} ({crs.scheduleTime})</strong></div>
                  <div>Venue: <strong>{crs.venue}</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MATERIALS HUB TAB */}
      {activeTab === 'materials' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Learning Materials & Handouts</h2>
            <p className="text-xs text-slate-500">Download course lecture notes, presentation slides, and code repositories</p>
          </div>

          <div className="space-y-3">
            {materials.map((mat) => (
              <div key={mat.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                      {mat.courseCode}
                    </span>
                    <span className="font-bold text-slate-900">{mat.title}</span>
                    {mat.storagePath && (
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>Private Signed URL</span>
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 text-[11px]">{mat.description}</p>
                  <div className="text-slate-400 text-[10px]">
                    Size: {mat.fileSize} · Uploaded: {mat.uploadDate} by {mat.uploadedBy}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (mat.storagePath) {
                      downloadFileByPath(mat.storagePath, mat.title);
                    } else if (mat.downloadUrl && mat.downloadUrl.startsWith('http')) {
                      window.open(mat.downloadUrl, '_blank', 'noopener,noreferrer');
                    } else {
                      const blob = new Blob([`Resource content for ${mat.title} (${mat.courseCode})`], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = mat.title.replace(/\s+/g, '_') + '.txt';
                      a.click();
                      URL.revokeObjectURL(url);
                    }
                  }}
                  className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                  title="Download resource securely via signed URL"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TIMETABLE & EXAMS TAB */}
      {activeTab === 'timetable' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Lecture Timetable & Examination Schedule</h2>
            <p className="text-xs text-slate-500">Class times and designated halls at Idi Aba Campus</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map((crs) => (
              <div key={crs.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-blue-900">{crs.code}</span>
                  <span className="text-slate-500">{crs.scheduleDay}</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{crs.title}</h4>
                <div className="text-slate-600 text-xs">
                  Time: <strong className="text-slate-900">{crs.scheduleTime}</strong>
                </div>
                <div className="text-slate-600 text-xs">
                  Hall: <strong className="text-slate-900">{crs.venue}</strong>
                </div>
                <div className="text-[11px] text-slate-500">Instructor: {crs.lecturerName}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MY ATTENDANCE TAB */}
      {activeTab === 'my_attendance' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Biometric & Classroom Attendance Records</h2>
            <p className="text-xs text-slate-500">Continuous attendance compliance for exam eligibility</p>
          </div>

          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs flex items-center justify-between">
            <div>
              <span className="font-bold text-emerald-950 block">Examination Attendance Clearance: Cleared</span>
              <span className="text-emerald-800 text-[11px]">Minimum required attendance is 75%. Your current rate is {attendanceRate}%.</span>
            </div>
            <span className="text-2xl font-black font-mono text-emerald-950">{attendanceRate}%</span>
          </div>

          <div className="space-y-3">
            {attendanceSessions.map((session) => {
              const myRec = session.records.find((r) => r.studentId === currentStudent.id);
              return (
                <div key={session.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">{session.sessionTitle}</div>
                    <div className="text-[11px] text-slate-500">
                      {session.courseCode} · Date: {session.date}
                    </div>
                  </div>
                  <div>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                        myRec?.status === 'present'
                          ? 'bg-emerald-50 text-emerald-700'
                          : myRec?.status === 'late'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {myRec?.status || 'Present'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ASSIGNMENTS & TESTS TAB */}
      {activeTab === 'assignments' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Coursework Assignments & Online Quizzes</h2>
            <p className="text-xs text-slate-500">Submit homework projects and take computer-based tests</p>
          </div>

          {/* Active Quizzes */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Available Computer-Based Quizzes (CBT)
            </h3>
            {quizzes.map((quiz) => {
              const myAttempt = quiz.attempts.find((a) => a.studentId === currentStudent.id);
              return (
                <div key={quiz.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                        {quiz.courseCode}
                      </span>
                      <span className="font-bold text-slate-900">{quiz.title}</span>
                    </div>
                    <div className="text-slate-500 text-[11px] mt-1">
                      {quiz.questions.length} Questions · {quiz.durationMinutes} Minutes Time Limit
                    </div>
                  </div>

                  <div>
                    {myAttempt ? (
                      <div className="text-right">
                        <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded text-xs">
                          Score: {myAttempt.score}/{myAttempt.totalQuestions} ({myAttempt.percentage}%)
                        </span>
                        <span className="block text-[10px] text-slate-400 mt-1">Completed</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => setTakingQuiz(quiz)}
                        className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
                      >
                        Take Online Quiz
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Assignments */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Coursework Projects & Homework
            </h3>
            {assignments.map((asg) => {
              const mySub = asg.submissions.find((s) => s.studentId === currentStudent.id);
              return (
                <div key={asg.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded mr-2">
                        {asg.courseCode}
                      </span>
                      <span className="font-bold text-slate-900 text-sm">{asg.title}</span>
                    </div>
                    <span className="font-mono text-slate-500">Due: {asg.dueDate}</span>
                  </div>

                  <p className="text-slate-600 text-xs leading-relaxed">{asg.description}</p>

                  <div className="pt-2 border-t border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      {mySub ? (
                        <div className="text-xs space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-emerald-700">Submitted on {mySub.submittedAt}</span>
                            {mySub.score !== undefined ? (
                              <span className="font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                                Score: {mySub.score}/{asg.maxScore}
                              </span>
                            ) : (
                              <span className="text-slate-500 italic">(Awaiting instructor grading)</span>
                            )}
                          </div>

                          {/* Submitted Attachment Display & Delete Action */}
                          {mySub.attachmentName && (
                            <div className="flex items-center gap-2 pt-1">
                              <span className="p-1.5 bg-slate-100 rounded-lg text-slate-700 flex items-center gap-1 font-mono text-[11px]">
                                <Paperclip className="w-3 h-3 text-slate-500" />
                                <span>{mySub.attachmentName}</span>
                              </span>

                              {/* Download Signed Attachment */}
                              <button
                                type="button"
                                onClick={() => {
                                  if (mySub.storagePath) {
                                    downloadFileByPath(mySub.storagePath, mySub.attachmentName);
                                  } else if (mySub.attachmentUrl && mySub.attachmentUrl.startsWith('http')) {
                                    window.open(mySub.attachmentUrl, '_blank', 'noopener,noreferrer');
                                  } else {
                                    const blob = new Blob([`Sample deliverable for ${asg.title}`], { type: 'text/plain' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = mySub.attachmentName || 'submission.zip';
                                    a.click();
                                    URL.revokeObjectURL(url);
                                  }
                                }}
                                className="px-2 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-blue-700 rounded-md text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                                title="Download submitted deliverable with private signed URL"
                              >
                                <Download className="w-3 h-3" />
                                <span>Download</span>
                              </button>

                              {/* Delete / Withdraw Attachment from Storage */}
                              {mySub.score === undefined && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteAttachment(asg.id, mySub.id)}
                                  disabled={deletingAttachmentSubId === mySub.id}
                                  className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-md text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                                  title="Delete deliverable file from Supabase Storage"
                                >
                                  {deletingAttachmentSubId === mySub.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-3 h-3" />
                                  )}
                                  <span>Withdraw File</span>
                                </button>
                              )}
                            </div>
                          )}

                          {mySub.feedback && (
                            <p className="text-[11px] text-slate-600 mt-1 bg-slate-100 p-2 rounded-lg">
                              Feedback: {mySub.feedback}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-amber-700 font-semibold">Not yet submitted</span>
                      )}
                    </div>

                    {!mySub && (
                      <button
                        onClick={() => {
                          setSubmittingAssignmentId(asg.id);
                          setSubmissionError(null);
                          setSubmissionFile(null);
                        }}
                        className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg text-xs cursor-pointer self-start sm:self-center"
                      >
                        Submit Solution
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* RESULTS TAB */}
      {activeTab === 'results' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Official Semester Statement of Results</h2>
              <p className="text-xs text-slate-500">{schoolInfo.currentSession} · {schoolInfo.currentSemester}</p>
            </div>
            <button
              onClick={() => setShowTranscriptModal(true)}
              className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Official Transcript</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Course Code</th>
                  <th className="py-2.5 px-3 font-semibold">Course Title</th>
                  <th className="py-2.5 px-2 text-center font-semibold">Units</th>
                  <th className="py-2.5 px-2 text-center font-semibold">CA</th>
                  <th className="py-2.5 px-2 text-center font-semibold">Exam</th>
                  <th className="py-2.5 px-2 text-center font-semibold">Total</th>
                  <th className="py-2.5 px-2 text-center font-semibold">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myResults.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-900">{r.courseCode}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">{r.courseTitle}</td>
                    <td className="py-2.5 px-2 text-center font-mono tabular-nums">{r.credits}</td>
                    <td className="py-2.5 px-2 text-center font-mono tabular-nums">{r.caScore}</td>
                    <td className="py-2.5 px-2 text-center font-mono tabular-nums">{r.examScore}</td>
                    <td className="py-2.5 px-2 text-center font-mono font-bold tabular-nums">{r.totalScore}</td>
                    <td className="py-2.5 px-2 text-center font-black text-blue-950 font-mono">{r.grade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FEES TAB */}
      {activeTab === 'fees' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Student Fees Ledger & Receipts</h2>
            <p className="text-xs text-slate-500">Official tuition payment ledger and Bursary receipts</p>
          </div>

          <div className="space-y-4">
            {myInvoices.map((inv) => (
              <div key={inv.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-mono font-bold text-slate-500 mr-2">{inv.invoiceNumber}</span>
                    <span className="font-bold text-sm text-slate-900">{inv.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                        inv.status === 'paid'
                          ? 'bg-emerald-50 text-emerald-700'
                          : inv.status === 'partial'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {inv.status}
                    </span>
                    {inv.balance > 0 && (
                      <button
                        onClick={() => setPayingInvoice(inv)}
                        className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg text-xs transition-colors"
                      >
                        Pay Balance Now (₦{inv.balance.toLocaleString()})
                      </button>
                    )}
                    {inv.transactions.length > 0 && (
                      <button
                        onClick={() => {
                          setViewingReceiptInvoice(inv);
                          setViewingReceiptTx(inv.transactions[0]);
                        }}
                        className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-lg text-xs"
                      >
                        View Receipt
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 font-mono text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-sans">Billed Amount:</span>
                    <span className="font-bold text-slate-900">₦{inv.amount.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-sans">Amount Paid:</span>
                    <span className="font-bold text-emerald-700">₦{inv.amountPaid.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-sans">Balance Due:</span>
                    <span className={`font-bold ${inv.balance > 0 ? 'text-amber-800' : 'text-slate-900'}`}>
                      ₦{inv.balance.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ID CARD TAB */}
      {activeTab === 'id_card' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Digital Institutional Identification Card</h2>
              <p className="text-xs text-slate-500">Official student identity document for campus entry and exam halls</p>
            </div>
            <button
              onClick={() => setShowIdCardModal(true)}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs"
            >
              Open Printable ID Modal
            </button>
          </div>

          <div className="flex justify-center p-6 bg-slate-100 rounded-2xl">
            {/* Embedded ID Card Preview */}
            <div className="w-[360px] h-[225px] bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 rounded-2xl p-4 shadow-xl border border-blue-800 text-white flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/15 pb-2">
                <div className="flex items-center gap-2">
                  <img
                    src="/src/assets/images/jaroy_school_crest_1791659609817.jpg"
                    alt="Jaroy Crest"
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <h3 className="text-[11px] font-black uppercase tracking-tight">Jaroy School of Mgmt & Tech</h3>
                    <span className="text-[9px] text-blue-200 block">Idi Aba, Abeokuta, Nigeria</span>
                  </div>
                </div>
                <span className="text-[9px] font-mono font-bold bg-blue-600/60 px-2 py-0.5 rounded text-white uppercase">
                  STUDENT
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-20 h-24 rounded-lg bg-slate-800 border-2 border-white/40 overflow-hidden shrink-0">
                  <img
                    src={currentStudent.avatarUrl}
                    alt={currentStudent.fullName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 space-y-1 text-[10px]">
                  <h4 className="text-xs font-black uppercase text-white truncate">{currentStudent.fullName}</h4>
                  <div className="text-blue-200">ID: <strong className="text-amber-300 font-mono">{currentStudent.studentId}</strong></div>
                  <div className="truncate text-blue-200">Prog: {currentStudent.programmeName}</div>
                  <div className="text-blue-200">Cohort: {currentStudent.level}</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[8px] text-slate-300 pt-1 border-t border-white/10">
                <span className="font-mono tracking-widest">||| | |||| || ||| |||| |</span>
                <span>Authorized Registry</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STUDENT PROFILE TAB */}
      {activeTab === 'profile' && (
        <StudentProfile />
      )}

      {/* SUBMISSION MODAL */}
      {submittingAssignmentId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900">Submit Assignment Deliverable</h3>
            <form onSubmit={handleSubmitAssignmentForm} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Submission Notes / Code Summary *
                </label>
                <textarea
                  rows={4}
                  placeholder="Explain how you completed the assignment, key architecture, endpoints created..."
                  value={submissionContent}
                  onChange={(e) => setSubmissionContent(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Project Archive File / GitHub URL
                </label>
                <input
                  type="text"
                  placeholder="e.g. Joy_Adeleke_SWE201_Final_Project.zip"
                  value={submissionFile}
                  onChange={(e) => setSubmissionFile(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSubmittingAssignmentId(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg"
                >
                  Confirm & Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALS */}
      {showIdCardModal && (
        <StudentIdCardModal
          student={currentStudent}
          onClose={() => setShowIdCardModal(false)}
        />
      )}

      {showTranscriptModal && (
        <TranscriptModal
          student={currentStudent}
          results={myResults}
          onClose={() => setShowTranscriptModal(false)}
        />
      )}

      {payingInvoice && (
        <PaymentGatewayModal
          invoice={payingInvoice}
          onClose={() => setPayingInvoice(null)}
          onPaymentSuccess={(tx) => {
            setViewingReceiptInvoice(payingInvoice);
            setViewingReceiptTx(tx);
          }}
        />
      )}

      {viewingReceiptInvoice && (
        <OfficialReceiptModal
          invoice={viewingReceiptInvoice}
          transaction={viewingReceiptTx}
          onClose={() => {
            setViewingReceiptInvoice(null);
            setViewingReceiptTx(undefined);
          }}
        />
      )}

      {takingQuiz && (
        <TakeQuizModal
          quiz={takingQuiz}
          onClose={() => setTakingQuiz(null)}
        />
      )}

    </div>
  );
};
