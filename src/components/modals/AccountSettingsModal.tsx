import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { StorageService } from '../../services/storageService';
import { X, User, Phone, Mail, Lock, CheckCircle2, Image } from 'lucide-react';
import { soundFx } from '../../utils/soundEffects';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUpdateUser: (updatedUser: UserProfile) => void;
}

export const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
}) => {
  const [name, setName] = useState(currentUser.name || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [avatar, setAvatar] = useState(currentUser.avatar || '');
  const [successToast, setSuccessToast] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playPop();

    const updated: UserProfile = {
      ...currentUser,
      name: name.trim() || currentUser.name,
      phone: phone.trim(),
      avatar: avatar.trim() || currentUser.avatar,
    };

    StorageService.setCurrentUser(updated);
    onUpdateUser(updated);
    setSuccessToast(true);
    setTimeout(() => {
      setSuccessToast(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#10131f] text-slate-100 rounded-3xl shadow-2xl border border-slate-700/80 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#141726] border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
              <User className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-400 font-mono">
                STUDENT PROFILE
              </span>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Account Settings
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

        {/* Success Banner */}
        {successToast && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Account details updated successfully!</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {/* Avatar Preview & URL */}
          <div className="flex items-center gap-4 bg-[#161a29] p-3 rounded-2xl border border-slate-800">
            <img
              src={avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
              alt="Avatar Preview"
              className="w-12 h-12 rounded-xl object-cover ring-2 ring-blue-500/40 shrink-0"
            />
            <div className="flex-1 min-w-0 space-y-1">
              <label className="block text-[10px] font-semibold text-slate-400 uppercase font-mono">
                Avatar Image URL
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={avatar}
                onChange={e => setAvatar(e.target.value)}
                className="w-full bg-[#10131f] border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="e.g. Rahul Verma"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-[#161a29] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full bg-[#161a29] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Email Address (READ-ONLY DISABLED WITH LOCK) */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 font-mono flex items-center justify-between">
              <span>Email Address</span>
              <span className="text-[10px] text-amber-400 font-normal flex items-center gap-1">
                <Lock className="w-3 h-3" /> Cannot be edited
              </span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                disabled
                value={currentUser.email}
                className="w-full bg-[#121522] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-400 font-mono cursor-not-allowed opacity-75"
              />
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99] mt-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Save Profile Details</span>
          </button>
        </form>
      </div>
    </div>
  );
};
