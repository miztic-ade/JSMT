import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Course, Assignment, Quiz, LearningMaterial } from '../../types';
import {
  BookOpen,
  Users,
  Clock,
  FolderDown,
  ClipboardList,
  FileSpreadsheet,
  Award,
  Plus,
  Upload,
  CheckCircle,
  Eye,
  FileText,
  Calendar,
  Trash2,
  Download,
  Loader2,
  ShieldCheck,
  FileCheck,
} from 'lucide-react';
import { AttendanceRegisterModal } from '../modals/AttendanceRegisterModal';
import { GradeEntryModal } from '../modals/GradeEntryModal';
import { uploadToStorage, downloadFileByPath } from '../../utils/supabaseStorage';

interface LecturerDashboardProps {
  activeTab: string;
}

export const LecturerDashboard: React.FC<LecturerDashboardProps> = ({ activeTab }) => {
  const {
    currentUser,
    courses,
    students,
    materials,
    assignments,
    quizzes,
    results,
    attendanceSessions,
    addMaterial,
    createAssignment,
    gradeAssignment,
    deleteMaterial,
  } = useSchool();

  // Find courses assigned to lecturer
  const myCourses = courses.filter((c) => c.lecturerId === currentUser.id || c.lecturerName.includes(currentUser.name.split(' ')[1] || 'Okafor'));
  const activeCourse = myCourses[0] || courses[0];

  // Modals state
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [selectedCourseForGrade, setSelectedCourseForGrade] = useState<Course>(activeCourse);

  // Upload Material Modal & Storage State
  const [showUploadMaterial, setShowUploadMaterial] = useState(false);
  const [materialFile, setMaterialFile] = useState<File | null>(null);
  const [isUploadingMaterial, setIsUploadingMaterial] = useState(false);
  const [materialError, setMaterialError] = useState<string | null>(null);
  const [deletingMaterialId, setDeletingMaterialId] = useState<string | null>(null);
  const [newMaterial, setNewMaterial] = useState({
    courseId: activeCourse?.id || '',
    courseCode: activeCourse?.code || '',
    title: '',
    type: 'pdf' as const,
    fileSize: '3.5 MB',
    description: '',
    downloadUrl: '#download-resource',
    storagePath: undefined as string | undefined,
  });

  // Create Assignment Modal
  const [showCreateAssignment, setShowCreateAssignment] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    courseId: activeCourse?.id || '',
    courseCode: activeCourse?.code || '',
    title: '',
    description: '',
    maxScore: 30,
    dueDate: '2026-10-25',
    assignedBy: currentUser.name,
  });

  // Grading submission state
  const [gradingSubId, setGradingSubId] = useState<string | null>(null);
  const [gradingAssignmentId, setGradingAssignmentId] = useState<string | null>(null);
  const [gradeScore, setGradeScore] = useState<number>(25);
  const [gradeFeedback, setGradeFeedback] = useState<string>('Well implemented solution.');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMaterialFile(file);
      if (!newMaterial.title) {
        setNewMaterial((prev) => ({ ...prev, title: file.name }));
      }
      const ext = file.name.split('.').pop()?.toLowerCase();
      let detectedType: 'pdf' | 'slides' | 'code' | 'notes' | 'video' = 'pdf';
      if (ext === 'ppt' || ext === 'pptx' || ext === 'key') detectedType = 'slides';
      else if (ext === 'zip' || ext === 'tar' || ext === 'gz' || ext === 'ts' || ext === 'js' || ext === 'py') detectedType = 'code';
      else if (ext === 'mp4' || ext === 'mov' || ext === 'webm') detectedType = 'video';
      else if (ext === 'txt' || ext === 'md' || ext === 'doc' || ext === 'docx') detectedType = 'notes';
      setNewMaterial((prev) => ({ ...prev, type: detectedType }));
    }
  };

  const handleUploadMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaterial.title) return;
    setIsUploadingMaterial(true);
    setMaterialError(null);

    try {
      let downloadUrl = newMaterial.downloadUrl;
      let storagePath = newMaterial.storagePath;
      let calculatedSize = newMaterial.fileSize;

      if (materialFile) {
        // Upload to private bucket app-files under {userId}/materials/...
        const res = await uploadToStorage(materialFile, 'materials', currentUser.id);
        if (!res.success) {
          throw new Error(res.error || 'Failed to upload resource to Supabase Storage');
        }
        downloadUrl = res.signedUrl;
        storagePath = res.path;
        calculatedSize = res.fileSize;
      }

      const crs = courses.find((c) => c.id === newMaterial.courseId) || activeCourse;
      addMaterial({
        ...newMaterial,
        courseCode: crs.code,
        uploadedBy: currentUser.name,
        fileSize: calculatedSize,
        downloadUrl,
        storagePath,
      });

      setShowUploadMaterial(false);
      setMaterialFile(null);
      setNewMaterial({
        courseId: activeCourse?.id || '',
        courseCode: activeCourse?.code || '',
        title: '',
        type: 'pdf',
        fileSize: '3.5 MB',
        description: '',
        downloadUrl: '#download-resource',
        storagePath: undefined,
      });
    } catch (err: any) {
      console.error('Material upload failed:', err);
      setMaterialError(err?.message || 'Failed to upload learning material.');
    } finally {
      setIsUploadingMaterial(false);
    }
  };

  const handleDeleteMaterialItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resource? It will be permanently removed from Supabase Storage.')) {
      return;
    }
    setDeletingMaterialId(id);
    try {
      await deleteMaterial(id);
    } catch (err) {
      console.error('Error deleting material:', err);
    } finally {
      setDeletingMaterialId(null);
    }
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssignment.title) return;
    const crs = courses.find((c) => c.id === newAssignment.courseId) || activeCourse;
    createAssignment({
      ...newAssignment,
      courseCode: crs.code,
      assignedBy: currentUser.name,
    });
    setShowCreateAssignment(false);
    setNewAssignment({
      courseId: activeCourse?.id || '',
      courseCode: activeCourse?.code || '',
      title: '',
      description: '',
      maxScore: 30,
      dueDate: '2026-10-25',
      assignedBy: currentUser.name,
    });
  };

  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (gradingAssignmentId && gradingSubId) {
      gradeAssignment(gradingAssignmentId, gradingSubId, gradeScore, gradeFeedback);
      setGradingSubId(null);
      setGradingAssignmentId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* OVERVIEW */}
      {(activeTab === 'overview' || !activeTab) && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block">
                Lecturer & Faculty Terminal
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Coursework Delivery & Class Management
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Instructor: <strong>{currentUser.name}</strong> · {currentUser.department}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAttendanceModal(true)}
                className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Take Attendance</span>
              </button>
              <button
                onClick={() => {
                  setSelectedCourseForGrade(activeCourse);
                  setShowGradeModal(true);
                }}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Award className="w-3.5 h-3.5 text-blue-700" />
                <span>Enter Grades</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 block">Assigned Courses</span>
              <span className="text-2xl font-black font-mono text-slate-900 tabular-nums">{myCourses.length}</span>
              <span className="text-xs text-blue-700 block mt-1">First Semester</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 block">Uploaded Study Materials</span>
              <span className="text-2xl font-black font-mono text-slate-900 tabular-nums">{materials.length}</span>
              <span className="text-xs text-emerald-700 block mt-1">PDFs, Code & Slides</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 block">Pending Assignments</span>
              <span className="text-2xl font-black font-mono text-slate-900 tabular-nums">{assignments.length}</span>
              <span className="text-xs text-amber-700 block mt-1">Continuous Assessment</span>
            </div>
          </div>

          {/* My Courses List */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">My Assigned Courses & Class Rosters</h3>
              <span className="text-xs text-slate-500">{myCourses.length} Courses Total</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myCourses.map((crs) => (
                <div key={crs.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                      {crs.code}
                    </span>
                    <span className="font-semibold text-slate-600 font-mono">{crs.credits} Units</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{crs.title}</h4>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{crs.syllabus}</p>
                  
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">{crs.scheduleDay}</span>
                    <button
                      onClick={() => {
                        setSelectedCourseForGrade(crs);
                        setShowGradeModal(true);
                      }}
                      className="text-xs font-semibold text-blue-700 hover:text-blue-900"
                    >
                      Grade Class &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MY COURSES TAB */}
      {activeTab === 'my_courses' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Assigned Courses & Curriculum Syllabus</h2>
              <p className="text-xs text-slate-500">Scheduled classroom teaching and lab modules</p>
            </div>
          </div>

          <div className="space-y-4">
            {myCourses.map((crs) => (
              <div key={crs.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-mono font-bold text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded-md mr-2">
                      {crs.code}
                    </span>
                    <span className="font-bold text-sm text-slate-900">{crs.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowAttendanceModal(true)}
                      className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100"
                    >
                      Attendance
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCourseForGrade(crs);
                        setShowGradeModal(true);
                      }}
                      className="px-3 py-1.5 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800"
                    >
                      Enter Grades
                    </button>
                  </div>
                </div>

                <p className="text-slate-600 text-xs leading-relaxed">{crs.syllabus}</p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-600">
                  <div>Programme: <strong>{crs.programmeName}</strong></div>
                  <div>Schedule: <strong>{crs.scheduleDay} ({crs.scheduleTime})</strong></div>
                  <div>Venue: <strong>{crs.venue}</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ATTENDANCE TAB */}
      {activeTab === 'attendance' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Attendance Register & Audit</h2>
              <p className="text-xs text-slate-500">Recorded lecture attendance sessions</p>
            </div>
            <button
              onClick={() => setShowAttendanceModal(true)}
              className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Mark New Session Attendance</span>
            </button>
          </div>

          <div className="space-y-4">
            {attendanceSessions.map((session) => (
              <div key={session.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-3">
                <div className="flex justify-between items-center">
                  <div className="font-bold text-slate-900">{session.sessionTitle}</div>
                  <span className="font-mono text-slate-500">{session.date}</span>
                </div>
                <div className="text-[11px] text-slate-600">
                  Course: <strong>{session.courseCode}</strong> · Taken by: {session.lecturerName}
                </div>

                {/* Roll preview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-2 border-t border-slate-200/60">
                  {session.records.map((rec, idx) => (
                    <div key={idx} className="p-2 bg-white rounded border border-slate-200 flex items-center justify-between">
                      <span className="font-medium text-slate-800 truncate mr-2">{rec.studentName}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                          rec.status === 'present'
                            ? 'bg-emerald-50 text-emerald-700'
                            : rec.status === 'late'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {rec.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LEARNING MATERIALS TAB */}
      {activeTab === 'materials' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Learning Materials & Handouts Hub</h2>
              <p className="text-xs text-slate-500">Upload lecture PDFs, slides, code repositories, and notes</p>
            </div>
            <button
              onClick={() => setShowUploadMaterial(true)}
              className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Learning Resource</span>
            </button>
          </div>

          <div className="space-y-3">
            {materials.map((mat) => (
              <div key={mat.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                      {mat.courseCode}
                    </span>
                    <span className="font-bold text-slate-900">{mat.title}</span>
                    {mat.storagePath && (
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>Private Storage (Signed Link)</span>
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{mat.description}</p>
                  <div className="text-slate-400 text-[10px] flex items-center gap-3 pt-1">
                    <span>Uploaded: {mat.uploadDate}</span>
                    <span>Size: {mat.fileSize}</span>
                    <span>By: {mat.uploadedBy}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (mat.storagePath) {
                        downloadFileByPath(mat.storagePath, mat.title);
                      } else if (mat.downloadUrl && mat.downloadUrl.startsWith('http')) {
                        window.open(mat.downloadUrl, '_blank', 'noopener,noreferrer');
                      } else {
                        // Fallback sample file download simulation
                        const blob = new Blob([`Resource content for ${mat.title} (${mat.courseCode})`], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = mat.title.replace(/\s+/g, '_') + '.txt';
                        a.click();
                        URL.revokeObjectURL(url);
                      }
                    }}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Download resource securely with Supabase signed URL"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-700" />
                    <span>Download</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteMaterialItem(mat.id)}
                    disabled={deletingMaterialId === mat.id}
                    className="p-1.5 text-slate-400 hover:text-red-700 rounded transition-colors cursor-pointer"
                    title="Delete Resource from Supabase Storage"
                  >
                    {deletingMaterialId === mat.id ? (
                      <Loader2 className="w-4 h-4 text-red-600 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ASSIGNMENTS TAB */}
      {activeTab === 'assignments' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Continuous Assessment & Assignments</h2>
              <p className="text-xs text-slate-500">Course projects, student submissions, and grading</p>
            </div>
            <button
              onClick={() => setShowCreateAssignment(true)}
              className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Assignment</span>
            </button>
          </div>

          <div className="space-y-6">
            {assignments.map((asg) => (
              <div key={asg.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono font-bold text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded-md mr-2">
                      {asg.courseCode}
                    </span>
                    <span className="font-bold text-sm text-slate-900">{asg.title}</span>
                  </div>
                  <span className="font-mono text-slate-500">Due: {asg.dueDate} (Max {asg.maxScore} marks)</span>
                </div>

                <p className="text-slate-700 text-xs leading-relaxed">{asg.description}</p>

                {/* Submissions Section */}
                <div className="pt-3 border-t border-slate-200 space-y-3">
                  <div className="font-bold text-slate-800 text-xs flex justify-between">
                    <span>Student Submissions ({asg.submissions.length})</span>
                  </div>

                  {asg.submissions.length === 0 ? (
                    <div className="text-slate-400 italic text-[11px]">No student submissions yet.</div>
                  ) : (
                    <div className="space-y-2">
                      {asg.submissions.map((sub) => (
                        <div key={sub.id} className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="font-bold text-slate-900 mr-2">{sub.studentName}</span>
                              <span className="font-mono text-blue-900 text-[11px]">{sub.matricNumber}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {sub.status === 'graded' ? (
                                <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                                  Graded: {sub.score}/{asg.maxScore}
                                </span>
                              ) : (
                                <button
                                  onClick={() => {
                                    setGradingAssignmentId(asg.id);
                                    setGradingSubId(sub.id);
                                    setGradeScore(25);
                                  }}
                                  className="px-2.5 py-1 bg-blue-700 text-white font-semibold rounded text-[11px] hover:bg-blue-800"
                                >
                                  Grade Submission
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="p-2 bg-slate-50 rounded text-slate-700 text-[11px]">
                            {sub.content}
                          </div>

                          {sub.attachmentName && (
                            <div className="text-[10px] text-blue-700 font-mono">
                              📎 Attached: {sub.attachmentName}
                            </div>
                          )}

                          {sub.feedback && (
                            <div className="text-[11px] text-slate-600 bg-blue-50/50 p-2 rounded border border-blue-100">
                              Feedback: <em>{sub.feedback}</em>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QUIZZES TAB */}
      {activeTab === 'quizzes' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Quizzes & Online Assessment Center</h2>
              <p className="text-xs text-slate-500">Computer Based Testing (CBT) modules and student attempts</p>
            </div>
          </div>

          <div className="space-y-4">
            {quizzes.map((quiz) => (
              <div key={quiz.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono font-bold text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded-md mr-2">
                      {quiz.courseCode}
                    </span>
                    <span className="font-bold text-sm text-slate-900">{quiz.title}</span>
                  </div>
                  <span className="font-mono text-slate-500">Duration: {quiz.durationMinutes} mins · {quiz.questions.length} Questions</span>
                </div>

                {/* Attempts */}
                <div className="pt-3 border-t border-slate-200 space-y-2">
                  <div className="font-bold text-slate-800">Student Attempts ({quiz.attempts.length})</div>
                  {quiz.attempts.map((att, idx) => (
                    <div key={idx} className="p-2.5 bg-white rounded-lg border border-slate-200 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-slate-900 mr-2">{att.studentName}</span>
                        <span className="font-mono text-slate-500 text-[11px]">{att.matricNumber}</span>
                      </div>
                      <div className="font-mono font-bold text-blue-900">
                        {att.score}/{att.totalQuestions} ({att.percentage}%)
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* GRADE ENTRY TAB */}
      {activeTab === 'grade_entry' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Continuous Assessment & Final Grade Entry</h2>
              <p className="text-xs text-slate-500">Record CA (30%) and Exam (70%) scores for grading sheets</p>
            </div>
            <button
              onClick={() => {
                setSelectedCourseForGrade(activeCourse);
                setShowGradeModal(true);
              }}
              className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Enter New Student Grade</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Student Name</th>
                  <th className="py-2.5 px-3 font-semibold">Matric No</th>
                  <th className="py-2.5 px-3 font-semibold">Course Code</th>
                  <th className="py-2.5 px-2 text-center font-semibold">CA (30)</th>
                  <th className="py-2.5 px-2 text-center font-semibold">Exam (70)</th>
                  <th className="py-2.5 px-2 text-center font-semibold">Total (100)</th>
                  <th className="py-2.5 px-2 text-center font-semibold">Grade</th>
                  <th className="py-2.5 px-3 font-semibold">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{res.studentName}</td>
                    <td className="py-2.5 px-3 font-mono text-blue-900">{res.matricNumber}</td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">{res.courseCode}</td>
                    <td className="py-2.5 px-2 text-center font-mono tabular-nums">{res.caScore}</td>
                    <td className="py-2.5 px-2 text-center font-mono tabular-nums">{res.examScore}</td>
                    <td className="py-2.5 px-2 text-center font-mono font-bold tabular-nums text-slate-900">{res.totalScore}</td>
                    <td className="py-2.5 px-2 text-center font-black text-blue-950 font-mono">{res.grade}</td>
                    <td className="py-2.5 px-3 text-slate-500 text-[11px] truncate max-w-xs">{res.remarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* UPLOAD MATERIAL MODAL */}
      {showUploadMaterial && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Upload Learning Resource</h3>
                <span className="text-[11px] text-slate-500">Destination: Supabase Storage (app-files/{currentUser.id}/materials)</span>
              </div>
              <span className="px-2 py-0.5 bg-blue-50 text-blue-800 rounded font-mono text-[10px] font-bold">
                Private Bucket
              </span>
            </div>

            {materialError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs">
                {materialError}
              </div>
            )}

            <form onSubmit={handleUploadMaterial} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Course *</label>
                <select
                  value={newMaterial.courseId}
                  onChange={(e) => setNewMaterial({ ...newMaterial, courseId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                >
                  {myCourses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code}: {c.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* File Picker */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Select Document / Archive File *
                </label>
                <div className="p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl hover:bg-slate-100 transition-colors">
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-700 file:text-white hover:file:bg-blue-800 cursor-pointer"
                    required={!newMaterial.title}
                  />
                  {materialFile && (
                    <div className="mt-2 text-[11px] text-emerald-800 flex items-center gap-1.5 font-medium">
                      <FileCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{materialFile.name} ({(materialFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Resource Title / Display Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Module 5: React Architecture.pdf"
                  value={newMaterial.title}
                  onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Resource Type</label>
                <select
                  value={newMaterial.type}
                  onChange={(e) => setNewMaterial({ ...newMaterial, type: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                >
                  <option value="pdf">PDF Document</option>
                  <option value="slides">Presentation Slides</option>
                  <option value="code">Source Code / Archive</option>
                  <option value="notes">Lecture Notes</option>
                  <option value="video">Instructional Video</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description / Summary</label>
                <textarea
                  rows={2}
                  value={newMaterial.description}
                  onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
                  placeholder="Brief summary of lecture concepts covered..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowUploadMaterial(false)}
                  disabled={isUploadingMaterial}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploadingMaterial}
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isUploadingMaterial ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Uploading to Supabase...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload & Sign URL</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE ASSIGNMENT MODAL */}
      {showCreateAssignment && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900">Create New Course Assignment</h3>
            <form onSubmit={handleCreateAssignment} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Course *</label>
                <select
                  value={newAssignment.courseId}
                  onChange={(e) => setNewAssignment({ ...newAssignment, courseId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                >
                  {myCourses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code}: {c.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description / Project Brief</label>
                <textarea
                  rows={3}
                  value={newAssignment.description}
                  onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max Score</label>
                  <input
                    type="number"
                    value={newAssignment.maxScore}
                    onChange={(e) => setNewAssignment({ ...newAssignment, maxScore: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newAssignment.dueDate}
                    onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateAssignment(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg"
                >
                  Publish Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GRADING SUBMISSION MODAL */}
      {gradingSubId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900">Grade Student Assignment Submission</h3>
            <form onSubmit={handleSaveGrade} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Score (Out of Max)</label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={gradeScore}
                  onChange={(e) => setGradeScore(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lecturer Feedback & Guidance</label>
                <textarea
                  rows={3}
                  value={gradeFeedback}
                  onChange={(e) => setGradeFeedback(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setGradingSubId(null);
                    setGradingAssignmentId(null);
                  }}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg"
                >
                  Save Grade & Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ATTENDANCE MODAL */}
      {showAttendanceModal && (
        <AttendanceRegisterModal
          course={activeCourse}
          onClose={() => setShowAttendanceModal(false)}
        />
      )}

      {/* GRADE ENTRY MODAL */}
      {showGradeModal && (
        <GradeEntryModal
          course={selectedCourseForGrade}
          onClose={() => setShowGradeModal(false)}
        />
      )}

    </div>
  );
};
