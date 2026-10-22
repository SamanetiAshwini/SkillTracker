import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, BookOpen, Clock, Users, PlayCircle, CheckCircle2 } from 'lucide-react';
import { courseService } from '../services/courseService';
import { Course } from '../types';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { ProgressBar } from '../components/ProgressBar';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

export const CourseCatalogPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [level, setLevel] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState<number | null>(null);
  const navigate = useNavigate();

  const loadCourses = async () => {
    setIsLoading(true);
    try {
      const data = await courseService.getCourses();
      setCourses(data);
    } catch (err) {
      console.error('Failed to load courses:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleEnroll = async (courseId: number) => {
    setEnrollingId(courseId);
    try {
      await courseService.enrollInCourse(courseId);
      // Reload courses to update enrollment status
      await loadCourses();
      navigate(`/learn/${courseId}`);
    } catch (err) {
      console.error('Enrollment error:', err);
    } finally {
      setEnrollingId(null);
    }
  };

  const categories = ['ALL', 'Backend Engineering', 'Frontend Engineering', 'Software Development'];
  const levels = ['ALL', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = category === 'ALL' || c.category === category;
    const matchesLevel = level === 'ALL' || c.level === level;
    return matchesSearch && matchesCat && matchesLevel;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#29252B] tracking-tight">Course Catalog</h1>
        <p className="text-sm text-[#77717A]">
          Explore industry-aligned curriculum crafted by senior engineering mentors
        </p>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#77717A] absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses by keyword, topic, or tech stack..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-[#FFF5F7] border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2 text-xs font-medium bg-[#FFF5F7] border border-[#F0DFE5] rounded-xl text-[#29252B] focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'ALL' ? 'All Categories' : cat}
                </option>
              ))}
            </select>

            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="px-3 py-2 text-xs font-medium bg-[#FFF5F7] border border-[#F0DFE5] rounded-xl text-[#29252B] focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
            >
              {levels.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl === 'ALL' ? 'All Levels' : lvl}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Courses Grid */}
      {isLoading ? (
        <LoadingSkeleton rows={4} />
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#F0DFE5]">
          <BookOpen className="w-12 h-12 text-[#E98EAD] mx-auto opacity-50 mb-3" />
          <h3 className="text-base font-semibold text-[#29252B]">No courses found</h3>
          <p className="text-xs text-[#77717A] mt-1">Try resetting your search query or filters.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} hoverable className="p-0 overflow-hidden flex flex-col justify-between">
              {/* Thumbnail */}
              <div className="h-44 relative overflow-hidden bg-[#FCE7EF]">
                {course.thumbnail_url ? (
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#D96C94]">
                    <BookOpen className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge variant="rose" size="sm">{course.category}</Badge>
                  <Badge variant="gray" size="sm">{course.level}</Badge>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <Link to={`/courses/${course.id}`}>
                    <h3 className="font-bold text-base text-[#29252B] hover:text-[#D96C94] transition-colors leading-snug">
                      {course.title}
                    </h3>
                  </Link>
                  <p className="text-xs text-[#77717A] line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-[#F0DFE5]">
                  <div className="flex items-center justify-between text-xs text-[#77717A]">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#E98EAD]" /> {course.estimated_hours} Hours
                    </span>
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-[#E98EAD]" /> {course.total_topics} Topics
                    </span>
                  </div>

                  {course.mentor && (
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-6 h-6 rounded-full bg-[#FCE7EF] text-[#D96C94] flex items-center justify-center font-bold text-[10px]">
                        {course.mentor.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-[#77717A] font-medium truncate">
                        Mentor: {course.mentor.first_name ? `${course.mentor.first_name} ${course.mentor.last_name}` : course.mentor.username}
                      </span>
                    </div>
                  )}

                  {course.is_enrolled && (
                    <div className="pt-1">
                      <ProgressBar progress={course.progress_percentage || 0} showLabel size="sm" />
                    </div>
                  )}

                  <div className="pt-2">
                    {course.is_enrolled ? (
                      <Link to={`/learn/${course.id}`} className="block">
                        <Button variant="secondary" size="sm" className="w-full">
                          <PlayCircle className="w-4 h-4 mr-1.5" /> Continue Learning
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full"
                        onClick={() => handleEnroll(course.id)}
                        isLoading={enrollingId === course.id}
                      >
                        Enroll Now
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
