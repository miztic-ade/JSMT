import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { UserRole } from '../../types';
import {
  ShieldCheck,
  GraduationCap,
  Briefcase,
  Users,
  Wallet,
  FileCheck,
  ChevronDown,
  Building2,
  ExternalLink,
  RotateCcw,
  Bell,
  LogIn,
  LogOut,
} from 'lucide-react';
import { supabase } from '../../supabaseClient.js';
import { NotificationDrawer } from '../notifications/NotificationDrawer';

interface HeaderProps {
  onToggleSidebar: () => void;
  isPublicView: boolean;
  setIsPublicView: (val: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuth?: (mode: 'signin' | 'signup') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  isPublicView,
  setIsPublicView,
  activeTab,
  setActiveTab,
  onOpenAuth,
}) => {
  const { currentUser, switchRole, schoolInfo, resetToDefaults, unreadNotificationsCount } = useSchool();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);

  const roleLabels: Record<UserRole, { label: string; icon: React.ReactNode; color: string }> = {
    super_admin: { label: 'Super Admin', icon: <ShieldCheck className="w-4 h-4" />, color: 'text-purple-700 bg-purple-50' },
    school_admin: { label: 'School Admin', icon: <Building2 className="w-4 h-4" />, color: 'text-blue-700 bg-blue-50' },
    lecturer: { label: 'Lecturer', icon: <Briefcase className="w-4 h-4" />, color: 'text-amber-700 bg-amber-50' },
    student: { label: 'Student', icon: <GraduationCap className="w-4 h-4" />, color: 'text-emerald-700 bg-emerald-50' },
    finance_officer: { label: 'Finance Officer', icon: <Wallet className="w-4 h-4" />, color: 'text-indigo-700 bg-indigo-50' },
    registrar: { label: 'Admission Officer', icon: <FileCheck className="w-4 h-4" />, color: 'text-cyan-700 bg-cyan-50' },
  };

  const handleRoleChange = (role: UserRole) => {
    switchRole(role);
    setRoleDropdownOpen(false);
    setIsPublicView(false);
    setActiveTab('overview');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      {/* Top 3-Zone Top Bar Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        
        {/* ZONE 1: Brand Wordmark with Institutional Crest */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 focus:outline-none"
            aria-label="Toggle Navigation"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <button
            onClick={() => setIsPublicView(false)}
            className="flex items-center gap-3 text-left focus:outline-none group"
          >
            <img
              src="/src/assets/images/jaroy_school_crest_1791659609817.jpg"
              alt="Jaroy School of Management and Technology Seal"
              className="w-10 h-10 rounded-full object-cover border border-blue-100 shadow-sm group-hover:scale-105 transition-transform"
            />
            <div className="hidden sm:block">
              <span className="block text-sm font-bold text-slate-900 tracking-tight leading-tight whitespace-nowrap">
                Jaroy School of Management and Technology
              </span>
              <span className="block text-xs text-slate-500 font-medium whitespace-nowrap">
                Abeokuta, Ogun State · Portal
              </span>
            </div>
            <div className="sm:hidden">
              <span className="text-sm font-bold text-slate-900">JSMT Abeokuta</span>
            </div>
          </button>
        </div>

        {/* ZONE 2: Concise Nav Links & Academic Session Metadata */}
        <div className="hidden lg:flex items-center gap-6 text-xs text-slate-600 font-medium">
          <div className="flex items-center gap-2 text-slate-500">
            <span className="text-blue-900 font-semibold">{schoolInfo.currentSession}</span>
            <span aria-hidden="true">·</span>
            <span>{schoolInfo.currentSemester}</span>
          </div>

          <div className="h-4 w-px bg-slate-200" aria-hidden="true" />

          {/* Mode Switcher: Portal vs Public Institutional Website */}
          <div className="flex items-center p-0.5 bg-slate-100 rounded-lg">
            <button
              onClick={() => setIsPublicView(false)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                !isPublicView
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              School Portal
            </button>
            <button
              onClick={() => setIsPublicView(true)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                isPublicView
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Public Website & Apply
            </button>
          </div>
        </div>

        {/* ZONE 3: Role Switcher & User Profile CTA */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* Quick Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors whitespace-nowrap"
              title="Switch user role for testing"
            >
              <span className="text-slate-400">Role:</span>
              <span className="font-semibold text-blue-900">
                {roleLabels[currentUser.role]?.label}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 border-b border-slate-100">
                  <span className="text-xs font-semibold text-slate-400">
                    Switch Test Account / Role
                  </span>
                </div>
                {(Object.keys(roleLabels) as UserRole[]).map((role) => (
                  <button
                    key={role}
                    onClick={() => handleRoleChange(role)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-xs text-left transition-colors ${
                      currentUser.role === role
                        ? 'bg-blue-50/80 font-bold text-blue-900'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-slate-500">{roleLabels[role].icon}</span>
                    <div className="flex-1 truncate">
                      <div className="leading-tight">{roleLabels[role].label}</div>
                    </div>
                    {currentUser.role === role && (
                      <span className="text-xs text-blue-700 font-semibold">Active</span>
                    )}
                  </button>
                ))}
                
                <div className="border-t border-slate-100 mt-1 pt-1 px-2 space-y-1">
                  {onOpenAuth && (
                    <button
                      onClick={() => {
                        setRoleDropdownOpen(false);
                        onOpenAuth('signin');
                      }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-colors font-semibold cursor-pointer"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Switch Supabase Account</span>
                    </button>
                  )}
                  <button
                    onClick={async () => {
                      setRoleDropdownOpen(false);
                      await supabase.auth.signOut();
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors font-semibold cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                  <button
                    onClick={() => {
                      resetToDefaults();
                      setRoleDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-md transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Demo Data</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Supabase Auth Button */}
          {onOpenAuth && (
            <button
              onClick={() => onOpenAuth('signin')}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              title="Sign In with Supabase Auth"
            >
              <LogIn className="w-3.5 h-3.5 text-blue-700" />
              <span>Sign In</span>
            </button>
          )}

          {/* Notification Bell Action */}
          <button
            onClick={() => setNotificationDrawerOpen(true)}
            className="relative p-2 text-slate-600 hover:text-blue-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="School Advisories & Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-xs">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Current User Identity */}
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200">
            {currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover border border-slate-200"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-900 text-white text-xs font-semibold flex items-center justify-center">
                {currentUser.name.charAt(0)}
              </div>
            )}
            <div className="text-left text-xs leading-tight">
              <span className="block font-semibold text-slate-800 truncate max-w-[130px]">
                {currentUser.name}
              </span>
              <span className="block text-slate-400 truncate max-w-[130px]">
                {currentUser.staffId || currentUser.studentId || currentUser.department}
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* Notifications Drawer */}
      <NotificationDrawer
        isOpen={notificationDrawerOpen}
        onClose={() => setNotificationDrawerOpen(false)}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          setIsPublicView(false);
        }}
      />
    </header>
  );
};
