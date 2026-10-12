import React from 'react';
import { StudentProfile } from '../../types';
import { useSchool } from '../../context/SchoolContext';
import { Printer, X, Shield, Sparkles } from 'lucide-react';

interface StudentIdCardModalProps {
  student: StudentProfile;
  onClose: () => void;
}

export const StudentIdCardModal: React.FC<StudentIdCardModalProps> = ({
  student,
  onClose,
}) => {
  const { schoolInfo } = useSchool();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header Action Bar */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <Shield className="w-4 h-4 text-blue-700" />
            <span>Digital Institutional Student Identification Card</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print ID Card</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ID Card Display Area */}
        <div className="p-8 bg-slate-100 flex flex-col items-center justify-center gap-6">
          
          {/* Front of Card */}
          <div className="w-[360px] h-[225px] bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 rounded-2xl p-4 shadow-xl border border-blue-800 text-white flex flex-col justify-between relative overflow-hidden">
            {/* Watermark Crest */}
            <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
              <img
                src="/src/assets/images/jaroy_school_crest_1791659609817.jpg"
                alt="Crest Watermark"
                className="w-56 h-56 rounded-full"
              />
            </div>

            {/* Top Bar */}
            <div className="flex items-center justify-between relative z-10 border-b border-white/15 pb-2">
              <div className="flex items-center gap-2">
                <img
                  src="/src/assets/images/jaroy_school_crest_1791659609817.jpg"
                  alt="Jaroy Crest"
                  className="w-8 h-8 rounded-full border border-white/30"
                />
                <div>
                  <h3 className="text-[11px] font-black uppercase tracking-tight leading-tight">
                    Jaroy School of Mgmt & Tech
                  </h3>
                  <span className="text-[9px] text-blue-200 block">Idi Aba, Abeokuta, Nigeria</span>
                </div>
              </div>
              <span className="text-[9px] font-mono font-bold bg-blue-600/60 px-2 py-0.5 rounded text-white tracking-widest uppercase">
                STUDENT
              </span>
            </div>

            {/* Middle Section: Photo & Student Bio */}
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-20 h-24 rounded-lg bg-slate-800 border-2 border-white/40 overflow-hidden shrink-0 shadow-md">
                {student.avatarUrl ? (
                  <img
                    src={student.avatarUrl}
                    alt={student.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-white text-xl">
                    {student.fullName.charAt(0)}
                  </div>
                )}
              </div>

              <div className="min-w-0 space-y-1">
                <h4 className="text-xs font-black uppercase text-white truncate leading-tight">
                  {student.fullName}
                </h4>
                <div className="text-[10px] text-blue-200 space-y-0.5">
                  <div>
                    <span className="text-slate-300">ID No: </span>
                    <span className="font-mono font-bold text-amber-300">{student.studentId}</span>
                  </div>
                  <div className="truncate">
                    <span className="text-slate-300">Prog: </span>
                    <span>{student.programmeName}</span>
                  </div>
                  <div>
                    <span className="text-slate-300">Cohort: </span>
                    <span>{student.level}</span>
                  </div>
                  <div>
                    <span className="text-slate-300">Valid Till: </span>
                    <span className="font-mono">Dec 2027</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Bar: Barcode representation */}
            <div className="flex items-center justify-between text-[8px] text-slate-300 pt-1 border-t border-white/10 relative z-10">
              <span className="font-mono tracking-widest">||| | |||| || ||| |||| |</span>
              <span>Authorized Signature</span>
            </div>
          </div>

          <div className="text-xs text-slate-500 text-center max-w-sm">
            This card remains the property of <strong>Jaroy School of Management and Technology</strong>. If found, please return to the Registry, Opposite Wonderful Direct Pharmacy, Idi Aba, Abeokuta.
          </div>

        </div>

      </div>
    </div>
  );
};
