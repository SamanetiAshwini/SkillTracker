import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  BookOpen,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  FileCheck2,
  Award
} from 'lucide-react';
import { authService } from '../services/authService';
import { courseService } from '../services/courseService';
import { assignmentService } from '../services/assignmentService';
import { assessmentService } from '../services/assessmentService';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

export const AdminDashboard: React.FC = () => {
  const [userStats, setUserStats] = useState<{ total: number; students: number; mentors: number; admins: number }>({
    total: 0,
    students: 0,
    mentors: 0,
    admins: 0,
  });
  const [coursesCount, setCoursesCount] = useState(0);
  const [submissionsCount, setSubmissionsCount] = useState(0);
  const [assessmentsCount, setAssessmentsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      setIsLoading(true);
      try {
        const [usersData, coursesData, submissionsData, assessmentsData] = await Promise.all([
          authService.getUsers(),
          courseService.getCourses(),
          assignmentService.getSubmissions(),
          assessmentService.getAssessments(),
        ]);

        const allUsers = usersData.results || usersData || [];
        const students = allUsers.filter((u: any) => u.role === 'STUDENT').length;
        const mentors = allUsers.filter((u: any) => u.role === 'MENTOR').length;
        const admins = allUsers.filter((u: any) => u.role === 'ADMIN').length;

        setUserStats({
          total: allUsers.length,
          students,
          mentors,
          admins,
        });

        setCoursesCount(coursesData.length || 0);
        setSubmissionsCount(submissionsData.length || 0);
        setAssessmentsCount(assessmentsData.length || 0);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (isLoading) {
    return <LoadingSkeleton rows={4} />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#F0DFE5] p-6 lg:p-8 rounded-3xl card-shadow">
        <div className="space-y-1">
          <Badge variant="purple">Platform Administration</Badge>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-[#29252B] tracking-tight">
            SkillTrack Executive Command Center
          </h1>
          <p className="text-sm text-[#77717A]">
            Platform-wide metrics, user directory controls, role governance, and curriculum oversight
          </p>
        </div>

        <Link to="/admin/users">
          <Button variant="primary" size="sm">
            <Users className="w-4 h-4 mr-1.5" /> Manage Users
          </Button>
        </Link>
      </div>

      {/* Main KPI Counter Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#29252B]">{userStats.total}</div>
            <div className="text-xs font-medium text-[#77717A]">Total Accounts</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FCE7EF] text-[#D96C94] flex items-center justify-center shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#29252B]">{userStats.students}</div>
            <div className="text-xs font-medium text-[#77717A]">Active Students</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#29252B]">{userStats.mentors}</div>
            <div className="text-xs font-medium text-[#77717A]">Faculty Mentors</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#29252B]">{coursesCount}</div>
            <div className="text-xs font-medium text-[#77717A]">Published Courses</div>
          </div>
        </Card>
      </div>

      {/* Second Row: Platform Health & Quick Directory Links */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="space-y-4">
          <h3 className="font-bold text-base text-[#29252B] border-b border-[#F0DFE5] pb-3">
            Platform Learning Health
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-[#FFF5F7] rounded-xl border border-[#F0DFE5] flex items-center justify-between">
              <span className="text-xs text-[#77717A]">Assignment Submissions</span>
              <span className="font-bold text-xs text-[#29252B]">{submissionsCount}</span>
            </div>
            <div className="p-3 bg-[#FFF5F7] rounded-xl border border-[#F0DFE5] flex items-center justify-between">
              <span className="text-xs text-[#77717A]">Active Assessments</span>
              <span className="font-bold text-xs text-[#29252B]">{assessmentsCount}</span>
            </div>
            <div className="p-3 bg-[#FFF5F7] rounded-xl border border-[#F0DFE5] flex items-center justify-between">
              <span className="text-xs text-[#77717A]">System Architecture</span>
              <span className="font-bold text-xs text-emerald-600">Django + DRF + React</span>
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-[#F0DFE5] pb-3">
            <div>
              <h3 className="font-bold text-base text-[#29252B]">Governance Shortcuts</h3>
              <p className="text-xs text-[#77717A]">Direct access to administrative operational tools</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border border-[#F0DFE5] bg-[#FFF5F7] space-y-2">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                <h4 className="font-bold text-sm text-[#29252B]">User Directory & Roles</h4>
              </div>
              <p className="text-xs text-[#77717A]">
                Activate or deactivate user accounts, modify role permissions (Student, Mentor, Admin).
              </p>
              <div className="pt-2">
                <Link to="/admin/users">
                  <Button variant="primary" size="sm">
                    Open User Directory →
                  </Button>
                </Link>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-[#F0DFE5] bg-[#FFF5F7] space-y-2">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#D96C94]" />
                <h4 className="font-bold text-sm text-[#29252B]">Course Oversight</h4>
              </div>
              <p className="text-xs text-[#77717A]">
                Review all course modules, syllabi, enrollments, and mentor assignments.
              </p>
              <div className="pt-2">
                <Link to="/courses">
                  <Button variant="outline" size="sm">
                    Inspect Courses →
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
