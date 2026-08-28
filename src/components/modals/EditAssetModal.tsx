import React, { useState, useEffect } from 'react';
import { VideoAsset } from '../../types';
import { X, Save, Tag, DollarSign, FileCode, HardDrive } from 'lucide-react';
import { soundFx } from '../../utils/soundEffects';

interface EditAssetModalProps {
  isOpen: boolean;
  asset: VideoAsset | null;
  onClose: () => void;
  onSave: (updatedAsset: VideoAsset) => void;
}

export const EditAssetModal: React.FC<EditAssetModalProps> = ({
  isOpen,
  asset,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState(0);
  const [fileSize, setFileSize] = useState('');
  const [isFreeSample, setIsFreeSample] = useState(false);

  useEffect(() => {
    if (asset) {
      setTitle(asset.title);
      setCategory(asset.category);
      setPrice(asset.price || 0);
      setFileSize(asset.fileSize || '120MB');
      setIsFreeSample(Boolean(asset.isFreeSample));
    }
  }, [asset]);

  if (!isOpen || !asset) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playPop();

    const updated: VideoAsset = {
      ...asset,
      title: title.trim(),
      category: category.trim(),
      price: Number(price),
      fileSize: fileSize.trim(),
      isFreeSample: isFreeSample,
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#10131f] text-slate-100 rounded-3xl shadow-2xl border border-slate-700/80 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#141726] border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <img src={asset.thumbnail} alt={asset.title} className="w-10 h-7 rounded object-cover ring-1 ring-slate-600" />
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400 font-mono">
                EDIT ASSET VAULT ITEM
              </span>
              <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-[200px]">
                {asset.title}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
              Asset Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-[#161a29] border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-[#161a29] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="SFX & Audio">SFX & Audio</option>
                <option value="Color LUTs">Color LUTs</option>
                <option value="Fusion Motion Graphics">Fusion Motion Graphics</option>
                <option value="Plugins & Macro">Plugins & Macro</option>
                <option value="Overlays & Grain">Overlays & Grain</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                File Size
              </label>
              <input
                type="text"
                value={fileSize}
                onChange={e => setFileSize(e.target.value)}
                placeholder="e.g. 1.2 GB"
                className="w-full bg-[#161a29] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                Price (INR ₹)
              </label>
              <input
                type="number"
                min={0}
                value={price}
                onChange={e => setPrice(Number(e.target.value))}
                className="w-full bg-[#161a29] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 cursor-pointer p-2.5 bg-[#161a29] border border-slate-700/80 rounded-xl">
                <input
                  type="checkbox"
                  checked={isFreeSample}
                  onChange={e => setIsFreeSample(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-0"
                />
                <span className="text-xs font-semibold text-slate-200">Free Sample</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Update Vault Asset</span>
          </button>
        </form>
      </div>
    </div>
  );
};
