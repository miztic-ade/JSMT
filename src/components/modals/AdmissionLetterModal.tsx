import React from 'react';
import { AdmissionApplication } from '../../types';
import { useSchool } from '../../context/SchoolContext';
import { Printer, X, CheckCircle2 } from 'lucide-react';

interface AdmissionLetterModalProps {
  application: AdmissionApplication;
  onClose: () => void;
}

export const AdmissionLetterModal: React.FC<AdmissionLetterModalProps> = ({
  application,
  onClose,
}) => {
  const { schoolInfo, programmes } = useSchool();
  const prog = programmes.find((p) => p.id === application.programmeAppliedId);

  const handlePrint = () => {
    window.print();
  };

  const matric = application.assignedMatricNumber || 'JSMT/2026/ADM/PROV';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Action Header */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <CheckCircle2 className="w-4 h-4 text-blue-700" />
            <span>Official Letter of Provisional Admission</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Download Letter</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Official Document */}
        <div className="p-10 space-y-6 bg-white text-slate-900 leading-relaxed text-xs" id="official-admission-letter">
          
          {/* Institutional Header */}
          <div className="border-b-2 border-blue-900 pb-4 text-center">
            <div className="flex justify-center items-center gap-4 mb-2">
              <img
                src="/src/assets/images/jaroy_school_crest_1791659609817.jpg"
                alt="Jaroy Crest"
                className="w-20 h-20 rounded-full object-cover border border-blue-900/30"
              />
              <div className="text-left">
                <h1 className="text-xl font-black tracking-tight text-blue-950 uppercase leading-none">
                  {schoolInfo.name}
                </h1>
                <p className="text-xs font-semibold text-blue-800 mt-1">
                  OFFICE OF THE REGISTRAR & ADMISSIONS BOARD
                </p>
                <p className="text-[11px] text-slate-600">
                  {schoolInfo.address}, {schoolInfo.city}, {schoolInfo.state}, Nigeria
                </p>
                <p className="text-[10px] text-slate-500">
                  Email: {schoolInfo.email} · Phone: {schoolInfo.phone} · Web: {schoolInfo.website}
                </p>
              </div>
            </div>
          </div>

          {/* Letter Meta */}
          <div className="flex justify-between items-start text-xs pt-2">
            <div>
              <span className="font-semibold text-slate-500">Ref: </span>
              <span className="font-mono font-bold text-slate-900">JSMT/REG/ADM/{application.applicationNumber}</span>
              <div className="mt-2 space-y-0.5">
                <div className="font-bold text-slate-900 text-sm">{application.fullName}</div>
                <div className="text-slate-600">{application.phone} · {application.email}</div>
                <div className="text-slate-500">State of Origin: {application.stateOfOrigin}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-slate-500">Date Issued:</div>
              <div className="font-mono font-medium text-slate-800">
                {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
              <div className="mt-2">
                <span className="text-[11px] text-slate-500">Student ID / Matric:</span>
                <span className="block font-mono font-bold text-blue-900 text-xs">{matric}</span>
              </div>
            </div>
          </div>

          {/* Subject */}
          <div className="pt-2">
            <h2 className="text-sm font-bold text-blue-950 uppercase border-b border-slate-300 pb-1">
              OFFER OF PROVISIONAL ADMISSION INTO {application.programmeAppliedName.toUpperCase()} ({schoolInfo.currentSession})
            </h2>
          </div>

          {/* Letter Content */}
          <div className="space-y-3 text-slate-800 text-[12px] text-justify">
            <p>
              Dear <strong>{application.fullName}</strong>,
            </p>
            <p>
              I am pleased to convey the approval of the Academic Board of <strong>{schoolInfo.name}</strong> offering you provisional admission into the <strong>{application.programmeAppliedName}</strong> programme for the <strong>{schoolInfo.currentSession}</strong>.
            </p>
            <p>
              This admission offer is grounded upon the evaluation of your academic credentials and verified senior secondary / diploma qualifications: <em>"{application.oLevelSummary}"</em>.
            </p>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
              <div className="font-bold text-slate-900">Admitted Programme Particulars:</div>
              <div className="grid grid-cols-2 gap-2 text-slate-700">
                <div>Award: <strong>{prog?.award || 'Professional Diploma'}</strong></div>
                <div>Duration: <strong>{prog?.duration || '12 Months'}</strong></div>
                <div>Campus Venue: <strong>Idi Aba Campus, Abeokuta</strong></div>
                <div>Tuition Per Term: <strong>₦{(prog?.tuitionPerTerm || 185000).toLocaleString()}</strong></div>
              </div>
            </div>

            <p>
              To confirm acceptance of this provisional admission, you are required to complete your registration documentation and pay the non-refundable acceptance/tuition deposit within <strong>fourteen (14) days</strong> of this notice.
            </p>

            <p>
              Please accept our hearty congratulations on your selection. We look forward to welcoming you into our dynamic community of technology scholars and innovators.
            </p>
          </div>

          {/* Signatures */}
          <div className="pt-8 border-t border-slate-200 flex justify-between items-end">
            <div>
              <div className="w-36 border-b border-slate-800 pb-1 mb-1 font-serif italic text-blue-950 font-bold">
                A. A. Bello
              </div>
              <span className="block font-bold text-slate-900 uppercase">
                {schoolInfo.registrarName}
              </span>
              <span className="block text-slate-500 text-[10px]">
                Registrar & Secretary to Academic Board
              </span>
            </div>

            <div className="text-right">
              <div className="inline-block p-2 border border-blue-900/30 rounded text-center">
                <span className="block font-bold text-blue-950 text-[10px] uppercase">
                  Academic Board Seal
                </span>
                <span className="block text-[9px] text-slate-500">
                  JSMT · Abeokuta, Nigeria
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
