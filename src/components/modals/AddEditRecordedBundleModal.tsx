import React, { useState, useEffect } from 'react';
import { RecordedBundle } from '../../types';
import { X, Save, Plus, Trash2, Film, DollarSign, Image, Sparkles } from 'lucide-react';
import { soundFx } from '../../utils/soundEffects';

interface AddEditRecordedBundleModalProps {
  isOpen: boolean;
  bundleToEdit: RecordedBundle | null;
  onClose: () => void;
  onSave: (bundle: RecordedBundle) => void;
}

export const AddEditRecordedBundleModal: React.FC<AddEditRecordedBundleModalProps> = ({
  isOpen,
  bundleToEdit,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(2499);
  const [originalPrice, setOriginalPrice] = useState(4999);
  const [thumbnail, setThumbnail] = useState('https://ik.imagekit.io/icyqvq18nj/ChatGPT%20Image%20Sep%2026,%202026,%2003_23_40%20AM.png?updatedAt=1790373254706');
  const [driveLink, setDriveLink] = useState('');
  const [totalHours, setTotalHours] = useState('40+ Hours');
  const [totalSessionsCount, setTotalSessionsCount] = useState(26);
  const [badgeText, setBadgeText] = useState('FULL RECORDED COLLECTION');
  const [isPublished, setIsPublished] = useState(true);
  const [highlights, setHighlights] = useState<string[]>([
    'All 26 Daily Class Recordings in 1080p 60FPS (Full Uncut)',
    'Full 40GB+ Sound Packs, Film Grains & 3D LUTs Included',
    'All Raw Practice Footage & DaVinci .dra Project Archives',
    'Lifetime Drive Access with Continuous Timeline Updates'
  ]);
  const [newHighlight, setNewHighlight] = useState('');

  useEffect(() => {
    if (bundleToEdit) {
      setTitle(bundleToEdit.title);
      setSubtitle(bundleToEdit.subtitle || '');
      setDescription(bundleToEdit.description || '');
      setPrice(bundleToEdit.price || 2499);
      setOriginalPrice(bundleToEdit.originalPrice || 4999);
      setThumbnail(bundleToEdit.thumbnail || '');
      setDriveLink(bundleToEdit.driveLink || '');
      setTotalHours(bundleToEdit.totalHours || '40+ Hours');
      setTotalSessionsCount(bundleToEdit.totalSessionsCount || 26);
      setBadgeText(bundleToEdit.badgeText || 'FULL RECORDED COLLECTION');
      setIsPublished(bundleToEdit.isPublished !== false);
      setHighlights(bundleToEdit.highlights?.length ? bundleToEdit.highlights : ['Full 26 Daily Class Recordings']);
    } else {
      setTitle('DaVinci Resolve: Complete 26-Day Recorded Masterclass Archive');
      setSubtitle('Instant Lifetime Access to all 26 recorded cohort live sessions, raw practice timelines, sound library, and project files.');
      setDescription('Cannot attend the live 3:30 PM IST cohort? Get instant access to the complete 26-day recorded collection. Includes all raw .drfx Fusion node files, Fairlight master audio stems, documentary grading timelines, and homework assignments.');
      setPrice(2499);
      setOriginalPrice(4999);
      setDriveLink('');
      setHighlights([
        'All 26 Daily Class Recordings in 1080p 60FPS (Full Uncut)',
        'Full 40GB+ Sound Packs, Film Grains & 3D LUTs Included',
        'All Raw Practice Footage & DaVinci .dra Project Archives',
        'Lifetime Drive Access with Continuous Timeline Updates'
      ]);
      setIsPublished(true);
    }
  }, [bundleToEdit]);

  if (!isOpen) return null;

  const handleAddHighlight = () => {
    if (newHighlight.trim()) {
      setHighlights([...highlights, newHighlight.trim()]);
      setNewHighlight('');
    }
  };

  const handleRemoveHighlight = (idx: number) => {
    setHighlights(highlights.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playPop();

    const bundleData: RecordedBundle = {
      id: bundleToEdit ? bundleToEdit.id : 'bundle-recorded-' + Date.now(),
      title: title.trim(),
      subtitle: subtitle.trim(),
      description: description.trim(),
      price: Number(price),
      originalPrice: Number(originalPrice),
      thumbnail: thumbnail.trim(),
      driveLink: driveLink.trim(),
      totalHours: totalHours.trim(),
      totalSessionsCount: Number(totalSessionsCount),
      badgeText: badgeText.trim(),
      isPublished: isPublished,
      highlights: highlights
    };

    onSave(bundleData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#10131f] text-slate-100 rounded-3xl shadow-2xl border border-slate-700/80 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-[#141726] border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold text-xs">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-purple-400 font-mono">
                RECORDED CMS
              </span>
              <h3 className="text-sm sm:text-base font-bold text-white">
                {bundleToEdit ? 'Edit Recorded Collection Bundle' : 'Create Recorded Collection Bundle'}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
              Bundle Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. DaVinci Resolve: Complete 26-Day Recorded Masterclass Archive"
              className="w-full bg-[#161a29] border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
              Subtitle (Card Teaser Line)
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={e => setSubtitle(e.target.value)}
              placeholder="Instant lifetime access to all 26 recorded cohort live sessions..."
              className="w-full bg-[#161a29] border border-slate-700/80 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
              Full Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Detailed description of what the student gets inside this recorded collection..."
              className="w-full bg-[#161a29] border border-slate-700/80 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Pricing & Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                Offer Price (₹)
              </label>
              <input
                type="number"
                required
                value={price}
                onChange={e => setPrice(Number(e.target.value))}
                className="w-full bg-[#161a29] border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                Original Price (₹)
              </label>
              <input
                type="number"
                value={originalPrice}
                onChange={e => setOriginalPrice(Number(e.target.value))}
                className="w-full bg-[#161a29] border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                Total Hours
              </label>
              <input
                type="text"
                value={totalHours}
                onChange={e => setTotalHours(e.target.value)}
                placeholder="40+ Hours"
                className="w-full bg-[#161a29] border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                Sessions Count
              </label>
              <input
                type="number"
                value={totalSessionsCount}
                onChange={e => setTotalSessionsCount(Number(e.target.value))}
                className="w-full bg-[#161a29] border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                Thumbnail Image URL
              </label>
              <input
                type="url"
                value={thumbnail}
                onChange={e => setThumbnail(e.target.value)}
                placeholder="https://ik.imagekit.io/..."
                className="w-full bg-[#161a29] border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                Badge Tag Text
              </label>
              <input
                type="text"
                value={badgeText}
                onChange={e => setBadgeText(e.target.value)}
                placeholder="FULL RECORDED COLLECTION"
                className="w-full bg-[#161a29] border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>
          </div>

          {/* Google Drive Link */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono text-purple-300">
              * Google Drive Archive Link (Delivered upon purchase into Student Asset Vault)
            </label>
            <input
              type="url"
              required
              value={driveLink}
              onChange={e => setDriveLink(e.target.value)}
              placeholder="https://drive.google.com/drive/folders/..."
              className="w-full bg-[#161a29] border border-purple-500/50 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-400 font-mono"
            />
          </div>

          {/* Visibility toggle */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer p-2.5 bg-[#161a29] border border-slate-700/80 rounded-xl">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={e => setIsPublished(e.target.checked)}
                className="rounded text-purple-500 focus:ring-0"
              />
              <span className="text-xs font-semibold text-slate-200">
                {isPublished ? 'Visible on Homepage (Students can purchase)' : 'Hidden (Draft Mode)'}
              </span>
            </label>
          </div>

          {/* Highlights List */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
              Bundle Highlights & Features
            </label>
            <div className="space-y-2 mb-2">
              {highlights.map((h, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2 p-2 bg-[#161a29] border border-slate-800 rounded-xl text-xs">
                  <span className="text-slate-200 truncate">{h}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveHighlight(idx)}
                    className="text-rose-400 hover:text-rose-300 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add bullet highlight..."
                value={newHighlight}
                onChange={e => setNewHighlight(e.target.value)}
                className="flex-1 bg-[#161a29] border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
              <button
                type="button"
                onClick={handleAddHighlight}
                className="px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-500/30 text-xs font-semibold rounded-xl flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Footer Save */}
          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/25 flex items-center gap-2 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{bundleToEdit ? 'Save Changes' : 'Create Recorded Bundle'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
