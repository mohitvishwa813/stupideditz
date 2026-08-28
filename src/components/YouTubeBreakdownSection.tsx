import React, { useState } from 'react';
import { YouTubeBreakdown, VideoAsset } from '../types';
import { Play, Tv, Clock, Eye, Sparkles, DownloadCloud, Volume2, ArrowUpRight, Bookmark } from 'lucide-react';
import { soundFx } from '../utils/soundEffects';

interface YouTubeBreakdownSectionProps {
  breakdowns: YouTubeBreakdown[];
  assets: VideoAsset[];
  onOpenVideoModal?: (breakdown: YouTubeBreakdown) => void;
}

export const YouTubeBreakdownSection: React.FC<YouTubeBreakdownSectionProps> = ({
  breakdowns,
  assets,
}) => {
  const [selectedBreakdown, setSelectedBreakdown] = useState<YouTubeBreakdown>(breakdowns[0] || {} as YouTubeBreakdown);
  const [activeMarker, setActiveMarker] = useState<number | null>(0);

  const getAssetDetails = (assetId: string) => {
    return assets.find(a => a.id === assetId);
  };

  if (!selectedBreakdown || !selectedBreakdown.id) return null;

  return (
    <section className="py-16 bg-[#090a0f] border-t border-slate-800 text-slate-100 relative" id="youtube-breakdowns-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 text-rose-400 text-xs font-semibold font-mono border border-rose-500/30">
            <Tv className="w-3.5 h-3.5" />
            DOCUMENTARY & YOUTUBE DECONSTRUCTIONS
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Behind the Timeline: Viral Edits Deconstructed
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            Step frame-by-frame through real YouTube videos. See exact timestamps, node graphs, and download the exact assets used at each second.
          </p>
        </div>

        {/* Video Selector Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {breakdowns.map((item) => {
            const isSelected = selectedBreakdown.id === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  soundFx.playClick();
                  setSelectedBreakdown(item);
                  setActiveMarker(0);
                }}
                className={`text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3.5 group ${
                  isSelected
                    ? 'bg-[#151928] border-blue-500 shadow-xs'
                    : 'bg-[#10131e] border-slate-800 hover:border-slate-700 hover:bg-[#141824]'
                }`}
                id={`breakdown-select-${item.id}`}
              >
                <div className="relative w-24 aspect-video rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-slate-800">
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform opacity-90"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Play className="w-4 h-4 text-white fill-current" />
                  </div>
                </div>
                <div className="space-y-1 overflow-hidden">
                  <h4 className="text-xs font-semibold text-slate-100 group-hover:text-blue-400 line-clamp-2 leading-snug">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3 text-emerald-400" /> {item.views}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-amber-400" /> {item.duration}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Interactive Breakdown Player & Inspector */}
        <div className="p-6 rounded-2xl bg-[#111422] border border-slate-800 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start shadow-xl">
          {/* Video Column */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-slate-800 shadow-lg">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube-nocookie.com/embed/${selectedBreakdown.youtubeId}?rel=0`}
                title={selectedBreakdown.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">
                {selectedBreakdown.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {selectedBreakdown.description}
              </p>
            </div>
          </div>

          {/* Timeline Points & Assets Column */}
          <div className="lg:col-span-5 space-y-5">
            {/* Timeline Moments */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
                <span className="flex items-center gap-1.5 text-white">
                  <Bookmark className="w-3.5 h-3.5 text-blue-400" />
                  Key Editing Moments
                </span>
                <span className="text-blue-400">{selectedBreakdown.timelineMarkers.length} Markers</span>
              </div>

              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {selectedBreakdown.timelineMarkers.map((marker, idx) => {
                  const isActive = activeMarker === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        soundFx.playClick();
                        setActiveMarker(idx);
                      }}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isActive
                          ? 'bg-[#182035] border-blue-500 text-white shadow-xs'
                          : 'bg-[#141824] border-slate-800/80 text-slate-300 hover:bg-[#181d2c]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-100 flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-400 font-mono text-[10px] font-semibold">
                            {marker.timestamp}
                          </span>
                          <span>{marker.label}</span>
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        <strong className="text-slate-300">Technique:</strong> {marker.effect}
                      </p>
                      {marker.assetName && (
                        <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                          <Sparkles className="w-3 h-3" />
                          <span>Asset: {marker.assetName}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Assets Used Box */}
            <div className="p-4 rounded-xl bg-[#141824] border border-slate-800 space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 flex items-center gap-2 font-mono">
                <DownloadCloud className="w-4 h-4 text-emerald-400" />
                Download Materials from This Video
              </h4>
              <div className="space-y-2">
                {selectedBreakdown.assetsUsed.map((assetId) => {
                  const asset = getAssetDetails(assetId);
                  if (!asset) return null;
                  return (
                    <div
                      key={asset.id}
                      className="p-2.5 rounded-xl bg-[#181d2c] border border-slate-700/60 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="overflow-hidden">
                        <p className="font-semibold text-slate-200 truncate">{asset.title}</p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {asset.category} • {asset.isFreeSample ? 'FREE SAMPLE' : `₹${asset.price}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {asset.audioSampleType && (
                          <button
                            onClick={() => soundFx.playByType(asset.audioSampleType)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                            title="Preview Sound"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <a
                          href={asset.downloadUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px] transition-colors"
                        >
                          Download
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
