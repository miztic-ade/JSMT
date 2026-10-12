import React from 'react';
import { AcademicResult, StudentProfile } from '../../types';
import { useSchool } from '../../context/SchoolContext';
import { Printer, X, Award } from 'lucide-react';

interface TranscriptModalProps {
  student: StudentProfile;
  results: AcademicResult[];
  onClose: () => void;
}

export const TranscriptModal: React.FC<TranscriptModalProps> = ({
  student,
  results,
  onClose,
}) => {
  const { schoolInfo } = useSchool();

  const handlePrint = () => {
    window.print();
  };

  const totalCredits = results.reduce((acc, r) => acc + r.credits, 0);
  const totalWeightedPoints = results.reduce((acc, r) => acc + r.gradePoint * r.credits, 0);
  const computedGPA = totalCredits > 0 ? (totalWeightedPoints / totalCredits).toFixed(2) : '0.00';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Actions */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <Award className="w-4 h-4 text-blue-700" />
            <span>Official Academic Statement of Results</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Transcript</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Transcript Document */}
        <div className="p-8 space-y-6 bg-white text-slate-900 text-xs" id="official-transcript">
          
          {/* Header */}
          <div className="text-center pb-4 border-b-2 border-blue-900 space-y-2">
            <div className="flex justify-center items-center gap-3">
              <img
                src="/src/assets/images/jaroy_school_crest_1791659609817.jpg"
                alt="Jaroy Crest"
                className="w-16 h-16 rounded-full object-cover border border-blue-900/20"
              />
              <div className="text-left">
                <h1 className="text-lg font-black tracking-tight text-blue-950 uppercase leading-none">
                  {schoolInfo.name}
                </h1>
                <p className="text-xs text-slate-600 font-semibold mt-1">
                  DIRECTORATE OF ACADEMIC AFFAIRS & EXAMINATIONS
                </p>
                <p className="text-[11px] text-slate-500">
                  {schoolInfo.address}, {schoolInfo.city}, {schoolInfo.state}, Nigeria
                </p>
              </div>
            </div>

            <div className="pt-2">
              <span className="inline-block px-4 py-1 bg-blue-950 text-white font-bold text-xs uppercase tracking-wider">
                Official Semester Statement of Academic Results
              </span>
            </div>
          </div>

          {/* Student Profile Block */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="block text-slate-500 text-[11px]">Student Full Name:</span>
              <span className="block font-bold text-slate-900 text-sm uppercase">{student.fullName}</span>
              <span className="block text-slate-500 text-[11px] mt-1">Academic Programme:</span>
              <span className="block font-medium text-slate-800">{student.programmeName}</span>
            </div>
            <div className="text-right">
              <span className="block text-slate-500 text-[11px]">Matriculation / Student ID:</span>
              <span className="block font-mono font-bold text-blue-950 text-sm">{student.studentId}</span>
              <span className="block text-slate-500 text-[11px] mt-1">Session / Semester:</span>
              <span className="block font-medium text-slate-800">{schoolInfo.currentSession} · {schoolInfo.currentSemester}</span>
            </div>
          </div>

          {/* Courses Table */}
          <table className="w-full text-xs border border-slate-300">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="py-2 px-3 text-left font-semibold">Course Code</th>
                <th className="py-2 px-3 text-left font-semibold">Course Title</th>
                <th className="py-2 px-2 text-center font-semibold">Units</th>
                <th className="py-2 px-2 text-center font-semibold">CA (30)</th>
                <th className="py-2 px-2 text-center font-semibold">Exam (70)</th>
                <th className="py-2 px-2 text-center font-semibold">Total (100)</th>
                <th className="py-2 px-2 text-center font-semibold">Grade</th>
                <th className="py-2 px-2 text-center font-semibold">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {results.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-slate-500">
                    No examination records published for this semester.
                  </td>
                </tr>
              ) : (
                results.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-950">{res.courseCode}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">{res.courseTitle}</td>
                    <td className="py-2.5 px-2 text-center font-mono tabular-nums">{res.credits}</td>
                    <td className="py-2.5 px-2 text-center font-mono tabular-nums">{res.caScore}</td>
                    <td className="py-2.5 px-2 text-center font-mono tabular-nums">{res.examScore}</td>
                    <td className="py-2.5 px-2 text-center font-mono font-bold tabular-nums">{res.totalScore}</td>
                    <td className="py-2.5 px-2 text-center font-bold text-blue-900">{res.grade}</td>
                    <td className="py-2.5 px-2 text-center font-mono tabular-nums font-semibold">
                      {(res.gradePoint * res.credits).toFixed(1)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot className="bg-slate-50 font-semibold border-t-2 border-slate-300">
              <tr>
                <td colSpan={2} className="py-2.5 px-3 text-right">Cumulative Summary:</td>
                <td className="py-2.5 px-2 text-center font-mono font-bold text-slate-900 tabular-nums">{totalCredits}</td>
                <td colSpan={3} className="py-2.5 px-2 text-right">Grade Point Average (GPA):</td>
                <td colSpan={2} className="py-2.5 px-3 text-center font-mono font-black text-sm text-blue-900 tabular-nums">
                  {computedGPA} / 4.00
                </td>
              </tr>
            </tfoot>
          </table>

          {/* Grading System Key */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[10px] text-slate-600">
            <span className="font-bold text-slate-800 block mb-1">Institutional Grading Scale:</span>
            <div className="grid grid-cols-5 gap-2">
              <div>A (70-100%): 4.00 (Distinction)</div>
              <div>B (60-69%): 3.50 (Upper Credit)</div>
              <div>C (50-59%): 3.00 (Lower Credit)</div>
              <div>D (40-49%): 2.00 (Pass)</div>
              <div>F (Below 40%): 0.00 (Fail)</div>
            </div>
          </div>

          {/* Institutional Endorsements */}
          <div className="pt-6 border-t border-slate-200 flex justify-between items-end">
            <div>
              <div className="w-32 border-b border-slate-900 pb-1 mb-1 font-serif italic text-blue-950 font-bold">
                F. Ogunleye
              </div>
              <span className="block font-bold text-slate-900 uppercase">
                Dr. (Mrs.) Folashade Ogunleye
              </span>
              <span className="block text-slate-500 text-[10px]">Dean of Academic Affairs</span>
            </div>

            <div className="text-right">
              <div className="w-32 border-b border-slate-900 pb-1 mb-1 font-serif italic text-blue-950 font-bold ml-auto">
                A. A. Bello
              </div>
              <span className="block font-bold text-slate-900 uppercase">
                {schoolInfo.registrarName}
              </span>
              <span className="block text-slate-500 text-[10px]">Registrar</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
