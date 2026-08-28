import React, { useState } from 'react';
import { CourseSession, StudentSubmission } from '../../types';
import { StorageService } from '../../services/storageService';
import { X, Upload, CheckCircle2, AlertCircle, Link2, FileText, User } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SubmitAssignmentModalProps {
  session: CourseSession | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: (sub: StudentSubmission) => void;
}

export const SubmitAssignmentModal: React.FC<SubmitAssignmentModalProps> = ({
  session,
  isOpen,
  onClose,
  onSubmitSuccess,
}) => {
  const [studentName, setStudentName] = useState('Alex Rivera');
  const [studentEmail, setStudentEmail] = useState('alex.creator@stupideditz.com');
  const [driveLink, setDriveLink] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !session) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!driveLink.trim()) {
      setError('Please provide your Google Drive project or exported video link');
      return;
    }

    if (!driveLink.includes('http')) {
      setError('Please provide a valid URL starting with http:// or https://');
      return;
    }

    const newSub = StorageService.addSubmission({
      sessionId: session.id,
      studentName,
      studentEmail,
      driveLink: driveLink.trim(),
      notes: notes.trim(),
    });

    setIsSuccess(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#c85a32', '#1d766f', '#eab308']
    });

    setTimeout(() => {
      onSubmitSuccess(newSub);
      setIsSuccess(false);
      onClose();
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-lg bg-[#faf8f5] text-[#2c2a29] rounded-2xl shadow-2xl border border-[#e7ded3] overflow-hidden"
        id="submit-assignment-modal"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#f2ecdf] border-b border-[#e2d7c7]">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#c85a32]">
              {session.dayCode} • Week {session.weekNumber} Assignment
            </span>
            <h3 className="text-lg font-bold text-[#1e1c1b] leading-tight">
              Submit Task: {session.topic}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-200/60 rounded-full transition-colors"
            id="close-submit-modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {isSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-bold text-stone-900">Assignment Submitted Successfully!</h4>
            <p className="text-sm text-stone-600">
              Your Google Drive project folder has been sent to the instructor. Feedback will be provided in the Saturday doubt session.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="bg-[#fcfaf7] p-3.5 rounded-xl border border-[#e8dfd3] text-xs text-stone-600 space-y-1">
              <p className="font-semibold text-stone-800 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#c85a32]" />
                Auto-Folder Destination:
              </p>
              <p className="font-mono text-stone-500 bg-stone-100 p-1.5 rounded border border-stone-200">
                Google Drive &gt; StupidEditz_Batch1 &gt; Week_{session.weekNumber} &gt; {session.dayCode}_{studentName.replace(/\s+/g, '_')}
              </p>
              <p className="text-[11px] text-stone-500">
                Ensure Google Drive link sharing is set to <strong>"Anyone with the link can view/edit"</strong>.
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Your Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#c85a32] focus:border-transparent outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Email</label>
                <input
                  type="email"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#c85a32] focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Google Drive Project Link / Export Link <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Link2 className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="url"
                  placeholder="https://drive.google.com/file/d/..."
                  value={driveLink}
                  onChange={(e) => {
                    setDriveLink(e.target.value);
                    if (error) setError('');
                  }}
                  required
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#c85a32] focus:border-transparent outline-none placeholder:text-stone-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Notes / Questions for Instructor (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g., Struggled a bit with the retiming curve on clip 3, used Fairlight noise reduction..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#c85a32] focus:border-transparent outline-none resize-none placeholder:text-stone-400"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-200/70 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-[#1d766f] hover:bg-[#165c56] rounded-lg shadow-sm transition-all active:scale-95"
                id="submit-assignment-btn"
              >
                <Upload className="w-4 h-4" />
                Submit Assignment
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
