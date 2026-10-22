import React, { useEffect, useState } from 'react';
import { FolderGit2, Plus, Code2, ExternalLink, Trash2, Edit2, Star } from 'lucide-react';
import { projectService } from '../services/projectService';
import { Project } from '../types';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

export const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    github_url: '',
    live_demo_url: '',
    image_url: '',
    is_featured: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const data = await projectService.getMyProjects();
      setProjects(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const openCreateModal = () => {
    setEditingProject(null);
    setFormData({
      title: '',
      description: '',
      tags: '',
      github_url: '',
      live_demo_url: '',
      image_url: '',
      is_featured: false,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (proj: Project) => {
    setEditingProject(proj);
    setFormData({
      title: proj.title,
      description: proj.description,
      tags: proj.tags || '',
      github_url: proj.github_url || '',
      live_demo_url: proj.live_demo_url || '',
      image_url: proj.image_url || '',
      is_featured: proj.is_featured,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;

    setIsSaving(true);
    try {
      if (editingProject) {
        await projectService.updateProject(editingProject.id, formData);
      } else {
        await projectService.createProject(formData);
      }
      setIsModalOpen(false);
      await loadProjects();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await projectService.deleteProject(id);
      await loadProjects();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#29252B] tracking-tight">Portfolio Projects</h1>
          <p className="text-sm text-[#77717A]">
            Demonstrate production software capability with live demos and repository links
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-1.5" /> Add Project
        </Button>
      </div>

      {isLoading ? (
        <LoadingSkeleton rows={4} />
      ) : projects.length === 0 ? (
        <Card className="text-center py-16">
          <FolderGit2 className="w-12 h-12 text-[#E98EAD] mx-auto opacity-60 mb-2" />
          <h3 className="text-base font-semibold text-[#29252B]">No portfolio projects yet</h3>
          <p className="text-xs text-[#77717A] mt-1">
            Add capstones, microservices, or full-stack apps to impress recruiters.
          </p>
          <Button variant="primary" size="sm" className="mt-4" onClick={openCreateModal}>
            Create First Project
          </Button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {projects.map((proj) => (
            <Card key={proj.id} className="flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  {proj.is_featured ? (
                    <Badge variant="rose" size="sm">
                      <Star className="w-3 h-3 fill-[#E98EAD]" /> Featured Capstone
                    </Badge>
                  ) : (
                    <span />
                  )}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(proj)}
                      className="p-1.5 rounded-lg text-[#77717A] hover:text-[#29252B] hover:bg-[#FCE7EF]"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(proj.id)}
                      className="p-1.5 rounded-lg text-[#77717A] hover:text-rose-600 hover:bg-rose-50"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-[#29252B]">{proj.title}</h3>
                <p className="text-xs text-[#77717A] leading-relaxed line-clamp-3">
                  {proj.description}
                </p>

                {proj.tags && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {proj.tags.split(',').map((tag, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-[#FFF5F7] border border-[#F0DFE5] text-[#77717A] px-2 py-0.5 rounded-md"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Links */}
              <div className="flex items-center gap-3 pt-3 border-t border-[#F0DFE5]">
                {proj.github_url && (
                  <a
                    href={proj.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#29252B] hover:text-[#D96C94]"
                  >
                    <Code2 className="w-4 h-4" /> Code Repo
                  </a>
                )}
                {proj.live_demo_url && (
                  <a
                    href={proj.live_demo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D96C94] hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" /> Live Demo
                  </a>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Project Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? 'Edit Project' : 'New Portfolio Project'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#29252B] mb-1">Project Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Distributed Telemetry Pipeline"
              className="w-full px-3 py-2 text-sm bg-white border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#29252B] mb-1">Description *</label>
            <textarea
              rows={3}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Highlight technical challenges solved, architecture design, and database optimizations..."
              className="w-full px-3 py-2 text-sm bg-white border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#29252B] mb-1">Tech Stack Tags</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="Django, React, PostgreSQL, Redis, Docker"
              className="w-full px-3 py-2 text-sm bg-white border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#29252B] mb-1">GitHub Repo URL</label>
              <input
                type="url"
                value={formData.github_url}
                onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                placeholder="https://github.com/..."
                className="w-full px-3 py-2 text-sm bg-white border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#29252B] mb-1">Live Demo URL</label>
              <input
                type="url"
                value={formData.live_demo_url}
                onChange={(e) => setFormData({ ...formData, live_demo_url: e.target.value })}
                placeholder="https://demo.app.com"
                className="w-full px-3 py-2 text-sm bg-white border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="is_featured"
              checked={formData.is_featured}
              onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
              className="rounded-md text-[#E98EAD] focus:ring-[#E98EAD]"
            />
            <label htmlFor="is_featured" className="text-xs text-[#29252B]">
              Pin as Featured Capstone Project
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#F0DFE5]">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSaving}
            >
              Save Project
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
