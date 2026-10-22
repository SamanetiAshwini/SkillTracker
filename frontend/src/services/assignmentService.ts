import api from './api';
import { Assignment, Submission } from '../types';

export const assignmentService = {
  getAssignments: async (courseId?: number): Promise<Assignment[]> => {
    const params = courseId ? { course: courseId } : {};
    const res = await api.get('/assignments/', { params });
    return res.data.results ? res.data.results : res.data;
  },

  getAssignmentDetail: async (id: number): Promise<Assignment> => {
    const res = await api.get(`/assignments/${id}/`);
    return res.data;
  },

  submitAssignment: async (
    assignmentId: number,
    data: { submission_text?: string; submission_url?: string; attachment_file?: File }
  ): Promise<Submission> => {
    const formData = new FormData();
    if (data.submission_text) formData.append('submission_text', data.submission_text);
    if (data.submission_url) formData.append('submission_url', data.submission_url);
    if (data.attachment_file) formData.append('attachment_file', data.attachment_file);

    const res = await api.post(`/assignments/${assignmentId}/submit/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  getSubmissions: async (params?: { assignment?: number; status?: string }): Promise<Submission[]> => {
    const res = await api.get('/assignments/submissions/', { params });
    return res.data.results ? res.data.results : res.data;
  },

  gradeSubmission: async (
    submissionId: number,
    data: { score: number; feedback: string; status?: string }
  ): Promise<Submission> => {
    const res = await api.post(`/assignments/submissions/${submissionId}/grade/`, data);
    return res.data;
  },

  createAssignment: async (data: Partial<Assignment>): Promise<Assignment> => {
    const res = await api.post('/assignments/', data);
    return res.data;
  },
};
