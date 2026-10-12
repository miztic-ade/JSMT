import React from 'react';
import { EmailDispatchRecord, NotificationItem } from '../../types';
import { useSchool } from '../../context/SchoolContext';
import { Mail, X, CheckCircle2, ShieldCheck, ExternalLink } from 'lucide-react';

interface EmailPreviewModalProps {
  notification: NotificationItem;
  onClose: () => void;
}

export const EmailPreviewModal: React.FC<EmailPreviewModalProps> = ({
  notification,
  onClose,
}) => {
  const { schoolInfo } = useSchool();
  const email = notification.emailRecord || {
    to: 'joy.adeleke@student.jaroyschool.edu.ng',
    subject: `[JSMT Official Alert] ${notification.title}`,
    sentAt: notification.timestamp,
    previewText: notification.message,
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Email Client Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <Mail className="w-4 h-4 text-blue-700" />
            <span>Dispatched Institutional Email Preview</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Envelope Metadata */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 text-xs space-y-1.5 font-sans">
          <div className="flex items-baseline">
            <span className="w-16 text-slate-400 font-medium">From:</span>
            <span className="font-semibold text-slate-900">
              Jaroy School Notifications &lt;no-reply@jaroyschool.edu.ng&gt;
            </span>
          </div>
          <div className="flex items-baseline">
            <span className="w-16 text-slate-400 font-medium">To:</span>
            <span className="font-mono text-blue-900 font-semibold">{email.to}</span>
          </div>
          <div className="flex items-baseline">
            <span className="w-16 text-slate-400 font-medium">Date:</span>
            <span className="text-slate-600 font-mono text-[11px]">{email.sentAt}</span>
          </div>
          <div className="flex items-baseline">
            <span className="w-16 text-slate-400 font-medium">Subject:</span>
            <span className="font-bold text-slate-900">{email.subject}</span>
          </div>
        </div>

        {/* Rendered HTML Institutional Email Body */}
        <div className="p-6 space-y-5 bg-white text-xs">
          
          {/* Email Branding Bar */}
          <div className="border-b border-blue-100 pb-4 flex items-center gap-3">
            <img
              src="/src/assets/images/jaroy_school_crest_1791659609817.jpg"
              alt="Jaroy Crest"
              className="w-10 h-10 rounded-full object-cover border border-blue-200"
            />
            <div>
              <span className="block font-black text-blue-950 uppercase tracking-tight text-xs">
                {schoolInfo.name}
              </span>
              <span className="block text-[10px] text-slate-500 font-medium">
                Idi Aba, Abeokuta, Ogun State · Automated Notification Dispatch
              </span>
            </div>
          </div>

          {/* Email Body Prose */}
          <div className="space-y-3 text-slate-700 leading-relaxed">
            <p className="font-semibold text-slate-900">
              Dear Student / Faculty Member,
            </p>
            <p>
              This is an official automated advisory from the <strong>{schoolInfo.name}</strong> digital notification gateway.
            </p>

            {/* Notification Callout */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold uppercase text-[10px] text-blue-900 bg-blue-100/60 px-2 py-0.5 rounded">
                  {notification.category}
                </span>
                <span className="font-bold text-slate-900">{notification.title}</span>
              </div>
              <p className="text-slate-700 text-xs leading-normal">
                {notification.message}
              </p>
            </div>

            <p className="text-[11px] text-slate-500">
              For further inquiries, visit the Academic Registry or Bursary Office at our Idi Aba Campus (Opposite Wonderful Direct Pharmacy, Abeokuta) during official operating hours (08:00 AM – 04:30 PM).
            </p>
          </div>

          {/* Email Footer */}
          <div className="pt-4 border-t border-slate-100 text-[10px] text-slate-400 space-y-1">
            <p>
              &copy; {new Date().getFullYear()} {schoolInfo.name}. All rights reserved.
            </p>
            <p>
              You received this message because email notifications are enabled in your account preferences.
            </p>
          </div>

        </div>

        {/* Modal Close CTA */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-lg transition-colors"
          >
            Close Preview
          </button>
        </div>

      </div>
    </div>
  );
};
