import React, { useState } from 'react';
import { Invoice, PaymentTransaction } from '../../types';
import { useSchool } from '../../context/SchoolContext';
import { CreditCard, Landmark, CheckCircle2, X, Shield, Lock } from 'lucide-react';

interface PaymentGatewayModalProps {
  invoice: Invoice;
  onClose: () => void;
  onPaymentSuccess: (tx: PaymentTransaction) => void;
}

export const PaymentGatewayModal: React.FC<PaymentGatewayModalProps> = ({
  invoice,
  onClose,
  onPaymentSuccess,
}) => {
  const { recordPayment } = useSchool();
  const [channel, setChannel] = useState<PaymentTransaction['channel']>('Paystack');
  const [payAmount, setPayAmount] = useState<number>(invoice.balance || invoice.amount);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [generatedTx, setGeneratedTx] = useState<PaymentTransaction | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (payAmount <= 0) return;

    setIsProcessing(true);
    setTimeout(() => {
      const tx = recordPayment(invoice.id, payAmount, channel);
      setGeneratedTx(tx);
      setIsProcessing(false);
      setIsDone(true);
      onPaymentSuccess(tx);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>Secure Bursary Payment Portal</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {!isDone ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Invoice Summary */}
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs space-y-1">
              <div className="flex justify-between font-semibold text-blue-950">
                <span>{invoice.category}</span>
                <span className="font-mono">{invoice.invoiceNumber}</span>
              </div>
              <div className="text-slate-600">Student: {invoice.studentName}</div>
              <div className="flex justify-between pt-1 border-t border-blue-200/50 text-slate-700">
                <span>Total Fee: ₦{invoice.amount.toLocaleString()}</span>
                <span className="font-bold text-blue-900">
                  Balance Due: ₦{invoice.balance.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Select Payment Channel
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'Paystack', label: 'Paystack Card / Transfer', desc: 'Instant Verification' },
                  { id: 'Bank Transfer', label: 'Direct Bank Transfer', desc: 'Access / GTBank JSMT Acct' },
                  { id: 'Remita', label: 'Remita RRR', desc: 'Federal & Institutional RRR' },
                  { id: 'Cash Deposit', label: 'Bursary Cash Office', desc: 'Idi Aba Counter' },
                ].map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setChannel(item.id as PaymentTransaction['channel'])}
                    className={`p-3 text-left rounded-xl border text-xs transition-colors ${
                      channel === item.id
                        ? 'border-blue-600 bg-blue-50/50 text-blue-950 font-semibold shadow-xs'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold leading-tight">{item.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Amount */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Payment Amount (₦ Naira)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">₦</span>
                <input
                  type="number"
                  min={1000}
                  max={invoice.balance || invoice.amount}
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-500">
                You can pay full balance or minimum installment (₦1,000+).
              </p>
            </div>

            {/* School Bank Account details for Transfer */}
            {channel === 'Bank Transfer' && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-700 space-y-1">
                <div className="font-semibold text-slate-900">Official JSMT Collection Account:</div>
                <div>Bank: <strong>Access Bank PLC / GTBank</strong></div>
                <div>Account Name: <strong>Jaroy School of Mgmt & Tech</strong></div>
                <div>Account Number: <strong className="font-mono text-blue-900">0129384756</strong></div>
              </div>
            )}

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-400 text-white font-bold text-xs rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <span>Securing Transaction...</span>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>Confirm & Authorize ₦{payAmount.toLocaleString()}</span>
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Payment Successfully Recorded!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Amount: <strong className="text-slate-900">₦{payAmount.toLocaleString()}</strong> via {channel}
              </p>
              <p className="text-xs font-mono font-semibold text-blue-900 mt-1">
                Receipt No: {generatedTx?.receiptNo}
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={onClose}
                className="w-full py-2.5 bg-blue-950 hover:bg-blue-900 text-white font-semibold text-xs rounded-xl transition-colors"
              >
                Close & View Updated Ledger
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
