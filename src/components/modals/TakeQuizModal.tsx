import React, { useState, useEffect } from 'react';
import { Quiz } from '../../types';
import { useSchool } from '../../context/SchoolContext';
import { Timer, CheckCircle, XCircle, AlertCircle, X, Award } from 'lucide-react';

interface TakeQuizModalProps {
  quiz: Quiz;
  onClose: () => void;
}

export const TakeQuizModal: React.FC<TakeQuizModalProps> = ({ quiz, onClose }) => {
  const { submitQuizAttempt, currentStudent } = useSchool();
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(quiz.durationMinutes * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  // Timer countdown
  useEffect(() => {
    if (isSubmitted) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isSubmitted]);

  const handleFinish = () => {
    let score = 0;
    quiz.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        score += 1;
      }
    });

    setFinalScore(score);
    setIsSubmitted(true);
    submitQuizAttempt(quiz.id, score, quiz.questions.length);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const currentQ = quiz.questions[currentQuestionIndex];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <span className="text-[11px] font-bold text-blue-900 font-mono">{quiz.courseCode}</span>
            <h3 className="text-xs font-bold text-slate-900 truncate max-w-md">{quiz.title}</h3>
          </div>
          
          <div className="flex items-center gap-3">
            {!isSubmitted && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs font-mono font-bold">
                <Timer className="w-3.5 h-3.5 text-amber-600" />
                <span>{minutes}:{seconds < 10 ? `0${seconds}` : seconds}</span>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quiz Body */}
        {!isSubmitted ? (
          <div className="p-6 space-y-6">
            {/* Progress counter */}
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </span>
              <span>
                Answered: {Object.keys(selectedAnswers).length}/{quiz.questions.length}
              </span>
            </div>

            {/* Current Question */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h4 className="text-sm font-semibold text-slate-900 leading-snug">
                {currentQuestionIndex + 1}. {currentQ.question}
              </h4>
            </div>

            {/* Options */}
            <div className="space-y-2">
              {currentQ.options.map((opt, optIdx) => {
                const isSelected = selectedAnswers[currentQuestionIndex] === optIdx;
                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() =>
                      setSelectedAnswers({
                        ...selectedAnswers,
                        [currentQuestionIndex]: optIdx,
                      })
                    }
                    className={`w-full p-3.5 text-left rounded-xl border text-xs transition-colors flex items-center justify-between ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 text-blue-950 font-semibold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{opt}</span>
                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                      isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                    }`}>
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Footer Navigation Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-lg transition-colors"
              >
                Previous
              </button>

              {currentQuestionIndex < quiz.questions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors"
                >
                  Next Question
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinish}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
                >
                  Submit & Finish Assessment
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Result Summary */
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-blue-50 text-blue-900 rounded-full flex items-center justify-center mx-auto">
              <Award className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">Assessment Submitted!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Candidate: {currentStudent.fullName} ({currentStudent.studentId})
              </p>
            </div>

            {/* Scorecard */}
            <div className="max-w-xs mx-auto p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="text-3xl font-black font-mono text-blue-900 tabular-nums">
                {finalScore} / {quiz.questions.length}
              </div>
              <div className="text-xs font-bold text-emerald-700">
                Score: {Math.round((finalScore / quiz.questions.length) * 100)}%
              </div>
              <p className="text-[11px] text-slate-500">
                Your score has been registered in the student continuous assessment database.
              </p>
            </div>

            {/* Answer Breakdown */}
            <div className="space-y-3 text-left max-h-56 overflow-y-auto pr-1">
              {quiz.questions.map((q, idx) => {
                const userAns = selectedAnswers[idx];
                const isCorrect = userAns === q.correctIndex;
                return (
                  <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                    <div className="flex items-start gap-2">
                      {isCorrect ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="font-semibold text-slate-900">{idx + 1}. {q.question}</div>
                        <div className="text-[11px] text-slate-600 mt-1">
                          Correct Answer: <strong>{q.options[q.correctIndex]}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 bg-blue-950 text-white font-semibold text-xs rounded-xl hover:bg-blue-900 transition-colors"
            >
              Close & Return to Dashboard
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
