import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, Clock, CheckCircle2, AlertCircle, PlayCircle, RotateCcw } from 'lucide-react';
import { assessmentService } from '../services/assessmentService';
import { Assessment, AssessmentAttemptResult } from '../types';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

export const AssessmentsPage: React.FC = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [attempts, setAttempts] = useState<AssessmentAttemptResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [asgData, attData] = await Promise.all([
          assessmentService.getAssessments(),
          assessmentService.getAttempts(),
        ]);
        setAssessments(asgData);
        setAttempts(attData);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#29252B] tracking-tight">Assessments & Quizzes</h1>
        <p className="text-sm text-[#77717A]">
          Timed evaluations with server-verified scoring and conceptual explanations
        </p>
      </div>

      {isLoading ? (
        <LoadingSkeleton rows={4} />
      ) : (
        <div className="space-y-8">
          {/* Active Quizzes */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[#29252B]">Available Quizzes</h2>
            {assessments.length === 0 ? (
              <Card className="text-center py-12">
                <Award className="w-10 h-10 text-[#E98EAD] mx-auto opacity-60 mb-2" />
                <p className="text-sm text-[#77717A]">No quizzes available for enrolled courses.</p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {assessments.map((quiz) => (
                  <Card key={quiz.id} className="flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="rose" size="sm">{quiz.course_title}</Badge>
                        <span className="text-xs text-[#77717A] flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#E98EAD]" /> {quiz.time_limit_minutes} min
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-[#29252B]">{quiz.title}</h3>
                      <p className="text-xs text-[#77717A] leading-relaxed line-clamp-2">
                        {quiz.description || 'Test your knowledge on key topics and architecture standards.'}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-[#77717A] pt-2 border-t border-[#F0DFE5]">
                        <span>Passing Threshold: <strong>{quiz.passing_score}%</strong></span>
                        <span>Questions: <strong>{quiz.questions_count || 4}</strong></span>
                      </div>
                    </div>

                    {/* Latest Attempt if any */}
                    <div className="pt-3 border-t border-[#F0DFE5] flex items-center justify-between">
                      {quiz.my_latest_attempt ? (
                        <div className="text-xs">
                          <span className="text-[#77717A]">Last Score: </span>
                          <span className="font-bold text-[#29252B]">
                            {quiz.my_latest_attempt.percentage}%
                          </span>{' '}
                          <Badge variant={quiz.my_latest_attempt.passed ? 'green' : 'amber'} size="sm">
                            {quiz.my_latest_attempt.passed ? 'Passed' : 'Needs Review'}
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-xs text-[#77717A]">Not yet attempted</span>
                      )}

                      <Link to={`/assessments/take/${quiz.id}`}>
                        <Button variant="primary" size="sm">
                          {quiz.my_latest_attempt ? (
                            <>
                              <RotateCcw className="w-4 h-4 mr-1.5" /> Retake
                            </>
                          ) : (
                            <>
                              <PlayCircle className="w-4 h-4 mr-1.5" /> Start Quiz
                            </>
                          )}
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Past Attempts History */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[#29252B]">Attempt History</h2>
            {attempts.length === 0 ? (
              <p className="text-xs text-[#77717A]">No attempts recorded yet.</p>
            ) : (
              <Card className="p-0 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FFF5F7] border-b border-[#F0DFE5] text-[#77717A] uppercase font-semibold text-[11px]">
                      <tr>
                        <th className="p-4">Quiz Title</th>
                        <th className="p-4">Course</th>
                        <th className="p-4">Date Taken</th>
                        <th className="p-4">Score</th>
                        <th className="p-4">Percentage</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Review</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0DFE5]">
                      {attempts.map((att) => (
                        <tr key={att.id} className="hover:bg-[#FFF5F7]/40 transition-colors">
                          <td className="p-4 font-semibold text-[#29252B]">{att.assessment_title}</td>
                          <td className="p-4 text-[#77717A]">{att.course_title}</td>
                          <td className="p-4 text-[#77717A]">
                            {new Date(att.start_time).toLocaleDateString()}
                          </td>
                          <td className="p-4 font-bold text-[#29252B]">
                            {att.score} / {att.total_points}
                          </td>
                          <td className="p-4 font-bold text-[#D96C94]">{att.percentage}%</td>
                          <td className="p-4">
                            <Badge variant={att.passed ? 'green' : 'amber'} size="sm">
                              {att.passed ? 'Passed' : 'Failed'}
                            </Badge>
                          </td>
                          <td className="p-4 text-right">
                            <Link to={`/assessments/result/${att.id}`}>
                              <Button variant="ghost" size="sm">
                                View Breakdown →
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
