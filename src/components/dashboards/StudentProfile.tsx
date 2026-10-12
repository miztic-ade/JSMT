import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  UserCircle2,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  Calendar,
  Award,
  IdCard,
  FileText,
  Save,
  CheckCircle2,
  AlertCircle,
  Building,
  ShieldCheck,
  UserCheck,
  BookOpen,
  ArrowRight,
  Printer,
  Sparkles,
  Camera,
  Trash2,
  Loader2,
} from 'lucide-react';
import { StudentIdCardModal } from '../modals/StudentIdCardModal';
import { TranscriptModal } from '../modals/TranscriptModal';
import { uploadToStorage } from '../../utils/supabaseStorage';

export const StudentProfile: React.FC = () => {
  const { currentStudent, currentUser, setCurrentUser, results, courses, schoolInfo, updateStudentProfile, deleteStudentAvatar } = useSchool();

  // Modals
  const [showIdCardModal, setShowIdCardModal] = useState(false);
  const [showTranscriptModal, setShowTranscriptModal] = useState(false);

  // Avatar upload states
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarNotice, setAvatarNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Editable Contact Details form state
  const [phone, setPhone] = useState(currentStudent.phone);
  const [address, setAddress] = useState(currentStudent.address);
  const [guardianName, setGuardianName] = useState(currentStudent.guardianName);
  const [guardianPhone, setGuardianPhone] = useState(currentStudent.guardianPhone);
  const [personalEmail, setPersonalEmail] = useState(
    currentStudent.email.includes('@student.') ? currentStudent.email.replace('@student.', '@') : currentStudent.email
  );

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Student results for academic records
  const myResults = results.filter((r) => r.studentId === currentStudent.id);

  // Grade point calculations
  const totalCredits = myResults.reduce((acc, r) => acc + r.credits, 0);
  const calculatedPoints = myResults.reduce((acc, r) => {
    let point = 0;
    if (r.grade === 'A') point = 5;
    else if (r.grade === 'B') point = 4;
    else if (r.grade === 'C') point = 3;
    else if (r.grade === 'D') point = 2;
    else point = 0;
    return acc + point * r.credits;
  }, 0);
  const gpa = totalCredits > 0 ? (calculatedPoints / totalCredits).toFixed(2) : currentStudent.currentGPA.toFixed(2);

  const handleUpdateContact = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      updateStudentProfile(currentStudent.id, {
        phone,
        address,
        guardianName,
        guardianPhone,
      });

      setTimeout(() => {
        setSaving(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3500);
      }, 500);
    } catch (err: any) {
      setSaving(false);
      setSaveError(err?.message || 'Failed to update contact details.');
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAvatarNotice({ type: 'error', message: 'Please select a valid image file (PNG, JPG, WEBP).' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarNotice({ type: 'error', message: 'Image size exceeds maximum limit of 5MB.' });
      return;
    }

    setUploadingAvatar(true);
    setAvatarNotice(null);

    try {
      const res = await uploadToStorage(file, 'avatars', currentStudent.userId);
      if (!res.success) {
        throw new Error(res.error || 'Failed to upload image to Supabase Storage');
      }

      // Update student profile with signed URL and storage path
      updateStudentProfile(currentStudent.id, {
        avatarUrl: res.signedUrl,
        avatarStoragePath: res.path,
      });

      // Also update active session user if matching
      setCurrentUser({
        ...currentUser,
        avatar: res.signedUrl,
        avatarStoragePath: res.path,
      });

      setAvatarNotice({
        type: 'success',
        message: 'Profile photo uploaded to private bucket "app-files" and signed URL generated successfully.',
      });
      setTimeout(() => setAvatarNotice(null), 4000);
    } catch (err: any) {
      console.error('Avatar upload failed:', err);
      setAvatarNotice({
        type: 'error',
        message: err?.message || 'Failed to upload photo to Supabase Storage.',
      });
    } finally {
      setUploadingAvatar(false);
      // Reset input value
      e.target.value = '';
    }
  };

  const handleDeleteAvatar = async () => {
    if (!confirm('Are you sure you want to delete this profile photo? It will be removed from Supabase Storage.')) {
      return;
    }

    setUploadingAvatar(true);
    try {
      await deleteStudentAvatar(currentStudent.id);
      setAvatarNotice({
        type: 'success',
        message: 'Profile photo removed from Supabase Storage bucket and profile reference updated.',
      });
      setTimeout(() => setAvatarNotice(null), 3500);
    } catch (err: any) {
      setAvatarNotice({
        type: 'error',
        message: err?.message || 'Failed to delete photo from storage.',
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Avatar Feedback Alert */}
      {avatarNotice && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
            avatarNotice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {avatarNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{avatarNotice.message}</span>
          </div>
          <button
            onClick={() => setAvatarNotice(null)}
            className="text-xs font-bold hover:underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Institutional Profile Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 relative px-6 flex items-end">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-white text-[11px] font-bold border border-white/30 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified Student Matriculant</span>
            </span>
          </div>
        </div>

        <div className="px-6 pb-6 pt-0">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 mb-4">
            <div className="flex items-end gap-4">
              <div className="relative group">
                {currentStudent.avatarUrl ? (
                  <img
                    src={currentStudent.avatarUrl}
                    alt={currentStudent.fullName}
                    className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-md bg-white"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-blue-900 text-white font-black text-2xl flex items-center justify-center border-4 border-white shadow-md">
                    {currentStudent.fullName.charAt(0)}
                  </div>
                )}

                {/* Upload Spinner Overlay */}
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-slate-900/70 rounded-2xl flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                )}

                {/* Camera / Upload Action Button */}
                <label
                  htmlFor="avatar-file-upload"
                  className="absolute -bottom-1 -left-1 p-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-full shadow-md cursor-pointer border-2 border-white transition-all hover:scale-105"
                  title="Upload profile photo to Supabase Storage"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <input
                    id="avatar-file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={uploadingAvatar}
                    className="hidden"
                  />
                </label>

                {/* Remove Photo Action if avatar exists */}
                {currentStudent.avatarUrl && (
                  <button
                    type="button"
                    onClick={handleDeleteAvatar}
                    disabled={uploadingAvatar}
                    className="absolute -top-1 -right-1 p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-md cursor-pointer border-2 border-white transition-all hover:scale-105"
                    title="Delete photo from Supabase Storage"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}

                <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" title="Active Enrollment" />
              </div>

              <div>
                <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">
                  Student Profile Record
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                  {currentStudent.fullName}
                </h1>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <span className="font-mono font-bold text-blue-900">{currentStudent.studentId}</span>
                  <span aria-hidden="true">·</span>
                  <span>{currentStudent.programmeName}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-700 font-semibold">Good Academic Standing</span>
                </div>
              </div>
            </div>

            {/* Quick Document Actions */}
            <div className="flex items-center gap-2 pt-2 sm:pt-0">
              <button
                type="button"
                onClick={() => setShowIdCardModal(true)}
                className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <IdCard className="w-3.5 h-3.5" />
                <span>Student ID Card</span>
              </button>
              <button
                type="button"
                onClick={() => setShowTranscriptModal(true)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-300"
              >
                <FileText className="w-3.5 h-3.5 text-blue-700" />
                <span>Academic Transcript</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Personal Information & Contact Details (Editable) */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Section 1: Official Personal Information */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UserCircle2 className="w-4 h-4 text-blue-700" />
                <h2 className="text-sm font-bold text-slate-900">Personal & Bio Information</h2>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Registry Verified</span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Full Legal Name:</span>
                <span className="font-bold text-slate-800">{currentStudent.fullName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Gender:</span>
                <span className="font-semibold text-slate-800">{currentStudent.gender}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Date of Birth:</span>
                <span className="font-semibold text-slate-800">{currentStudent.dateOfBirth}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">State of Origin / Residence:</span>
                <span className="font-semibold text-slate-800">Ogun State, Nigeria</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Institutional Student ID:</span>
                <span className="font-mono font-bold text-blue-900">{currentStudent.studentId}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Official School Email:</span>
                <span className="font-mono font-medium text-slate-700">{currentStudent.email}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Update Contact Details Form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-700" />
                <h2 className="text-sm font-bold text-slate-900">Update Contact Information</h2>
              </div>
              <span className="text-[11px] text-blue-600 font-medium">Self-Service Portal</span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Keep your contact details up to date to ensure you receive bursary alerts, examination clearance codes, and campus notices.
            </p>

            <form onSubmit={handleUpdateContact} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Primary Mobile Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234 812 345 6789"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Residential / Hostel Address in Abeokuta *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 14 Adigbe Road, Idi Aba, Abeokuta, Ogun State"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Next of Kin / Guardian Name
                  </label>
                  <input
                    type="text"
                    value={guardianName}
                    onChange={(e) => setGuardianName(e.target.value)}
                    placeholder="e.g. Mrs. Funke Adeleke"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Emergency / Guardian Phone
                  </label>
                  <input
                    type="tel"
                    value={guardianPhone}
                    onChange={(e) => setGuardianPhone(e.target.value)}
                    placeholder="+234 803 111 2233"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alternative Personal Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={personalEmail}
                    onChange={(e) => setPersonalEmail(e.target.value)}
                    placeholder="personal.email@gmail.com"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  />
                </div>
              </div>

              {/* Feedback messages */}
              {saveSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Contact details updated and saved successfully!</span>
                </div>
              )}

              {saveError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{saveError}</span>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto px-6 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-400 text-white font-bold text-xs rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving Changes...' : 'Save Contact Details'}</span>
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Right Column: Academic Records & Performance Overview */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Academic Overview Cards */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-700" />
                <h2 className="text-sm font-bold text-slate-900">Academic Standing & Curriculum</h2>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Current Semester
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Cumulative GPA</span>
                <span className="text-xl font-black font-mono text-blue-950">{gpa}</span>
                <span className="text-[9px] text-emerald-700 block mt-0.5">Scale 5.00</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Credits Earned</span>
                <span className="text-xl font-black font-mono text-slate-900">{totalCredits || currentStudent.totalCreditsEarned}</span>
                <span className="text-[9px] text-slate-500 block mt-0.5">Units Complete</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Enrolled Courses</span>
                <span className="text-xl font-black font-mono text-slate-900">{courses.length}</span>
                <span className="text-[9px] text-slate-500 block mt-0.5">{schoolInfo.currentSemester}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Academic Session</span>
                <span className="text-sm font-bold text-slate-900">{schoolInfo.currentSession}</span>
                <span className="text-[9px] text-blue-700 block mt-0.5">First Semester</span>
              </div>
            </div>

            <div className="pt-2 text-xs space-y-2 border-t border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-500">Department:</span>
                <span className="font-semibold text-slate-800">{currentStudent.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Programme:</span>
                <span className="font-bold text-blue-900">{currentStudent.programmeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Current Cohort Level:</span>
                <span className="font-semibold text-slate-800">{currentStudent.level}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date of Admission:</span>
                <span className="font-mono text-slate-700">{currentStudent.admissionDate}</span>
              </div>
            </div>
          </div>

          {/* Academic Records / Course Grades Ledger */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-blue-700" />
                <h2 className="text-sm font-bold text-slate-900">Academic Records & Course Grades</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowTranscriptModal(true)}
                className="text-[11px] font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
              >
                <span>Full Transcript</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold">
                    <th className="py-2 px-3">Code</th>
                    <th className="py-2 px-3">Course Title</th>
                    <th className="py-2 px-2 text-center">Units</th>
                    <th className="py-2 px-2 text-center">CA</th>
                    <th className="py-2 px-2 text-center">Exam</th>
                    <th className="py-2 px-2 text-center">Total</th>
                    <th className="py-2 px-2 text-center">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myResults.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-2 px-3 font-mono font-bold text-blue-900">{r.courseCode}</td>
                      <td className="py-2 px-3 font-medium text-slate-800 max-w-[150px] truncate">{r.courseTitle}</td>
                      <td className="py-2 px-2 text-center font-mono tabular-nums">{r.credits}</td>
                      <td className="py-2 px-2 text-center font-mono tabular-nums text-slate-600">{r.caScore}</td>
                      <td className="py-2 px-2 text-center font-mono tabular-nums text-slate-600">{r.examScore}</td>
                      <td className="py-2 px-2 text-center font-mono font-bold tabular-nums text-slate-900">{r.totalScore}</td>
                      <td className="py-2 px-2 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded font-mono font-black text-[11px] ${
                            r.grade === 'A'
                              ? 'bg-emerald-50 text-emerald-700'
                              : r.grade === 'B'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {r.grade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
              <span className="text-slate-500">Grading System: A (70-100% · 5.0), B (60-69% · 4.0), C (50-59% · 3.0)</span>
              <span className="font-bold text-slate-700">Official JSMT Abeokuta Registry</span>
            </div>
          </div>

        </div>

      </div>

      {/* MODALS */}
      {showIdCardModal && (
        <StudentIdCardModal
          student={currentStudent}
          onClose={() => setShowIdCardModal(false)}
        />
      )}

      {showTranscriptModal && (
        <TranscriptModal
          student={currentStudent}
          results={myResults}
          onClose={() => setShowTranscriptModal(false)}
        />
      )}

    </div>
  );
};

export default StudentProfile;
