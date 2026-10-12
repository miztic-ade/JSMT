import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { NotificationCategory, NotificationItem } from '../../types';
import {
  Bell,
  X,
  CheckCheck,
  Trash2,
  Sliders,
  Mail,
  ExternalLink,
  BookOpen,
  CalendarDays,
  CreditCard,
  Award,
  ShieldCheck,
  Send,
  Check,
} from 'lucide-react';
import { EmailPreviewModal } from './EmailPreviewModal';
import { NotificationPreferencesModal } from './NotificationPreferencesModal';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  const {
    currentUser,
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    clearAllNotifications,
    triggerTestNotification,
  } = useSchool();

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [selectedNotifForEmail, setSelectedNotifForEmail] = useState<NotificationItem | null>(null);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);

  if (!isOpen) return null;

  // Filter notifications relevant to current user
  const relevantNotifications = notifications.filter((n) => {
    if (n.recipientId === 'all') return true;
    if (n.recipientId === currentUser.id) return true;
    if (n.recipientRole === 'all') return true;
    if (currentUser.role === 'student' && n.recipientRole === 'students') return true;
    if (currentUser.role === 'lecturer' && (n.recipientRole === 'staff' || n.recipientRole === 'lecturers')) return true;
    if (currentUser.role === 'school_admin' || currentUser.role === 'super_admin') return true;
    return false;
  });

  const filteredList = relevantNotifications.filter((n) => {
    if (filterCategory === 'all') return true;
    return n.category === filterCategory;
  });

  const getCategoryIcon = (cat: NotificationCategory) => {
    switch (cat) {
      case 'assignment':
        return <BookOpen className="w-4 h-4 text-blue-700" />;
      case 'exam':
        return <CalendarDays className="w-4 h-4 text-purple-700" />;
      case 'payment':
        return <CreditCard className="w-4 h-4 text-amber-700" />;
      case 'announcement':
        return <Bell className="w-4 h-4 text-emerald-700" />;
      case 'academic':
        return <Award className="w-4 h-4 text-cyan-700" />;
      case 'system':
        return <ShieldCheck className="w-4 h-4 text-slate-700" />;
      default:
        return <Bell className="w-4 h-4 text-slate-700" />;
    }
  };

  const handleActionClick = (notif: NotificationItem) => {
    markNotificationAsRead(notif.id);
    if (notif.targetTab) {
      onNavigateTab(notif.targetTab);
      onClose();
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
        <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 animate-in slide-in-from-right duration-200">
          
          {/* Top Zone */}
          <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Bell className="w-5 h-5 text-blue-900" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                    {unreadNotificationsCount}
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">Notifications Center</h3>
                <span className="text-[11px] text-slate-500">
                  {unreadNotificationsCount} unread advisories
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {unreadNotificationsCount > 0 && (
                <button
                  onClick={markAllNotificationsAsRead}
                  className="p-1.5 text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-lg text-xs font-semibold flex items-center gap-1"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span className="hidden sm:inline">Mark all read</span>
                </button>
              )}
              <button
                onClick={() => setShowPreferencesModal(true)}
                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
                title="Notification Preferences"
              >
                <Sliders className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Category Filter Pills (Functional interactive button tab controls) */}
          <div className="px-4 py-2 border-b border-slate-100 bg-white overflow-x-auto flex items-center gap-1.5 text-xs">
            {[
              { id: 'all', label: 'All' },
              { id: 'assignment', label: 'Assignments' },
              { id: 'exam', label: 'Exams' },
              { id: 'payment', label: 'Payments' },
              { id: 'announcement', label: 'Notices' },
              { id: 'academic', label: 'Grades' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilterCategory(cat.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors ${
                  filterCategory === cat.id
                    ? 'bg-blue-900 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Notifications Scrollable List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredList.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <Bell className="w-10 h-10 text-slate-300 mx-auto" />
                <div>
                  <h4 className="text-xs font-bold text-slate-700">No notifications found</h4>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto mt-1">
                    There are no current advisories under the selected category.
                  </p>
                </div>
              </div>
            ) : (
              filteredList.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3.5 rounded-xl border text-xs transition-colors space-y-2 ${
                    !notif.isRead
                      ? 'bg-blue-50/40 border-blue-200 shadow-xs'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  {/* Item Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="p-1.5 bg-slate-100 rounded-lg shrink-0">
                        {getCategoryIcon(notif.category)}
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-slate-900 block truncate leading-tight">
                          {notif.title}
                        </span>
                        {/* Unboxed metadata with · separator (Zero-pill discipline) */}
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                          <span className="capitalize font-medium text-slate-700">{notif.category}</span>
                          <span aria-hidden="true">·</span>
                          <span>{notif.timestamp.slice(5, 16)}</span>
                          {notif.priority === 'urgent' && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-red-700 font-bold uppercase">Urgent</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {!notif.isRead && (
                        <button
                          onClick={() => markNotificationAsRead(notif.id)}
                          className="p-1 text-slate-400 hover:text-emerald-700 rounded transition-colors"
                          title="Mark as read"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notif.id)}
                        className="p-1 text-slate-400 hover:text-red-700 rounded transition-colors"
                        title="Dismiss"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Message Prose */}
                  <p className="text-slate-700 text-[11px] leading-relaxed pl-8">
                    {notif.message}
                  </p>

                  {/* Actions Bar */}
                  <div className="pt-2 pl-8 flex items-center justify-between text-[11px]">
                    {notif.targetTab ? (
                      <button
                        onClick={() => handleActionClick(notif)}
                        className="text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1"
                      >
                        <span>View Details</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    ) : (
                      <span />
                    )}

                    {/* Email preview button if dispatched */}
                    {notif.emailDispatched && (
                      <button
                        onClick={() => setSelectedNotifForEmail(notif)}
                        className="text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded text-[10px]"
                        title="Inspect delivered email copy"
                      >
                        <Mail className="w-3 h-3 text-indigo-700" />
                        <span>Email Sent · Preview</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Controls */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowPreferencesModal(true)}
                className="font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1.5"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Configure Preferences</span>
              </button>

              {filteredList.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  className="text-slate-500 hover:text-red-700 font-medium"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Quick Test Alert Buttons for examiners */}
            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
              <span>Test dispatch:</span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => triggerTestNotification('assignment')}
                  className="px-2 py-0.5 bg-white border border-slate-200 hover:bg-slate-100 rounded text-[10px] font-semibold text-slate-700"
                >
                  + Assignment
                </button>
                <button
                  onClick={() => triggerTestNotification('exam')}
                  className="px-2 py-0.5 bg-white border border-slate-200 hover:bg-slate-100 rounded text-[10px] font-semibold text-slate-700"
                >
                  + Exam
                </button>
                <button
                  onClick={() => triggerTestNotification('payment')}
                  className="px-2 py-0.5 bg-white border border-slate-200 hover:bg-slate-100 rounded text-[10px] font-semibold text-slate-700"
                >
                  + Fee Due
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* MODALS */}
      {selectedNotifForEmail && (
        <EmailPreviewModal
          notification={selectedNotifForEmail}
          onClose={() => setSelectedNotifForEmail(null)}
        />
      )}

      {showPreferencesModal && (
        <NotificationPreferencesModal
          onClose={() => setShowPreferencesModal(false)}
        />
      )}
    </>
  );
};
