import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  BookOpen,
  Play,
  FileCode,
  Sparkles
} from 'lucide-react';
import { courseService } from '../services/courseService';
import { Course, Topic } from '../types';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { ProgressBar } from '../components/ProgressBar';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

export const LearningViewPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [activeTopic, setActiveTopic] = useState<Topic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const loadCourse = async (id: number) => {
    try {
      const data = await courseService.getCourseDetail(id);
      setCourse(data);

      // Default active topic to first topic or in-progress topic
      if (!activeTopic && data.modules && data.modules.length > 0) {
        const allTopics = data.modules.flatMap((m) => m.topics);
        const inProgress = allTopics.find((t) => t.student_progress?.status === 'IN_PROGRESS');
        setActiveTopic(inProgress || allTopics[0] || null);
      } else if (activeTopic) {
        // Refresh active topic data
        const allTopics = data.modules?.flatMap((m) => m.topics) || [];
        const refreshed = allTopics.find((t) => t.id === activeTopic.id);
        if (refreshed) setActiveTopic(refreshed);
      }
    } catch (err) {
      console.error('Failed to load course for learning:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      loadCourse(parseInt(courseId));
    }
  }, [courseId]);

  const handleUpdateStatus = async (status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED') => {
    if (!activeTopic || !course) return;
    setIsUpdating(true);
    try {
      const res = await courseService.updateTopicProgress(activeTopic.id, status);
      // Update local state smoothly
      setActiveTopic({
        ...activeTopic,
        student_progress: res.progress,
      });
      // Refresh full course for progress percentage calculation
      await loadCourse(course.id);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading || !course) {
    return <LoadingSkeleton rows={5} />;
  }

  const allTopics = course.modules?.flatMap((m) => m.topics) || [];
  const currentIdx = allTopics.findIndex((t) => t.id === activeTopic?.id);
  const prevTopic = currentIdx > 0 ? allTopics[currentIdx - 1] : null;
  const nextTopic = currentIdx >= 0 && currentIdx < allTopics.length - 1 ? allTopics[currentIdx + 1] : null;

  const currentStatus = activeTopic?.student_progress?.status || 'NOT_STARTED';

  return (
    <div className="space-y-6">
      {/* Top Banner Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#F0DFE5] p-4 lg:p-6 rounded-2xl card-shadow">
        <div className="flex items-center gap-3">
          <Link
            to="/courses"
            className="p-2 rounded-xl text-[#77717A] hover:bg-[#FCE7EF] hover:text-[#29252B] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="text-xs font-semibold text-[#D96C94] uppercase tracking-wider">
              {course.category}
            </span>
            <h1 className="text-lg font-bold text-[#29252B]">{course.title}</h1>
          </div>
        </div>

        <div className="w-full sm:w-64 space-y-1">
          <ProgressBar progress={course.progress_percentage || 0} showLabel size="sm" />
        </div>
      </div>

      {/* Main 2-Column Learning Workspace */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left Topic Syllabus Drawer: 4 cols */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
            <h3 className="text-sm font-bold text-[#29252B] border-b border-[#F0DFE5] pb-2">
              Course Syllabus
            </h3>

            {course.modules?.map((mod, modIdx) => (
              <div key={mod.id} className="space-y-2">
                <div className="text-xs font-bold text-[#77717A] tracking-wider uppercase pt-1">
                  Module {mod.order}: {mod.title}
                </div>
                <div className="space-y-1">
                  {mod.topics?.map((topic) => {
                    const isSelected = activeTopic?.id === topic.id;
                    const status = topic.student_progress?.status || 'NOT_STARTED';
                    return (
                      <button
                        key={topic.id}
                        onClick={() => setActiveTopic(topic)}
                        className={`w-full p-2.5 rounded-xl text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-[#FCE7EF] text-[#D96C94] font-semibold shadow-xs'
                            : 'hover:bg-[#FFF5F7] text-[#29252B]'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          <CheckCircle2
                            className={`w-4 h-4 shrink-0 ${
                              status === 'COMPLETED'
                                ? 'text-emerald-500'
                                : status === 'IN_PROGRESS'
                                ? 'text-[#E98EAD]'
                                : 'text-[#F0DFE5]'
                            }`}
                          />
                          <span className="truncate">{topic.title}</span>
                        </div>
                        <span className="text-[10px] text-[#77717A] shrink-0">
                          {topic.duration_minutes}m
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </Card>
        </div>

        {/* Right Topic Content Reader: 8 cols */}
        <div className="lg:col-span-8 space-y-6">
          {activeTopic ? (
            <Card className="p-6 lg:p-8 space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F0DFE5] pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="rose" size="sm">{activeTopic.content_type}</Badge>
                    <span className="text-xs text-[#77717A] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#E98EAD]" /> {activeTopic.duration_minutes} minutes
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#29252B]">
                    {activeTopic.title}
                  </h2>
                </div>

                {/* Status Toggle Buttons */}
                <div className="flex items-center gap-2">
                  {currentStatus !== 'COMPLETED' ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleUpdateStatus('COMPLETED')}
                      isLoading={isUpdating}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1.5" /> Mark as Completed
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Badge variant="green" size="md">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Completed
                      </Badge>
                      <button
                        onClick={() => handleUpdateStatus('IN_PROGRESS')}
                        className="text-xs text-[#77717A] hover:text-[#D96C94] underline cursor-pointer"
                      >
                        Reset Status
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Learning Content */}
              <div className="prose max-w-none text-sm text-[#29252B] leading-relaxed whitespace-pre-line space-y-4">
                {activeTopic.content}
              </div>

              {/* Reference Link if available */}
              {activeTopic.resource_url && (
                <div className="p-4 bg-[#FFF5F7] border border-[#F0DFE5] rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-[#29252B]">Supplemental Reference Link</h4>
                    <p className="text-[11px] text-[#77717A]">{activeTopic.resource_url}</p>
                  </div>
                  <a
                    href={activeTopic.resource_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#D96C94] hover:underline"
                  >
                    Open Resource <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* Prev / Next Navigation Footer */}
              <div className="flex items-center justify-between pt-6 border-t border-[#F0DFE5]">
                {prevTopic ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTopic(prevTopic)}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Previous Topic
                  </Button>
                ) : (
                  <div />
                )}

                {nextTopic ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      if (currentStatus !== 'COMPLETED') {
                        handleUpdateStatus('COMPLETED');
                      }
                      setActiveTopic(nextTopic);
                    }}
                  >
                    Next Topic <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                ) : (
                  <Link to="/courses">
                    <Button variant="secondary" size="sm">
                      Finish Course <Sparkles className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          ) : (
            <Card className="text-center py-12">
              <BookOpen className="w-10 h-10 text-[#E98EAD] mx-auto opacity-60 mb-2" />
              <p className="text-sm text-[#77717A]">Select a topic from the syllabus to start learning.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
