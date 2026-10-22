import React, { useEffect, useState } from 'react';
import { Award, Plus, CheckCircle2, HelpCircle } from 'lucide-react';
import { assessmentService } from '../services/assessmentService';
import { courseService } from '../services/courseService';
import { Assessment, Course, Question } from '../types';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

export const MentorAssessmentsPage: React.FC = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Quiz Modal
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<number>(0);
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDesc, setQuizDesc] = useState('');
  const [timeLimit, setTimeLimit] = useState(25);
  const [passingScore, setPassingScore] = useState(70);

  // New Question Modal
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [targetQuizId, setTargetQuizId] = useState<number | null>(null);
  const [questionText, setQuestionText] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('A');
  const [points, setPoints] = useState(25);
  const [explanation, setExplanation] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [aData, cData] = await Promise.all([
        assessmentService.getAssessments(),
        courseService.getCourses(),
      ]);
      setAssessments(aData);
      setCourses(cData);
      if (cData.length > 0) setSelectedCourseId(cData[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizTitle || !selectedCourseId) return;

    try {
      await assessmentService.createAssessment({
        course: selectedCourseId,
        title: quizTitle,
        description: quizDesc,
        time_limit_minutes: timeLimit,
        passing_score: passingScore,
        is_active: true,
      });
      setIsQuizModalOpen(false);
      setQuizTitle('');
      setQuizDesc('');
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetQuizId || !questionText || !optA || !optB) return;

    const options = [
      { id: 'A', text: optA },
      { id: 'B', text: optB },
    ];
    if (optC) options.push({ id: 'C', text: optC });
    if (optD) options.push({ id: 'D', text: optD });

    try {
      await assessmentService.addQuestion(targetQuizId, {
        question_text: questionText,
        question_type: 'MCQ',
        points,
        options,
        correct_answer: correctAnswer,
        explanation,
      });
      setIsQuestionModalOpen(false);
      setQuestionText('');
      setOptA('');
      setOptB('');
      setOptC('');
      setOptD('');
      setExplanation('');
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#29252B] tracking-tight">Assessment Bank</h1>
          <p className="text-sm text-[#77717A]">
            Draft timed multiple choice and conceptual tests for your cohort modules
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => setIsQuizModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" /> Create Assessment
        </Button>
      </div>

      {isLoading ? (
        <LoadingSkeleton rows={4} />
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {assessments.map((quiz) => (
            <Card key={quiz.id} className="space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="rose" size="sm">{quiz.course_title}</Badge>
                  <span className="text-xs text-[#77717A]">{quiz.time_limit_minutes} min duration</span>
                </div>

                <h3 className="text-base font-bold text-[#29252B]">{quiz.title}</h3>
                <p className="text-xs text-[#77717A] leading-relaxed line-clamp-2">
                  {quiz.description || 'Comprehensive evaluation covering modular topics.'}
                </p>

                <div className="flex items-center gap-4 text-xs text-[#77717A] pt-2 border-t border-[#F0DFE5]">
                  <span>Passing Score: <strong>{quiz.passing_score}%</strong></span>
                  <span>Questions in bank: <strong>{quiz.questions_count || 4}</strong></span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#F0DFE5] flex justify-end">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setTargetQuizId(quiz.id);
                    setIsQuestionModalOpen(true);
                  }}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Question to Bank
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* New Quiz Modal */}
      <Modal isOpen={isQuizModalOpen} onClose={() => setIsQuizModalOpen(false)} title="Create Assessment">
        <form onSubmit={handleCreateQuiz} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#29252B] mb-1">Target Course *</label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(parseInt(e.target.value))}
              className="w-full px-3 py-2 text-sm bg-white border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#29252B] mb-1">Assessment Title *</label>
            <input
              type="text"
              required
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              placeholder="e.g. Django REST Security & ORM Fundamentals"
              className="w-full px-3 py-2 text-sm bg-white border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#29252B] mb-1">Description</label>
            <textarea
              rows={2}
              value={quizDesc}
              onChange={(e) => setQuizDesc(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#29252B] mb-1">Time Limit (Mins)</label>
              <input
                type="number"
                value={timeLimit}
                onChange={(e) => setTimeLimit(parseInt(e.target.value) || 20)}
                className="w-full px-3 py-2 text-sm bg-white border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#29252B] mb-1">Passing Threshold (%)</label>
              <input
                type="number"
                value={passingScore}
                onChange={(e) => setPassingScore(parseInt(e.target.value) || 70)}
                className="w-full px-3 py-2 text-sm bg-white border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#F0DFE5]">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsQuizModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Publish Quiz
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Question Modal */}
      <Modal isOpen={isQuestionModalOpen} onClose={() => setIsQuestionModalOpen(false)} title="Add MCQ Question">
        <form onSubmit={handleAddQuestion} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#29252B] mb-1">Question Text *</label>
            <textarea
              rows={2}
              required
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="e.g. Which HTTP status code represents a forbidden authorization request?"
              className="w-full px-3 py-2 text-sm bg-white border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#29252B] mb-1">Option A *</label>
              <input
                type="text"
                required
                value={optA}
                onChange={(e) => setOptA(e.target.value)}
                placeholder="Choice A text"
                className="w-full px-3 py-2 text-sm bg-white border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#29252B] mb-1">Option B *</label>
              <input
                type="text"
                required
                value={optB}
                onChange={(e) => setOptB(e.target.value)}
                placeholder="Choice B text"
                className="w-full px-3 py-2 text-sm bg-white border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#29252B] mb-1">Option C (Optional)</label>
              <input
                type="text"
                value={optC}
                onChange={(e) => setOptC(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#29252B] mb-1">Option D (Optional)</label>
              <input
                type="text"
                value={optD}
                onChange={(e) => setOptD(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#29252B] mb-1">Correct Option ID *</label>
              <select
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
              >
                <option value="A">Option A</option>
                <option value="B">Option B</option>
                <option value="C">Option C</option>
                <option value="D">Option D</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#29252B] mb-1">Points Awarded</label>
              <input
                type="number"
                value={points}
                onChange={(e) => setPoints(parseInt(e.target.value) || 25)}
                className="w-full px-3 py-2 text-sm bg-white border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#29252B] mb-1">Explanation (Shown after quiz submit)</label>
            <textarea
              rows={2}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Why this choice is technically accurate..."
              className="w-full px-3 py-2 text-sm bg-white border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#F0DFE5]">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsQuestionModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Question
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
