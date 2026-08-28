import React, { useState } from 'react';
import { CourseSession } from '../../types';
import { StorageService } from '../../services/storageService';
import { X, Star, Sparkles, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SessionRatingModalProps {
  session: CourseSession | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SessionRatingModal: React.FC<SessionRatingModalProps> = ({
  session,
  isOpen,
  onClose,
}) => {
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !session) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveRating(session.id, rating, feedback);
    setSubmitted(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-md bg-[#faf8f5] text-[#2c2a29] rounded-2xl shadow-2xl border border-[#e7ded3] overflow-hidden"
        id="session-rating-modal"
      >
        <div className="flex items-center justify-between px-6 py-4 bg-[#f4ede2] border-b border-[#e2d7c7]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#b87b28]/15 text-[#b87b28] rounded-lg">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#b87b28]">
                {session.dayCode} Feedback
              </span>
              <h3 className="text-sm font-bold text-[#1e1c1b] truncate max-w-[260px]">
                {session.topic}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-200/60 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-stone-800">Thank you for your rating!</h4>
            <p className="text-xs text-stone-600">Your feedback helps Arjun continuously level up the DaVinci curriculum.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="text-center space-y-2">
              <p className="text-xs font-semibold uppercase text-stone-500">How would you rate this class?</p>
              <div className="flex justify-center items-center gap-2 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        (hoveredRating || rating) >= star
                          ? 'fill-[#b87b28] text-[#b87b28]'
                          : 'text-stone-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs font-medium text-stone-600">
                {rating === 5 && '🔥 Flawless & Super Practical!'}
                {rating === 4 && '👍 Great class, learned a lot'}
                {rating === 3 && '👌 Good content, need more practice'}
                {rating <= 2 && 'Need clarification on some topics'}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                What did you like the most / what could be improved?
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Loved the live shortcut demonstration and Zem TV node tree breakdown!"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#b87b28] focus:border-transparent outline-none resize-none placeholder:text-stone-400"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-200/60 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-[#b87b28] hover:bg-[#9d671e] rounded-lg shadow-sm transition-all active:scale-95"
              >
                Submit Rating
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
