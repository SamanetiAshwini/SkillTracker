import api from './api';
import {
  Skill,
  StudentSkill,
  TargetRole,
  SkillGapAnalysisResponse,
  JobApplication,
} from '../types';

export const careerService = {
  getSkills: async (): Promise<Skill[]> => {
    const res = await api.get('/careers/skills/');
    return res.data.results ? res.data.results : res.data;
  },

  getMySkills: async (): Promise<StudentSkill[]> => {
    const res = await api.get('/careers/my-skills/');
    return res.data.results ? res.data.results : res.data;
  },

  addOrUpdateSkill: async (data: {
    skill: number;
    proficiency_level: string;
    years_of_experience?: number;
  }): Promise<StudentSkill> => {
    const res = await api.post('/careers/my-skills/', data);
    return res.data;
  },

  deleteStudentSkill: async (id: number): Promise<void> => {
    await api.delete(`/careers/my-skills/${id}/`);
  },

  getTargetRoles: async (): Promise<TargetRole[]> => {
    const res = await api.get('/careers/target-roles/');
    return res.data.results ? res.data.results : res.data;
  },

  getSkillGapAnalysis: async (roleId?: number): Promise<SkillGapAnalysisResponse> => {
    const endpoint = roleId ? `/careers/gap-analysis/${roleId}/` : '/careers/gap-analysis/';
    const res = await api.get(endpoint);
    return res.data;
  },

  getJobApplications: async (): Promise<JobApplication[]> => {
    const res = await api.get('/careers/job-applications/');
    return res.data.results ? res.data.results : res.data;
  },

  createJobApplication: async (data: Partial<JobApplication>): Promise<JobApplication> => {
    const res = await api.post('/careers/job-applications/', data);
    return res.data;
  },

  updateJobApplication: async (id: number, data: Partial<JobApplication>): Promise<JobApplication> => {
    const res = await api.patch(`/careers/job-applications/${id}/`, data);
    return res.data;
  },

  deleteJobApplication: async (id: number): Promise<void> => {
    await api.delete(`/careers/job-applications/${id}/`);
  },
};
