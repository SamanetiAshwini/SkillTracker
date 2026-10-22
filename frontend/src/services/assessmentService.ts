import api from './api';
import { Assessment, AssessmentAttemptResult, Question } from '../types';

export const assessmentService = {
  getAssessments: async (courseId?: number): Promise<Assessment[]> => {
    const params = courseId ? { course: courseId } : {};
    const res = await api.get('/assessments/', { params });
    return res.data.results ? res.data.results : res.data;
  },

  getAssessmentToTake: async (assessmentId: number): Promise<Assessment> => {
    const res = await api.get(`/assessments/${assessmentId}/take/`);
    return res.data;
  },

  submitQuiz: async (
    assessmentId: number,
    answers: Array<{ question_id: number; selected_option: string }>
  ): Promise<AssessmentAttemptResult> => {
    const res = await api.post(`/assessments/${assessmentId}/submit/`, { answers });
    return res.data;
  },

  getAttempts: async (): Promise<AssessmentAttemptResult[]> => {
    const res = await api.get('/assessments/attempts/');
    return res.data.results ? res.data.results : res.data;
  },

  getAttemptDetail: async (attemptId: number): Promise<AssessmentAttemptResult> => {
    const res = await api.get(`/assessments/attempts/${attemptId}/`);
    return res.data;
  },

  createAssessment: async (data: Partial<Assessment>): Promise<Assessment> => {
    const res = await api.post('/assessments/', data);
    return res.data;
  },

  addQuestion: async (assessmentId: number, question: Partial<Question>): Promise<Question> => {
    const res = await api.post(`/assessments/${assessmentId}/add_question/`, question);
    return res.data;
  },
};
