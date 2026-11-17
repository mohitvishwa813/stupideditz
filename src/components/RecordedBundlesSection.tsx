import React, { useState } from 'react';
import { RecordedBundle, UserProfile } from '../types';
import { 
  Film, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Lock, 
  Download, 
  Clock, 
  FolderDown, 
  Check, 
  Layers, 
  ShieldCheck,
  Video
} from 'lucide-react';
import { soundFx } from '../utils/soundEffects';
import confetti from 'canvas-confetti';
import { loadRazorpay } from '../utils/loadRazorpay';
import { ApiService } from '../services/apiService';

interface RecordedBundlesSectionProps {
  bundles: RecordedBundle[];
  currentUser: UserProfile | null;
  onOpenLoginModal: () => void;
  onOpenStudentPortal: (tab?: 'enrolled-courses' | 'classroom' | 'assets') => void;
}

export const RecordedBundlesSection: React.FC<RecordedBundlesSectionProps> = ({
  bundles,
  currentUser,
  onOpenLoginModal,
  onOpenStudentPortal
}) => {
  const [processingBundleId, setProcessingBundleId] = useState<string | null>(null);

  // Filter only published bundles
  const visibleBundles = bundles.filter(b => b.isPublished !== false);

  if (!visibleBundles || visibleBundles.length === 0) {
    return null;
  }

  const handlePurchase = async (bundle: RecordedBundle) => {
    if (!currentUser) {
      soundFx.playGlitch();
      onOpenLoginModal();
      return;
    }

    const isAlreadyPurchased = 
      currentUser.purchasedAssets?.includes(bundle.id) ||
      currentUser.orderHistory?.some(o => o.itemId === bundle.id && o.status === 'paid');

    if (isAlreadyPurchased) {
      soundFx.playWhoosh();
      onOpenStudentPortal('assets');
      return;
    }

    soundFx.playWhoosh();
    setProcessingBundleId(bundle.id);

    try {
      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        alert('Failed to load Razorpay SDK. Please check your internet connection.');
        setProcessingBundleId(null);
        return;
      }

      const orderRes = await ApiService.createPaymentOrder(bundle.price, 'bundle', bundle.id, currentUser.id);

      if (!orderRes.success || !orderRes.orderId) {
        alert('Failed to initialize secure checkout. Please try again.');
        setProcessingBundleId(null);
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || '',
        amount: orderRes.amount,
        currency: orderRes.currency || 'INR',
        name: 'Stupid Editz Studio',
        description: `Purchase ${bundle.title}`,
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        order_id: orderRes.orderId,
        handler: async function (response: any) {
          try {
            const verification = await ApiService.verifyPaymentSignature({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              userId: currentUser.id
            });

            if (verification.success) {
              soundFx.playPop();
              confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });

              const newOrder = {
                id: response.razorpay_order_id,
                amount: orderRes.amount ? orderRes.amount / 100 : bundle.price,
                currency: orderRes.currency || 'INR',
                itemType: 'bundle',
                itemId: bundle.id,
                status: 'paid',
                createdAt: new Date().toISOString()
              };

              import('../services/storageService').then(m => {
                const latestUser = m.StorageService.getCurrentUser() || currentUser;
                const updatedUser = { 
                  ...latestUser, 
                  purchasedAssets: Array.from(new Set([...(latestUser.purchasedAssets || []), bundle.id])),
                  orderHistory: [newOrder, ...(latestUser.orderHistory || [])]
                };
                m.StorageService.setCurrentUser(updatedUser);
                alert(`🎉 Payment Successful! The "${bundle.title}" has been added directly to your Student Asset Vault!`);
                onOpenStudentPortal('assets');
              });
            } else {
              alert('Payment verification failed. Please contact support.');
            }
          } catch (e) {
            console.error('Signature verification error:', e);
            alert('Payment verification error occurred.');
          } finally {
            setProcessingBundleId(null);
          }
        },
        prefill: {
          name: currentUser.name || '',
          email: currentUser.email || ''
        },
        theme: { color: '#8b5cf6' },
        modal: {
          ondismiss: function() {
            setProcessingBundleId(null);
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (err) {
      console.error('Payment error:', err);
      alert('Could not connect to payment gateway.');
      setProcessingBundleId(null);
    }
  };

  return (
    <section className="py-16 bg-[#0a0c16] text-slate-100 border-t border-slate-800" id="recorded-bundles-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/15 text-purple-400 text-xs font-mono font-bold uppercase tracking-wider mb-3 border border-purple-500/30 pulse-glow-border">
            <Film className="w-3.5 h-3.5" />
            Full Recorded Masterclass Editions
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Recorded Session <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-blue-400 bg-clip-text text-transparent">Collection Bundles</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-2.5">
            Can't attend the live cohort timings? Get complete uncut access to past batch class recordings, raw DaVinci project files, and practice assets. Instant lifetime drive access automatically added to your Student Vault.
          </p>
        </div>

        {/* Bundles List */}
        <div className="flex flex-col gap-8">
          {visibleBundles.map((bundle) => {
            const isPurchased = 
              currentUser?.purchasedAssets?.includes(bundle.id) ||
              currentUser?.orderHistory?.some(o => o.itemId === bundle.id && o.status === 'paid');
            const isProcessing = processingBundleId === bundle.id;

            return (
              <div
                key={bundle.id}
                className="glass-card glass-card-hover border border-purple-500/30 hover:border-purple-500/50 rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row transition-all duration-300 group w-full relative"
              >
                {/* Left Side: Thumbnail Preview */}
                <div className="relative w-full lg:w-5/12 h-[260px] lg:h-auto overflow-hidden bg-black shrink-0">
                  <img
                    src={bundle.thumbnail}
                    alt={bundle.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#101322] via-[#101322]/30 to-black/40" />

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[11px] font-bold uppercase tracking-wider shadow-lg shadow-purple-600/30">
                      {bundle.badgeText || 'RECORDED ARCHIVE'}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-slate-200 text-[11px] font-mono border border-white/10 font-semibold flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-purple-400" />
                      {bundle.totalHours || '40+ Hours'}
                    </span>
                  </div>

                  {isPurchased && (
                    <div className="absolute top-4 right-4 bg-emerald-500 text-slate-950 px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-500/30">
                      <CheckCircle2 className="w-4 h-4" />
                      In Your Asset Vault
                    </div>
                  )}

                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-slate-200 font-mono">
                    <span className="flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-3 py-1 rounded border border-white/10 font-semibold">
                      <Video className="w-4 h-4 text-purple-400" />
                      {bundle.totalSessionsCount || 26} Full Class Recordings
                    </span>
                  </div>
                </div>

                {/* Right Side: Details & Buy action */}
                <div className="flex-1 p-6 lg:p-8 flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl lg:text-3xl font-extrabold text-white leading-tight group-hover:text-purple-300 transition-colors">
                      {bundle.title}
                    </h3>
                    <p className="text-sm text-slate-400 mt-2.5 leading-relaxed">
                      {bundle.subtitle}
                    </p>

                    {bundle.description && (
                      <p className="text-xs text-slate-500 mt-3 line-clamp-2">
                        {bundle.description}
                      </p>
                    )}

                    {/* Highlights list */}
                    <div className="mt-6 space-y-2.5">
                      {bundle.highlights.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                          <span className="text-sm text-slate-300 font-medium">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing and Actions */}
                  <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-3xl font-extrabold text-white font-mono">
                          ₹{bundle.price.toLocaleString('en-IN')}
                        </span>
                        {bundle.originalPrice && bundle.originalPrice > bundle.price && (
                          <span className="text-[11px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/30 font-semibold uppercase tracking-wider">
                            {Math.round(((bundle.originalPrice - bundle.price) / bundle.originalPrice) * 100)}% OFF
                          </span>
                        )}
                      </div>
                      {bundle.originalPrice && (
                        <span className="text-sm text-slate-500 line-through font-mono">
                          ₹{bundle.originalPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    <div className="sm:w-auto w-full">
                      {isPurchased ? (
                        <button
                          onClick={() => {
                            soundFx.playWhoosh();
                            onOpenStudentPortal('assets');
                          }}
                          className="w-full sm:w-auto py-3.5 px-6 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/40 font-bold text-sm flex items-center justify-center gap-2 transition-all"
                        >
                          <FolderDown className="w-4 h-4" />
                          <span>View in Asset Vault</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handlePurchase(bundle)}
                          disabled={isProcessing}
                          className="w-full sm:w-auto py-3.5 px-7 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-600/30 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                          {isProcessing ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span>Opening Checkout...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 text-purple-200" />
                              <span>Buy Recorded Bundle (₹{bundle.price.toLocaleString('en-IN')})</span>
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
