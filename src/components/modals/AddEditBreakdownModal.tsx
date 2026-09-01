import React, { useState, useEffect } from 'react';
import { YouTubeBreakdown } from '../../types';
import { X, Plus, Trash2, Save, GripVertical } from 'lucide-react';

interface AddEditBreakdownModalProps {
  isOpen: boolean;
  breakdownToEdit: YouTubeBreakdown | null;
  onClose: () => void;
  onSave: (breakdown: YouTubeBreakdown) => void;
}

export const AddEditBreakdownModal: React.FC<AddEditBreakdownModalProps> = ({
  isOpen,
  breakdownToEdit,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<YouTubeBreakdown>({
    id: `yt-${Date.now()}`,
    title: '',
    youtubeId: '',
    videoUrl: '',
    thumbnailUrl: '',
    views: '',
    duration: '',
    description: '',
    assetsUsed: [],
    timelineMarkers: []
  });

  const [assetInput, setAssetInput] = useState('');

  useEffect(() => {
    if (breakdownToEdit) {
      setFormData({ ...breakdownToEdit });
    } else {
      setFormData({
        id: `yt-${Date.now()}`,
        title: '',
        youtubeId: '',
        videoUrl: '',
        thumbnailUrl: '',
        views: '',
        duration: '',
        description: '',
        assetsUsed: [],
        timelineMarkers: []
      });
    }
    setAssetInput('');
  }, [breakdownToEdit, isOpen]);

  if (!isOpen) return null;

  const handleAddAsset = () => {
    if (assetInput.trim()) {
      setFormData(prev => ({
        ...prev,
        assetsUsed: [...prev.assetsUsed, assetInput.trim()]
      }));
      setAssetInput('');
    }
  };

  const handleRemoveAsset = (index: number) => {
    setFormData(prev => ({
      ...prev,
      assetsUsed: prev.assetsUsed.filter((_, i) => i !== index)
    }));
  };

  const handleAddMarker = () => {
    setFormData(prev => ({
      ...prev,
      timelineMarkers: [
        ...prev.timelineMarkers,
        {
          timestamp: '00:00',
          seconds: 0,
          label: 'New Marker',
          effect: '',
          assetName: ''
        }
      ]
    }));
  };

  const handleUpdateMarker = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const markers = [...prev.timelineMarkers];
      markers[index] = { ...markers[index], [field]: value };
      
      // Auto-calculate seconds from MM:SS if timestamp is updated
      if (field === 'timestamp') {
        const parts = value.split(':');
        if (parts.length === 2) {
          const m = parseInt(parts[0], 10) || 0;
          const s = parseInt(parts[1], 10) || 0;
          markers[index].seconds = m * 60 + s;
        }
      }
      
      return { ...prev, timelineMarkers: markers };
    });
  };

  const handleRemoveMarker = (index: number) => {
    setFormData(prev => ({
      ...prev,
      timelineMarkers: prev.timelineMarkers.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0f111a] border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-[#121522]">
          <h2 className="text-xl font-bold text-white">
            {breakdownToEdit ? 'Edit YouTube Breakdown' : 'Create New Breakdown'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <form id="breakdown-form" onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider border-b border-slate-800 pb-2">Basic Info</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Video Title</label>
                  <input
                    required
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-[#161a29] border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                    placeholder="e.g. How I Edited a 1M+ View Video in DaVinci Resolve"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">YouTube Video ID</label>
                  <input
                    required
                    type="text"
                    value={formData.youtubeId}
                    onChange={e => setFormData({ ...formData, youtubeId: e.target.value })}
                    className="w-full bg-[#161a29] border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                    placeholder="e.g. dQw4w9WgXcQ"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Video URL</label>
                  <input
                    required
                    type="url"
                    value={formData.videoUrl}
                    onChange={e => setFormData({ ...formData, videoUrl: e.target.value })}
                    className="w-full bg-[#161a29] border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Thumbnail URL</label>
                  <input
                    required
                    type="url"
                    value={formData.thumbnailUrl}
                    onChange={e => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                    className="w-full bg-[#161a29] border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Views (e.g. 1.2M)</label>
                  <input
                    type="text"
                    value={formData.views}
                    onChange={e => setFormData({ ...formData, views: e.target.value })}
                    className="w-full bg-[#161a29] border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Duration (MM:SS)</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={e => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full bg-[#161a29] border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-[#161a29] border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Assets Used */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider border-b border-slate-800 pb-2">Assets Used</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={assetInput}
                  onChange={e => setAssetInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddAsset())}
                  className="flex-1 bg-[#161a29] border border-slate-700/80 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g. 50 Documentary Sounds Pack"
                />
                <button
                  type="button"
                  onClick={handleAddAsset}
                  className="px-4 py-2 bg-[#1c2136] hover:bg-slate-700 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
              {formData.assetsUsed.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.assetsUsed.map((asset, idx) => (
                    <div key={idx} className="bg-blue-900/30 text-blue-300 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 border border-blue-500/20">
                      {asset}
                      <button type="button" onClick={() => handleRemoveAsset(idx)} className="hover:text-white transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Timeline Markers */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider">Timeline Markers</h3>
                <button
                  type="button"
                  onClick={handleAddMarker}
                  className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> ADD MARKER
                </button>
              </div>
              
              <div className="space-y-3">
                {formData.timelineMarkers.map((marker, idx) => (
                  <div key={idx} className="bg-[#161a29] border border-slate-700 rounded-xl p-4 flex gap-4 items-start">
                    <div className="mt-2 text-slate-500">
                      <GripVertical className="w-4 h-4" />
                    </div>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Timestamp (MM:SS)</label>
                        <input
                          type="text"
                          value={marker.timestamp}
                          onChange={e => handleUpdateMarker(idx, 'timestamp', e.target.value)}
                          className="w-full bg-[#0f111a] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Label</label>
                        <input
                          type="text"
                          value={marker.label}
                          onChange={e => handleUpdateMarker(idx, 'label', e.target.value)}
                          className="w-full bg-[#0f111a] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Technique/Effect</label>
                        <input
                          type="text"
                          value={marker.effect}
                          onChange={e => handleUpdateMarker(idx, 'effect', e.target.value)}
                          className="w-full bg-[#0f111a] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Asset Name (Optional)</label>
                        <input
                          type="text"
                          value={marker.assetName || ''}
                          onChange={e => handleUpdateMarker(idx, 'assetName', e.target.value)}
                          className="w-full bg-[#0f111a] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveMarker(idx)}
                      className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors mt-6"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {formData.timelineMarkers.length === 0 && (
                  <div className="text-center p-8 border border-dashed border-slate-700 rounded-xl text-slate-500 text-sm">
                    No timeline markers added yet.
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-slate-800 bg-[#121522] flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-semibold text-slate-300 hover:bg-[#1a1f33] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="breakdown-form"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {breakdownToEdit ? 'Save Changes' : 'Create Breakdown'}
          </button>
        </div>
      </div>
    </div>
  );
};
