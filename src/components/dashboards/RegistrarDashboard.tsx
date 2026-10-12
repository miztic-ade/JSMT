import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { AdmissionApplication } from '../../types';
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Award,
  Search,
  Filter,
  Download,
  GraduationCap,
  Users,
  Eye,
  FileText,
  Clock,
  Printer,
  ChevronRight,
} from 'lucide-react';
import { AdmissionLetterModal } from '../modals/AdmissionLetterModal';

interface RegistrarDashboardProps {
  activeTab: string;
}

export const RegistrarDashboard: React.FC<RegistrarDashboardProps> = ({ activeTab }) => {
  const {
    applications,
    programmes,
    students,
    updateApplicationStatus,
    schoolInfo,
  } = useSchool();

  // Search & filter
  const [appSearch, setAppSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'under_review' | 'approved' | 'rejected' | 'correction_requested'>('all');

  // Modals state
  const [selectedAppForLetter, setSelectedAppForLetter] = useState<AdmissionApplication | null>(null);
  const [reviewingApp, setReviewingApp] = useState<AdmissionApplication | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [assignMatricInput, setAssignMatricInput] = useState('');

  // Metrics
  const totalApps = applications.length;
  const approvedApps = applications.filter((a) => a.status === 'approved').length;
  const underReviewApps = applications.filter((a) => a.status === 'under_review' || a.status === 'pending').length;
  const correctionsApps = applications.filter((a) => a.status === 'correction_requested').length;

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.fullName.toLowerCase().includes(appSearch.toLowerCase()) ||
      app.applicationNumber.toLowerCase().includes(appSearch.toLowerCase()) ||
      app.programmeAppliedName.toLowerCase().includes(appSearch.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = (app: AdmissionApplication) => {
    const matric = assignMatricInput || `JSMT/2026/${app.programmeAppliedId.slice(5, 8).toUpperCase()}/${Math.floor(10 + Math.random() * 89)}`;
    updateApplicationStatus(app.id, 'approved', reviewNotes || 'Credentials verified and cleared for matriculation.', matric);
    setReviewingApp(null);
    setReviewNotes('');
    setAssignMatricInput('');
  };

  const handleReject = (app: AdmissionApplication) => {
    updateApplicationStatus(app.id, 'rejected', reviewNotes || 'Candidate does not meet the minimum prerequisite entry standards.');
    setReviewingApp(null);
    setReviewNotes('');
  };

  const handleRequestCorrection = (app: AdmissionApplication) => {
    updateApplicationStatus(app.id, 'correction_requested', reviewNotes || 'Please upload a clear copy of your senior secondary school statement of result.');
    setReviewingApp(null);
    setReviewNotes('');
  };

  const exportAdmissionsCsv = () => {
    const headers = ['App Number', 'Full Name', 'Programme Applied', 'State', 'Status', 'O-Levels Summary', 'Assigned Matric'];
    const rows = applications.map((a) => [
      a.applicationNumber,
      `"${a.fullName}"`,
      `"${a.programmeAppliedName}"`,
      `"${a.stateOfOrigin}"`,
      a.status,
      `"${a.oLevelSummary}"`,
      a.assignedMatricNumber || 'N/A',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `JSMT_Admissions_Registry_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* OVERVIEW */}
      {(activeTab === 'overview' || !activeTab) && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <span className="text-xs font-bold text-cyan-700 uppercase tracking-wider block">
                Admissions & Student Registry Directorate
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Applicant Intake & Credential Verification
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Registrar: <strong>{schoolInfo.registrarName}</strong> · Intake for {schoolInfo.currentSession}
              </p>
            </div>
            <button
              onClick={exportAdmissionsCsv}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Admissions CSV</span>
            </button>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 block">Total Applications</span>
              <span className="text-2xl font-black font-mono text-slate-900 tabular-nums">{totalApps}</span>
              <span className="text-xs text-slate-500 block mt-1">{schoolInfo.currentSession}</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 block">Approved & Matriculated</span>
              <span className="text-2xl font-black font-mono text-emerald-800 tabular-nums">{approvedApps}</span>
              <span className="text-xs text-emerald-700 block mt-1">Admission Letters Issued</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 block">In Review / Pending</span>
              <span className="text-2xl font-black font-mono text-amber-900 tabular-nums">{underReviewApps}</span>
              <span className="text-xs text-amber-700 block mt-1">Awaiting Credential Check</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 block">Correction Required</span>
              <span className="text-2xl font-black font-mono text-blue-900 tabular-nums">{correctionsApps}</span>
              <span className="text-xs text-blue-700 block mt-1">Contacted Applicant</span>
            </div>
          </div>

          {/* Quick Review Queue */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Admission Applications Queue</h3>
              <button
                onClick={() => setStatusFilter('all')}
                className="text-xs font-semibold text-blue-700 hover:text-blue-900"
              >
                View Full Queue &rarr;
              </button>
            </div>

            <div className="space-y-3">
              {applications.slice(0, 4).map((app) => (
                <div key={app.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-blue-900">{app.applicationNumber}</span>
                      <span className="font-bold text-slate-900">{app.fullName}</span>
                    </div>
                    <div className="text-slate-600 text-[11px]">
                      Applied for: <strong>{app.programmeAppliedName}</strong> · {app.appliedDate}
                    </div>
                    <div className="text-slate-500 text-[10px]">
                      Qualifications: {app.oLevelSummary}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        app.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700'
                          : app.status === 'under_review'
                          ? 'bg-amber-50 text-amber-700'
                          : app.status === 'correction_requested'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {app.status.replace('_', ' ')}
                    </span>
                    <button
                      onClick={() => setReviewingApp(app)}
                      className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg text-xs"
                    >
                      Review
                    </button>
                    {app.status === 'approved' && (
                      <button
                        onClick={() => setSelectedAppForLetter(app)}
                        className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold rounded-lg text-xs"
                      >
                        Letter
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* APPLICATION PIPELINE TAB */}
      {(activeTab === 'applications' || activeTab === 'verification' || activeTab === 'letters') && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Application Review & Credential Verification Desk</h2>
              <p className="text-xs text-slate-500">Inspect candidate credentials, verify O'Level subjects, and issue admission letters</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search applicant or ID..."
                  value={appSearch}
                  onChange={(e) => setAppSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 w-56 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-700 font-medium"
              >
                <option value="all">All Applications</option>
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="correction_requested">Correction Requested</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredApplications.map((app) => (
              <div key={app.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-mono font-bold text-blue-900 mr-2">{app.applicationNumber}</span>
                    <span className="font-bold text-sm text-slate-900">{app.fullName}</span>
                    <span className="text-slate-500 text-[11px] ml-2">({app.gender} · {app.stateOfOrigin})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        app.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700'
                          : app.status === 'under_review'
                          ? 'bg-amber-50 text-amber-700'
                          : app.status === 'correction_requested'
                          ? 'bg-blue-50 text-blue-700'
                          : app.status === 'rejected'
                          ? 'bg-red-50 text-red-700'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {app.status.replace('_', ' ')}
                    </span>
                    <button
                      onClick={() => setReviewingApp(app)}
                      className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg text-xs"
                    >
                      Review & Decide
                    </button>
                    {app.status === 'approved' && (
                      <button
                        onClick={() => setSelectedAppForLetter(app)}
                        className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold rounded-lg text-xs flex items-center gap-1"
                      >
                        <Award className="w-3.5 h-3.5 text-blue-700" />
                        <span>Admission Letter</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 pt-2 border-t border-slate-200/60">
                  <div>Programme Applied: <strong className="text-slate-900">{app.programmeAppliedName}</strong></div>
                  <div>Contact: {app.phone} · {app.email}</div>
                  <div className="col-span-2">
                    Previous Education: <strong className="text-slate-800">{app.previousEducation}</strong>
                  </div>
                  <div className="col-span-2">
                    Verified O'Level Records: <em className="text-slate-800 font-medium">"{app.oLevelSummary}"</em>
                  </div>
                  {app.assignedMatricNumber && (
                    <div className="col-span-2 text-blue-900 font-mono font-bold">
                      Assigned Matric Number: {app.assignedMatricNumber}
                    </div>
                  )}
                  {app.reviewNotes && (
                    <div className="col-span-2 p-2 bg-white rounded border border-slate-200 text-slate-700 italic">
                      Registry Note: {app.reviewNotes}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ENROLLMENT TAB */}
      {activeTab === 'enrollment' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Enrolled Matriculants Registry</h2>
            <p className="text-xs text-slate-500">Students formally matriculated into academic programmes</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Matric Number</th>
                  <th className="py-2.5 px-3 font-semibold">Student Name</th>
                  <th className="py-2.5 px-3 font-semibold">Programme</th>
                  <th className="py-2.5 px-3 font-semibold">Admission Date</th>
                  <th className="py-2.5 px-3 font-semibold">Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-900">{s.studentId}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{s.fullName}</td>
                    <td className="py-2.5 px-3 text-slate-700">{s.programmeName}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">{s.admissionDate}</td>
                    <td className="py-2.5 px-3 text-slate-600">{s.level}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REVIEW APPLICATION MODAL */}
      {reviewingApp && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <div>
                <span className="font-mono font-bold text-blue-900">{reviewingApp.applicationNumber}</span>
                <h3 className="text-sm font-bold text-slate-900">{reviewingApp.fullName}</h3>
                <span className="text-slate-500 text-[11px]">{reviewingApp.programmeAppliedName}</span>
              </div>
              <button
                onClick={() => setReviewingApp(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>Previous School: <strong>{reviewingApp.previousEducation}</strong></div>
              <div>O'Level Grades: <strong className="text-slate-900">{reviewingApp.oLevelSummary}</strong></div>
              <div>State of Origin: <strong>{reviewingApp.stateOfOrigin}</strong></div>
              {reviewingApp.statementOfPurpose && (
                <div className="text-[11px] text-slate-600 pt-1 border-t border-slate-200">
                  Career Statement: <em>"{reviewingApp.statementOfPurpose}"</em>
                </div>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Assign Custom Matriculation Number (Optional)
              </label>
              <input
                type="text"
                placeholder={`e.g. JSMT/2026/${reviewingApp.programmeAppliedId.slice(5, 8).toUpperCase()}/038`}
                value={assignMatricInput}
                onChange={(e) => setAssignMatricInput(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Registry Decision Notes & Remarks
              </label>
              <textarea
                rows={3}
                placeholder="Remarks, requirements, or reasons for decision..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => handleReject(reviewingApp)}
                className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-lg transition-colors"
              >
                Reject Application
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleRequestCorrection(reviewingApp)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors"
                >
                  Request Correction
                </button>
                <button
                  type="button"
                  onClick={() => handleApprove(reviewingApp)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors shadow-xs"
                >
                  Approve & Matriculate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADMISSION LETTER MODAL */}
      {selectedAppForLetter && (
        <AdmissionLetterModal
          application={selectedAppForLetter}
          onClose={() => setSelectedAppForLetter(null)}
        />
      )}

    </div>
  );
};
