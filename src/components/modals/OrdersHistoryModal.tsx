import React from 'react';
import { createPortal } from 'react-dom';
import { UserProfile } from '../../types';
import { X, Receipt, CheckCircle2, CreditCard, Download, ExternalLink } from 'lucide-react';
import { soundFx } from '../../utils/soundEffects';
import { DbService } from '../../services/dbService';

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

  const [ordersList, setOrdersList] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (isOpen && currentUser && currentUser.id) {
      const fetchOrders = async () => {
        setLoading(true);
        const orders = await DbService.getUserOrders(currentUser.id);
        
        const formattedOrders = orders
          .filter(o => o.status === 'paid' || o.status === 'created')
          .map(o => ({
            id: o.razorpayOrderId,
            title: o.itemType === 'course' ? 'DaVinci Resolve Masterclass' : o.itemType === 'bundle' ? 'Full Platform Bundle' : 'Creator Asset Pack',
            type: o.itemType === 'course' ? 'Course Cohort' : o.itemType === 'bundle' ? 'Bundle Access' : 'Asset Pack',
            batch: 'September 2026',
            amount: `₹${o.amount}`,
            date: new Date(o.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
            paymentMethod: 'Razorpay',
            paymentId: o.razorpayOrderId,
            status: o.status === 'paid' ? 'SUCCESSFUL' : 'PENDING'
          }));
        
        setOrdersList(formattedOrders);
        setLoading(false);
      };
      fetchOrders();
    }
  }, [isOpen, currentUser]);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
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
          {loading ? (
            <div className="py-12 flex justify-center items-center">
              <div className="w-8 h-8 rounded-full border-2 border-slate-700 border-t-emerald-500 animate-spin" />
            </div>
          ) : ordersList.length === 0 ? (
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
    </div>,
    document.body
  );
};
