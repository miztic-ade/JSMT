import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { StudentProfile, Course } from '../../types';
import {
  GraduationCap,
  Users,
  BookOpen,
  CalendarDays,
  Award,
  Bell,
  Download,
  Plus,
  Search,
  Filter,
  CheckCircle,
  FileSpreadsheet,
  Clock,
  Printer,
  ChevronRight,
  BarChart3,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react';
import { StudentIdCardModal } from '../modals/StudentIdCardModal';
import { TranscriptModal } from '../modals/TranscriptModal';
import { AnalyticsDashboard } from './AnalyticsDashboard';

interface SchoolAdminDashboardProps {
  activeTab: string;
  setActiveTab?: (tab: string) => void;
}

export const SchoolAdminDashboard: React.FC<SchoolAdminDashboardProps> = ({ activeTab, setActiveTab }) => {
  const {
    students,
    allUsers,
    courses,
    results,
    announcements,
    publishResultsBatch,
    schoolInfo,
    addAnnouncement,
  } = useSchool();

  const lecturers = allUsers.filter((u) => u.role === 'lecturer');

  // Search & filter states
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudentForId, setSelectedStudentForId] = useState<StudentProfile | null>(null);
  const [selectedStudentForTranscript, setSelectedStudentForTranscript] = useState<StudentProfile | null>(null);

  // New announcement form state
  const [showAddNotice, setShowAddNotice] = useState(false);
  const [newNotice, setNewNotice] = useState({
    title: '',
    content: '',
    category: 'academic' as const,
    targetAudience: 'all' as const,
    author: 'Academic Affairs Office',
  });

  const filteredStudents = students.filter(
    (s) =>
      s.fullName.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.studentId.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.programmeName.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotice.title) return;
    addAnnouncement(newNotice);
    setShowAddNotice(false);
    setNewNotice({
      title: '',
      content: '',
      category: 'academic',
      targetAudience: 'all',
      author: 'Academic Affairs Office',
    });
  };

  const exportStudentsCsv = () => {
    const headers = ['Student ID / Matric', 'Full Name', 'Programme', 'Level', 'Phone', 'Email', 'Current GPA'];
    const rows = students.map((s) => [
      `"${s.studentId}"`,
      `"${s.fullName}"`,
      `"${s.programmeName}"`,
      `"${s.level}"`,
      `"${s.phone}"`,
      `"${s.email}"`,
      s.currentGPA.toFixed(2),
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `JSMT_Student_Directory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* OVERVIEW */}
      {(activeTab === 'overview' || !activeTab) && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">
                Academic Affairs Directorate
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Academic Administration & Student Affairs
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Overseeing class allocations, student registers, and academic progress at Idi Aba Campus.
              </p>
            </div>
            <button
              onClick={exportStudentsCsv}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Student Registry CSV</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 block">Registered Students</span>
              <span className="text-2xl font-black font-mono text-slate-900 tabular-nums">{students.length}</span>
              <span className="text-xs text-emerald-700 block mt-1">Verified Matriculants</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 block">Faculty Lecturers</span>
              <span className="text-2xl font-black font-mono text-slate-900 tabular-nums">{lecturers.length}</span>
              <span className="text-xs text-blue-700 block mt-1">Active Instructors</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 block">Active Courses</span>
              <span className="text-2xl font-black font-mono text-slate-900 tabular-nums">{courses.length}</span>
              <span className="text-xs text-purple-700 block mt-1">{schoolInfo.currentSemester}</span>
            </div>
          </div>

          {/* Quick Timetable & Hall Schedules */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Current Academic Timetable & Lecture Venues</h3>
              <span className="text-xs text-slate-500">{schoolInfo.currentSession}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.slice(0, 6).map((crs) => (
                <div key={crs.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-blue-900">{crs.code}</span>
                    <span className="text-slate-500">{crs.credits} Units</span>
                  </div>
                  <div className="font-bold text-slate-900 leading-tight">{crs.title}</div>
                  <div className="text-[11px] text-slate-600">Lecturer: {crs.lecturerName}</div>
                  <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                    <span>{crs.scheduleDay}</span>
                    <span className="font-medium text-slate-700">{crs.scheduleTime}</span>
                  </div>
                  <div className="text-[10px] text-blue-800 font-medium">📍 {crs.venue}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Academic & Faculty Analytics Highlight Banner */}
          <div className="bg-linear-to-r from-blue-900 via-slate-900 to-indigo-950 text-white p-6 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-blue-300 text-xs font-semibold uppercase tracking-wider">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                <span>Academic & Faculty Analytics</span>
                <span aria-hidden="true">·</span>
                <span>JSMT Institutional Intelligence</span>
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Student Enrollment Trajectories, Course Popularity & Staff Activity
              </h3>
              <p className="text-xs text-slate-300 max-w-xl">
                Inspect semester-by-semester matriculant volume, track lecture hall capacity utilization, review faculty lab sessions held, and monitor continuous assessment grading compliance.
              </p>
            </div>
            <button
              onClick={() => setActiveTab?.('analytics')}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-2 shrink-0 self-start md:self-center"
            >
              <span>View Academic Analytics</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <AnalyticsDashboard initialRoleFilter="admin" />
      )}

      {/* STUDENTS DIRECTORY */}
      {activeTab === 'students' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Enrolled Students Directory</h2>
              <p className="text-xs text-slate-500">View student records, generate ID cards, and inspect transcripts</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search student or matric..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 w-56 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={exportStudentsCsv}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Student Name</th>
                  <th className="py-3 px-3 font-semibold">Matric Number</th>
                  <th className="py-3 px-3 font-semibold">Programme</th>
                  <th className="py-3 px-3 font-semibold">Level / Cohort</th>
                  <th className="py-3 px-2 font-semibold">GPA</th>
                  <th className="py-3 px-4 font-semibold text-right">Documents</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((stud) => (
                  <tr key={stud.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{stud.fullName}</div>
                      <div className="text-slate-500 text-[11px]">{stud.email} · {stud.phone}</div>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-blue-900">{stud.studentId}</td>
                    <td className="py-3 px-3 text-slate-700">{stud.programmeName}</td>
                    <td className="py-3 px-3 text-slate-600">{stud.level}</td>
                    <td className="py-3 px-2 font-mono font-bold text-slate-900 tabular-nums">
                      {stud.currentGPA.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedStudentForId(stud)}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-md text-[11px] transition-colors"
                      >
                        ID Card
                      </button>
                      <button
                        onClick={() => setSelectedStudentForTranscript(stud)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-md text-[11px] transition-colors"
                      >
                        Transcript
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* LECTURERS TAB */}
      {activeTab === 'lecturers' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Academic Faculty & Lecturers</h2>
            <p className="text-xs text-slate-500">Qualified instructional staff and subject matter experts</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lecturers.map((lec) => (
              <div key={lec.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-900 text-white font-bold flex items-center justify-center">
                    {lec.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{lec.name}</div>
                    <div className="font-mono text-blue-900 text-[11px]">{lec.staffId}</div>
                  </div>
                </div>
                <div className="text-slate-600 text-[11px] pt-1">
                  Department: <strong className="text-slate-800">{lec.department}</strong>
                </div>
                <div className="text-slate-500 text-[11px]">
                  Email: {lec.email}
                </div>
                <div className="text-slate-500 text-[11px]">
                  Phone: {lec.phone}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TIMETABLE TAB */}
      {activeTab === 'timetable' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Master Lecture & Examination Timetable</h2>
            <p className="text-xs text-slate-500">Idi Aba Campus Weekly Lecture Schedules</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map((crs) => (
              <div key={crs.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-blue-900">{crs.code}</span>
                  <span className="text-slate-500">{crs.scheduleDay}</span>
                </div>
                <div className="font-bold text-slate-900 text-sm">{crs.title}</div>
                <div className="text-slate-600">Time: <strong className="text-slate-800">{crs.scheduleTime}</strong></div>
                <div className="text-slate-600">Venue: <strong className="text-slate-800">{crs.venue}</strong></div>
                <div className="text-slate-500 text-[11px]">Lecturer: {crs.lecturerName}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RESULTS & TRANSCRIPTS TAB */}
      {activeTab === 'results' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Academic Examination Results</h2>
              <p className="text-xs text-slate-500">Published grades for {schoolInfo.currentSession}</p>
            </div>
            <button
              onClick={() => publishResultsBatch(schoolInfo.currentSemester, schoolInfo.currentSession.slice(0, 9))}
              className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs"
            >
              Publish All Grades for Semester
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Student Name</th>
                  <th className="py-2.5 px-3 font-semibold">Matric No</th>
                  <th className="py-2.5 px-3 font-semibold">Course Code</th>
                  <th className="py-2.5 px-2 text-center font-semibold">CA</th>
                  <th className="py-2.5 px-2 text-center font-semibold">Exam</th>
                  <th className="py-2.5 px-2 text-center font-semibold">Total</th>
                  <th className="py-2.5 px-2 text-center font-semibold">Grade</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
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
                    <td className="py-2.5 px-2 text-center font-mono font-bold tabular-nums">{res.totalScore}</td>
                    <td className="py-2.5 px-2 text-center font-black text-blue-950 font-mono">{res.grade}</td>
                    <td className="py-2.5 px-3">
                      <span className="text-[11px] text-emerald-700 font-semibold">
                        {res.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ANNOUNCEMENTS TAB */}
      {activeTab === 'announcements' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Institutional Notices & Circulars</h2>
              <p className="text-xs text-slate-500">Official bulletins sent to students and faculty</p>
            </div>
            <button
              onClick={() => setShowAddNotice(true)}
              className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Announcement</span>
            </button>
          </div>

          <div className="space-y-4">
            {announcements.map((ann) => (
              <div key={ann.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-slate-900 text-sm">{ann.title}</h4>
                  <span className="font-mono text-[11px] text-slate-500">{ann.date}</span>
                </div>
                <p className="text-slate-700 leading-relaxed">{ann.content}</p>
                <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
                  Signed: <strong>{ann.author}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE NOTICE MODAL */}
      {showAddNotice && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900">Post Official Institutional Notice</h3>
            <form onSubmit={handleCreateNotice} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={newNotice.title}
                  onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notice Content *</label>
                <textarea
                  rows={4}
                  value={newNotice.content}
                  onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddNotice(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg"
                >
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALS */}
      {selectedStudentForId && (
        <StudentIdCardModal
          student={selectedStudentForId}
          onClose={() => setSelectedStudentForId(null)}
        />
      )}

      {selectedStudentForTranscript && (
        <TranscriptModal
          student={selectedStudentForTranscript}
          results={results.filter((r) => r.studentId === selectedStudentForTranscript.id)}
          onClose={() => setSelectedStudentForTranscript(null)}
        />
      )}

    </div>
  );
};
