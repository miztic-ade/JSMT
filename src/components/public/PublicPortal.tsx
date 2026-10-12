import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  GraduationCap,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  BookOpen,
  Send,
  Building2,
  Award,
  Users,
  Clock,
  ArrowRight,
  Shield,
  Sparkles,
} from 'lucide-react';

interface PublicPortalProps {
  onEnterPortal: () => void;
  onOpenAuth?: (mode: 'signin' | 'signup') => void;
}

export const PublicPortal: React.FC<PublicPortalProps> = ({ onEnterPortal, onOpenAuth }) => {
  const { schoolInfo, programmes, submitAdmissionApplication } = useSchool();

  // Application form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    gender: 'Female' as 'Female' | 'Male',
    dateOfBirth: '2004-06-15',
    stateOfOrigin: 'Ogun State',
    programmeAppliedId: programmes[0]?.id || '',
    previousEducation: '',
    oLevelSummary: '',
    statementOfPurpose: '',
  });

  const [submittedAppNumber, setSubmittedAppNumber] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const prog = programmes.find((p) => p.id === formData.programmeAppliedId) || programmes[0];

    setTimeout(() => {
      const appNum = submitAdmissionApplication({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        stateOfOrigin: formData.stateOfOrigin,
        programmeAppliedId: prog.id,
        programmeAppliedName: prog.name,
        previousEducation: formData.previousEducation || 'Senior Secondary School Certificate (SSCE)',
        oLevelSummary: formData.oLevelSummary || '5 Credits including Mathematics and English',
        statementOfPurpose: formData.statementOfPurpose || 'To acquire high-demand digital technology skills and build innovative solutions.',
      });

      setSubmittedAppNumber(appNum);
      setIsSubmitting(false);
    }, 700);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      
      {/* Top Banner Notice */}
      <div className="bg-blue-950 text-white text-xs py-2 px-4 border-b border-blue-900">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-amber-300">Admissions Open:</span>
            <span>{schoolInfo.currentSession} Intake currently receiving applications.</span>
          </div>
          <div className="flex items-center gap-4 text-blue-200">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-amber-400" />
              <span>Idi Aba, Abeokuta, Ogun State</span>
            </span>
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              <span>{schoolInfo.phone}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-blue-950 to-slate-900 text-white py-16 lg:py-24 overflow-hidden">
        {/* Subdued Background Glow */}
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <img
            src="/src/assets/images/jaroy_campus_tech_lab_1791659598163.jpg"
            alt="Jaroy Computer Lab"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Mission & Hero Pitch */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-3">
                <img
                  src="/src/assets/images/jaroy_school_crest_1791659609817.jpg"
                  alt="Jaroy Crest"
                  className="w-16 h-16 rounded-full border-2 border-white/20 shadow-md object-cover"
                />
                <div>
                  <span className="text-xs font-bold tracking-widest text-blue-300 uppercase block">
                    Institutional Excellence in Abeokuta
                  </span>
                  <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                    {schoolInfo.name}
                  </h1>
                </div>
              </div>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
                Empowering Nigerian youth and working professionals with market-driven digital engineering, artificial intelligence, cybersecurity, and management training. Located opposite Wonderful Direct Pharmacy, Idi Aba, Abeokuta.
              </p>

              {/* Metric Highlights */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10 text-xs">
                <div>
                  <span className="block text-xl sm:text-2xl font-black font-mono text-white tabular-nums">100%</span>
                  <span className="text-slate-400">Hands-on Lab Training</span>
                </div>
                <div>
                  <span className="block text-xl sm:text-2xl font-black font-mono text-white tabular-nums">6+</span>
                  <span className="text-slate-400">Accredited Tech Tracks</span>
                </div>
                <div>
                  <span className="block text-xl sm:text-2xl font-black font-mono text-white tabular-nums">400+</span>
                  <span className="text-slate-400">Employed Alumni</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href="#apply-section"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-colors shadow-md flex items-center gap-2"
                >
                  <span>Apply for Admission</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <button
                  onClick={onEnterPortal}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Building2 className="w-4 h-4 text-blue-300" />
                  <span>Log into Staff / Student Portal</span>
                </button>
                {onOpenAuth && (
                  <button
                    onClick={() => onOpenAuth('signin')}
                    className="px-5 py-3 bg-blue-950/80 hover:bg-blue-900 text-blue-200 hover:text-white font-semibold text-xs rounded-xl border border-blue-500/40 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <span>Supabase Sign In / Register</span>
                  </button>
                )}
              </div>
            </div>

            {/* Right Column: Lab Photography Card */}
            <div className="lg:col-span-5">
              <div className="bg-slate-800/80 rounded-2xl p-2 border border-slate-700 shadow-2xl overflow-hidden">
                <img
                  src="/src/assets/images/jaroy_campus_tech_lab_1791659598163.jpg"
                  alt="Students in JSMT Abeokuta Innovation Hub"
                  className="w-full h-72 sm:h-80 object-cover rounded-xl"
                />
                <div className="p-4 text-xs">
                  <div className="font-bold text-white">Innovation Hub & Software Engineering Lab</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    Equipped with high-performance workstations, dedicated high-speed fiber internet, and industry development toolchains.
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Programmes Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block mb-1">
            Industry Accredited Curricula
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Academic & Professional Programmes
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Designed to bridge the technology talent gap in Nigeria and prepare graduates for international and local industry employability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programmes.map((prog) => (
            <div
              key={prog.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:border-blue-300 transition-colors flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded-md">
                    {prog.code}
                  </span>
                  <span className="text-slate-500 font-medium">{prog.duration}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {prog.name}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {prog.description}
                </p>

                <div className="pt-2 text-xs text-slate-500 space-y-1">
                  <div>Department: <strong className="text-slate-700">{prog.departmentName}</strong></div>
                  <div>Award: <strong className="text-slate-700">{prog.award}</strong></div>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">Term Tuition</span>
                  <span className="text-sm font-bold font-mono text-slate-900 tabular-nums">
                    ₦{prog.tuitionPerTerm.toLocaleString()}
                  </span>
                </div>
                <a
                  href="#apply-section"
                  onClick={() => setFormData((prev) => ({ ...prev, programmeAppliedId: prog.id }))}
                  className="px-3 py-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Apply Now &rarr;
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Online Admission Application Section */}
      <section id="apply-section" className="py-16 bg-slate-100 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-lg">
            
            <div className="border-b border-slate-200 pb-6 mb-8 text-center space-y-1">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-widest">
                Official Admission Portal
              </span>
              <h2 className="text-2xl font-bold text-slate-900">
                Online Application for Admission ({schoolInfo.currentSession})
              </h2>
              <p className="text-xs text-slate-500 max-w-lg mx-auto">
                Fill the official application form below. Submitted records are queued immediately in the Registrar’s verification system.
              </p>
            </div>

            {submittedAppNumber ? (
              <div className="p-8 text-center space-y-5 bg-emerald-50/50 rounded-2xl border border-emerald-200">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Application Successfully Submitted!</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Your institutional application reference number is:
                  </p>
                  <p className="text-xl font-mono font-black text-blue-900 mt-2">
                    {submittedAppNumber}
                  </p>
                </div>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  The Registrar Office at Idi Aba, Abeokuta will review your O-Level submissions. You can now log into the portal to review admission status or download your provisional admission letter upon approval.
                </p>
                <div className="pt-2 flex justify-center gap-4">
                  <button
                    onClick={onEnterPortal}
                    className="px-5 py-2.5 bg-blue-700 text-white font-semibold text-xs rounded-xl hover:bg-blue-800 transition-colors shadow-xs"
                  >
                    Go to Portal & Review
                  </button>
                  <button
                    onClick={() => setSubmittedAppNumber(null)}
                    className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Submit Another Application
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Applicant Full Name (Surname First) *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Babajide Daniel Adeleke"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. babajide.adeleke@gmail.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone Number (WhatsApp) *
                    </label>
                    <input
                      type="tel"
                      placeholder="+234 800 000 0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Gender
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      State of Origin
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ogun State"
                      value={formData.stateOfOrigin}
                      onChange={(e) => setFormData({ ...formData, stateOfOrigin: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Programme of Interest *
                  </label>
                  <select
                    value={formData.programmeAppliedId}
                    onChange={(e) => setFormData({ ...formData, programmeAppliedId: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    required
                  >
                    {programmes.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.award} - ₦{p.tuitionPerTerm.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Previous School / Educational Qualification *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Abeokuta Grammar School (SSCE 2024) or ND Poly"
                      value={formData.previousEducation}
                      onChange={(e) => setFormData({ ...formData, previousEducation: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      O'Level Grades Summary (WAEC / NECO / NABTEB) *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Maths (B2), English (C4), Physics (A1), Chemistry (B3)"
                      value={formData.oLevelSummary}
                      onChange={(e) => setFormData({ ...formData, oLevelSummary: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Statement of Career Objective / Purpose
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Briefly state why you want to study at Jaroy School of Management and Technology..."
                    value={formData.statementOfPurpose}
                    onChange={(e) => setFormData({ ...formData, statementOfPurpose: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-400 text-white font-bold text-xs rounded-xl transition-colors shadow-md flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <span>Submitting Application to Registrar...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Admission Application</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

          </div>

        </div>
      </section>

      {/* Campus Location & Footer */}
      <footer className="bg-slate-950 text-white py-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-3">
              <img
                src="/src/assets/images/jaroy_school_crest_1791659609817.jpg"
                alt="Jaroy Crest"
                className="w-10 h-10 rounded-full object-cover"
              />
              <span className="font-bold text-sm tracking-tight">
                {schoolInfo.name}
              </span>
            </div>
            <p className="text-slate-400 max-w-sm text-xs leading-relaxed">
              Leading technology and professional management training center in Abeokuta, Ogun State. Equipping students with industry-demanded tech skills.
            </p>
            <div className="text-slate-400 flex items-center gap-2 text-[11px]">
              <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>{schoolInfo.address}, {schoolInfo.city}, {schoolInfo.state}, {schoolInfo.country}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="font-bold text-slate-200">Contact Registry</div>
            <div className="text-slate-400 space-y-1 text-xs">
              <div>Phone: {schoolInfo.phone}</div>
              <div>Alt: {schoolInfo.altPhone}</div>
              <div>Email: {schoolInfo.email}</div>
              <div>Web: {schoolInfo.website}</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="font-bold text-slate-200">Portal Actions</div>
            <div className="space-y-1.5">
              <button
                onClick={onEnterPortal}
                className="block text-blue-400 hover:text-blue-300 font-semibold"
              >
                Access School Management Portal &rarr;
              </button>
              <div className="text-slate-500 text-[11px]">
                {schoolInfo.currentSession}
              </div>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-8 border-t border-slate-800/80 text-center text-slate-500 text-[11px]">
          &copy; {new Date().getFullYear()} Jaroy School of Management and Technology. All rights reserved. Idi Aba, Abeokuta, Ogun State, Nigeria.
        </div>
      </footer>

    </div>
  );
};
