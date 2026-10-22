import React, { useEffect, useState } from 'react';
import { Briefcase, Plus, ExternalLink, Trash2, Edit2, Clock, CheckCircle2 } from 'lucide-react';
import { careerService } from '../services/careerService';
import { JobApplication } from '../types';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

export const JobTrackerPage: React.FC = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<JobApplication | null>(null);

  const [formData, setFormData] = useState({
    company: '',
    job_title: '',
    application_date: new Date().toISOString().split('T')[0],
    status: 'APPLIED' as JobApplication['status'],
    job_url: '',
    salary_range: '',
    notes: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const loadApplications = async () => {
    setIsLoading(true);
    try {
      const data = await careerService.getJobApplications();
      setApplications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const openCreateModal = () => {
    setEditingApp(null);
    setFormData({
      company: '',
      job_title: '',
      application_date: new Date().toISOString().split('T')[0],
      status: 'APPLIED',
      job_url: '',
      salary_range: '',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (app: JobApplication) => {
    setEditingApp(app);
    setFormData({
      company: app.company,
      job_title: app.job_title,
      application_date: app.application_date,
      status: app.status,
      job_url: app.job_url || '',
      salary_range: app.salary_range || '',
      notes: app.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company || !formData.job_title) return;

    setIsSaving(true);
    try {
      if (editingApp) {
        await careerService.updateJobApplication(editingApp.id, formData);
      } else {
        await careerService.createJobApplication(formData);
      }
      setIsModalOpen(false);
      await loadApplications();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this application entry?')) return;
    try {
      await careerService.deleteJobApplication(id);
      await loadApplications();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status: JobApplication['status']) => {
    switch (status) {
      case 'OFFER':
        return <Badge variant="green" size="sm">Offer Received</Badge>;
      case 'INTERVIEWING':
        return <Badge variant="rose" size="sm">Interviewing</Badge>;
      case 'SCREENING':
        return <Badge variant="amber" size="sm">Screening</Badge>;
      case 'REJECTED':
        return <Badge variant="gray" size="sm">Archived</Badge>;
      default:
        return <Badge variant="gray" size="sm">Applied</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#29252B] tracking-tight">Job Application Pipeline</h1>
          <p className="text-sm text-[#77717A]">
            Monitor your career search funnel from resume drop to final offer
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-1.5" /> Log Application
        </Button>
      </div>

      {/* Funnel Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {(['APPLIED', 'SCREENING', 'INTERVIEWING', 'OFFER', 'REJECTED'] as const).map((st) => {
          const count = applications.filter((a) => a.status === st).length;
          return (
            <Card key={st} className="p-4 text-center space-y-1">
              <div className="text-xl font-bold text-[#29252B]">{count}</div>
              <div className="text-[11px] font-semibold text-[#77717A] uppercase tracking-wider">
                {st}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Applications Table / Cards */}
      {isLoading ? (
        <LoadingSkeleton rows={4} />
      ) : applications.length === 0 ? (
        <Card className="text-center py-16">
          <Briefcase className="w-12 h-12 text-[#E98EAD] mx-auto opacity-60 mb-2" />
          <h3 className="text-base font-semibold text-[#29252B]">No applications tracked yet</h3>
          <p className="text-xs text-[#77717A] mt-1">
            Log your first submission to track interview dates and notes.
          </p>
          <Button variant="primary" size="sm" className="mt-4" onClick={openCreateModal}>
            Log Application
          </Button>
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFF5F7] border-b border-[#F0DFE5] text-[#77717A] uppercase font-semibold text-[11px]">
                <tr>
                  <th className="p-4">Company</th>
                  <th className="p-4">Role Title</th>
                  <th className="p-4">Date Applied</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Target Compensation</th>
                  <th className="p-4">Notes</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0DFE5]">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-[#FFF5F7]/40 transition-colors">
                    <td className="p-4 font-bold text-[#29252B] flex items-center gap-2">
                      {app.company}
                      {app.job_url && (
                        <a
                          href={app.job_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#D96C94] hover:underline"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </td>
                    <td className="p-4 font-semibold text-[#29252B]">{app.job_title}</td>
                    <td className="p-4 text-[#77717A]">{app.application_date}</td>
                    <td className="p-4">{getStatusBadge(app.status)}</td>
                    <td className="p-4 text-[#77717A]">{app.salary_range || '—'}</td>
                    <td className="p-4 text-[#77717A] max-w-xs truncate">{app.notes || '—'}</td>
                    <td className="p-4 text-right space-x-1">
                      <button
                        onClick={() => openEditModal(app)}
                        className="p-1.5 rounded-lg text-[#77717A] hover:text-[#29252B] hover:bg-[#FCE7EF]"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(app.id)}
                        className="p-1.5 rounded-lg text-[#77717A] hover:text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingApp ? 'Update Job Application' : 'Log New Application'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#29252B] mb-1">Company *</label>
              <input
                type="text"
                required
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="e.g. Stripe"
                className="w-full px-3 py-2 text-sm bg-white border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#29252B] mb-1">Job Title *</label>
              <input
                type="text"
                required
                value={formData.job_title}
                onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                placeholder="Software Engineer"
                className="w-full px-3 py-2 text-sm bg-white border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#29252B] mb-1">Application Date</label>
              <input
                type="date"
                value={formData.application_date}
                onChange={(e) => setFormData({ ...formData, application_date: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#29252B] mb-1">Pipeline Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 text-sm bg-white border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
              >
                <option value="APPLIED">Applied</option>
                <option value="SCREENING">Screening</option>
                <option value="INTERVIEWING">Interviewing</option>
                <option value="OFFER">Offer</option>
                <option value="REJECTED">Archived</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#29252B] mb-1">Job Post URL</label>
              <input
                type="url"
                value={formData.job_url}
                onChange={(e) => setFormData({ ...formData, job_url: e.target.value })}
                placeholder="https://company.com/jobs/..."
                className="w-full px-3 py-2 text-sm bg-white border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#29252B] mb-1">Salary Range</label>
              <input
                type="text"
                value={formData.salary_range}
                onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
                placeholder="$120k - $140k"
                className="w-full px-3 py-2 text-sm bg-white border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#29252B] mb-1">Notes & Next Steps</label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="System design round on Thursday; prepare caching topics..."
              className="w-full px-3 py-2 text-sm bg-white border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
            />
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
              Save Application
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
