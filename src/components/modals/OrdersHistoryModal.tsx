import React from 'react';
import { UserProfile } from '../../types';
import { X, Receipt, CheckCircle2, CreditCard, Download, ExternalLink } from 'lucide-react';
import { soundFx } from '../../utils/soundEffects';

interface OrdersHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
}

export const OrdersHistoryModal: React.FC<OrdersHistoryModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  if (!isOpen) return null;

  // Mock confirmed orders matching database Razorpay records
  const mockOrders = [
    {
      id: 'ORD-RZP-892401',
      title: 'DaVinci Resolve 19: High-Retention Masterclass',
      type: 'Course Cohort',
      batch: 'September 2026 Live Cohort',
      amount: '₹4,999',
      date: '10 Sep 2026',
      paymentMethod: 'Razorpay UPI (GPay)',
      paymentId: 'pay_P89201948201',
      status: 'SUCCESSFUL'
    },
    {
      id: 'ORD-RZP-781920',
      title: 'Creator Production Asset Vault (40GB)',
      type: 'Asset Pack Locker',
      batch: 'VIP Access',
      amount: '₹999',
      date: '12 Aug 2026',
      paymentMethod: 'Razorpay Card',
      paymentId: 'pay_P78192038101',
      status: 'SUCCESSFUL'
    }
  ];

  const ordersList = currentUser.isEnrolled ? mockOrders : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#10131f] text-slate-100 rounded-3xl shadow-2xl border border-slate-700/80 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#141726] border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold text-xs shadow-xs">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400 font-mono">
                RAZORPAY PAYMENT HISTORY
              </span>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Orders & Confirmed Invoices
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {ordersList.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
                <CreditCard className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white">No Payment History Found</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                You have not completed any masterclass or asset pack purchases yet. Confirmed Razorpay transactions will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {ordersList.map(order => (
                <div
                  key={order.id}
                  className="bg-[#151928] border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        ✓ {order.status}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">{order.id}</span>
                    </div>

                    <h4 className="text-sm font-bold text-white">{order.title}</h4>
                    
                    <div className="text-xs text-slate-400 font-mono space-x-3">
                      <span>Date: <strong className="text-slate-200">{order.date}</strong></span>
                      <span>•</span>
                      <span>Payment ID: <strong className="text-slate-200">{order.paymentId}</strong></span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                    <div className="text-base font-black text-emerald-400 font-mono">
                      {order.amount}
                    </div>
                    <button
                      onClick={() => soundFx.playPop()}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1 transition-colors border border-slate-700"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-400" />
                      <span>Receipt</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
