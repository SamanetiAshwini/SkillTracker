import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Award, Clock, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { assessmentService } from '../services/assessmentService';
import { Assessment, Question } from '../types';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { ProgressBar } from '../components/ProgressBar';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

export const QuizTakePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qId: number]: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(30 * 60);

  useEffect(() => {
    const loadQuiz = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await assessmentService.getAssessmentToTake(parseInt(id));
        setAssessment(data);
        setTimeLeft(data.time_limit_minutes * 60);
      } catch (err: any) {
        console.error(err);
        setError('Failed to load assessment. Ensure you are enrolled in this course.');
      } finally {
        setIsLoading(false);
      }
    };

    loadQuiz();
  }, [id]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleSelectOption = (questionId: number, optionId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSubmit = async () => {
    if (!assessment) return;

    const questions = assessment.questions || [];
    const answeredCount = Object.keys(selectedAnswers).length;

    if (answeredCount < questions.length) {
      if (!window.confirm(`You have answered ${answeredCount} of ${questions.length} questions. Are you sure you want to submit?`)) {
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);

    const payload = Object.entries(selectedAnswers).map(([qId, opt]) => ({
      question_id: parseInt(qId),
      selected_option: opt,
    }));

    try {
      const result = await assessmentService.submitQuiz(assessment.id, payload);
      navigate(`/assessments/result/${result.id}`);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to submit quiz.');
      setIsSubmitting(false);
    }
  };

  if (isLoading || !assessment) {
    return <LoadingSkeleton rows={4} />;
  }

  const questions = assessment.questions || [];
  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPct = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#F0DFE5] p-5 rounded-2xl card-shadow">
        <div className="space-y-1">
          <Link
            to="/assessments"
            className="inline-flex items-center gap-1.5 text-xs text-[#77717A] hover:text-[#29252B]"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Quizzes
          </Link>
          <h1 className="text-xl font-bold text-[#29252B]">{assessment.title}</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[#FFF5F7] border border-[#F0DFE5] px-3 py-1.5 rounded-xl text-xs font-semibold text-[#D96C94]">
            <Clock className="w-4 h-4 text-[#E98EAD]" />
            <span>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
          </div>
          <div className="w-32">
            <ProgressBar progress={progressPct} showLabel size="sm" />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-6">
        {questions.map((q, idx) => {
          const selected = selectedAnswers[q.id];
          return (
            <Card key={q.id} className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#FCE7EF] text-[#D96C94] flex items-center justify-center font-bold text-xs shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-[#77717A] uppercase tracking-wider">
                    Question {idx + 1}
                  </span>
                </div>
                <span className="text-xs text-[#77717A] bg-[#FFF5F7] px-2.5 py-1 rounded-full border border-[#F0DFE5]">
                  {q.points} {q.points === 1 ? 'Point' : 'Points'}
                </span>
              </div>

              <p className="text-sm font-semibold text-[#29252B] leading-relaxed">
                {q.question_text}
              </p>

              {/* Options */}
              <div className="space-y-2 pt-2">
                {q.options.map((opt) => {
                  const isChecked = selected === opt.id;
                  return (
                    <label
                      key={opt.id}
                      onClick={() => handleSelectOption(q.id, opt.id)}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        isChecked
                          ? 'border-[#E98EAD] bg-[#FFF5F7] text-[#29252B] font-medium shadow-xs'
                          : 'border-[#F0DFE5] hover:bg-[#FFF5F7]/40 text-[#77717A]'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        checked={isChecked}
                        onChange={() => handleSelectOption(q.id, opt.id)}
                        className="text-[#E98EAD] focus:ring-[#E98EAD] cursor-pointer"
                      />
                      <span className="flex-1">{opt.text}</span>
                    </label>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Submit Footer */}
      <div className="flex items-center justify-between p-4 bg-white border border-[#F0DFE5] rounded-2xl card-shadow">
        <span className="text-xs text-[#77717A]">
          Answered: <strong>{answeredCount}</strong> of {questions.length} questions
        </span>
        <Button
          variant="primary"
          size="md"
          onClick={handleSubmit}
          isLoading={isSubmitting}
        >
          Submit Evaluation
        </Button>
      </div>
    </div>
  );
};
