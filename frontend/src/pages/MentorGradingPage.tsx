import React, { useEffect, useState } from 'react';
import { FileCheck2, ExternalLink, CheckCircle2, AlertCircle, Edit3 } from 'lucide-react';
import { assignmentService } from '../services/assignmentService';
import { Submission } from '../types';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

export const MentorGradingPage: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);

  // Grade Form State
  const [score, setScore] = useState<number>(85);
  const [feedback, setFeedback] = useState<string>('');
  const [statusVal, setStatusVal] = useState<'GRADED' | 'RESUBMISSION_REQUESTED'>('GRADED');
  const [isGrading, setIsGrading] = useState(false);
  const [gradeError, setGradeError] = useState<string | null>(null);

  const loadSubmissions = async () => {
    setIsLoading(true);
    try {
      const data = await assignmentService.getSubmissions();
      setSubmissions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const openGradingModal = (sub: Submission) => {
    setSelectedSub(sub);
    setScore(sub.score || (sub.max_points ? Math.round(sub.max_points * 0.85) : 80));
    setFeedback(sub.feedback || '');
    setStatusVal((sub.status as any) === 'RESUBMISSION_REQUESTED' ? 'RESUBMISSION_REQUESTED' : 'GRADED');
    setGradeError(null);
  };

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;

    if (selectedSub.max_points && score > selectedSub.max_points) {
      setGradeError(`Score cannot exceed maximum points (${selectedSub.max_points}).`);
      return;
    }

    setIsGrading(true);
    setGradeError(null);

    try {
      await assignmentService.gradeSubmission(selectedSub.id, {
        score,
        feedback,
        status: statusVal,
      });
      setSelectedSub(null);
      await loadSubmissions();
    } catch (err: any) {
      console.error(err);
      setGradeError(err.response?.data?.score?.[0] || 'Grading failed.');
    } finally {
      setIsGrading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#29252B] tracking-tight">Assignment Grading & Review</h1>
        <p className="text-sm text-[#77717A]">
          Review student code submissions, evaluate implementation criteria, and award grades
        </p>
      </div>

      {isLoading ? (
        <LoadingSkeleton rows={4} />
      ) : submissions.length === 0 ? (
        <Card className="text-center py-16">
          <FileCheck2 className="w-12 h-12 text-[#E98EAD] mx-auto opacity-60 mb-2" />
          <h3 className="text-base font-semibold text-[#29252B]">No submissions found</h3>
          <p className="text-xs text-[#77717A] mt-1">Student submissions will appear here once submitted.</p>
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFF5F7] border-b border-[#F0DFE5] text-[#77717A] uppercase font-semibold text-[11px]">
                <tr>
                  <th className="p-4">Student</th>
                  <th className="p-4">Assignment</th>
                  <th className="p-4">Submitted At</th>
                  <th className="p-4">Artifact / Link</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Score</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0DFE5]">
                {submissions.map((sub) => {
                  const isGraded = sub.status === 'GRADED';
                  return (
                    <tr key={sub.id} className="hover:bg-[#FFF5F7]/40 transition-colors">
                      <td className="p-4 font-bold text-[#29252B]">
                        {sub.student.first_name ? `${sub.student.first_name} ${sub.student.last_name}` : sub.student.username}
                        <div className="text-[11px] text-[#77717A] font-normal">{sub.student.email}</div>
                      </td>
                      <td className="p-4 font-semibold text-[#29252B]">{sub.assignment_title}</td>
                      <td className="p-4 text-[#77717A]">{new Date(sub.submitted_at).toLocaleDateString()}</td>
                      <td className="p-4">
                        {sub.submission_url ? (
                          <a
                            href={sub.submission_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[#D96C94] hover:underline"
                          >
                            Repo Link <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : sub.submission_text ? (
                          <span className="text-[#77717A] italic">Text Solution</span>
                        ) : (
                          <span className="text-[#77717A]">—</span>
                        )}
                      </td>
                      <td className="p-4">
                        <Badge variant={isGraded ? 'green' : 'amber'} size="sm">
                          {isGraded ? 'Graded' : 'Pending Review'}
                        </Badge>
                      </td>
                      <td className="p-4 font-bold text-[#29252B]">
                        {sub.score !== null && sub.score !== undefined ? `${sub.score} / ${sub.max_points}` : '—'}
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          variant={isGraded ? 'outline' : 'primary'}
                          size="sm"
                          onClick={() => openGradingModal(sub)}
                        >
                          <Edit3 className="w-3.5 h-3.5 mr-1" />
                          {isGraded ? 'Re-grade' : 'Grade'}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Grading Modal */}
      {selectedSub && (
        <Modal
          isOpen={!!selectedSub}
          onClose={() => setSelectedSub(null)}
          title={`Grade: ${selectedSub.assignment_title}`}
          maxWidth="lg"
        >
          <form onSubmit={handleSaveGrade} className="space-y-4">
            {gradeError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{gradeError}</span>
              </div>
            )}

            {/* Student Submission Preview */}
            <div className="p-3 bg-[#FFF5F7] border border-[#F0DFE5] rounded-xl text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-[#29252B]">
                  Student: {selectedSub.student.first_name ? `${selectedSub.student.first_name} ${selectedSub.student.last_name}` : selectedSub.student.username}
                </span>
                <span className="text-[#77717A]">
                  Max Allowed Points: <strong>{selectedSub.max_points}</strong>
                </span>
              </div>

              {selectedSub.submission_url && (
                <div>
                  <span className="text-[#77717A]">Project URL: </span>
                  <a
                    href={selectedSub.submission_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#D96C94] font-medium hover:underline"
                  >
                    {selectedSub.submission_url}
                  </a>
                </div>
              )}

              {selectedSub.submission_text && (
                <div className="mt-1">
                  <span className="text-[#77717A]">Student Notes: </span>
                  <p className="p-2 bg-white rounded-lg border border-[#F0DFE5] text-[#29252B] whitespace-pre-wrap text-[11px] mt-1">
                    {selectedSub.submission_text}
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#29252B] mb-1">
                  Score Awarded (Max: {selectedSub.max_points}) *
                </label>
                <input
                  type="number"
                  min="0"
                  max={selectedSub.max_points}
                  required
                  value={score}
                  onChange={(e) => setScore(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm bg-white border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#29252B] mb-1">
                  Review Status
                </label>
                <select
                  value={statusVal}
                  onChange={(e) => setStatusVal(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm bg-white border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
                >
                  <option value="GRADED">Graded & Accepted</option>
                  <option value="RESUBMISSION_REQUESTED">Resubmission Requested</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#29252B] mb-1">
                Qualitative Mentor Feedback *
              </label>
              <textarea
                rows={3}
                required
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Praise strengths, point out edge cases or performance bottlenecks..."
                className="w-full px-3 py-2 text-sm bg-white border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#F0DFE5]">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSelectedSub(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isGrading}
              >
                Save Review & Feedback
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
