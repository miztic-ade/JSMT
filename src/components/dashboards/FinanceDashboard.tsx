import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Invoice, PaymentTransaction } from '../../types';
import {
  Wallet,
  FileSpreadsheet,
  Download,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Building,
  Printer,
  ShieldCheck,
  CreditCard,
  TrendingUp,
  BarChart3,
  ArrowUpRight,
} from 'lucide-react';
import { OfficialReceiptModal } from '../modals/OfficialReceiptModal';
import { PaymentGatewayModal } from '../modals/PaymentGatewayModal';
import { AnalyticsDashboard } from './AnalyticsDashboard';

interface FinanceDashboardProps {
  activeTab: string;
  setActiveTab?: (tab: string) => void;
}

export const FinanceDashboard: React.FC<FinanceDashboardProps> = ({ activeTab, setActiveTab }) => {
  const {
    invoices,
    students,
    programmes,
    createInvoice,
    recordPayment,
    schoolInfo,
  } = useSchool();

  // Search & filter
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'partial' | 'pending' | 'overdue'>('all');

  // Modals state
  const [selectedInvoiceForReceipt, setSelectedInvoiceForReceipt] = useState<Invoice | null>(null);
  const [selectedTxForReceipt, setSelectedTxForReceipt] = useState<PaymentTransaction | undefined>(undefined);
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);

  // New Invoice Form
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  const [newInv, setNewInv] = useState({
    studentId: students[0]?.id || '',
    category: 'Tuition Fee' as Invoice['category'],
    amount: 185000,
    dueDate: '2026-11-15',
    session: '2026/2027 First Semester',
  });

  // Financial metrics
  const totalInvoiced = invoices.reduce((acc, inv) => acc + inv.amount, 0);
  const totalCollected = invoices.reduce((acc, inv) => acc + inv.amountPaid, 0);
  const totalOutstanding = invoices.reduce((acc, inv) => acc + inv.balance, 0);
  const collectionRate = totalInvoiced > 0 ? Math.round((totalCollected / totalInvoiced) * 100) : 0;

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.studentName.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
      inv.matricNumber.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
      inv.invoiceNumber.toLowerCase().includes(invoiceSearch.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const stud = students.find((s) => s.id === newInv.studentId) || students[0];
    createInvoice({
      studentId: stud.id,
      studentName: stud.fullName,
      matricNumber: stud.studentId,
      programmeName: stud.programmeName,
      category: newInv.category,
      amount: newInv.amount,
      dueDate: newInv.dueDate,
      session: newInv.session,
    });
    setShowCreateInvoice(false);
  };

  const exportFinancialLedgerCsv = () => {
    const headers = ['Invoice No', 'Student Name', 'Matric Number', 'Fee Category', 'Billed Amount (NGN)', 'Paid (NGN)', 'Balance (NGN)', 'Status', 'Due Date'];
    const rows = invoices.map((inv) => [
      inv.invoiceNumber,
      `"${inv.studentName}"`,
      inv.matricNumber,
      `"${inv.category}"`,
      inv.amount,
      inv.amountPaid,
      inv.balance,
      inv.status,
      inv.dueDate,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `JSMT_Bursary_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
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
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider block">
                Bursary & Financial Controller Directorate
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Institutional Revenue & Student Invoicing
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Bursar: <strong>{schoolInfo.bursarName}</strong> · Fee accounts for {schoolInfo.currentSession}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCreateInvoice(true)}
                className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Issue Student Invoice</span>
              </button>
              <button
                onClick={exportFinancialLedgerCsv}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Ledger CSV</span>
              </button>
            </div>
          </div>

          {/* Key Financial KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 block">Total Invoiced</span>
              <span className="text-2xl font-black font-mono text-slate-900 tabular-nums">
                ₦{totalInvoiced.toLocaleString()}
              </span>
              <span className="text-xs text-slate-500 block mt-1">Billed Fees</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 block">Total Revenue Realized</span>
              <span className="text-2xl font-black font-mono text-emerald-800 tabular-nums">
                ₦{totalCollected.toLocaleString()}
              </span>
              <span className="text-xs text-emerald-700 block mt-1">Cleared in Bank / Cash</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 block">Outstanding Receivables</span>
              <span className="text-2xl font-black font-mono text-amber-900 tabular-nums">
                ₦{totalOutstanding.toLocaleString()}
              </span>
              <span className="text-xs text-amber-700 block mt-1">Pending Collection</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 block">Collection Rate</span>
              <span className="text-2xl font-black font-mono text-blue-900 tabular-nums">
                {collectionRate}%
              </span>
              <span className="text-xs text-blue-700 block mt-1">Realization Efficiency</span>
            </div>
          </div>

          {/* Recent Invoices Quick Table */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Recent Student Invoices</h3>
              <button
                onClick={() => setStatusFilter('all')}
                className="text-xs font-semibold text-blue-700 hover:text-blue-900"
              >
                View Complete Ledger &rarr;
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 border-y border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Invoice No</th>
                    <th className="py-2.5 px-3 font-semibold">Student Name</th>
                    <th className="py-2.5 px-3 font-semibold">Category</th>
                    <th className="py-2.5 px-3 text-right font-semibold">Billed (₦)</th>
                    <th className="py-2.5 px-3 text-right font-semibold">Paid (₦)</th>
                    <th className="py-2.5 px-3 text-right font-semibold">Balance (₦)</th>
                    <th className="py-2.5 px-3 font-semibold">Status</th>
                    <th className="py-2.5 px-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.slice(0, 5).map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{inv.invoiceNumber}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-900">
                        {inv.studentName}
                        <span className="block font-mono text-[10px] text-slate-400">{inv.matricNumber}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">{inv.category}</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums">₦{inv.amount.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-emerald-700 font-semibold tabular-nums">
                        ₦{inv.amountPaid.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-amber-900 font-semibold tabular-nums">
                        ₦{inv.balance.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            inv.status === 'paid'
                              ? 'bg-emerald-50 text-emerald-700'
                              : inv.status === 'partial'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {inv.transactions.length > 0 && (
                          <button
                            onClick={() => {
                              setSelectedInvoiceForReceipt(inv);
                              setSelectedTxForReceipt(inv.transactions[0]);
                            }}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-semibold text-[11px]"
                          >
                            Receipt
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* Financial BI Analytics Spotlight Banner */}
          <div className="bg-linear-to-r from-emerald-950 via-slate-900 to-indigo-950 text-white p-6 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Bursary Business Intelligence & Analytics</span>
                <span aria-hidden="true">·</span>
                <span>Revenue Telemetry</span>
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Visualizations of Revenue, Outstanding Receivables & Fee Collection Rates
              </h3>
              <p className="text-xs text-slate-300 max-w-xl">
                Real-time collection efficiency radial gauge ({collectionRate}%), monthly income trajectories vs targets, fee schedule distribution, and actionable defaulter management with direct payment notice dispatch.
              </p>
            </div>
            <button
              onClick={() => setActiveTab?.('analytics')}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-2 shrink-0 self-start md:self-center"
            >
              <span>Explore Financial Analytics</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <AnalyticsDashboard initialRoleFilter="finance" />
      )}

      {/* INVOICES & LEDGER TAB */}
      {(activeTab === 'invoices' || activeTab === 'record_payment') && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Student Fee Invoices & Payments Ledger</h2>
              <p className="text-xs text-slate-500">Record verified payments, generate official receipts, and audit transactions</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search invoice or student..."
                  value={invoiceSearch}
                  onChange={(e) => setInvoiceSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 w-56 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-700 font-medium"
              >
                <option value="all">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="partial">Partial</option>
                <option value="overdue">Overdue</option>
                <option value="pending">Pending</option>
              </select>

              <button
                onClick={() => setShowCreateInvoice(true)}
                className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Issue Invoice</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-y border-slate-200">
                <tr>
                  <th className="py-3 px-3 font-semibold">Invoice No</th>
                  <th className="py-3 px-3 font-semibold">Student Name</th>
                  <th className="py-3 px-3 font-semibold">Programme</th>
                  <th className="py-3 px-3 font-semibold">Category</th>
                  <th className="py-3 px-3 text-right font-semibold">Amount (₦)</th>
                  <th className="py-3 px-3 text-right font-semibold">Paid (₦)</th>
                  <th className="py-3 px-3 text-right font-semibold">Balance (₦)</th>
                  <th className="py-3 px-3 font-semibold">Status</th>
                  <th className="py-3 px-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">{inv.invoiceNumber}</td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{inv.studentName}</div>
                      <div className="font-mono text-[10px] text-blue-900">{inv.matricNumber}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 truncate max-w-xs">{inv.programmeName}</td>
                    <td className="py-3 px-3 font-medium text-slate-800">{inv.category}</td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums">₦{inv.amount.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right font-mono text-emerald-700 font-bold tabular-nums">
                      ₦{inv.amountPaid.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-amber-900 font-bold tabular-nums">
                      ₦{inv.balance.toLocaleString()}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          inv.status === 'paid'
                            ? 'bg-emerald-50 text-emerald-700'
                            : inv.status === 'partial'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                      {inv.balance > 0 && (
                        <button
                          onClick={() => setPayingInvoice(inv)}
                          className="px-2.5 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded font-bold text-[11px]"
                        >
                          Record Payment
                        </button>
                      )}
                      {inv.transactions.length > 0 && (
                        <button
                          onClick={() => {
                            setSelectedInvoiceForReceipt(inv);
                            setSelectedTxForReceipt(inv.transactions[0]);
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-semibold text-[11px]"
                        >
                          Receipt
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* OVERDUE & DEFAULTERS TAB */}
      {activeTab === 'overdue' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Overdue Fees & Defaulters Tracker</h2>
            <p className="text-xs text-slate-500">Students with outstanding tuition past due dates</p>
          </div>

          <div className="space-y-3">
            {invoices.filter((inv) => inv.balance > 0).map((inv) => (
              <div key={inv.id} className="p-4 bg-amber-50/50 rounded-xl border border-amber-200 text-xs flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{inv.studentName}</span>
                    <span className="font-mono text-blue-900 font-bold">{inv.matricNumber}</span>
                  </div>
                  <div className="text-slate-600">Category: {inv.category} · Due Date: {inv.dueDate}</div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-amber-800 block uppercase font-medium">Outstanding Balance</span>
                  <span className="text-sm font-black font-mono text-amber-950 tabular-nums">
                    ₦{inv.balance.toLocaleString()}
                  </span>
                  <div className="pt-1">
                    <button
                      onClick={() => setPayingInvoice(inv)}
                      className="px-3 py-1 bg-amber-700 hover:bg-amber-800 text-white rounded font-bold text-[11px]"
                    >
                      Clear Debt
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* APPROVED FEE SCHEDULES TAB */}
      {activeTab === 'fee_structures' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Approved Institutional Fee Schedules</h2>
            <p className="text-xs text-slate-500">Official bursary approved tariffs for {schoolInfo.currentSession}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {programmes.map((p) => (
              <div key={p.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-3">
                <span className="font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                  {p.code}
                </span>
                <h4 className="font-bold text-slate-900 text-sm">{p.name}</h4>
                <div className="space-y-1 text-slate-600 pt-1 border-t border-slate-200/60">
                  <div className="flex justify-between">
                    <span>Tuition Per Term:</span>
                    <strong className="font-mono text-slate-900">₦{p.tuitionPerTerm.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Tech Lab & Internet Fee:</span>
                    <strong className="font-mono text-slate-900">₦35,000</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Exam & Cert Fee:</span>
                    <strong className="font-mono text-slate-900">₦25,000</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE INVOICE MODAL */}
      {showCreateInvoice && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900">Issue New Student Fee Invoice</h3>
            <form onSubmit={handleCreateInvoice} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Student *</label>
                <select
                  value={newInv.studentId}
                  onChange={(e) => setNewInv({ ...newInv, studentId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.studentId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Fee Category *</label>
                <select
                  value={newInv.category}
                  onChange={(e) => setNewInv({ ...newInv, category: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                >
                  <option value="Tuition Fee">Tuition Fee</option>
                  <option value="Technology Lab Fee">Technology Lab Fee</option>
                  <option value="Registration & Matriculation">Registration & Matriculation</option>
                  <option value="Professional Exam Fee">Professional Exam Fee</option>
                  <option value="Library & Resources">Library & Resources</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Fee Amount (₦ Naira) *</label>
                <input
                  type="number"
                  min={1000}
                  value={newInv.amount}
                  onChange={(e) => setNewInv({ ...newInv, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={newInv.dueDate}
                  onChange={(e) => setNewInv({ ...newInv, dueDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateInvoice(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg"
                >
                  Issue Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PAYMENT GATEWAY MODAL */}
      {payingInvoice && (
        <PaymentGatewayModal
          invoice={payingInvoice}
          onClose={() => setPayingInvoice(null)}
          onPaymentSuccess={(tx) => {
            setSelectedInvoiceForReceipt(payingInvoice);
            setSelectedTxForReceipt(tx);
          }}
        />
      )}

      {/* OFFICIAL RECEIPT MODAL */}
      {selectedInvoiceForReceipt && (
        <OfficialReceiptModal
          invoice={selectedInvoiceForReceipt}
          transaction={selectedTxForReceipt}
          onClose={() => {
            setSelectedInvoiceForReceipt(null);
            setSelectedTxForReceipt(undefined);
          }}
        />
      )}

    </div>
  );
};
