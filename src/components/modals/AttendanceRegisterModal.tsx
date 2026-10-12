import React, { useState } from 'react';
import { Course } from '../../types';
import { useSchool } from '../../context/SchoolContext';
import { Clock, Check, X, UserCheck } from 'lucide-react';

interface AttendanceRegisterModalProps {
  course?: Course;
  onClose: () => void;
}

export const AttendanceRegisterModal: React.FC<AttendanceRegisterModalProps> = ({
  course,
  onClose,
}) => {
  const { courses, students, recordAttendance, currentUser } = useSchool();
  const [selectedCourseId, setSelectedCourseId] = useState(course?.id || courses[0]?.id || '');
  const [sessionTitle, setSessionTitle] = useState('Lecture Session: Architecture & Practical Demonstration');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const activeCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];

  // Attendance state for students
  const [attendanceMap, setAttendanceMap] = useState<
    Record<string, { status: 'present' | 'absent' | 'late' | 'excused'; notes: string }>
  >(() => {
    const initial: Record<string, { status: 'present' | 'absent' | 'late' | 'excused'; notes: string }> = {};
    students.forEach((s) => {
      initial[s.id] = { status: 'present', notes: '' };
    });
    return initial;
  });

  const markAll = (status: 'present' | 'absent') => {
    setAttendanceMap((prev) => {
      const updated = { ...prev };
      students.forEach((s) => {
        updated[s.id] = { ...updated[s.id], status };
      });
      return updated;
    });
  };

  const handleStatusChange = (studentId: string, status: 'present' | 'absent' | 'late' | 'excused') => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], status },
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCourse) return;

    const records = students.map((s) => ({
      studentId: s.id,
      studentName: s.fullName,
      matricNumber: s.studentId,
      status: attendanceMap[s.id]?.status || 'present',
      notes: attendanceMap[s.id]?.notes || undefined,
    }));

    recordAttendance({
      courseId: activeCourse.id,
      courseCode: activeCourse.code,
      courseTitle: activeCourse.title,
      date,
      sessionTitle,
      lecturerName: currentUser.name,
      records,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <Clock className="w-4 h-4 text-blue-700" />
            <span>Class Attendance Register</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Course
              </label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code}: {c.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Session Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Lecture Session Topic / Lab Module
            </label>
            <input
              type="text"
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Quick Batch Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            <span className="text-xs font-bold text-slate-700">
              Student Attendance List ({students.length})
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => markAll('present')}
                className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors"
              >
                Mark All Present
              </button>
              <button
                type="button"
                onClick={() => markAll('absent')}
                className="px-2.5 py-1 text-[11px] font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
              >
                Mark All Absent
              </button>
            </div>
          </div>

          {/* Students Roster */}
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {students.map((stud) => {
              const currentStat = attendanceMap[stud.id]?.status || 'present';
              return (
                <div
                  key={stud.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900">{stud.fullName}</div>
                    <div className="font-mono text-[11px] text-slate-500">{stud.studentId}</div>
                  </div>

                  <div className="flex items-center gap-1">
                    {(['present', 'absent', 'late', 'excused'] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleStatusChange(stud.id, st)}
                        className={`px-2.5 py-1 rounded text-[11px] capitalize font-medium transition-colors ${
                          currentStat === st
                            ? st === 'present'
                              ? 'bg-emerald-600 text-white font-bold'
                              : st === 'absent'
                              ? 'bg-red-600 text-white font-bold'
                              : st === 'late'
                              ? 'bg-amber-500 text-white font-bold'
                              : 'bg-blue-600 text-white font-bold'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Submit */}
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
              Save Attendance Record
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
