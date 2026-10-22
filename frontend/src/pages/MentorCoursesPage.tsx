import React, { useEffect, useState } from 'react';
import { BookOpen, Plus, Layers, FileText, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { courseService } from '../services/courseService';
import { Course, Module, Topic } from '../types';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

export const MentorCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCourseId, setExpandedCourseId] = useState<number | null>(null);
  const [courseDetail, setCourseDetail] = useState<Course | null>(null);

  // New Course Modal State
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    category: 'Backend Engineering',
    level: 'BEGINNER' as Course['level'],
    estimated_hours: 20,
    thumbnail_url: '',
  });

  // New Module Modal State
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [targetCourseId, setTargetCourseId] = useState<number | null>(null);
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleDesc, setModuleDesc] = useState('');

  // New Topic Modal State
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [targetModuleId, setTargetModuleId] = useState<number | null>(null);
  const [topicForm, setTopicForm] = useState({
    title: '',
    content_type: 'ARTICLE',
    content: '',
    duration_minutes: 20,
    resource_url: '',
  });

  const loadCourses = async () => {
    setIsLoading(true);
    try {
      const data = await courseService.getCourses();
      setCourses(data);
      if (data.length > 0 && !expandedCourseId) {
        expandCourse(data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const expandCourse = async (courseId: number) => {
    setExpandedCourseId(courseId);
    try {
      const detail = await courseService.getCourseDetail(courseId);
      setCourseDetail(detail);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.title) return;
    try {
      await courseService.createCourse(courseForm);
      setIsCourseModalOpen(false);
      setCourseForm({
        title: '',
        description: '',
        category: 'Backend Engineering',
        level: 'BEGINNER',
        estimated_hours: 20,
        thumbnail_url: '',
      });
      await loadCourses();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCourseId || !moduleTitle) return;
    try {
      await courseService.createModule({
        course: targetCourseId,
        title: moduleTitle,
        description: moduleDesc,
      });
      setIsModuleModalOpen(false);
      setModuleTitle('');
      setModuleDesc('');
      await expandCourse(targetCourseId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetModuleId || !topicForm.title) return;
    try {
      await courseService.createTopic({
        module: targetModuleId,
        ...topicForm,
      });
      setIsTopicModalOpen(false);
      setTopicForm({
        title: '',
        content_type: 'ARTICLE',
        content: '',
        duration_minutes: 20,
        resource_url: '',
      });
      if (expandedCourseId) {
        await expandCourse(expandedCourseId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#29252B] tracking-tight">Course Content Studio</h1>
          <p className="text-sm text-[#77717A]">
            Create and structure modules, interactive topics, and learning materials
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => setIsCourseModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" /> Create Course
        </Button>
      </div>

      {isLoading ? (
        <LoadingSkeleton rows={4} />
      ) : (
        <div className="grid lg:grid-cols-3 gap-6 items-start">
          {/* Courses list column */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#77717A] uppercase tracking-wider">Your Courses</h3>
            {courses.map((c) => {
              const isSelected = expandedCourseId === c.id;
              return (
                <Card
                  key={c.id}
                  onClick={() => expandCourse(c.id)}
                  hoverable
                  className={`p-4 transition-all ${
                    isSelected ? 'border-[#E98EAD] bg-[#FFF5F7]' : 'bg-white'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Badge variant="rose" size="sm">{c.category}</Badge>
                      <Badge variant="gray" size="sm">{c.level}</Badge>
                    </div>
                    <h4 className="font-bold text-sm text-[#29252B]">{c.title}</h4>
                    <p className="text-xs text-[#77717A]">{c.total_topics} Topics</p>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Course Details & Modules / Topics Studio */}
          <div className="lg:col-span-2 space-y-4">
            {courseDetail ? (
              <Card className="space-y-6">
                <div className="flex items-center justify-between border-b border-[#F0DFE5] pb-4">
                  <div>
                    <span className="text-xs font-bold text-[#D96C94] uppercase tracking-wider">
                      {courseDetail.category} • {courseDetail.level}
                    </span>
                    <h2 className="text-xl font-bold text-[#29252B]">{courseDetail.title}</h2>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setTargetCourseId(courseDetail.id);
                      setIsModuleModalOpen(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-1.5" /> Add Module
                  </Button>
                </div>

                {/* Modules & Topics Hierarchy */}
                <div className="space-y-4">
                  {courseDetail.modules && courseDetail.modules.length > 0 ? (
                    courseDetail.modules.map((mod) => (
                      <div key={mod.id} className="p-4 rounded-2xl border border-[#F0DFE5] bg-[#FFF5F7]/50 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[11px] font-bold text-[#77717A] uppercase">
                              Module {mod.order}
                            </span>
                            <h4 className="font-bold text-sm text-[#29252B]">{mod.title}</h4>
                          </div>

                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setTargetModuleId(mod.id);
                              setIsTopicModalOpen(true);
                            }}
                          >
                            <Plus className="w-3.5 h-3.5 mr-1" /> Add Topic
                          </Button>
                        </div>

                        {/* Topics List */}
                        <div className="space-y-2 pt-1 pl-2 border-l-2 border-[#F0DFE5]">
                          {mod.topics && mod.topics.length > 0 ? (
                            mod.topics.map((top) => (
                              <div
                                key={top.id}
                                className="p-3 bg-white rounded-xl border border-[#F0DFE5] flex items-center justify-between text-xs"
                              >
                                <div>
                                  <span className="font-semibold text-[#29252B]">{top.title}</span>
                                  <div className="flex items-center gap-2 pt-0.5 text-[#77717A] text-[10px]">
                                    <span className="capitalize">{top.content_type.toLowerCase()}</span>
                                    <span>•</span>
                                    <span>{top.duration_minutes} mins</span>
                                  </div>
                                </div>
                                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                                </span>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-[#77717A] py-1">No topics yet in this module.</p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-xs text-[#77717A]">No modules yet. Click 'Add Module' to start drafting curriculum.</p>
                    </div>
                  )}
                </div>
              </Card>
            ) : (
              <Card className="text-center py-12">
                <BookOpen className="w-10 h-10 text-[#E98EAD] mx-auto opacity-60 mb-2" />
                <p className="text-xs text-[#77717A]">Select a course to inspect and edit curriculum.</p>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* New Course Modal */}
      <Modal isOpen={isCourseModalOpen} onClose={() => setIsCourseModalOpen(false)} title="Create New Course">
        <form onSubmit={handleCreateCourse} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#29252B] mb-1">Course Title *</label>
            <input
              type="text"
              required
              value={courseForm.title}
              onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
              placeholder="e.g. Distributed System Design with Python"
              className="w-full px-3 py-2 text-sm bg-white border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#29252B] mb-1">Description *</label>
            <textarea
              rows={3}
              required
              value={courseForm.description}
              onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
              placeholder="Detailed syllabus overview and learning outcomes..."
              className="w-full px-3 py-2 text-sm bg-white border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#29252B] mb-1">Category</label>
              <input
                type="text"
                value={courseForm.category}
                onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#29252B] mb-1">Difficulty Level</label>
              <select
                value={courseForm.level}
                onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value as any })}
                className="w-full px-3 py-2 text-sm bg-white border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#29252B] mb-1">Estimated Hours</label>
              <input
                type="number"
                value={courseForm.estimated_hours}
                onChange={(e) => setCourseForm({ ...courseForm, estimated_hours: parseInt(e.target.value) || 20 })}
                className="w-full px-3 py-2 text-sm bg-white border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#29252B] mb-1">Thumbnail URL</label>
              <input
                type="url"
                value={courseForm.thumbnail_url}
                onChange={(e) => setCourseForm({ ...courseForm, thumbnail_url: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 text-sm bg-white border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#F0DFE5]">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsCourseModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Publish Course
            </Button>
          </div>
        </form>
      </Modal>

      {/* New Module Modal */}
      <Modal isOpen={isModuleModalOpen} onClose={() => setIsModuleModalOpen(false)} title="Add Course Module">
        <form onSubmit={handleCreateModule} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#29252B] mb-1">Module Title *</label>
            <input
              type="text"
              required
              value={moduleTitle}
              onChange={(e) => setModuleTitle(e.target.value)}
              placeholder="e.g. Module 3: Microservice Communication Patterns"
              className="w-full px-3 py-2 text-sm bg-white border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#29252B] mb-1">Module Description</label>
            <textarea
              rows={2}
              value={moduleDesc}
              onChange={(e) => setModuleDesc(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#F0DFE5]">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsModuleModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Module
            </Button>
          </div>
        </form>
      </Modal>

      {/* New Topic Modal */}
      <Modal isOpen={isTopicModalOpen} onClose={() => setIsTopicModalOpen(false)} title="Add Module Topic">
        <form onSubmit={handleCreateTopic} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#29252B] mb-1">Topic Title *</label>
            <input
              type="text"
              required
              value={topicForm.title}
              onChange={(e) => setTopicForm({ ...topicForm, title: e.target.value })}
              placeholder="e.g. gRPC vs REST API Performance"
              className="w-full px-3 py-2 text-sm bg-white border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#29252B] mb-1">Content Type</label>
              <select
                value={topicForm.content_type}
                onChange={(e) => setTopicForm({ ...topicForm, content_type: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
              >
                <option value="ARTICLE">Article / Notes</option>
                <option value="VIDEO">Video Lesson</option>
                <option value="EXERCISE">Hands-on Exercise</option>
                <option value="RESOURCE">Reference Resource</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#29252B] mb-1">Duration (Minutes)</label>
              <input
                type="number"
                value={topicForm.duration_minutes}
                onChange={(e) => setTopicForm({ ...topicForm, duration_minutes: parseInt(e.target.value) || 20 })}
                className="w-full px-3 py-2 text-sm bg-white border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#29252B] mb-1">Learning Content & Notes *</label>
            <textarea
              rows={4}
              required
              value={topicForm.content}
              onChange={(e) => setTopicForm({ ...topicForm, content: e.target.value })}
              placeholder="Provide in-depth conceptual breakdown, code examples, or exercise prompts..."
              className="w-full px-3 py-2 text-sm bg-white border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#29252B] mb-1">External Resource URL</label>
            <input
              type="url"
              value={topicForm.resource_url}
              onChange={(e) => setTopicForm({ ...topicForm, resource_url: e.target.value })}
              placeholder="https://docs.djangoproject.com/..."
              className="w-full px-3 py-2 text-sm bg-white border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#F0DFE5]">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsTopicModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Topic
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
