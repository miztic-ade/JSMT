import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  CalendarDays,
  FileSpreadsheet,
  Wallet,
  FileCheck2,
  Bell,
  Settings,
  ShieldAlert,
  Award,
  ClipboardList,
  FolderDown,
  Clock,
  IdCard,
  CreditCard,
  Building,
  Layers,
  ChevronLeft,
  ChevronRight,
  MapPin,
  BarChart3,
  TrendingUp,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
}) => {
  const { currentUser, schoolInfo } = useSchool();

  interface NavItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    badgeCount?: number;
  }

  const getNavItems = (): NavItem[] => {
    switch (currentUser.role) {
      case 'super_admin':
        return [
          { id: 'overview', label: 'Executive Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
          { id: 'analytics', label: 'Institutional Analytics', icon: <BarChart3 className="w-4 h-4" /> },
          { id: 'users', label: 'User & Staff Accounts', icon: <Users className="w-4 h-4" /> },
          { id: 'programmes', label: 'Programmes & Depts', icon: <Layers className="w-4 h-4" /> },
          { id: 'courses', label: 'Course Catalog & Allocation', icon: <BookOpen className="w-4 h-4" /> },
          { id: 'finance_overview', label: 'Financial Control', icon: <Wallet className="w-4 h-4" /> },
          { id: 'audit_logs', label: 'System Audit Logs', icon: <ShieldAlert className="w-4 h-4" /> },
          { id: 'settings', label: 'School Settings & Sessions', icon: <Settings className="w-4 h-4" /> },
        ];

      case 'school_admin':
        return [
          { id: 'overview', label: 'Administrative Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
          { id: 'analytics', label: 'Academic & Staff Analytics', icon: <BarChart3 className="w-4 h-4" /> },
          { id: 'students', label: 'Students Directory', icon: <GraduationCap className="w-4 h-4" /> },
          { id: 'lecturers', label: 'Lecturers & Faculty', icon: <Users className="w-4 h-4" /> },
          { id: 'courses', label: 'Courses & Curriculum', icon: <BookOpen className="w-4 h-4" /> },
          { id: 'timetable', label: 'Timetable & Venues', icon: <CalendarDays className="w-4 h-4" /> },
          { id: 'results', label: 'Results & Transcripts', icon: <Award className="w-4 h-4" /> },
          { id: 'announcements', label: 'Notices & Circulars', icon: <Bell className="w-4 h-4" /> },
        ];

      case 'lecturer':
        return [
          { id: 'overview', label: 'Instructor Hub', icon: <LayoutDashboard className="w-4 h-4" /> },
          { id: 'my_courses', label: 'My Assigned Courses', icon: <BookOpen className="w-4 h-4" /> },
          { id: 'attendance', label: 'Take Attendance', icon: <Clock className="w-4 h-4" /> },
          { id: 'materials', label: 'Learning Resources', icon: <FolderDown className="w-4 h-4" /> },
          { id: 'assignments', label: 'Assignments & Projects', icon: <ClipboardList className="w-4 h-4" /> },
          { id: 'quizzes', label: 'Quizzes & Tests', icon: <FileSpreadsheet className="w-4 h-4" /> },
          { id: 'grade_entry', label: 'Enter CA & Exam Grades', icon: <Award className="w-4 h-4" /> },
        ];

      case 'student':
        return [
          { id: 'overview', label: 'Student Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
          { id: 'my_courses', label: 'My Registered Courses', icon: <BookOpen className="w-4 h-4" /> },
          { id: 'materials', label: 'Learning Hub & Resources', icon: <FolderDown className="w-4 h-4" /> },
          { id: 'timetable', label: 'Timetable & Exam Halls', icon: <CalendarDays className="w-4 h-4" /> },
          { id: 'my_attendance', label: 'Attendance Records', icon: <Clock className="w-4 h-4" /> },
          { id: 'assignments', label: 'Coursework & Quizzes', icon: <ClipboardList className="w-4 h-4" /> },
          { id: 'results', label: 'Semester Results & Transcript', icon: <Award className="w-4 h-4" /> },
          { id: 'fees', label: 'Fees & Official Receipts', icon: <CreditCard className="w-4 h-4" /> },
          { id: 'id_card', label: 'Digital Student ID Card', icon: <IdCard className="w-4 h-4" /> },
          { id: 'profile', label: 'Student Profile & Records', icon: <Users className="w-4 h-4" /> },
        ];

      case 'finance_officer':
        return [
          { id: 'overview', label: 'Bursary Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
          { id: 'analytics', label: 'Financial Analytics & BI', icon: <TrendingUp className="w-4 h-4" /> },
          { id: 'invoices', label: 'Invoices & Fee Ledger', icon: <FileSpreadsheet className="w-4 h-4" /> },
          { id: 'record_payment', label: 'Record Verified Payment', icon: <Wallet className="w-4 h-4" /> },
          { id: 'overdue', label: 'Overdue & Defaulters', icon: <ShieldAlert className="w-4 h-4" /> },
          { id: 'fee_structures', label: 'Approved Fee Schedules', icon: <Building className="w-4 h-4" /> },
          { id: 'reports', label: 'Financial Summary Reports', icon: <Award className="w-4 h-4" /> },
        ];

      case 'registrar':
        return [
          { id: 'overview', label: 'Admissions Desk', icon: <LayoutDashboard className="w-4 h-4" /> },
          { id: 'applications', label: 'Application Pipeline', icon: <FileCheck2 className="w-4 h-4" /> },
          { id: 'verification', label: 'Credential Verification', icon: <ShieldAlert className="w-4 h-4" /> },
          { id: 'letters', label: 'Official Admission Letters', icon: <Award className="w-4 h-4" /> },
          { id: 'enrollment', label: 'Enrolled Matriculants', icon: <GraduationCap className="w-4 h-4" /> },
        ];

      default:
        return [{ id: 'overview', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> }];
    }
  };

  const navItems = getNavItems();

  return (
    <aside
      className={`fixed md:sticky top-16 z-30 h-[calc(100vh-4rem)] bg-slate-900 text-white flex flex-col justify-between transition-all duration-200 border-r border-slate-800 ${
        isCollapsed ? 'w-20' : 'w-64'
      } ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
    >
      {/* Top Section */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        
        {/* User Card */}
        <div className={`p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 ${isCollapsed ? 'text-center' : ''}`}>
          <div className="flex items-center gap-3">
            {currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-10 h-10 rounded-full object-cover shrink-0 border border-blue-400"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-600 font-bold text-white flex items-center justify-center shrink-0">
                {currentUser.name.charAt(0)}
              </div>
            )}
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <span className="block text-xs font-bold text-white truncate">
                  {currentUser.name}
                </span>
                <span className="block text-[11px] text-blue-300 font-medium capitalize">
                  {currentUser.role.replace('_', ' ')}
                </span>
                <span className="block text-[10px] text-slate-400 truncate">
                  {currentUser.staffId || currentUser.studentId || 'Faculty'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="space-y-1">
          {!isCollapsed && (
            <div className="px-3 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Navigation
            </div>
          )}

          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                } ${isCollapsed ? 'justify-center' : ''}`}
              >
                <span className={isActive ? 'text-white' : 'text-slate-400'}>
                  {item.icon}
                </span>
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info & Collapse Toggle */}
      <div className="p-3 border-t border-slate-800 space-y-2">
        {!isCollapsed && (
          <div className="px-2 py-1 text-[11px] text-slate-400 flex items-start gap-1.5">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-blue-400 mt-0.5" />
            <div className="leading-tight">
              <span className="block text-slate-300 font-medium">Idi Aba Campus</span>
              <span>Opposite Wonderful Direct Pharmacy, Abeokuta</span>
            </div>
          </div>
        )}

        {/* Collapse Toggle for Desktop */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex w-full items-center justify-center p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-xs"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <div className="flex items-center gap-2">
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse Sidebar</span>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};
