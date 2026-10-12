import React, { useState } from 'react';
import { Course, StudentProfile } from '../../types';
import { useSchool } from '../../context/SchoolContext';
import { Award, X, Check } from 'lucide-react';

interface GradeEntryModalProps {
  course: Course;
  student?: StudentProfile;
  onClose: () => void;
}

export const GradeEntryModal: React.FC<GradeEntryModalProps> = ({
  course,
  student,
  onClose,
}) => {
  const { students, saveOrUpdateResult, schoolInfo } = useSchool();
  const [selectedStudentId, setSelectedStudentId] = useState(student?.id || students[0]?.id || '');
  const [caScore, setCaScore] = useState<number>(25);
  const [examScore, setExamScore] = useState<number>(55);
  const [remarks, setRemarks] = useState('Satisfactory academic engagement and practical lab work.');

  const activeStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  const total = Math.min(100, Math.max(0, caScore + examScore));

  const calculateGrade = (score: number) => {
    if (score >= 70) return { grade: 'A' as const, point: 4.0 };
    if (score >= 60) return { grade: 'B' as const, point: 3.5 };
    if (score >= 50) return { grade: 'C' as const, point: 3.0 };
    if (score >= 40) return { grade: 'D' as const, point: 2.0 };
    return { grade: 'F' as const, point: 0.0 };
  };

  const { grade, point } = calculateGrade(total);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudent) return;

    saveOrUpdateResult({
      studentId: activeStudent.id,
      studentName: activeStudent.fullName,
      matricNumber: activeStudent.studentId,
      courseId: course.id,
      courseCode: course.code,
      courseTitle: course.title,
      credits: course.credits,
      caScore,
      examScore,
      totalScore: total,
      grade,
      gradePoint: point,
      semester: schoolInfo.currentSemester,
      session: schoolInfo.currentSession.slice(0, 9),
      published: true,
      remarks,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <Award className="w-4 h-4 text-blue-700" />
            <span>Grade & Score Entry Portal</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs">
            <span className="font-mono font-bold text-blue-900">{course.code}</span>
            <div className="font-semibold text-slate-900">{course.title}</div>
            <div className="text-slate-500 text-[11px]">Unit Credits: {course.credits}</div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Enrolled Student
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName} ({s.studentId})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                CA Score (Max 30)
              </label>
              <input
                type="number"
                min={0}
                max={30}
                value={caScore}
                onChange={(e) => setCaScore(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Exam Score (Max 70)
              </label>
              <input
                type="number"
                min={0}
                max={70}
                value={examScore}
                onChange={(e) => setExamScore(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Computed Score Display */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-500 block">Total Score (100)</span>
              <span className="text-2xl font-black font-mono text-slate-900 tabular-nums">{total}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block">Assigned Grade</span>
              <span className="text-2xl font-black text-blue-900 font-mono">{grade}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block">Grade Point</span>
              <span className="text-2xl font-black font-mono text-slate-800 tabular-nums">{point.toFixed(1)}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Lecturer Feedback / Remarks
            </label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors shadow-xs"
            >
              Save & Publish Grade
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
