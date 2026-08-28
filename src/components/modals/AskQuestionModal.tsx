import React, { useState } from 'react';
import { X, MessageSquare, Send, CheckCircle2, Bot, Sparkles } from 'lucide-react';

interface AskQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'question' | 'feedback';
}

export const AskQuestionModal: React.FC<AskQuestionModalProps> = ({
  isOpen,
  onClose,
  mode = 'question'
}) => {
  const [topic, setTopic] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [category, setCategory] = useState<'Cut' | 'Edit' | 'Fusion' | 'Color' | 'Fairlight' | 'General'>('Fusion');
  const [submitted, setSubmitted] = useState(false);
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    if (mode === 'question') {
      // Provide an instant helpful smart editing tip response + queue for live Saturday doubt session
      const sampleAnswers: Record<string, string> = {
        Fusion: `💡 **Arjun's Instant Tip for Fusion:**\nIf your node tree isn't rendering or tracking is slipping, ensure your background node defines the canvas resolution, and check that your Planar Tracker reference frame is set to frame 0 before creating a Planar Transform.\n\n*Your question has also been logged for the Saturday Live Doubt-Clearing Session!*`,
        Color: `💡 **Arjun's Color Tip:**\nAlways balance Lift/Gamma/Gain before applying creative LUTs! Keep your skin tones along the vectorscope indicator line for natural results.\n\n*Logged for Saturday Live Doubt-Clearing Session!*`,
        Edit: `💡 **Arjun's Speed Edit Tip:**\nUse 'Shift + [' and 'Shift + ]' to ripple trim start/end to playhead without switching tools for instant 3x editing speed!\n\n*Logged for Saturday Live Doubt Session!*`,
        General: `💡 **Arjun's Tip:**\nGot your question! This will be reviewed and demonstrated live with raw project files during the Saturday session.\n\n*Logged for Saturday Live Doubt-Clearing Session!*`
      };

      setAiAnswer(sampleAnswers[category] || sampleAnswers.General);
    }
    
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    setAiAnswer(null);
    setTopic('');
    setQuestionText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-lg bg-[#faf8f5] text-[#2c2a29] rounded-2xl shadow-2xl border border-[#e7ded3] overflow-hidden"
        id="ask-question-modal"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#f2ecdf] border-b border-[#e2d7c7]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#1d766f]/15 text-[#1d766f] rounded-lg">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#1d766f]">
                {mode === 'feedback' ? 'Cohort Feedback' : 'Student Doubt Board'}
              </span>
              <h3 className="text-base font-bold text-stone-900">
                {mode === 'feedback' ? 'Share Your Course Feedback' : 'Ask a Question / Submit a Doubt'}
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

        {/* Body */}
        <div className="p-6">
          {submitted ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  <strong>Logged!</strong> {mode === 'feedback' ? 'Thank you for your valuable feedback.' : 'Your doubt has been added to Arjun\'s priority queue for the upcoming Saturday session.'}
                </span>
              </div>

              {aiAnswer && (
                <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-sm space-y-2 text-xs text-stone-700">
                  <div className="flex items-center gap-1.5 font-bold text-[#c85a32]">
                    <Sparkles className="w-4 h-4" />
                    <span>Instant Workspace Assistant</span>
                  </div>
                  <div className="whitespace-pre-line text-stone-600 font-sans leading-relaxed">
                    {aiAnswer}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#1d766f] hover:bg-[#165c56] rounded-lg shadow-sm"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'question' && (
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Related DaVinci Page / Module
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                    {(['Cut', 'Edit', 'Fusion', 'Color', 'Fairlight', 'General'] as const).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`py-1.5 px-2 text-[11px] font-bold rounded-lg border text-center transition-all ${
                          category === cat
                            ? 'bg-[#1d766f] text-white border-[#1d766f] shadow-xs'
                            : 'bg-white text-stone-600 border-stone-300 hover:bg-stone-100'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {mode === 'feedback' ? 'Feedback Subject' : 'Topic / Problem Summary'}
                </label>
                <input
                  type="text"
                  placeholder={mode === 'feedback' ? 'e.g. Pace of the color grading session...' : 'e.g. Planar tracker slipping on moving subject'}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#1d766f] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {mode === 'feedback' ? 'Your Thoughts & Suggestions' : 'Describe your question / error'}
                </label>
                <textarea
                  rows={4}
                  placeholder={mode === 'feedback' ? 'What can we do to make your learning experience even better?' : 'Please include details like: which node you were using, your timeline framerate, and the error you saw...'}
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#1d766f] outline-none resize-none placeholder:text-stone-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-200/60 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-[#1d766f] hover:bg-[#165c56] rounded-lg shadow-sm transition-all active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  {mode === 'feedback' ? 'Submit Feedback' : 'Post Question'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
