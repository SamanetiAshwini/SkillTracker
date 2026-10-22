import React, { useEffect, useState } from 'react';
import { FileCheck2, Clock, CheckCircle2, AlertCircle, UploadCloud, Link as LinkIcon } from 'lucide-react';
import { assignmentService } from '../services/assignmentService';
import { Assignment } from '../types';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

export const AssignmentsPage: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  // Submission Form State
  const [submissionText, setSubmissionText] = useState('');
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const loadAssignments = async () => {
    setIsLoading(true);
    try {
      const data = await assignmentService.getAssignments();
      setAssignments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  const openSubmitModal = (asg: Assignment) => {
    setSelectedAssignment(asg);
    setSubmissionText(asg.my_submission?.submission_text || '');
    setSubmissionUrl(asg.my_submission?.submission_url || '');
    setAttachmentFile(null);
    setSubmitError(null);
    setSubmitSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;
    if (!submissionText.trim() && !submissionUrl.trim() && !attachmentFile) {
      setSubmitError('Please provide notes, a repository link, or an attachment file.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await assignmentService.submitAssignment(selectedAssignment.id, {
        submission_text: submissionText,
        submission_url: submissionUrl,
        attachment_file: attachmentFile || undefined,
      });
      setSubmitSuccess(true);
      await loadAssignments();
      setTimeout(() => {
        setSelectedAssignment(null);
      }, 1200);
    } catch (err: any) {
      console.error(err);
      setSubmitError(err.response?.data?.detail || 'Failed to submit assignment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#29252B] tracking-tight">Assignments & Submissions</h1>
        <p className="text-sm text-[#77717A]">
          Practical capstones and exercises evaluated with personalized mentor feedback
        </p>
      </div>

      {isLoading ? (
        <LoadingSkeleton rows={4} />
      ) : assignments.length === 0 ? (
        <Card className="text-center py-16">
          <FileCheck2 className="w-12 h-12 text-[#E98EAD] mx-auto opacity-60 mb-2" />
          <h3 className="text-base font-semibold text-[#29252B]">No assignments available</h3>
          <p className="text-xs text-[#77717A] mt-1">
            Enroll in a course to view upcoming project assignments.
          </p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {assignments.map((asg) => {
            const submission = asg.my_submission;
            const isGraded = submission?.status === 'GRADED';
            const isPending = submission?.status === 'PENDING';

            return (
              <Card key={asg.id} className="flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="rose" size="sm">{asg.course_title}</Badge>
                    <span className="text-xs text-[#77717A] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#E98EAD]" />
                      Due {new Date(asg.due_date).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#29252B]">{asg.title}</h3>
                  <p className="text-xs text-[#77717A] leading-relaxed line-clamp-3">
                    {asg.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-[#77717A] pt-2 border-t border-[#F0DFE5]">
                    <span>Max Points: <strong>{asg.max_points}</strong></span>
                    <span>Passing: <strong>{asg.passing_points} pts</strong></span>
                  </div>
                </div>

                {/* Submission State Footer */}
                <div className="pt-3 border-t border-[#F0DFE5] space-y-3">
                  {submission ? (
                    <div className="p-3 bg-[#FFF5F7] border border-[#F0DFE5] rounded-xl space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#29252B]">My Submission:</span>
                        <Badge variant={isGraded ? 'green' : 'amber'} size="sm">
                          {isGraded ? `Score: ${submission.score} / ${asg.max_points}` : 'Pending Review'}
                        </Badge>
                      </div>

                      {submission.submission_url && (
                        <div className="text-[11px] text-[#77717A] truncate">
                          Link:{' '}
                          <a
                            href={submission.submission_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#D96C94] hover:underline"
                          >
                            {submission.submission_url}
                          </a>
                        </div>
                      )}

                      {submission.feedback && (
                        <div className="p-2.5 bg-white border border-[#F0DFE5] rounded-lg text-xs space-y-1">
                          <span className="font-bold text-[#29252B]">Mentor Feedback:</span>
                          <p className="text-[#77717A] italic text-[11px]">{submission.feedback}</p>
                        </div>
                      )}
                    </div>
                  ) : null}

                  <Button
                    variant={submission ? 'outline' : 'primary'}
                    size="sm"
                    className="w-full"
                    onClick={() => openSubmitModal(asg)}
                  >
                    {submission ? 'Update / Resubmit' : 'Submit Assignment'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Submission Modal */}
      {selectedAssignment && (
        <Modal
          isOpen={!!selectedAssignment}
          onClose={() => setSelectedAssignment(null)}
          title={`Submit: ${selectedAssignment.title}`}
          maxWidth="lg"
        >
          {submitSuccess ? (
            <div className="p-6 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold text-[#29252B]">Submission Received!</h3>
              <p className="text-xs text-[#77717A]">
                Your assignment has been submitted to your faculty mentor for review.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {submitError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[#29252B] mb-1">
                  Repository or Deployment URL
                </label>
                <div className="relative">
                  <LinkIcon className="w-4 h-4 text-[#77717A] absolute left-3 top-3" />
                  <input
                    type="url"
                    value={submissionUrl}
                    onChange={(e) => setSubmissionUrl(e.target.value)}
                    placeholder="https://github.com/username/project"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#29252B] mb-1">
                  Submission Notes & Implementation Description
                </label>
                <textarea
                  rows={4}
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  placeholder="Detail your architecture, test results, and any trade-offs made..."
                  className="w-full px-3 py-2 text-sm bg-white border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#29252B] mb-1">
                  Optional File Attachment (.zip, .pdf, .py)
                </label>
                <input
                  type="file"
                  onChange={(e) => setAttachmentFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-xs text-[#77717A] file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#FCE7EF] file:text-[#D96C94] hover:file:bg-[#E98EAD] hover:file:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#F0DFE5]">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedAssignment(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSubmitting}
                >
                  Submit Solution
                </Button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
};
