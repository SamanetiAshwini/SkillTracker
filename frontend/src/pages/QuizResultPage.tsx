import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Award, CheckCircle2, XCircle, ArrowLeft, RotateCcw, BookOpen } from 'lucide-react';
import { assessmentService } from '../services/assessmentService';
import { AssessmentAttemptResult } from '../types';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

export const QuizResultPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [result, setResult] = useState<AssessmentAttemptResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadResult = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await assessmentService.getAttemptDetail(parseInt(id));
        setResult(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadResult();
  }, [id]);

  if (isLoading || !result) {
    return <LoadingSkeleton rows={4} />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        to="/assessments"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#77717A] hover:text-[#29252B]"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Quizzes
      </Link>

      {/* Hero Result Banner */}
      <Card className="text-center p-8 space-y-4 bg-gradient-to-b from-white to-[#FFF5F7]">
        <div
          className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${
            result.passed ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
          }`}
        >
          {result.passed ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
        </div>

        <div>
          <Badge variant={result.passed ? 'green' : 'amber'} size="md">
            {result.passed ? 'Passed Evaluation' : 'Review Required'}
          </Badge>
          <h1 className="text-2xl font-extrabold text-[#29252B] mt-2">{result.assessment_title}</h1>
          <p className="text-xs text-[#77717A] mt-1">{result.course_title}</p>
        </div>

        <div className="flex justify-center items-center gap-8 py-4 border-y border-[#F0DFE5] max-w-sm mx-auto">
          <div>
            <div className="text-3xl font-extrabold text-[#D96C94]">{result.percentage}%</div>
            <div className="text-[11px] font-medium text-[#77717A]">Final Score</div>
          </div>
          <div className="w-px h-10 bg-[#F0DFE5]" />
          <div>
            <div className="text-xl font-bold text-[#29252B]">
              {result.score} / {result.total_points}
            </div>
            <div className="text-[11px] font-medium text-[#77717A]">Points Earned</div>
          </div>
          <div className="w-px h-10 bg-[#F0DFE5]" />
          <div>
            <div className="text-xl font-bold text-[#29252B]">{result.passing_score}%</div>
            <div className="text-[11px] font-medium text-[#77717A]">Threshold</div>
          </div>
        </div>

        <div className="flex justify-center gap-3 pt-2">
          <Link to={`/assessments/take/${result.assessment}`}>
            <Button variant="outline" size="sm">
              <RotateCcw className="w-4 h-4 mr-1.5" /> Retake Assessment
            </Button>
          </Link>
          <Link to="/courses">
            <Button variant="primary" size="sm">
              <BookOpen className="w-4 h-4 mr-1.5" /> Return to Courses
            </Button>
          </Link>
        </div>
      </Card>

      {/* Answer Breakdown */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#29252B]">Question Breakdown & Explanations</h2>

        <div className="space-y-4">
          {result.answers.map((ans, idx) => (
            <Card key={ans.id} className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#FFF5F7] border border-[#F0DFE5] text-[#29252B] flex items-center justify-center font-bold text-xs shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-[#77717A] uppercase tracking-wider">
                    Question {idx + 1}
                  </span>
                </div>
                <Badge variant={ans.is_correct ? 'green' : 'amber'} size="sm">
                  {ans.is_correct ? `+${ans.points_awarded} pts` : '0 pts'}
                </Badge>
              </div>

              <p className="text-sm font-semibold text-[#29252B]">{ans.question_text}</p>

              {/* Options status */}
              <div className="space-y-2 pt-1">
                {ans.options?.map((opt) => {
                  const isSelected = ans.selected_option === opt.id;
                  const isCorrect = ans.correct_answer === opt.id;

                  let style = 'border-[#F0DFE5] bg-white text-[#77717A]';
                  if (isSelected && isCorrect) {
                    style = 'border-emerald-300 bg-emerald-50 text-emerald-800 font-semibold';
                  } else if (isSelected && !isCorrect) {
                    style = 'border-rose-300 bg-rose-50 text-rose-800 font-semibold';
                  } else if (isCorrect) {
                    style = 'border-emerald-300 bg-emerald-50/50 text-emerald-700';
                  }

                  return (
                    <div
                      key={opt.id}
                      className={`p-3 rounded-xl border text-xs flex items-center justify-between ${style}`}
                    >
                      <span>{opt.text}</span>
                      <div className="flex items-center gap-2">
                        {isSelected && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-current">
                            Your Choice
                          </span>
                        )}
                        {isCorrect && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                            Correct Answer
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Explanation Note */}
              {ans.explanation && (
                <div className="p-3 bg-[#FFF5F7] border border-[#F0DFE5] rounded-xl text-xs space-y-1">
                  <span className="font-bold text-[#29252B]">Why this is correct:</span>
                  <p className="text-[#77717A] text-[11px] leading-relaxed">{ans.explanation}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
