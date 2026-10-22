import api from './api';
import { Project } from '../types';

export const projectService = {
  getProjects: async (): Promise<Project[]> => {
    const res = await api.get('/projects/');
    return res.data.results ? res.data.results : res.data;
  },

  getMyProjects: async (): Promise<Project[]> => {
    const res = await api.get('/projects/mine/');
    return res.data;
  },

  createProject: async (data: Partial<Project>): Promise<Project> => {
    const res = await api.post('/projects/', data);
    return res.data;
  },

  updateProject: async (id: number, data: Partial<Project>): Promise<Project> => {
    const res = await api.patch(`/projects/${id}/`, data);
    return res.data;
  },

  deleteProject: async (id: number): Promise<void> => {
    await api.delete(`/projects/${id}/`);
  },
};
