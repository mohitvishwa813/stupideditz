import React, { useState } from 'react';
import { VideoAsset, AssetCategory, UserProfile, BundlePromo } from '../types';
import { 
  Download, 
  Play, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Tv, 
  Check, 
  FileCode, 
  Layers, 
  Music, 
  Palette, 
  Search,
  Filter,
  Flame,
  ArrowDownToLine,
  FolderArchive
} from 'lucide-react';
import { soundFx } from '../utils/soundEffects';
import confetti from 'canvas-confetti';
import { loadRazorpay } from '../utils/loadRazorpay';
import { ApiService } from '../services/apiService';

interface AssetVaultSectionProps {
  assets: VideoAsset[];
  bundlePromo?: BundlePromo;
  currentUser?: UserProfile | null;
  onOpenLoginModal?: () => void;
  onSelectVideoBreakdown?: (videoTitle: string) => void;
}

export const AssetVaultSection: React.FC<AssetVaultSectionProps> = ({
  assets,
  bundlePromo,
  currentUser,
  onOpenLoginModal,
  onSelectVideoBreakdown,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessingBundle, setIsProcessingBundle] = useState(false);

  const hasPurchasedBundle = bundlePromo ? currentUser?.purchasedAssets?.includes(bundlePromo.id) : false;

  const handlePurchaseBundle = async () => {
    if (!currentUser) {
      soundFx.playGlitch();
      if (onOpenLoginModal) onOpenLoginModal();
      return;
    }
    if (!bundlePromo) return;

    if (hasPurchasedBundle) {
      soundFx.playPop();
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      window.open(bundlePromo.driveLink, '_blank');
      return;
    }

    soundFx.playWhoosh();
    setIsProcessingBundle(true);

    try {
      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        alert('Failed to load Razorpay SDK. Please check your internet connection.');
        setIsProcessingBundle(false);
        return;
      }

      const orderRes = await ApiService.createPaymentOrder(bundlePromo.currentPrice, 'bundle', bundlePromo.id, currentUser.id);
      
      if (!orderRes.success || !orderRes.orderId) {
        alert('Failed to initialize secure checkout. Please try again.');
        setIsProcessingBundle(false);
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || '',
        amount: orderRes.amount,
        currency: orderRes.currency,
        name: 'Stupid Editz Studio',
        description: `Purchase ${bundlePromo.title}`,
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
              confetti({ particleCount: 140, spread: 90, origin: { y: 0.5 } });
              
              // Update local storage so UI reflects immediately
              if (currentUser) {
                const updatedUser = { ...currentUser, purchasedAssets: [...(currentUser.purchasedAssets || []), bundlePromo.id] };
                import('../services/storageService').then(m => m.StorageService.setCurrentUser(updatedUser));
                // Note: In a real app we'd dispatch an event or use context to trigger re-render of layout
                window.location.reload(); // Quickest way to force refresh of the whole app state
              }

              // Direct them to the bundle download drive link on success
              window.open(bundlePromo.driveLink, '_blank');
            } else {
              alert('Payment verification failed. If money was deducted, it will be refunded.');
            }
          } catch (error) {
            console.error('Verification failed', error);
            alert('An error occurred during payment verification.');
          } finally {
            setIsProcessingBundle(false);
          }
        },
        prefill: {
          name: currentUser.name,
          email: currentUser.email,
          contact: currentUser.phone || ''
        },
        readonly: {
          email: true,
          contact: true
        },
        theme: { color: '#2563EB' },
        config: {
          display: {
            blocks: {
              upi: { name: "Pay using UPI", instruments: [{ method: "upi" }] },
              card: { name: "Pay using Card", instruments: [{ method: "card" }] }
            },
            sequence: ["block.upi", "block.card"],
            preferences: { show_default_blocks: false }
          }
        },
        modal: {
          ondismiss: function() {
            setIsProcessingBundle(false);
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (err) {
      console.error('Payment initialization error:', err);
      alert('Could not connect to payment gateway.');
      setIsProcessingBundle(false);
    }
  };
  const [playingAssetId, setPlayingAssetId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadSuccessId, setDownloadSuccessId] = useState<string | null>(null);
  const [isProcessingAssetId, setIsProcessingAssetId] = useState<string | null>(null);

  const categories = ['All', 'Free Samples', 'SFX', 'LUTs', 'Fusion Nodes', 'Titles', 'Sound Samples', 'Project Files'];

  const filteredAssets = assets.filter((asset) => {
    const matchesCat = 
      selectedCategory === 'All' 
        ? true 
        : selectedCategory === 'Free Samples' 
        ? asset.isFreeSample 
        : asset.category === selectedCategory;
    
    const matchesSearch = 
      asset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCat && matchesSearch;
  });

  const handlePlaySound = (asset: VideoAsset) => {
    setPlayingAssetId(asset.id);
    soundFx.playByType(asset.audioSampleType || 'whoosh');
    setTimeout(() => {
      setPlayingAssetId(null);
    }, 900);
  };

  const handleDownload = async (asset: VideoAsset) => {
    if (!currentUser) {
      soundFx.playGlitch();
      if (onOpenLoginModal) onOpenLoginModal();
      return;
    }

    const isAlreadyPurchased = hasPurchasedBundle || currentUser.purchasedAssets?.includes(asset.id);

    if (!asset.isFreeSample && asset.price > 0 && !isAlreadyPurchased) {
      soundFx.playWhoosh();
      setIsProcessingAssetId(asset.id);

      try {
        const isLoaded = await loadRazorpay();
        if (!isLoaded) {
          alert('Failed to load Razorpay SDK. Please check your internet connection.');
          setIsProcessingAssetId(null);
          return;
        }

        const orderRes = await ApiService.createPaymentOrder(asset.price, 'asset', asset.id, currentUser.id);
        
        if (!orderRes.success || !orderRes.orderId) {
          alert('Failed to initialize secure checkout. Please try again.');
          setIsProcessingAssetId(null);
          return;
        }

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || '',
          amount: orderRes.amount,
          currency: orderRes.currency,
          name: 'Stupid Editz Studio',
          description: `Purchase ${asset.title}`,
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
                setDownloadSuccessId(asset.id);
                confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 }, colors: ['#3b82f6', '#10b981', '#60a5fa'] });
                
                if (currentUser) {
                  const updatedUser = { ...currentUser, purchasedAssets: [...(currentUser.purchasedAssets || []), asset.id] };
                  import('../services/storageService').then(m => m.StorageService.setCurrentUser(updatedUser));
                  window.location.reload(); 
                }

                if (asset.downloadUrl) window.open(asset.downloadUrl, '_blank');
                setTimeout(() => setDownloadSuccessId(null), 3000);
              } else {
                alert('Payment verification failed.');
              }
            } catch (error) {
              console.error('Verification failed', error);
              alert('An error occurred during payment verification.');
            } finally {
              setIsProcessingAssetId(null);
            }
          },
          prefill: {
            name: currentUser.name,
            email: currentUser.email,
            contact: currentUser.phone || ''
          },
          readonly: { email: true, contact: true },
          theme: { color: '#2563EB' },
          config: {
            display: {
              blocks: {
                upi: { name: "Pay using UPI", instruments: [{ method: "upi" }] },
                card: { name: "Pay using Card", instruments: [{ method: "card" }] }
              },
              sequence: ["block.upi", "block.card"],
              preferences: { show_default_blocks: false }
            }
          },
          modal: {
            ondismiss: function() {
              setIsProcessingAssetId(null);
            }
          }
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();

      } catch (err) {
        console.error('Payment initialization error:', err);
        alert('Could not connect to payment gateway.');
        setIsProcessingAssetId(null);
      }
    } else {
      // Free download
      soundFx.playPop();
      setDownloadingId(asset.id);
      setTimeout(() => {
        setDownloadingId(null);
        setDownloadSuccessId(asset.id);
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#3b82f6', '#10b981', '#60a5fa']
        });

        if (asset.downloadUrl) {
          window.open(asset.downloadUrl, '_blank');
        }

        setTimeout(() => {
          setDownloadSuccessId(null);
        }, 3000);
      }, 800);
    }
  };

  const getCategoryIcon = (category: AssetCategory) => {
    switch (category) {
      case 'SFX':
      case 'Sound Samples':
        return <Music className="w-3.5 h-3.5 text-emerald-400" />;
      case 'LUTs':
        return <Palette className="w-3.5 h-3.5 text-amber-400" />;
      case 'Fusion Nodes':
        return <Layers className="w-3.5 h-3.5 text-blue-400" />;
      default:
        return <FileCode className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <section className="py-16 bg-[#090a0f] border-t border-slate-800 text-slate-100 relative" id="asset-vault-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 text-blue-400 text-xs font-semibold font-mono border border-blue-500/30">
              <FolderArchive className="w-3.5 h-3.5" />
              CREATOR ASSET VAULT & FREE SAMPLES
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Studio-Grade SFX, Kodak LUTs & Fusion Nodes
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              The exact sound effects, color grades, kinetic lower thirds, and .drfx templates used across our 1,000,000+ view documentary edits. Download free instant samples or grab the full cohort bundle.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by SFX, node, LUT name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#121522] border border-slate-700/80 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none placeholder-slate-500"
              id="asset-search-input"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                soundFx.playClick();
                setSelectedCategory(cat);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-[#111422] text-slate-400 hover:text-slate-200 hover:bg-[#181d30] border border-slate-800'
              }`}
            >
              {cat === 'Free Samples' && <Sparkles className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{cat}</span>
              {cat === 'Free Samples' && (
                <span className="px-1.5 py-0.2 text-[9px] font-mono bg-emerald-500/20 text-emerald-400 rounded font-bold">
                  FREE
                </span>
              )}
            </button>
          ))}
        </div>
        
        {/* All-in-one Bundle Promo */}
        {bundlePromo && (
          <div className="bg-gradient-to-r from-blue-600/20 via-indigo-600/10 to-transparent border border-blue-500/30 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full" />
            <div className="relative z-10 space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest border border-blue-500/30">
                <Sparkles className="w-3 h-3" />
                {bundlePromo.badgeText}
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white">{bundlePromo.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {bundlePromo.description}
              </p>
            </div>
            <div className="relative z-10 flex flex-col items-center md:items-end gap-3 shrink-0">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">₹{bundlePromo.currentPrice}</span>
                <span className="text-sm text-slate-500 line-through">₹{bundlePromo.originalPrice}</span>
              </div>
              <button 
                onClick={handlePurchaseBundle}
                disabled={isProcessingBundle}
              className={`px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95 flex items-center gap-2 ${isProcessingBundle ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isProcessingBundle ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : hasPurchasedBundle ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  Access Bundle (Purchased)
                </>
              ) : (
                <>
                  <Flame className="w-4 h-4 text-amber-400" />
                  Buy All-In-One Bundle
                </>
              )}
            </button>
            <p className="text-[10px] text-slate-500">Instant Access via Google Drive</p>
          </div>
        </div>
        )}

        {/* Assets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssets.map((asset) => {
            const isPlaying = playingAssetId === asset.id;
            const isDownloading = downloadingId === asset.id;
            const isDownloaded = downloadSuccessId === asset.id;
            const isAlreadyPurchased = hasPurchasedBundle || currentUser?.purchasedAssets?.includes(asset.id);

            return (
              <div
                key={asset.id}
                className="group relative bg-[#111420] border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl flex flex-col justify-between"
                id={`asset-card-${asset.id}`}
              >
                {/* Thumbnail Header */}
                <div className="relative aspect-[16/9] overflow-hidden bg-slate-950">
                  <img
                    src={asset.thumbnail}
                    alt={asset.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111420] via-transparent to-black/50" />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/85 backdrop-blur-md text-[10px] font-semibold uppercase tracking-wider text-slate-200 border border-white/10 shadow-md">
                      {getCategoryIcon(asset.category)}
                      {asset.category}
                    </span>
                    <span className="px-2 py-1 rounded-lg bg-[#181d2f]/90 backdrop-blur-md text-[10px] font-mono text-slate-300 border border-slate-700">
                      {asset.format}
                    </span>
                  </div>

                  {/* Highlighted Price Badge */}
                  <div className="absolute top-3 right-3 z-10">
                    {asset.isFreeSample ? (
                      <span className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black border border-emerald-300/50 text-[10px] uppercase tracking-wider shadow-lg shadow-emerald-500/30 backdrop-blur-md">
                        FREE SAMPLE
                      </span>
                    ) : (
                      <span className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white font-black font-mono border border-cyan-400/50 text-xs tracking-wider shadow-xl shadow-blue-600/40 backdrop-blur-md">
                        ₹{asset.price} INR
                      </span>
                    )}
                  </div>

                  {/* Audio Preview Trigger Button */}
                  {asset.audioSampleType && (
                    <button
                      onClick={() => handlePlaySound(asset)}
                      className={`absolute bottom-3 right-3 p-3 rounded-full backdrop-blur-md transition-all ${
                        isPlaying
                          ? 'bg-blue-600 text-white scale-110 shadow-xs'
                          : 'bg-black/80 hover:bg-blue-600 text-slate-200 hover:text-white border border-white/20'
                      }`}
                      title="Preview Synthesized Sound FX"
                      id={`play-sound-${asset.id}`}
                    >
                      {isPlaying ? (
                        <div className="flex items-center gap-0.5 h-4 w-4 justify-center">
                          <span className="w-1 h-3 bg-white animate-pulse" />
                          <span className="w-1 h-4 bg-white animate-bounce" />
                          <span className="w-1 h-2 bg-white animate-pulse" />
                        </div>
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors leading-snug">
                      {asset.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {asset.description}
                    </p>

                    {/* YouTube Video Context Reference */}
                    {asset.featuredInVideo && (
                      <div className="pt-1">
                        <div className="p-2 rounded-xl bg-[#141828] border border-slate-800 text-[11px] text-slate-300 flex items-center justify-between gap-2">
                          <span className="flex items-center gap-1.5 text-blue-400 font-semibold truncate">
                            <Tv className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{asset.featuredInVideo}</span>
                          </span>
                          {asset.usedInTimestamp && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-[10px] text-slate-400 shrink-0">
                              @{asset.usedInTimestamp}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer Stats & Download CTA */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                    <div className="text-[11px] text-slate-500 font-mono">
                      {asset.fileSize} • {asset.downloadsCount.toLocaleString()} dl
                    </div>

                    <button
                      onClick={() => handleDownload(asset)}
                      disabled={isDownloading || isProcessingAssetId === asset.id}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isDownloaded
                          ? 'bg-emerald-500 text-slate-950 font-bold'
                          : isDownloading || isProcessingAssetId === asset.id
                          ? 'bg-slate-700 text-slate-300 cursor-wait'
                          : asset.isFreeSample
                          ? 'bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/40'
                          : 'bg-blue-600 hover:bg-blue-500 text-white shadow-xs'
                      }`}
                      id={`download-asset-${asset.id}`}
                    >
                      {isDownloaded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Got it!</span>
                        </>
                      ) : isDownloading || isProcessingAssetId === asset.id ? (
                        <>
                          <ArrowDownToLine className="w-3.5 h-3.5 animate-bounce" />
                          <span>Processing...</span>
                        </>
                      ) : isAlreadyPurchased ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Purchased</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          <span>{asset.isFreeSample ? 'Free Sample' : 'Get Pack'}</span>
                        </>
                      )}
                    </button>
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
