import React, { useState } from 'react';
import { MOCK_TEST_QUESTIONS } from '../../data/initialData';
import { X, Award, CheckCircle, XCircle, RotateCcw, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MockTestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MockTestModal: React.FC<MockTestModalProps> = ({ isOpen, onClose }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const currentQ = MOCK_TEST_QUESTIONS[currentIdx];
  const totalQ = MOCK_TEST_QUESTIONS.length;

  const handleSelect = (optionIdx: number) => {
    if (isSubmitted) return;
    setSelectedAnswers({
      ...selectedAnswers,
      [currentIdx]: optionIdx,
    });
  };

  const handleNext = () => {
    if (currentIdx < totalQ - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setIsSubmitted(true);
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  };

  const calculateScore = () => {
    let score = 0;
    MOCK_TEST_QUESTIONS.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) {
        score++;
      }
    });
    return score;
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setCurrentIdx(0);
  };

  const score = calculateScore();
  const percentage = Math.round((score / totalQ) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-xl bg-[#faf8f5] text-[#2c2a29] rounded-2xl shadow-2xl border border-[#e7ded3] overflow-hidden"
        id="mock-test-modal"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#f2ecdf] border-b border-[#e2d7c7]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#c85a32]/15 text-[#c85a32] rounded-lg">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#c85a32]">
                DaVinci Resolve Certification
              </span>
              <h3 className="text-base font-bold text-stone-900">
                Mock Practical Assessment Test
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
          {!isSubmitted ? (
            <div className="space-y-6">
              {/* Progress */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-stone-600">
                  <span>Question {currentIdx + 1} of {totalQ}</span>
                  <span className="px-2 py-0.5 rounded bg-stone-200 text-stone-700 font-mono text-[11px]">
                    {currentQ.pageContext} Page
                  </span>
                </div>
                <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#c85a32] transition-all duration-300 rounded-full"
                    style={{ width: `${((currentIdx + 1) / totalQ) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question */}
              <div className="space-y-4">
                <h4 className="text-base font-bold text-stone-900 leading-snug">
                  {currentQ.question}
                </h4>

                <div className="space-y-2.5">
                  {currentQ.options.map((option, optIdx) => {
                    const isSelected = selectedAnswers[currentIdx] === optIdx;
                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelect(optIdx)}
                        className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#c85a32]/10 border-[#c85a32] text-[#c85a32] shadow-sm ring-1 ring-[#c85a32]'
                            : 'bg-white border-stone-300 text-stone-800 hover:border-stone-400 hover:bg-stone-50'
                        }`}
                      >
                        <span>{option}</span>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ml-3 ${
                          isSelected ? 'border-[#c85a32] bg-[#c85a32]' : 'border-stone-300'
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx(currentIdx - 1)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-200/60 rounded-lg disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={selectedAnswers[currentIdx] === undefined}
                  onClick={handleNext}
                  className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-[#c85a32] hover:bg-[#b04825] rounded-lg shadow-sm disabled:opacity-40 disabled:pointer-events-none transition-all active:scale-95"
                >
                  {currentIdx === totalQ - 1 ? 'Finish Assessment' : 'Next Question'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Results Screen */
            <div className="space-y-6 text-center py-2">
              <div className="inline-block p-4 rounded-full bg-emerald-100 text-emerald-600 mb-1">
                <Award className="w-12 h-12" />
              </div>
              <div>
                <h4 className="text-2xl font-black text-stone-900">
                  {percentage >= 80 ? 'Mastery Score Achieved! 🎓' : 'Good Attempt! 🎬'}
                </h4>
                <p className="text-sm text-stone-600 mt-1">
                  You scored <strong className="text-stone-900 font-bold">{score}</strong> out of {totalQ} ({percentage}%)
                </p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-stone-200 text-left space-y-3 max-h-56 overflow-y-auto">
                <h5 className="text-xs font-bold uppercase text-stone-500">Answer Breakdown:</h5>
                {MOCK_TEST_QUESTIONS.map((q, idx) => {
                  const isCorrect = selectedAnswers[idx] === q.correctAnswer;
                  return (
                    <div key={idx} className="text-xs p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                      <div className="flex items-start gap-2">
                        {isCorrect ? (
                          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="font-semibold text-stone-800">{q.question}</p>
                          <p className="text-stone-600 mt-1 text-[11px]">
                            <strong>Correct:</strong> {q.options[q.correctAnswer]}
                          </p>
                          <p className="text-stone-500 italic mt-0.5 text-[10px]">{q.explanation}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-stone-700 bg-stone-200 hover:bg-stone-300 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Retake Test
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#1d766f] hover:bg-[#165c56] rounded-lg shadow-sm transition-colors"
                >
                  Close & Continue Learning
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
