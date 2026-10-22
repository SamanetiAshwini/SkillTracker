import api from './api';
import { Course, Enrollment, Module, Topic, TopicProgress } from '../types';

export const courseService = {
  getCourses: async (params?: { category?: string; level?: string; search?: string }): Promise<Course[]> => {
    const res = await api.get('/courses/', { params });
    return res.data.results ? res.data.results : res.data;
  },

  getCourseDetail: async (id: number): Promise<Course> => {
    const res = await api.get(`/courses/${id}/`);
    return res.data;
  },

  enrollInCourse: async (courseId: number): Promise<Enrollment> => {
    const res = await api.post(`/courses/${courseId}/enroll/`);
    return res.data;
  },

  getMyEnrollments: async (): Promise<Enrollment[]> => {
    const res = await api.get('/courses/my-enrollments/');
    return res.data.results ? res.data.results : res.data;
  },

  updateTopicProgress: async (
    topicId: number,
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
  ): Promise<{ message: string; progress: TopicProgress; course_progress_percentage: number }> => {
    const res = await api.post(`/courses/topics/${topicId}/progress/`, { status });
    return res.data;
  },

  // Mentor / Admin course creation and content management
  createCourse: async (data: Partial<Course>): Promise<Course> => {
    const res = await api.post('/courses/', data);
    return res.data;
  },

  updateCourse: async (id: number, data: Partial<Course>): Promise<Course> => {
    const res = await api.patch(`/courses/${id}/`, data);
    return res.data;
  },

  createModule: async (data: { course: number; title: string; description?: string; order?: number }): Promise<Module> => {
    const res = await api.post('/courses/modules/', data);
    return res.data;
  },

  createTopic: async (data: {
    module: number;
    title: string;
    content_type: string;
    content: string;
    duration_minutes: number;
    resource_url?: string;
    order?: number;
  }): Promise<Topic> => {
    const res = await api.post('/courses/topics/', data);
    return res.data;
  },

  getEnrolledStudents: async (courseId: number): Promise<Enrollment[]> => {
    const res = await api.get(`/courses/${courseId}/students/`);
    return res.data;
  },
};
