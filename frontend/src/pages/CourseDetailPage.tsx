import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { BookOpen, Clock, Users, ArrowLeft, PlayCircle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { courseService } from '../services/courseService';
import { Course } from '../types';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { ProgressBar } from '../components/ProgressBar';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

export const CourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [openModules, setOpenModules] = useState<{ [key: number]: boolean }>({ 0: true });
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      loadCourse(parseInt(id));
    }
  }, [id]);

  const loadCourse = async (courseId: number) => {
    setIsLoading(true);
    try {
      const data = await courseService.getCourseDetail(courseId);
      setCourse(data);
    } catch (err) {
      console.error('Failed to load course details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!course) return;
    setIsEnrolling(true);
    try {
      await courseService.enrollInCourse(course.id);
      await loadCourse(course.id);
      navigate(`/learn/${course.id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsEnrolling(false);
    }
  };

  const toggleModule = (index: number) => {
    setOpenModules((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  if (isLoading || !course) {
    return <LoadingSkeleton rows={4} />;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Link to="/courses" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#77717A] hover:text-[#29252B]">
        <ArrowLeft className="w-4 h-4" /> Back to Catalog
      </Link>

      {/* Main Course Hero */}
      <Card className="p-6 lg:p-8 space-y-6">
        <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap gap-2">
              <Badge variant="rose">{course.category}</Badge>
              <Badge variant="gray">{course.level}</Badge>
              {course.is_enrolled && <Badge variant="green">Enrolled</Badge>}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#29252B] tracking-tight">
              {course.title}
            </h1>

            <p className="text-sm text-[#77717A] leading-relaxed max-w-2xl">
              {course.description}
            </p>

            <div className="flex flex-wrap gap-6 text-xs text-[#77717A] pt-2">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#E98EAD]" /> {course.estimated_hours} Hours Total
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#E98EAD]" /> {course.total_topics} Curriculum Topics
              </span>
              {course.mentor && (
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#E98EAD]" /> Mentor: {course.mentor.first_name ? `${course.mentor.first_name} ${course.mentor.last_name}` : course.mentor.username}
                </span>
              )}
            </div>
          </div>

          <div className="w-full md:w-64 shrink-0 bg-[#FFF5F7] p-5 rounded-2xl border border-[#F0DFE5] space-y-4">
            {course.is_enrolled ? (
              <div className="space-y-3">
                <ProgressBar progress={course.progress_percentage || 0} showLabel size="md" />
                <Link to={`/learn/${course.id}`} className="block">
                  <Button variant="primary" size="md" className="w-full">
                    <PlayCircle className="w-4 h-4 mr-1.5" /> Continue Learning
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-xs text-[#77717A] text-center">
                  Full access to modules, quizzes, and mentor assignments
                </div>
                <Button
                  variant="primary"
                  size="md"
                  className="w-full"
                  onClick={handleEnroll}
                  isLoading={isEnrolling}
                >
                  Enroll in Course
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Syllabus / Modules Accordion */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-[#29252B]">Course Syllabus</h2>

        {course.modules && course.modules.length > 0 ? (
          <div className="space-y-3">
            {course.modules.map((mod, idx) => (
              <Card key={mod.id} className="p-0 overflow-hidden">
                <button
                  onClick={() => toggleModule(idx)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-[#FFF5F7] transition-colors"
                >
                  <div>
                    <h3 className="text-sm font-bold text-[#29252B]">{mod.title}</h3>
                    <p className="text-xs text-[#77717A] mt-0.5">{mod.description || `${mod.topics?.length || 0} topics in this section`}</p>
                  </div>
                  {openModules[idx] ? (
                    <ChevronUp className="w-4 h-4 text-[#77717A]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#77717A]" />
                  )}
                </button>

                {openModules[idx] && (
                  <div className="border-t border-[#F0DFE5] divide-y divide-[#F0DFE5] bg-[#FFF5F7]/30">
                    {mod.topics?.map((topic) => (
                      <div key={topic.id} className="p-3.5 pl-6 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <CheckCircle2
                            className={`w-4 h-4 ${
                              topic.student_progress?.status === 'COMPLETED'
                                ? 'text-emerald-500'
                                : 'text-[#F0DFE5]'
                            }`}
                          />
                          <span className="font-medium text-[#29252B]">{topic.title}</span>
                          <span className="text-[10px] text-[#77717A] bg-white px-2 py-0.5 rounded-full border border-[#F0DFE5]">
                            {topic.content_type}
                          </span>
                        </div>
                        <span className="text-[#77717A]">{topic.duration_minutes} min</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#77717A]">No modules published yet for this course.</p>
        )}
      </div>
    </div>
  );
};
