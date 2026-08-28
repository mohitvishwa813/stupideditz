import React, { useState, useEffect } from 'react';
import { RegisteredStudent } from '../../types';
import { X, Save, Mail, User, Calendar, CheckCircle2, ShieldAlert } from 'lucide-react';
import { soundFx } from '../../utils/soundEffects';

interface EditStudentModalProps {
  isOpen: boolean;
  student: RegisteredStudent | null;
  onClose: () => void;
  onSave: (updatedStudent: RegisteredStudent) => void;
}

const BATCH_OPTIONS = [
  'July 2026 Cohort',
  'August 2026 Cohort',
  'September 2026 Live Cohort',
  'October 2026 Cohort',
  'November 2026 Cohort',
  'December 2026 Cohort',
];

export const EditStudentModal: React.FC<EditStudentModalProps> = ({
  isOpen,
  student,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [batch, setBatch] = useState('');
  const [completedDays, setCompletedDays] = useState(0);
  const [status, setStatus] = useState<'Active' | 'Suspended'>('Active');

  useEffect(() => {
    if (student) {
      setName(student.name);
      setEmail(student.email);
      setBatch(student.batch);
      setCompletedDays(student.completedDays || 0);
      setStatus(student.status || 'Active');
    }
  }, [student]);

  if (!isOpen || !student) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playPop();

    const updated: RegisteredStudent = {
      ...student,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      batch: batch,
      completedDays: Number(completedDays),
      status: status,
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
            <img src={student.avatar} alt={student.name} className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-600" />
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-400 font-mono">
                EDIT STUDENT RECORD
              </span>
              <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-[200px]">
                {student.name}
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
              Student Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-[#161a29] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-[#161a29] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
              Enrolled Batch
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <select
                value={batch}
                onChange={e => setBatch(e.target.value)}
                className="w-full bg-[#161a29] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                {BATCH_OPTIONS.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                Completed Days (0-26)
              </label>
              <input
                type="number"
                min={0}
                max={26}
                value={completedDays}
                onChange={e => setCompletedDays(Number(e.target.value))}
                className="w-full bg-[#161a29] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                Account Status
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="w-full bg-[#161a29] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Student Changes</span>
          </button>
        </form>
      </div>
    </div>
  );
};
