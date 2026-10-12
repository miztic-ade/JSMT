import React from 'react';
import { Invoice, PaymentTransaction } from '../../types';
import { useSchool } from '../../context/SchoolContext';
import { Printer, X, CheckCircle2, ShieldCheck } from 'lucide-react';

interface OfficialReceiptModalProps {
  invoice: Invoice;
  transaction?: PaymentTransaction;
  onClose: () => void;
}

export const OfficialReceiptModal: React.FC<OfficialReceiptModalProps> = ({
  invoice,
  transaction,
  onClose,
}) => {
  const { schoolInfo } = useSchool();
  const tx = transaction || invoice.transactions[0] || {
    id: 'tx_demo',
    reference: 'JSMT-PAY-MANUAL',
    amount: invoice.amountPaid || invoice.amount,
    date: new Date().toISOString().replace('T', ' ').slice(0, 16),
    channel: 'Bank Transfer',
    receiptNo: 'REC-2026-DEFAULT',
    recordedBy: schoolInfo.bursarName,
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Action Header (Excluded from print) */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Official Institutional Revenue Receipt</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div className="p-8 space-y-6 bg-white text-slate-900" id="official-receipt">
          
          {/* Institutional Crest & Header */}
          <div className="text-center pb-6 border-b-2 border-slate-900/10 space-y-2">
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
                <p className="text-xs text-slate-600 font-medium mt-1">
                  {schoolInfo.address}, {schoolInfo.city}, {schoolInfo.state}, {schoolInfo.country}
                </p>
                <p className="text-[11px] text-slate-500">
                  Tel: {schoolInfo.phone} · Email: {schoolInfo.email}
                </p>
              </div>
            </div>

            <div className="pt-3">
              <span className="inline-block px-4 py-1 bg-blue-900 text-white font-bold text-xs tracking-wider uppercase rounded-sm">
                Official Bursary Payment Receipt
              </span>
            </div>
          </div>

          {/* Receipt Identifiers */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <span className="block text-slate-400 font-medium">Receipt Serial No</span>
              <span className="block font-mono font-bold text-sm text-slate-900">{tx.receiptNo}</span>
            </div>
            <div>
              <span className="block text-slate-400 font-medium">Payment Reference</span>
              <span className="block font-mono font-semibold text-slate-900">{tx.reference}</span>
            </div>
            <div>
              <span className="block text-slate-400 font-medium">Date & Timestamp</span>
              <span className="block font-mono font-medium text-slate-800">{tx.date}</span>
            </div>
            <div>
              <span className="block text-slate-400 font-medium">Payment Channel</span>
              <span className="block font-semibold text-slate-900">{tx.channel}</span>
            </div>
          </div>

          {/* Student Billing Details */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="block text-slate-400">Payer / Student Name:</span>
              <span className="block text-sm font-bold text-slate-900">{invoice.studentName}</span>
            </div>
            <div>
              <span className="block text-slate-400">Student ID / Matric Number:</span>
              <span className="block font-mono font-bold text-blue-900">{invoice.matricNumber}</span>
            </div>
            <div className="col-span-2">
              <span className="block text-slate-400">Academic Programme:</span>
              <span className="block font-medium text-slate-800">{invoice.programmeName}</span>
            </div>
          </div>

          {/* Table Breakdown */}
          <table className="w-full text-xs border border-slate-200">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="py-2 px-3 text-left font-semibold">Description</th>
                <th className="py-2 px-3 text-left font-semibold">Session / Term</th>
                <th className="py-2 px-3 text-right font-semibold">Amount (₦)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="py-3 px-3 font-medium text-slate-900">
                  {invoice.category} (Invoice #{invoice.invoiceNumber})
                </td>
                <td className="py-3 px-3 text-slate-600">{invoice.session}</td>
                <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                  ₦{tx.amount.toLocaleString()}
                </td>
              </tr>
            </tbody>
            <tfoot className="bg-slate-50 font-semibold text-slate-900 border-t border-slate-300">
              <tr>
                <td colSpan={2} className="py-2 px-3 text-right">Total Amount Received:</td>
                <td className="py-2 px-3 text-right font-mono font-bold text-blue-900 text-sm tabular-nums">
                  ₦{tx.amount.toLocaleString()}
                </td>
              </tr>
              {invoice.balance > 0 && (
                <tr className="text-red-700">
                  <td colSpan={2} className="py-1.5 px-3 text-right text-xs">Remaining Balance Due:</td>
                  <td className="py-1.5 px-3 text-right font-mono text-xs tabular-nums">
                    ₦{invoice.balance.toLocaleString()}
                  </td>
                </tr>
              )}
            </tfoot>
          </table>

          {/* Official Endorsement & Verification Stamp */}
          <div className="pt-6 border-t border-slate-200 flex items-end justify-between text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified by Bursary Office</span>
              </div>
              <p className="text-[11px] text-slate-500 max-w-xs">
                Generated from the JSMT Enterprise Portal. This receipt constitutes legal proof of fee settlement.
              </p>
            </div>

            <div className="text-center">
              <div className="w-32 border-b border-slate-900 pb-1 mb-1 font-serif italic text-blue-900 font-bold">
                L. O. Sanusi
              </div>
              <span className="block font-bold text-[11px] text-slate-900 uppercase">
                {schoolInfo.bursarName}
              </span>
              <span className="block text-[10px] text-slate-500">Chief Bursar / Bursary Controller</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
