import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { NotificationCategory, NotificationPreferences } from '../../types';
import {
  Bell,
  Mail,
  ShieldCheck,
  Check,
  X,
  Sparkles,
  Sliders,
  Send,
} from 'lucide-react';

interface NotificationPreferencesModalProps {
  onClose: () => void;
}

export const NotificationPreferencesModal: React.FC<NotificationPreferencesModalProps> = ({
  onClose,
}) => {
  const {
    currentUser,
    notificationPreferences,
    updateNotificationPreferences,
    triggerTestNotification,
  } = useSchool();

  const [prefs, setPrefs] = useState<NotificationPreferences>({
    ...notificationPreferences,
    preferredEmail: notificationPreferences.preferredEmail || currentUser.email,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [testSentCategory, setTestSentCategory] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateNotificationPreferences(prefs);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const toggleCategory = (cat: keyof NotificationPreferences['categories'], channel: 'inApp' | 'email') => {
    setPrefs((prev) => ({
      ...prev,
      categories: {
        ...prev.categories,
        [cat]: {
          ...prev.categories[cat],
          [channel]: !prev.categories[cat][channel],
        },
      },
    }));
  };

  const handleTriggerTest = (cat: NotificationCategory) => {
    triggerTestNotification(cat);
    setTestSentCategory(cat);
    setTimeout(() => setTestSentCategory(null), 2500);
  };

  const categoryLabels: {
    key: keyof NotificationPreferences['categories'];
    title: string;
    desc: string;
  }[] = [
    {
      key: 'assignment',
      title: 'Coursework & New Assignments',
      desc: 'Alerts when lecturers publish homework briefs, deadlines, and project instructions.',
    },
    {
      key: 'exam',
      title: 'Upcoming Exams & Hall Schedules',
      desc: 'Official notifications for semester examinations, timetable releases, and hall allocations.',
    },
    {
      key: 'payment',
      title: 'Fee Payment Due Dates & Invoices',
      desc: 'Bursary reminders for tuition installments, lab fee invoices, and payment receipts.',
    },
    {
      key: 'announcement',
      title: 'Administrative Circulars & Notices',
      desc: 'Official bulletins issued by Rector, Dean, and Academic Directorate.',
    },
    {
      key: 'academic',
      title: 'Academic Results & Grade Updates',
      desc: 'Continuous assessment grades, exam results, and transcript updates.',
    },
    {
      key: 'system',
      title: 'System Security & Account Audits',
      desc: 'Security notifications, login alerts, and data maintenance updates.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-700" />
            <h3 className="text-xs font-bold text-slate-900">
              Notification Preferences & Delivery Channels
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-6 text-xs max-h-[80vh] overflow-y-auto">
          
          {/* Master Channel Toggles */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
            <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block">
              Master Channel Settings
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* In-App Master */}
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                <div className="flex items-center gap-2.5">
                  <Bell className="w-4 h-4 text-blue-700" />
                  <div>
                    <span className="font-bold text-slate-900 block">In-App Alerts</span>
                    <span className="text-[10px] text-slate-500">Badge & portal drawer</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.inAppMaster}
                  onChange={(e) => setPrefs({ ...prefs, inAppMaster: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
              </div>

              {/* Email Master */}
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-indigo-700" />
                  <div>
                    <span className="font-bold text-slate-900 block">Email Notifications</span>
                    <span className="text-[10px] text-slate-500">Inbox delivery for critical alerts</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.emailMaster}
                  onChange={(e) => setPrefs({ ...prefs, emailMaster: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Preferred Email Input */}
            <div className="pt-2">
              <label className="block text-slate-700 font-semibold mb-1">
                Designated Notification Email Address
              </label>
              <input
                type="email"
                value={prefs.preferredEmail}
                onChange={(e) => setPrefs({ ...prefs, preferredEmail: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
                required
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Official JSMT student or faculty address where email dispatches are sent.
              </span>
            </div>

            {/* Delivery Frequency */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Notification Delivery Frequency
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="digestFrequency"
                    value="instant"
                    checked={prefs.digestFrequency === 'instant'}
                    onChange={() => setPrefs({ ...prefs, digestFrequency: 'instant' })}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>Instant (Real-time delivery upon event)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="digestFrequency"
                    value="daily_digest"
                    checked={prefs.digestFrequency === 'daily_digest'}
                    onChange={() => setPrefs({ ...prefs, digestFrequency: 'daily_digest' })}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>Daily Summary Digest (07:00 AM)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Granular Subscriptions Matrix */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200">
              <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Event Category Preferences
              </span>
              <div className="flex items-center gap-8 text-[11px] font-semibold text-slate-500 pr-2">
                <span>In-App</span>
                <span>Email</span>
              </div>
            </div>

            <div className="space-y-2">
              {categoryLabels.map((cat) => (
                <div
                  key={cat.key}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0 pr-4">
                    <span className="font-bold text-slate-900 block leading-tight">{cat.title}</span>
                    <span className="text-[11px] text-slate-500 block mt-0.5 leading-snug">{cat.desc}</span>
                  </div>

                  <div className="flex items-center gap-10 shrink-0 pr-4">
                    <input
                      type="checkbox"
                      checked={prefs.categories[cat.key]?.inApp}
                      onChange={() => toggleCategory(cat.key, 'inApp')}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    />
                    <input
                      type="checkbox"
                      checked={prefs.categories[cat.key]?.email}
                      onChange={() => toggleCategory(cat.key, 'email')}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Test Trigger Section */}
          <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100 space-y-2">
            <span className="font-bold text-blue-950 uppercase tracking-wider text-[10px] block">
              Verify Live Notification Delivery
            </span>
            <p className="text-[11px] text-slate-600">
              Click any category below to immediately dispatch a simulated notification and verify delivery:
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                { id: 'assignment' as const, label: 'Test Assignment Alert' },
                { id: 'exam' as const, label: 'Test Exam Alert' },
                { id: 'payment' as const, label: 'Test Payment Alert' },
                { id: 'announcement' as const, label: 'Test Announcement' },
              ].map((btn) => (
                <button
                  type="button"
                  key={btn.id}
                  onClick={() => handleTriggerTest(btn.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-colors flex items-center gap-1 ${
                    testSentCategory === btn.id
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Send className="w-3 h-3" />
                  <span>{testSentCategory === btn.id ? 'Dispatched!' : btn.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            {savedSuccess ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1.5 text-xs">
                <Check className="w-4 h-4" />
                <span>Preferences Successfully Saved!</span>
              </span>
            ) : (
              <span className="text-slate-400 text-[11px]">
                Settings are saved to your local profile.
              </span>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg transition-colors shadow-xs"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
