import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { User, UserRole } from '../../types';
import {
  Users,
  GraduationCap,
  BookOpen,
  Wallet,
  ShieldAlert,
  Settings,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  Download,
  Building,
  Layers,
  Save,
  RotateCcw,
  BarChart3,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react';
import { AnalyticsDashboard } from './AnalyticsDashboard';

interface SuperAdminDashboardProps {
  activeTab: string;
  setActiveTab?: (tab: string) => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ activeTab, setActiveTab }) => {
  const {
    students,
    allUsers,
    courses,
    invoices,
    applications,
    departments,
    programmes,
    auditLogs,
    schoolInfo,
    updateSchoolInfo,
    addUser,
    updateUser,
    deleteUser,
    addCourse,
    addDepartment,
    addProgramme,
    resetToDefaults,
  } = useSchool();

  // Metrics
  const totalStudents = students.length;
  const totalFaculty = allUsers.filter((u) => u.role === 'lecturer' || u.role === 'school_admin').length;
  const totalCourses = courses.length;
  const totalRevenue = invoices.reduce((acc, inv) => acc + inv.amountPaid, 0);
  const pendingApplications = applications.filter((a) => a.status === 'pending' || a.status === 'under_review').length;

  // New user form state
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState<Partial<User>>({
    name: '',
    email: '',
    role: 'lecturer',
    department: 'School of Computing & Software Engineering',
    phone: '',
  });

  // New course form state
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [newCourse, setNewCourse] = useState({
    code: '',
    title: '',
    programmeId: programmes[0]?.id || '',
    credits: 3,
    lecturerId: allUsers.find((u) => u.role === 'lecturer')?.id || '',
    lecturerName: allUsers.find((u) => u.role === 'lecturer')?.name || 'Engr. Chidi Okafor',
    semester: 'First Semester',
    scheduleDay: 'Monday & Wednesday',
    scheduleTime: '10:00 AM - 12:00 PM',
    venue: 'Innovation Tech Lab 1',
    syllabus: 'Introduction to fundamentals and core industry practice.',
  });

  // Settings form state
  const [settingsForm, setSettingsForm] = useState(schoolInfo);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSchoolInfo(settingsForm);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;
    addUser(newUser);
    setShowAddUserModal(false);
    setNewUser({
      name: '',
      email: '',
      role: 'lecturer',
      department: 'School of Computing & Software Engineering',
      phone: '',
    });
  };

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    const prog = programmes.find((p) => p.id === newCourse.programmeId) || programmes[0];
    addCourse({
      ...newCourse,
      programmeName: prog.name,
    });
    setShowAddCourseModal(false);
    setNewCourse({
      code: '',
      title: '',
      programmeId: programmes[0]?.id || '',
      credits: 3,
      lecturerId: allUsers.find((u) => u.role === 'lecturer')?.id || '',
      lecturerName: allUsers.find((u) => u.role === 'lecturer')?.name || 'Engr. Chidi Okafor',
      semester: 'First Semester',
      scheduleDay: 'Monday & Wednesday',
      scheduleTime: '10:00 AM - 12:00 PM',
      venue: 'Innovation Tech Lab 1',
      syllabus: 'Introduction to fundamentals and core industry practice.',
    });
  };

  const exportAuditLogsCsv = () => {
    const headers = ['ID', 'Timestamp', 'Actor Name', 'Actor Role', 'Category', 'Action', 'Details'];
    const rows = auditLogs.map((l) => [
      l.id,
      `"${l.timestamp}"`,
      `"${l.actorName}"`,
      `"${l.actorRole}"`,
      l.category,
      `"${l.action}"`,
      `"${l.details}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `JSMT_Audit_Log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* OVERVIEW TAB */}
      {(activeTab === 'overview' || !activeTab) && (
        <div className="space-y-6">
          {/* Welcome Kicker */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <span className="text-xs font-bold text-purple-700 uppercase tracking-wider block">
                Super Administrator Terminal
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                System Governance & Institutional Overview
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Centralized control of users, course curriculum, fees, and audit logging for Jaroy School of Management and Technology.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddUserModal(true)}
                className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add User Account</span>
              </button>
            </div>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Enrolled Students</span>
                <GraduationCap className="w-4 h-4 text-blue-600" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-slate-900 tabular-nums">{totalStudents}</span>
                <span className="text-xs text-emerald-600 font-medium">Active Cohorts</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Faculty & Staff</span>
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-slate-900 tabular-nums">{allUsers.length}</span>
                <span className="text-xs text-slate-500">All Roles</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Total Collections</span>
                <Wallet className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black font-mono text-slate-900 tabular-nums">
                  ₦{totalRevenue.toLocaleString()}
                </span>
                <span className="block text-[11px] text-slate-400 mt-0.5">Verified Revenue</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Pending Applications</span>
                <ShieldAlert className="w-4 h-4 text-amber-600" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-slate-900 tabular-nums">{pendingApplications}</span>
                <span className="text-xs text-amber-700 font-medium">Awaiting Review</span>
              </div>
            </div>
          </div>

          {/* Institutional Analytics Spotlight Banner */}
          <div className="bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-blue-300 text-xs font-semibold uppercase tracking-wider">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                <span>Executive Decision Support</span>
                <span aria-hidden="true">·</span>
                <span>Active Analytics</span>
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Institutional Performance & Analytics Engine
              </h3>
              <p className="text-xs text-slate-300 max-w-xl">
                Explore student enrollment trajectories (+23.7% YoY), course popularity and lab utilization rates, faculty teaching scorecards, and bursary revenue collection rates.
              </p>
            </div>
            <button
              onClick={() => setActiveTab?.('analytics')}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 shrink-0 self-start md:self-center"
            >
              <span>Explore Analytics Dashboard</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Department & Programmes Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Academic Departments ({departments.length})</h3>
                <span className="text-xs text-blue-700 font-semibold">{programmes.length} Programmes</span>
              </div>
              <div className="space-y-3">
                {departments.map((dept) => (
                  <div key={dept.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                    <div className="flex justify-between items-center font-bold text-slate-900">
                      <span>{dept.name}</span>
                      <span className="font-mono text-blue-900">{dept.code}</span>
                    </div>
                    <div className="text-slate-500 text-[11px] mt-1">HOD: {dept.headOfDepartment}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Recent System Audit Events</h3>
                <button
                  onClick={exportAuditLogsCsv}
                  className="text-xs text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download CSV</span>
                </button>
              </div>
              <div className="space-y-2.5">
                {auditLogs.slice(0, 4).map((log) => (
                  <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900">{log.action}</span>
                      <span className="text-[10px] font-mono text-slate-400">{log.timestamp.slice(11)}</span>
                    </div>
                    <div className="text-slate-600 text-[11px] mt-0.5">{log.details}</div>
                    <div className="text-[10px] text-slate-400 mt-1">By {log.actorName} ({log.actorRole})</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <AnalyticsDashboard initialRoleFilter="all" />
      )}

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">User & Staff Accounts Management</h2>
              <p className="text-xs text-slate-500">
                Manage roles, activate/suspend credentials, and provision institutional accounts.
              </p>
            </div>
            <button
              onClick={() => setShowAddUserModal(true)}
              className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New User</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">User Details</th>
                  <th className="py-3 px-3 font-semibold">Role</th>
                  <th className="py-3 px-3 font-semibold">Department / School</th>
                  <th className="py-3 px-3 font-semibold">ID / Matric</th>
                  <th className="py-3 px-3 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{user.name}</div>
                      <div className="text-slate-500 text-[11px]">{user.email}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-blue-900 capitalize">
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 truncate max-w-xs">{user.department}</td>
                    <td className="py-3 px-3 font-mono text-slate-800">{user.staffId || user.studentId || '-'}</td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() =>
                          updateUser(user.id, {
                            status: user.status === 'active' ? 'suspended' : 'active',
                          })
                        }
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          user.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-red-50 text-red-700 hover:bg-red-100'
                        }`}
                      >
                        {user.status === 'active' ? 'Active' : 'Suspended'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="p-1.5 text-slate-400 hover:text-red-700 rounded transition-colors"
                        title="Deactivate Account"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PROGRAMMES & DEPTS TAB */}
      {activeTab === 'programmes' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Academic Programmes Catalog</h2>
                <p className="text-xs text-slate-500">Accredited diplomas and certificate programmes</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {programmes.map((p) => (
                <div key={p.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                      {p.code}
                    </span>
                    <span className="text-slate-500">{p.duration}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm leading-snug">{p.name}</h4>
                  <p className="text-slate-600 text-[11px]">{p.award}</p>
                  <div className="pt-2 border-t border-slate-200/60 flex justify-between items-center">
                    <span className="text-slate-500">Term Tuition:</span>
                    <span className="font-mono font-bold text-slate-900 tabular-nums">
                      ₦{p.tuitionPerTerm.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* COURSES TAB */}
      {activeTab === 'courses' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Course Catalog & Allocation</h2>
              <p className="text-xs text-slate-500">Manage curriculum courses and assigned lecturers</p>
            </div>
            <button
              onClick={() => setShowAddCourseModal(true)}
              className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Course</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map((crs) => (
              <div key={crs.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                    {crs.code}
                  </span>
                  <span className="text-slate-500 font-mono font-semibold">{crs.credits} Units</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{crs.title}</h4>
                <div className="text-slate-600 text-[11px]">
                  Lecturer: <strong>{crs.lecturerName}</strong>
                </div>
                <div className="text-slate-500 text-[11px]">
                  Schedule: {crs.scheduleDay} ({crs.scheduleTime})
                </div>
                <div className="text-slate-500 text-[11px]">
                  Venue: {crs.venue}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FINANCE OVERVIEW TAB */}
      {activeTab === 'finance_overview' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Institutional Financial Control</h2>
            <p className="text-xs text-slate-500">Revenue aggregation and fee collections breakdown</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 block">Total Invoiced</span>
              <span className="text-xl font-bold font-mono text-slate-900 tabular-nums">
                ₦{invoices.reduce((a, b) => a + b.amount, 0).toLocaleString()}
              </span>
            </div>
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-xs text-emerald-800 block">Total Received</span>
              <span className="text-xl font-bold font-mono text-emerald-900 tabular-nums">
                ₦{totalRevenue.toLocaleString()}
              </span>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
              <span className="text-xs text-amber-800 block">Outstanding Receivables</span>
              <span className="text-xl font-bold font-mono text-amber-900 tabular-nums">
                ₦{invoices.reduce((a, b) => a + b.balance, 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* AUDIT LOGS TAB */}
      {activeTab === 'audit_logs' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Security & Operational Audit Trail</h2>
              <p className="text-xs text-slate-500">Immutable ledger of administrative actions and timestamps</p>
            </div>
            <button
              onClick={exportAuditLogsCsv}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Timestamp</th>
                  <th className="py-2.5 px-3 font-semibold">Actor</th>
                  <th className="py-2.5 px-2 font-semibold">Category</th>
                  <th className="py-2.5 px-3 font-semibold">Action</th>
                  <th className="py-2.5 px-4 font-semibold">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-mono text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{log.actorName}</td>
                    <td className="py-2.5 px-2 font-mono text-[10px] text-blue-900">{log.category}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-800">{log.action}</td>
                    <td className="py-2.5 px-4 text-slate-600">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Institutional Configuration</h2>
              <p className="text-xs text-slate-500">Manage school name, current semester, and leadership details</p>
            </div>
            {settingsSaved && (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg">
                Settings Successfully Saved
              </span>
            )}
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 max-w-2xl text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">School Full Name</label>
              <input
                type="text"
                value={settingsForm.name}
                onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Current Academic Session</label>
                <input
                  type="text"
                  value={settingsForm.currentSession}
                  onChange={(e) => setSettingsForm({ ...settingsForm, currentSession: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Current Semester</label>
                <input
                  type="text"
                  value={settingsForm.currentSemester}
                  onChange={(e) => setSettingsForm({ ...settingsForm, currentSemester: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Campus Physical Address</label>
              <input
                type="text"
                value={settingsForm.address}
                onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rector / Director</label>
                <input
                  type="text"
                  value={settingsForm.rectorName}
                  onChange={(e) => setSettingsForm({ ...settingsForm, rectorName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Registrar</label>
                <input
                  type="text"
                  value={settingsForm.registrarName}
                  onChange={(e) => setSettingsForm({ ...settingsForm, registrarName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-200">
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save School Information</span>
              </button>

              <button
                type="button"
                onClick={resetToDefaults}
                className="px-4 py-2 text-red-700 hover:bg-red-50 rounded-xl transition-colors font-semibold flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Demo Database</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CREATE USER MODAL */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Create New Institutional User Account</h3>
            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Institutional Email *</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                >
                  <option value="lecturer">Lecturer / Instructor</option>
                  <option value="school_admin">School Administrator</option>
                  <option value="student">Student</option>
                  <option value="finance_officer">Finance Officer / Bursar</option>
                  <option value="registrar">Admission Officer / Registrar</option>
                  <option value="super_admin">Super Administrator</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  value={newUser.department}
                  onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE COURSE MODAL */}
      {showAddCourseModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Add New Curriculum Course</h3>
            <form onSubmit={handleCreateCourse} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Course Code *</label>
                  <input
                    type="text"
                    placeholder="e.g. SWE-205"
                    value={newCourse.code}
                    onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Credits</label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={newCourse.credits}
                    onChange={(e) => setNewCourse({ ...newCourse, credits: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Course Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Cloud Native Engineering with Docker"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Programme</label>
                <select
                  value={newCourse.programmeId}
                  onChange={(e) => setNewCourse({ ...newCourse, programmeId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                >
                  {programmes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Venue</label>
                <input
                  type="text"
                  value={newCourse.venue}
                  onChange={(e) => setNewCourse({ ...newCourse, venue: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddCourseModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg"
                >
                  Create Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
