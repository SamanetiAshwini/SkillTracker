import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  FileCheck2,
  Users,
  Award,
  ArrowRight,
  TrendingUp,
  Plus
} from 'lucide-react';
import { courseService } from '../services/courseService';
import { assignmentService } from '../services/assignmentService';
import { assessmentService } from '../services/assessmentService';
import { Course, Submission, Assessment } from '../types';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

export const MentorDashboard: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMentorData = async () => {
      setIsLoading(true);
      try {
        const [cData, sData, aData] = await Promise.all([
          courseService.getCourses(),
          assignmentService.getSubmissions({ status: 'PENDING' }),
          assessmentService.getAssessments(),
        ]);
        setCourses(cData);
        setSubmissions(sData);
        setAssessments(aData);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMentorData();
  }, []);

  if (isLoading) {
    return <LoadingSkeleton rows={4} />;
  }

  const pendingCount = submissions.filter((s) => s.status === 'PENDING').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#F0DFE5] p-6 lg:p-8 rounded-3xl card-shadow">
        <div className="space-y-1">
          <Badge variant="amber">Faculty Workspace</Badge>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-[#29252B] tracking-tight">
            Mentor Administration Hub
          </h1>
          <p className="text-sm text-[#77717A]">
            Manage cohort curricula, review hands-on capstones, and oversee student development
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/mentor/courses">
            <Button variant="outline" size="sm">
              <BookOpen className="w-4 h-4 mr-1.5" /> Curricula
            </Button>
          </Link>
          <Link to="/mentor/grading">
            <Button variant="primary" size="sm">
              <FileCheck2 className="w-4 h-4 mr-1.5" /> Review Submissions
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Counter */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FCE7EF] text-[#D96C94] flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#29252B]">{courses.length}</div>
            <div className="text-xs font-medium text-[#77717A]">Active Courses</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#29252B]">{pendingCount}</div>
            <div className="text-xs font-medium text-[#77717A]">Pending Reviews</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#29252B]">{assessments.length}</div>
            <div className="text-xs font-medium text-[#77717A]">Assessments Published</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#29252B]">Active</div>
            <div className="text-xs font-medium text-[#77717A]">Mentor Role Status</div>
          </div>
        </Card>
      </div>

      {/* Main Grid: Pending Submissions & Assigned Courses */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pending Submissions to Grade */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#F0DFE5] pb-3">
            <div>
              <h3 className="font-bold text-base text-[#29252B]">Submissions Pending Review</h3>
              <p className="text-xs text-[#77717A]">Student code and architecture waiting for qualitative feedback</p>
            </div>
            <Link to="/mentor/grading" className="text-xs font-semibold text-[#D96C94] hover:underline">
              View All →
            </Link>
          </div>

          {submissions.length === 0 ? (
            <p className="text-xs text-[#77717A] py-8 text-center">All assignment submissions have been graded!</p>
          ) : (
            <div className="space-y-3">
              {submissions.slice(0, 4).map((sub) => (
                <div key={sub.id} className="p-3.5 rounded-xl border border-[#F0DFE5] bg-[#FFF5F7] flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="font-bold text-xs text-[#29252B]">{sub.student.username}</span>
                    <p className="text-[11px] text-[#77717A] truncate max-w-xs">{sub.assignment_title}</p>
                    <span className="text-[10px] text-[#77717A]">
                      Submitted: {new Date(sub.submitted_at).toLocaleDateString()}
                    </span>
                  </div>
                  <Link to="/mentor/grading">
                    <Button variant="primary" size="sm">
                      Grade Solution
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Managed Courses */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#F0DFE5] pb-3">
            <div>
              <h3 className="font-bold text-base text-[#29252B]">Curricula Under Your Oversight</h3>
              <p className="text-xs text-[#77717A]">Add or edit modules, learning resources, and assignments</p>
            </div>
            <Link to="/mentor/courses" className="text-xs font-semibold text-[#D96C94] hover:underline">
              Manage →
            </Link>
          </div>

          <div className="space-y-3">
            {courses.map((c) => (
              <div key={c.id} className="p-3.5 rounded-xl border border-[#F0DFE5] bg-[#FFF5F7] flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-[#29252B]">{c.title}</h4>
                  <div className="flex items-center gap-2 pt-1">
                    <Badge variant="rose" size="sm">{c.category}</Badge>
                    <span className="text-[11px] text-[#77717A]">{c.total_topics} Topics</span>
                  </div>
                </div>
                <Link to="/mentor/courses">
                  <Button variant="outline" size="sm">
                    Edit Modules
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
