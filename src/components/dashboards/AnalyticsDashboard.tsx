import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { UserRole, Course, Invoice, StudentProfile, User } from '../../types';
import {
  BarChart3,
  TrendingUp,
  Users,
  BookOpen,
  Wallet,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Filter,
  Download,
  Printer,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Award,
  Clock,
  Building,
  GraduationCap,
  Layers,
  ChevronRight,
  ShieldCheck,
  Percent,
  FileSpreadsheet,
  Send,
  PieChart as PieChartIcon,
  Activity,
} from 'lucide-react';

interface AnalyticsDashboardProps {
  initialRoleFilter?: 'admin' | 'finance' | 'all';
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  initialRoleFilter,
}) => {
  const {
    currentUser,
    students,
    courses,
    allUsers,
    invoices,
    attendanceSessions,
    materials,
    assignments,
    auditLogs,
    programmes,
    departments,
    schoolInfo,
    sendNotification,
  } = useSchool();

  // Determine available view modes based on user role
  const isAdministrator = currentUser.role === 'super_admin' || currentUser.role === 'school_admin';
  const isFinanceOfficer = currentUser.role === 'finance_officer';
  const isSuperAdmin = currentUser.role === 'super_admin';

  // Default active tab: if finance officer, finance; if admin, admin; if super admin, can switch
  const [activeAnalyticsView, setActiveAnalyticsView] = useState<'admin' | 'finance' | 'executive'>(() => {
    if (initialRoleFilter === 'finance') return 'finance';
    if (initialRoleFilter === 'admin') return 'admin';
    if (isFinanceOfficer) return 'finance';
    if (isSuperAdmin) return 'executive';
    return 'admin';
  });

  // Global filters
  const [sessionFilter, setSessionFilter] = useState<'all' | '2026/2027' | '2025/2026' | '2024/2025'>('2026/2027');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [hoveredDataPoint, setHoveredDataPoint] = useState<any | null>(null);
  const [reminderSentStudentId, setReminderSentStudentId] = useState<string | null>(null);

  // -------------------------------------------------------------
  // 1. STUDENT ENROLLMENT DATA & TRENDS
  // -------------------------------------------------------------
  const historicalEnrollmentData = useMemo(() => [
    { period: '2024/2025 Sem 1', total: 54, comp: 28, data: 12, cyb: 8, mgmt: 6, growth: 0 },
    { period: '2024/2025 Sem 2', total: 72, comp: 36, data: 16, cyb: 12, mgmt: 8, growth: 33.3 },
    { period: '2025/2026 Sem 1', total: 98, comp: 48, data: 24, cyb: 16, mgmt: 10, growth: 36.1 },
    { period: '2025/2026 Sem 2', total: 118, comp: 58, data: 28, cyb: 20, mgmt: 12, growth: 20.4 },
    { period: '2026/2027 Sem 1 (Current)', total: 146, comp: 72, data: 36, cyb: 24, mgmt: 14, growth: 23.7 },
  ], []);

  // Filtered students by department
  const filteredStudents = useMemo(() => {
    if (departmentFilter === 'all') return students;
    const dept = departments.find(d => d.id === departmentFilter);
    if (!dept) return students;
    return students.filter(s => s.department.toLowerCase().includes(dept.name.toLowerCase()) || s.department.toLowerCase().includes(dept.code.toLowerCase()));
  }, [students, departmentFilter, departments]);

  // Department distribution
  const departmentEnrollments = useMemo(() => {
    return departments.map(dept => {
      const count = students.filter(s =>
        s.department.toLowerCase().includes(dept.name.toLowerCase()) ||
        s.department.toLowerCase().includes(dept.code.toLowerCase())
      ).length;
      const percentage = students.length > 0 ? Math.round((count / students.length) * 100) : 0;
      return {
        ...dept,
        count,
        percentage,
      };
    });
  }, [departments, students]);

  // -------------------------------------------------------------
  // 2. COURSE POPULARITY DATA
  // -------------------------------------------------------------
  const coursePopularity = useMemo(() => {
    const list = courses.map((course) => {
      const labCapacity = 50; // JSMT Tech Lab capacity benchmark
      const enrolled = course.enrolledStudentsCount || 0;
      const capacityRate = Math.min(100, Math.round((enrolled / labCapacity) * 100));
      
      // Calculate engagement score from materials and attendance sessions
      const relatedSessions = attendanceSessions.filter(s => s.courseId === course.id || s.courseCode === course.code).length;
      const relatedMaterials = materials.filter(m => m.courseId === course.id || m.courseCode === course.code).length;
      const relatedAssignments = assignments.filter(a => a.courseId === course.id || a.courseCode === course.code).length;
      const popularityScore = enrolled * 2 + relatedSessions * 5 + relatedMaterials * 3 + relatedAssignments * 4;

      return {
        ...course,
        enrolled,
        labCapacity,
        capacityRate,
        relatedSessions,
        relatedMaterials,
        popularityScore,
      };
    });

    return list.sort((a, b) => b.enrolled - a.enrolled);
  }, [courses, attendanceSessions, materials, assignments]);

  // -------------------------------------------------------------
  // 3. STAFF ACTIVITY DATA
  // -------------------------------------------------------------
  const staffActivity = useMemo(() => {
    const lecturers = allUsers.filter(u => u.role === 'lecturer' || u.role === 'school_admin');

    return lecturers.map((lecturer) => {
      const assignedCourses = courses.filter(c => c.lecturerId === lecturer.id || c.lecturerName.toLowerCase().includes(lecturer.name.toLowerCase()));
      const sessionsHeld = attendanceSessions.filter(s => s.lecturerName.toLowerCase().includes(lecturer.name.toLowerCase())).length;
      const materialsShared = materials.filter(m => m.uploadedBy.toLowerCase().includes(lecturer.name.toLowerCase())).length;
      const assignmentsGiven = assignments.filter(a => a.assignedBy.toLowerCase().includes(lecturer.name.toLowerCase()));
      
      let totalSubmissions = 0;
      let gradedSubmissions = 0;
      assignmentsGiven.forEach(a => {
        totalSubmissions += a.submissions.length;
        gradedSubmissions += a.submissions.filter(sub => sub.status === 'graded').length;
      });

      const gradingRate = totalSubmissions > 0 ? Math.round((gradedSubmissions / totalSubmissions) * 100) : 100;
      const auditActionsCount = auditLogs.filter(log => log.actorName.toLowerCase().includes(lecturer.name.toLowerCase())).length;

      // Composite Activity Index (0 to 100)
      const activityIndex = Math.min(100, Math.round(
        (assignedCourses.length * 15) + (sessionsHeld * 12) + (materialsShared * 8) + (gradedSubmissions * 6) + (auditActionsCount * 5)
      ));

      return {
        lecturer,
        coursesCount: assignedCourses.length,
        assignedCourses,
        sessionsHeld,
        materialsShared,
        assignmentsCount: assignmentsGiven.length,
        totalSubmissions,
        gradedSubmissions,
        gradingRate,
        auditActionsCount,
        activityIndex,
      };
    }).sort((a, b) => b.activityIndex - a.activityIndex);
  }, [allUsers, courses, attendanceSessions, materials, assignments, auditLogs]);

  // -------------------------------------------------------------
  // 4. FINANCIAL DATA (REVENUE, OUTSTANDING, COLLECTION RATE)
  // -------------------------------------------------------------
  const financialMetrics = useMemo(() => {
    const totalBilled = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const totalCollected = invoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
    const totalOutstanding = invoices.reduce((sum, inv) => sum + inv.balance, 0);
    const collectionRate = totalBilled > 0 ? ((totalCollected / totalBilled) * 100) : 0;

    // Monthly revenue simulation based on transaction logs & invoices
    const monthlyRevenue = [
      { month: 'May 2026', billed: 420000, collected: 380000, rate: 90.4 },
      { month: 'Jun 2026', billed: 560000, collected: 490000, rate: 87.5 },
      { month: 'Jul 2026', billed: 680000, collected: 520000, rate: 76.4 },
      { month: 'Aug 2026', billed: 850000, collected: 620000, rate: 72.9 },
      { month: 'Sep 2026', billed: 1120000, collected: 810000, rate: 72.3 },
      { month: 'Oct 2026 (MTD)', billed: 1350000, collected: 965000, rate: 71.4 },
    ];

    // Revenue by Fee Category
    const categoryRevenueMap: Record<string, { billed: number; collected: number; balance: number }> = {};
    invoices.forEach(inv => {
      if (!categoryRevenueMap[inv.category]) {
        categoryRevenueMap[inv.category] = { billed: 0, collected: 0, balance: 0 };
      }
      categoryRevenueMap[inv.category].billed += inv.amount;
      categoryRevenueMap[inv.category].collected += inv.amountPaid;
      categoryRevenueMap[inv.category].balance += inv.balance;
    });

    const categoryBreakdown = Object.entries(categoryRevenueMap).map(([category, vals]) => ({
      category,
      billed: vals.billed,
      collected: vals.collected,
      balance: vals.balance,
      rate: vals.billed > 0 ? Math.round((vals.collected / vals.billed) * 100) : 0,
      share: totalCollected > 0 ? Math.round((vals.collected / totalCollected) * 100) : 0,
    })).sort((a, b) => b.collected - a.collected);

    // Payment channels share
    const channelMap: Record<string, number> = {
      Paystack: 0,
      'Bank Transfer': 0,
      Remita: 0,
      'Cash Deposit': 0,
    };

    invoices.forEach(inv => {
      inv.transactions?.forEach(tx => {
        if (channelMap[tx.channel] !== undefined) {
          channelMap[tx.channel] += tx.amount;
        } else {
          channelMap[tx.channel] = tx.amount;
        }
      });
    });

    const channelBreakdown = Object.entries(channelMap).map(([channel, amount]) => ({
      channel,
      amount,
      percentage: totalCollected > 0 ? Math.round((amount / totalCollected) * 100) : 0,
    })).sort((a, b) => b.amount - a.amount);

    // Outstanding by programme
    const programmeBalances: Record<string, { totalBilled: number; totalPaid: number; balance: number }> = {};
    invoices.forEach(inv => {
      const pName = inv.programmeName || 'General';
      if (!programmeBalances[pName]) {
        programmeBalances[pName] = { totalBilled: 0, totalPaid: 0, balance: 0 };
      }
      programmeBalances[pName].totalBilled += inv.amount;
      programmeBalances[pName].totalPaid += inv.amountPaid;
      programmeBalances[pName].balance += inv.balance;
    });

    const programmeOutstanding = Object.entries(programmeBalances).map(([prog, vals]) => ({
      programme: prog,
      billed: vals.totalBilled,
      paid: vals.totalPaid,
      balance: vals.balance,
      rate: vals.totalBilled > 0 ? Math.round((vals.totalPaid / vals.totalBilled) * 100) : 0,
    })).sort((a, b) => b.balance - a.balance);

    // Aging analysis
    const overdueInvoices = invoices.filter(inv => inv.status === 'overdue' || (inv.balance > 0 && new Date(inv.dueDate) < new Date()));
    const partialInvoices = invoices.filter(inv => inv.status === 'partial');
    const pendingInvoices = invoices.filter(inv => inv.status === 'pending');
    const paidInvoices = invoices.filter(inv => inv.status === 'paid');

    const overdueBalance = overdueInvoices.reduce((s, i) => s + i.balance, 0);
    const partialBalance = partialInvoices.reduce((s, i) => s + i.balance, 0);
    const pendingBalance = pendingInvoices.reduce((s, i) => s + i.balance, 0);

    return {
      totalBilled,
      totalCollected,
      totalOutstanding,
      collectionRate,
      monthlyRevenue,
      categoryBreakdown,
      channelBreakdown,
      programmeOutstanding,
      statusCounts: {
        paid: paidInvoices.length,
        partial: partialInvoices.length,
        pending: pendingInvoices.length,
        overdue: overdueInvoices.length,
      },
      agingAmounts: {
        overdue: overdueBalance,
        partial: partialBalance,
        pending: pendingBalance,
      },
      overdueInvoices,
    };
  }, [invoices]);

  // Send fee reminder trigger
  const handleSendFeeReminder = (invoice: Invoice) => {
    setReminderSentStudentId(invoice.id);
    sendNotification({
      recipientId: invoice.studentId,
      recipientRole: 'student',
      title: `Urgent: Bursary Fee Notice (${invoice.category})`,
      message: `Dear ${invoice.studentName}, your outstanding balance of ₦${invoice.balance.toLocaleString()} for ${invoice.category} (Invoice ${invoice.invoiceNumber}) was due on ${invoice.dueDate}. Please make payment to avoid restriction of portal credentials.`,
      category: 'payment',
      priority: 'urgent',
      targetTab: 'fees',
      channel: 'both',
      emailDispatched: true,
      emailRecord: {
        to: `${invoice.studentName.toLowerCase().replace(/\s+/g, '.')}@student.jaroyschool.edu.ng`,
        subject: `[JSMT Bursary Notice] Outstanding Balance for ${invoice.category}`,
        sentAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
        previewText: `Official payment reminder for invoice ${invoice.invoiceNumber}. Outstanding: ₦${invoice.balance.toLocaleString()}.`,
      },
    });

    setTimeout(() => {
      setReminderSentStudentId(null);
    }, 3500);
  };

  // CSV Export functions
  const handleExportAdminCsv = () => {
    const headers = ['Metric Type', 'Entity Code', 'Name / Title', 'Primary Metric', 'Secondary Metric', 'Details'];
    const rows = [
      ...historicalEnrollmentData.map(e => ['Enrollment Trend', e.period, 'Student Count', e.total.toString(), `${e.growth}% YoY`, `Comp: ${e.comp}, Data: ${e.data}, Cyb: ${e.cyb}`]),
      ...coursePopularity.map(c => ['Course Popularity', c.code, c.title, `${c.enrolled} Students`, `${c.capacityRate}% Capacity`, `Lecturer: ${c.lecturerName}`]),
      ...staffActivity.map(s => ['Staff Activity', s.lecturer.staffId || 'N/A', s.lecturer.name, `Index: ${s.activityIndex}/100`, `${s.sessionsHeld} Sessions Held`, `${s.gradingRate}% Grading Turnaround`]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.map(item => `"${item}"`).join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `JSMT_Administrator_Analytics_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportFinanceCsv = () => {
    const headers = ['Financial Metric', 'Category / Item', 'Billed Amount (NGN)', 'Collected (NGN)', 'Outstanding (NGN)', 'Collection Rate'];
    const rows = [
      ['Total Institutional Billed', 'All Accounts', financialMetrics.totalBilled.toString(), financialMetrics.totalCollected.toString(), financialMetrics.totalOutstanding.toString(), `${financialMetrics.collectionRate.toFixed(1)}%`],
      ...financialMetrics.categoryBreakdown.map(c => ['Fee Category Breakdown', c.category, c.billed.toString(), c.collected.toString(), c.balance.toString(), `${c.rate}%`]),
      ...financialMetrics.programmeOutstanding.map(p => ['Programme Ledger', p.programme, p.billed.toString(), p.paid.toString(), p.balance.toString(), `${p.rate}%`]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.map(item => `"${item}"`).join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `JSMT_Financial_BI_Analytics_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* HEADER BAR */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 tracking-wide uppercase">
            <span>Jaroy Analytics & Decision Support</span>
            <span aria-hidden="true">·</span>
            <span>Idi Aba Campus</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-500 font-normal">{schoolInfo.currentSession}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Institutional Performance & Analytics Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time telemetry, student progression trends, faculty teaching output, and bursary revenue metrics.
          </p>
        </div>

        {/* Global Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Mode Switcher (Tab buttons) */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-medium">
            {(isAdministrator || isSuperAdmin) && (
              <button
                onClick={() => setActiveAnalyticsView('admin')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeAnalyticsView === 'admin'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span>Academic & Faculty</span>
              </button>
            )}

            {(isFinanceOfficer || isSuperAdmin) && (
              <button
                onClick={() => setActiveAnalyticsView('finance')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeAnalyticsView === 'finance'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Bursary & Revenue</span>
              </button>
            )}

            {isSuperAdmin && (
              <button
                onClick={() => setActiveAnalyticsView('executive')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeAnalyticsView === 'executive'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-purple-600" />
                <span>Executive 360°</span>
              </button>
            )}
          </div>

          {/* Export Action */}
          <button
            onClick={activeAnalyticsView === 'finance' ? handleExportFinanceCsv : handleExportAdminCsv}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
            title="Download CSV report"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          {/* Print Action */}
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
            title="Print report"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Print</span>
          </button>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-semibold text-slate-700">Academic Session:</span>
            <select
              value={sessionFilter}
              onChange={(e) => setSessionFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="2026/2027">2026/2027 (Current)</option>
              <option value="2025/2026">2025/2026 Academic Year</option>
              <option value="2024/2025">2024/2025 Academic Year</option>
              <option value="all">Historical Multi-Session</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-semibold text-slate-700">School / Department:</span>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 max-w-xs truncate"
            >
              <option value="all">All Academic Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-500">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Real-time Sync Active · Last computed just now</span>
        </div>
      </div>

      {/* ======================================================================== */}
      {/* SECTION A: ADMINISTRATOR ANALYTICS (Academic, Enrollment, Staff)        */}
      {/* ======================================================================== */}
      {(activeAnalyticsView === 'admin' || activeAnalyticsView === 'executive') && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span>Academic & Administrative Intelligence</span>
              </h2>
              <p className="text-xs text-slate-500">
                Enrollment trajectory, classroom capacity load, and instructor productivity indices.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500">Target Benchmark: 150 Intake</span>
          </div>

          {/* Admin Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Active Matriculants</span>
                <span className="text-emerald-700 font-semibold flex items-center">
                  <ArrowUpRight className="w-3.5 h-3.5" /> +23.7% YoY
                </span>
              </div>
              <div className="text-2xl font-black font-mono text-slate-900 tabular-nums">
                {students.length} Students
              </div>
              <div className="text-xs text-slate-500 mt-2 flex items-center justify-between">
                <span>Total Enrolled Roster</span>
                <span className="font-mono text-slate-700">100% Verified</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Course Catalog Load</span>
                <span className="text-blue-700 font-semibold">Active Term</span>
              </div>
              <div className="text-2xl font-black font-mono text-slate-900 tabular-nums">
                {courses.length} Courses
              </div>
              <div className="text-xs text-slate-500 mt-2 flex items-center justify-between">
                <span>Total Weekly Credits</span>
                <span className="font-mono text-slate-700">
                  {courses.reduce((acc, c) => acc + c.credits, 0)} Units
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Faculty Instructors</span>
                <span className="text-purple-700 font-semibold">Academic Staff</span>
              </div>
              <div className="text-2xl font-black font-mono text-slate-900 tabular-nums">
                {allUsers.filter(u => u.role === 'lecturer').length} Lecturers
              </div>
              <div className="text-xs text-slate-500 mt-2 flex items-center justify-between">
                <span>Average Course Load</span>
                <span className="font-mono text-slate-700">
                  {(courses.length / Math.max(1, allUsers.filter(u => u.role === 'lecturer').length)).toFixed(1)} crs / staff
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Lecture Hall Utilization</span>
                <span className="text-emerald-700 font-semibold">Lab Capacity</span>
              </div>
              <div className="text-2xl font-black font-mono text-slate-900 tabular-nums">
                {Math.round(courses.reduce((acc, c) => acc + (c.enrolledStudentsCount || 0), 0) / Math.max(1, courses.length * 50) * 100)}%
              </div>
              <div className="text-xs text-slate-500 mt-2 flex items-center justify-between">
                <span>Innovation Lab Peak</span>
                <span className="font-mono text-emerald-800 font-semibold">Optimal</span>
              </div>
            </div>
          </div>

          {/* GRID: Student Enrollment Trends & Department Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 1. Student Enrollment Trends Line/Area Chart (2 Cols) */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span>Student Enrollment Trajectory (Multi-Session Growth)</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Cumulative headcount intake across consecutive academic semesters at JSMT Abeokuta.
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-blue-600 inline-block" />
                    <span>Total Matriculants</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block" />
                    <span>Computing & AI</span>
                  </div>
                </div>
              </div>

              {/* Responsive SVG Area / Line Chart */}
              <div className="relative pt-4 pb-2">
                <div className="h-64 w-full">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 600 220" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="enrollmentGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="techGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Guideline Grids */}
                    <line x1="40" y1="30" x2="580" y2="30" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="40" y1="80" x2="580" y2="80" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="40" y1="130" x2="580" y2="130" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="40" y1="180" x2="580" y2="180" stroke="#e2e8f0" strokeWidth="1.5" />

                    {/* Y-Axis Value Labels */}
                    <text x="30" y="34" fill="#94a3b8" fontSize="10" textAnchor="end" fontFamily="monospace">160</text>
                    <text x="30" y="84" fill="#94a3b8" fontSize="10" textAnchor="end" fontFamily="monospace">120</text>
                    <text x="30" y="134" fill="#94a3b8" fontSize="10" textAnchor="end" fontFamily="monospace">80</text>
                    <text x="30" y="184" fill="#94a3b8" fontSize="10" textAnchor="end" fontFamily="monospace">40</text>

                    {/* SVG Coordinates Math:
                        Points at X: 80, 200, 320, 440, 560
                        Values: 54, 72, 98, 118, 146
                        Formula: Y = 180 - ((val - 40) / 120) * 150
                        54: Y = 180 - (14/120)*150 = 162.5
                        72: Y = 180 - (32/120)*150 = 140
                        98: Y = 180 - (58/120)*150 = 107.5
                        118: Y = 180 - (78/120)*150 = 82.5
                        146: Y = 180 - (106/120)*150 = 47.5
                    */}

                    {/* Total Area Fill */}
                    <path
                      d="M 80 162.5 L 200 140 L 320 107.5 L 440 82.5 L 560 47.5 L 560 180 L 80 180 Z"
                      fill="url(#enrollmentGrad)"
                    />

                    {/* Computing Sub-Path Fill */}
                    {/* Comp values: 28, 36, 48, 58, 72. Y = 180 - ((comp - 10)/80)*130 approx */}
                    <path
                      d="M 80 170 L 200 158 L 320 140 L 440 126 L 560 102 L 560 180 L 80 180 Z"
                      fill="url(#techGrad)"
                    />
                    <path
                      d="M 80 170 L 200 158 L 320 140 L 440 126 L 560 102"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                    />

                    {/* Total Line Stroke */}
                    <path
                      d="M 80 162.5 L 200 140 L 320 107.5 L 440 82.5 L 560 47.5"
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />

                    {/* Dots and interactive hover circles */}
                    {[
                      { x: 80, y: 162.5, item: historicalEnrollmentData[0] },
                      { x: 200, y: 140, item: historicalEnrollmentData[1] },
                      { x: 320, y: 107.5, item: historicalEnrollmentData[2] },
                      { x: 440, y: 82.5, item: historicalEnrollmentData[3] },
                      { x: 560, y: 47.5, item: historicalEnrollmentData[4] },
                    ].map((pt, idx) => (
                      <g key={idx} className="cursor-pointer group" onMouseEnter={() => setHoveredDataPoint(pt.item)} onMouseLeave={() => setHoveredDataPoint(null)}>
                        <circle cx={pt.x} cy={pt.y} r="5" fill="#ffffff" stroke="#2563eb" strokeWidth="3" />
                        <circle cx={pt.x} cy={pt.y} r="14" fill="#2563eb" fillOpacity="0" className="group-hover:fill-opacity-15 transition-all" />
                      </g>
                    ))}

                    {/* X-Axis Session Labels */}
                    <text x="80" y="202" fill="#64748b" fontSize="9" textAnchor="middle" fontWeight="500">2024/25 S1</text>
                    <text x="200" y="202" fill="#64748b" fontSize="9" textAnchor="middle" fontWeight="500">2024/25 S2</text>
                    <text x="320" y="202" fill="#64748b" fontSize="9" textAnchor="middle" fontWeight="500">2025/26 S1</text>
                    <text x="440" y="202" fill="#64748b" fontSize="9" textAnchor="middle" fontWeight="500">2025/26 S2</text>
                    <text x="560" y="202" fill="#1e293b" fontSize="10" textAnchor="middle" fontWeight="700">2026/27 Current</text>
                  </svg>
                </div>

                {/* Hover Tooltip / Detail strip */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 mt-2 flex flex-wrap items-center justify-between text-xs">
                  {hoveredDataPoint ? (
                    <>
                      <div className="font-semibold text-slate-800">
                        {hoveredDataPoint.period}: <span className="font-mono font-bold text-blue-700">{hoveredDataPoint.total} students</span>
                      </div>
                      <div className="text-slate-600 flex items-center gap-3">
                        <span>Comp: {hoveredDataPoint.comp}</span>
                        <span>Data: {hoveredDataPoint.data}</span>
                        <span>Cyb: {hoveredDataPoint.cyb}</span>
                        <span className="text-emerald-700 font-bold">+{hoveredDataPoint.growth}% YoY</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-slate-500 w-full text-center sm:text-left flex items-center justify-between">
                      <span>Hover over any data point for detailed departmental breakdown</span>
                      <span className="font-bold text-blue-700">Projected Next Session: 185 Students (+26%)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Department Breakdown Cards & Level Distribution (1 Col) */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <PieChartIcon className="w-4 h-4 text-purple-600" />
                  <span>Enrollment by Academic Track</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Distribution of matriculated candidates across faculties.
                </p>
              </div>

              <div className="space-y-3.5">
                {departmentEnrollments.map((dept) => (
                  <div key={dept.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 truncate pr-2">{dept.name}</span>
                      <span className="font-mono font-bold text-slate-900 shrink-0">
                        {dept.count} <span className="text-slate-400 font-normal">({dept.percentage}%)</span>
                      </span>
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          dept.code === 'SCSE'
                            ? 'bg-blue-600'
                            : dept.code === 'DSAI'
                            ? 'bg-emerald-500'
                            : dept.code === 'CDFS'
                            ? 'bg-amber-500'
                            : 'bg-purple-500'
                        }`}
                        style={{ width: `${Math.max(8, dept.percentage)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="text-xs font-bold text-slate-700 block">Class Level Distribution:</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Year 1 (Certificate / ND)</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">68.2%</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Year 2 & Diploma Track</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">31.8%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* GRID: Course Popularity & Staff Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 3. Course Popularity Chart & Ranking */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <span>Course Popularity & Lab Capacity Index</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Courses ranked by student enrollments and Innovation Lab capacity fill rate.
                  </p>
                </div>
                <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  Capacity: 50 / lab
                </span>
              </div>

              {/* Course Popularity List with Horizontal Bar Indicators */}
              <div className="space-y-3.5">
                {coursePopularity.slice(0, 5).map((course, idx) => (
                  <div key={course.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-800 text-[11px] font-bold flex items-center justify-center font-mono">
                          #{idx + 1}
                        </span>
                        <div>
                          <span className="font-mono font-bold text-xs text-blue-900 mr-2">{course.code}</span>
                          <span className="text-xs font-bold text-slate-800">{course.title}</span>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-extrabold text-slate-900 shrink-0">
                        {course.enrolled} Enrolled
                      </span>
                    </div>

                    {/* Progress Bar & Sub-metrics */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[11px] text-slate-500">
                        <span>Lecturer: {course.lecturerName}</span>
                        <span className={`font-mono font-semibold ${course.capacityRate >= 80 ? 'text-amber-700' : 'text-emerald-700'}`}>
                          {course.capacityRate}% Lab Utilized
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            course.capacityRate >= 80 ? 'bg-amber-500' : 'bg-blue-600'
                          }`}
                          style={{ width: `${course.capacityRate}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/60">
                      <span>{course.credits} Credits · {course.scheduleDay}</span>
                      <span className="text-slate-700 font-medium">📍 {course.venue}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Staff Activity & Output Scorecard */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    <span>Faculty & Staff Activity Scorecard</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Teaching output, lecture lab sessions taken, and coursework turnaround rates.
                  </p>
                </div>
                <span className="text-xs text-slate-500 font-medium">Active Instructors</span>
              </div>

              {/* Staff Cards */}
              <div className="space-y-3.5">
                {staffActivity.map(({ lecturer, coursesCount, sessionsHeld, materialsShared, gradingRate, activityIndex }) => (
                  <div key={lecturer.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-700 text-white font-bold text-xs flex items-center justify-center">
                          {lecturer.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">{lecturer.name}</div>
                          <div className="text-[11px] text-slate-500">{lecturer.department}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          {activityIndex}/100 Activity
                        </span>
                      </div>
                    </div>

                    {/* Operational metrics grid */}
                    <div className="grid grid-cols-4 gap-2 text-center text-[11px] pt-1 border-t border-slate-200/60">
                      <div className="bg-white p-1.5 rounded-lg border border-slate-200/80">
                        <span className="text-slate-400 block text-[10px]">Courses</span>
                        <span className="font-mono font-bold text-slate-800">{coursesCount}</span>
                      </div>
                      <div className="bg-white p-1.5 rounded-lg border border-slate-200/80">
                        <span className="text-slate-400 block text-[10px]">Lab Sessions</span>
                        <span className="font-mono font-bold text-slate-800">{sessionsHeld}</span>
                      </div>
                      <div className="bg-white p-1.5 rounded-lg border border-slate-200/80">
                        <span className="text-slate-400 block text-[10px]">Materials</span>
                        <span className="font-mono font-bold text-slate-800">{materialsShared}</span>
                      </div>
                      <div className="bg-white p-1.5 rounded-lg border border-slate-200/80">
                        <span className="text-slate-400 block text-[10px]">Grading</span>
                        <span className="font-mono font-bold text-emerald-700">{gradingRate}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Audit trail quick summary */}
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-900 flex items-center justify-between">
                <span>Total faculty audit activities logged this semester:</span>
                <span className="font-mono font-bold">{auditLogs.length} verified operations</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================== */}
      {/* SECTION B: FINANCE OFFICER ANALYTICS (Revenue, Outstanding, Collection) */}
      {/* ======================================================================== */}
      {(activeAnalyticsView === 'finance' || activeAnalyticsView === 'executive') && (
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-600" />
                <span>Bursary & Financial Business Intelligence (BI)</span>
              </h2>
              <p className="text-xs text-slate-500">
                Revenue streams, fee collection efficiency gauges, and outstanding student receivables.
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              Institutional Target: 85% Rate
            </span>
          </div>

          {/* Finance Stat Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Total Invoiced Revenue</span>
                <span className="text-slate-400 font-mono">Billed</span>
              </div>
              <div className="text-2xl font-black font-mono text-slate-900 tabular-nums">
                ₦{financialMetrics.totalBilled.toLocaleString()}
              </div>
              <div className="text-xs text-slate-500 mt-2 flex items-center justify-between">
                <span>Across All Accounts</span>
                <span className="font-mono text-slate-700">{invoices.length} Invoices</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Verified Revenue Collected</span>
                <span className="text-emerald-700 font-semibold flex items-center">
                  <ArrowUpRight className="w-3.5 h-3.5" /> +18.4%
                </span>
              </div>
              <div className="text-2xl font-black font-mono text-emerald-700 tabular-nums">
                ₦{financialMetrics.totalCollected.toLocaleString()}
              </div>
              <div className="text-xs text-slate-500 mt-2 flex items-center justify-between">
                <span>Current Realized Cash</span>
                <span className="font-mono text-emerald-800 font-bold">In Bank</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Outstanding Receivables</span>
                <span className="text-amber-700 font-semibold flex items-center">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Pending
                </span>
              </div>
              <div className="text-2xl font-black font-mono text-amber-700 tabular-nums">
                ₦{financialMetrics.totalOutstanding.toLocaleString()}
              </div>
              <div className="text-xs text-slate-500 mt-2 flex items-center justify-between">
                <span>Overdue Accounts</span>
                <span className="font-mono text-amber-800 font-bold">{financialMetrics.statusCounts.overdue} Defaulters</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Overall Collection Rate</span>
                <span className="text-blue-700 font-semibold">Efficiency</span>
              </div>
              <div className="text-2xl font-black font-mono text-blue-900 tabular-nums">
                {financialMetrics.collectionRate.toFixed(1)}%
              </div>
              <div className="text-xs text-slate-500 mt-2 flex items-center justify-between">
                <span>Target: 85%</span>
                <span className="font-mono text-slate-700">Gap: -{(85 - financialMetrics.collectionRate).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* GRID: Revenue Trend & Fee Collection Gauge */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 1. Monthly Revenue Collection Curve (2 Cols) */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span>Monthly Revenue vs Invoiced Target (May – Oct 2026)</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Comparative tracking of billing vs verified cash collections at JSMT Bursary.
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-slate-300 inline-block" />
                    <span>Billed Invoices</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-emerald-600 inline-block" />
                    <span>Collected Cash</span>
                  </div>
                </div>
              </div>

              {/* Bar & Curve Visualization */}
              <div className="h-64 w-full pt-2">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 600 220" preserveAspectRatio="none">
                  {/* Grid lines */}
                  <line x1="40" y1="30" x2="580" y2="30" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="40" y1="80" x2="580" y2="80" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="40" y1="130" x2="580" y2="130" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="40" y1="180" x2="580" y2="180" stroke="#cbd5e1" strokeWidth="1.5" />

                  {/* Y-Axis Labels */}
                  <text x="35" y="34" fill="#94a3b8" fontSize="10" textAnchor="end" fontFamily="monospace">₦1.5M</text>
                  <text x="35" y="84" fill="#94a3b8" fontSize="10" textAnchor="end" fontFamily="monospace">₦1.0M</text>
                  <text x="35" y="134" fill="#94a3b8" fontSize="10" textAnchor="end" fontFamily="monospace">₦500k</text>
                  <text x="35" y="184" fill="#94a3b8" fontSize="10" textAnchor="end" fontFamily="monospace">₦0</text>

                  {/* Monthly Bars: 6 Months (X: 70, 160, 250, 340, 430, 520) */}
                  {financialMetrics.monthlyRevenue.map((item, idx) => {
                    const x = 70 + idx * 90;
                    // Max is 1500000 = 150px height
                    const maxScale = 1500000;
                    const billedHeight = (item.billed / maxScale) * 150;
                    const collectedHeight = (item.collected / maxScale) * 150;

                    const billedY = 180 - billedHeight;
                    const collectedY = 180 - collectedHeight;

                    return (
                      <g key={idx} className="cursor-pointer group">
                        {/* Billed background bar */}
                        <rect
                          x={x - 18}
                          y={billedY}
                          width="16"
                          height={billedHeight}
                          rx="3"
                          fill="#e2e8f0"
                          className="group-hover:fill-slate-300 transition-colors"
                        />
                        {/* Collected foreground bar */}
                        <rect
                          x={x + 2}
                          y={collectedY}
                          width="16"
                          height={collectedHeight}
                          rx="3"
                          fill="#059669"
                          className="group-hover:fill-emerald-700 transition-colors"
                        />

                        {/* Top Rate Label */}
                        <text
                          x={x}
                          y={collectedY - 6}
                          fill="#047857"
                          fontSize="9"
                          textAnchor="middle"
                          fontWeight="bold"
                          fontFamily="monospace"
                        >
                          {item.rate.toFixed(0)}%
                        </text>

                        {/* Month Label */}
                        <text
                          x={x}
                          y="200"
                          fill="#64748b"
                          fontSize="9"
                          textAnchor="middle"
                          fontWeight="600"
                        >
                          {item.month.split(' ')[0]}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Summary legend */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between text-xs">
                <span className="text-slate-600">
                  Peak collection occurred in October with <span className="font-mono font-bold text-slate-900">₦965,000</span> verified.
                </span>
                <span className="text-emerald-700 font-bold">
                  Bursary Net Cash Velocity: Strong
                </span>
              </div>
            </div>

            {/* 2. Fee Collection Rate Gauge & Status Breakdown (1 Col) */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Percent className="w-4 h-4 text-emerald-600" />
                  <span>Fee Collection Efficiency Gauge</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Target attainment vs minimum threshold.
                </p>
              </div>

              {/* Circular Gauge / Radial Progress */}
              <div className="flex flex-col items-center justify-center pt-2">
                <div className="relative w-44 h-44 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#f1f5f9"
                      strokeWidth="10"
                      fill="transparent"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#059669"
                      strokeWidth="10"
                      strokeDasharray={251.2}
                      strokeDashoffset={251.2 - (251.2 * (financialMetrics.collectionRate / 100))}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-black font-mono text-slate-900">
                      {financialMetrics.collectionRate.toFixed(1)}%
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Collection Rate
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold mt-0.5">
                      Target 85.0%
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Ratios */}
              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>Fully Paid Accounts</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900">{financialMetrics.statusCounts.paid}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span>Partial Installments</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900">{financialMetrics.statusCounts.partial}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span>Pending First Payment</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900">{financialMetrics.statusCounts.pending}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span>Overdue Defaulters</span>
                  </div>
                  <span className="font-mono font-bold text-rose-700">{financialMetrics.statusCounts.overdue}</span>
                </div>
              </div>
            </div>
          </div>

          {/* GRID: Fee Category Distribution & Payment Channels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 3. Revenue Breakdown by Fee Category */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-blue-600" />
                    <span>Revenue by Institutional Fee Category</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Billed amounts, collected income, and pending balances by fee schedule.
                  </p>
                </div>
                <span className="text-xs text-slate-500 font-mono">5 Categories</span>
              </div>

              <div className="space-y-3">
                {financialMetrics.categoryBreakdown.map((cat, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">{cat.category}</span>
                      <span className="font-mono font-extrabold text-slate-900">
                        ₦{cat.collected.toLocaleString()} <span className="text-slate-400 font-normal">/ ₦{cat.billed.toLocaleString()}</span>
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                          style={{ width: `${cat.rate}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-slate-500">
                        <span>Share of Collections: <strong className="text-slate-700">{cat.share}%</strong></span>
                        <span className="font-mono font-bold text-emerald-700">{cat.rate}% Collected</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Payment Channels & Gateway Volume Share */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Wallet className="w-4 h-4 text-purple-600" />
                    <span>Payment Channel Distribution</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Breakdown of student payments by verified transaction processor.
                  </p>
                </div>
                <span className="text-xs text-slate-500 font-medium">Verified Inflow</span>
              </div>

              <div className="space-y-3">
                {financialMetrics.channelBreakdown.map((ch, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                        ch.channel === 'Paystack' ? 'bg-cyan-100 text-cyan-800' :
                        ch.channel === 'Bank Transfer' ? 'bg-blue-100 text-blue-800' :
                        ch.channel === 'Remita' ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-200 text-slate-700'
                      }`}>
                        {ch.channel[0]}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{ch.channel}</div>
                        <div className="text-[11px] text-slate-500">{ch.percentage}% of total processed funds</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-extrabold text-xs text-slate-900">
                        ₦{ch.amount.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-emerald-700 font-semibold">Verified</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
                <span>Direct Automated Reconciliation Rate:</span>
                <span className="font-mono font-bold">98.2% Seamless Clearance</span>
              </div>
            </div>
          </div>

          {/* 5. Outstanding Payments & Actionable Defaulter Ledger */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Outstanding Receivables & Overdue Accounts Ledger</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Students with outstanding fee balances requiring bursary follow-up or payment reminders.
                </p>
              </div>
              <span className="text-xs font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                {financialMetrics.overdueInvoices.length} Overdue Notices Pending
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Invoice Number</th>
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3">Matriculation No</th>
                    <th className="py-2.5 px-3">Fee Category</th>
                    <th className="py-2.5 px-3 text-right">Billed Amount</th>
                    <th className="py-2.5 px-3 text-right">Outstanding Balance</th>
                    <th className="py-2.5 px-3">Due Date</th>
                    <th className="py-2.5 px-3 text-center">Bursary Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {invoices.filter(inv => inv.balance > 0).map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-900">{inv.invoiceNumber}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{inv.studentName}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{inv.matricNumber}</td>
                      <td className="py-2.5 px-3 text-slate-700">{inv.category}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600 text-right">₦{inv.amount.toLocaleString()}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-amber-700 text-right">₦{inv.balance.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-slate-500">{inv.dueDate}</td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => handleSendFeeReminder(inv)}
                          disabled={reminderSentStudentId === inv.id}
                          className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors flex items-center justify-center gap-1 mx-auto ${
                            reminderSentStudentId === inv.id
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                          }`}
                        >
                          {reminderSentStudentId === inv.id ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Notice Sent</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-3 h-3 text-amber-700" />
                              <span>Send Reminder</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
