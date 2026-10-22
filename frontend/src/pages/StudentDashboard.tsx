import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  Compass,
  FolderGit2,
  Briefcase,
  PlayCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { courseService } from '../services/courseService';
import { assignmentService } from '../services/assignmentService';
import { assessmentService } from '../services/assessmentService';
import { careerService } from '../services/careerService';
import { Enrollment, Assignment, AssessmentAttemptResult, StudentSkill } from '../types';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { ProgressBar } from '../components/ProgressBar';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [attempts, setAttempts] = useState<AssessmentAttemptResult[]>([]);
  const [skills, setSkills] = useState<StudentSkill[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Weekly activity telemetry data (Recharts)
  const activityData = [
    { day: 'Mon', hours: 3.5, topics: 4 },
    { day: 'Tue', hours: 2.0, topics: 2 },
    { day: 'Wed', hours: 4.5, topics: 5 },
    { day: 'Thu', hours: 1.5, topics: 1 },
    { day: 'Fri', hours: 5.0, topics: 6 },
    { day: 'Sat', hours: 3.0, topics: 3 },
    { day: 'Sun', hours: 2.5, topics: 2 },
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [enrollmentRes, assignmentRes, attemptRes, skillRes] = await Promise.all([
          courseService.getMyEnrollments(),
          assignmentService.getAssignments(),
          assessmentService.getAttempts(),
          careerService.getMySkills(),
        ]);
        setEnrollments(enrollmentRes);
        setAssignments(assignmentRes);
        setAttempts(attemptRes);
        setSkills(skillRes);
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return <LoadingSkeleton rows={5} />;
  }

  const activeEnrollments = enrollments.filter((e) => e.status === 'ACTIVE');
  const completedCourses = enrollments.filter((e) => e.status === 'COMPLETED').length;
  const pendingAssignments = assignments.filter((a) => !a.my_submission || a.my_submission.status === 'PENDING').length;
  const passedQuizzes = attempts.filter((a) => a.passed).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-white via-white to-[#FCE7EF] border border-[#F0DFE5] rounded-3xl p-6 lg:p-8 card-shadow">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FCE7EF] text-xs font-semibold text-[#D96C94]">
            <TrendingUp className="w-3.5 h-3.5" />
            Learning Momentum: On Track
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-[#29252B] tracking-tight">
            Welcome back, {user?.first_name || user?.username}!
          </h1>
          <p className="text-sm text-[#77717A] max-w-xl">
            {user?.profile?.headline || 'Continuous learning and skill progress tracker.'}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link to="/courses">
            <Button variant="outline" size="sm">
              <BookOpen className="w-4 h-4 mr-1.5" /> Browse Courses
            </Button>
          </Link>
          <Link to="/skill-gap">
            <Button variant="primary" size="sm">
              <Compass className="w-4 h-4 mr-1.5" /> Analyze Skill Gap
            </Button>
          </Link>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FCE7EF] flex items-center justify-center text-[#D96C94] shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#29252B]">{enrollments.length}</div>
            <div className="text-xs font-medium text-[#77717A]">Enrolled Courses</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#29252B]">{completedCourses}</div>
            <div className="text-xs font-medium text-[#77717A]">Completed Courses</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#29252B]">{pendingAssignments}</div>
            <div className="text-xs font-medium text-[#77717A]">Pending Tasks</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#29252B]">{passedQuizzes}</div>
            <div className="text-xs font-medium text-[#77717A]">Quizzes Passed</div>
          </div>
        </Card>
      </div>

      {/* Main Grid: Enrolled Courses & Weekly Activity Chart */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Enrolled Courses */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="space-y-5">
            <div className="flex items-center justify-between border-b border-[#F0DFE5] pb-4">
              <div>
                <h2 className="text-lg font-bold text-[#29252B]">In-Progress Courses</h2>
                <p className="text-xs text-[#77717A]">Calculated dynamically from completed topic milestones</p>
              </div>
              <Link to="/courses" className="text-xs font-semibold text-[#D96C94] hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {enrollments.length === 0 ? (
              <div className="text-center py-10 space-y-3">
                <BookOpen className="w-10 h-10 text-[#E98EAD] mx-auto opacity-60" />
                <p className="text-sm text-[#77717A]">You are not currently enrolled in any course.</p>
                <Link to="/courses">
                  <Button variant="primary" size="sm">Browse Course Catalog</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {enrollments.map((enr) => (
                  <div
                    key={enr.id}
                    className="p-4 rounded-2xl border border-[#F0DFE5] bg-[#FFF5F7] hover:bg-white transition-all card-shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="rose" size="sm">{enr.course.category}</Badge>
                        <Badge variant={enr.status === 'COMPLETED' ? 'green' : 'amber'} size="sm">
                          {enr.status}
                        </Badge>
                      </div>
                      <h4 className="text-base font-bold text-[#29252B] truncate">
                        {enr.course.title}
                      </h4>
                      <div className="max-w-md">
                        <ProgressBar progress={enr.progress_percentage} showLabel size="sm" />
                      </div>
                    </div>

                    <Link to={`/learn/${enr.course.id}`} className="shrink-0 w-full sm:w-auto">
                      <Button variant="primary" size="sm" className="w-full">
                        <PlayCircle className="w-4 h-4 mr-1.5" /> Continue Learning
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Weekly Learning Activity Chart */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#29252B]">Weekly Study Activity</h3>
                <p className="text-xs text-[#77717A]">Daily hours spent practicing code & completing curriculum</p>
              </div>
              <span className="text-xs font-semibold text-[#D96C94] bg-[#FCE7EF] px-2.5 py-1 rounded-full">
                Total: 22 hrs this week
              </span>
            </div>

            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="day" stroke="#77717A" fontSize={12} tickLine={false} />
                  <YAxis stroke="#77717A" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#F0DFE5',
                      borderRadius: '12px',
                      boxShadow: '0 4px 20px -2px rgba(233, 142, 173, 0.15)',
                    }}
                    labelStyle={{ color: '#29252B', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="hours" name="Hours" fill="#E98EAD" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Right 1 Col: Upcoming Deadlines & Recent Scores */}
        <div className="space-y-6">
          {/* Upcoming Assignments */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#F0DFE5] pb-3">
              <h3 className="text-base font-bold text-[#29252B]">Assignments</h3>
              <Link to="/assignments" className="text-xs font-semibold text-[#D96C94] hover:underline">
                View All
              </Link>
            </div>

            {assignments.length === 0 ? (
              <p className="text-xs text-[#77717A] py-4 text-center">No assignments pending.</p>
            ) : (
              <div className="space-y-3">
                {assignments.slice(0, 3).map((asg) => (
                  <div key={asg.id} className="p-3 rounded-xl border border-[#F0DFE5] bg-[#FFF5F7] space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#29252B] truncate max-w-[180px]">{asg.title}</span>
                      <span className="text-[11px] text-[#77717A]">
                        {new Date(asg.due_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-[#77717A] text-[11px]">Max: {asg.max_points} pts</span>
                      {asg.my_submission ? (
                        <Badge variant={asg.my_submission.status === 'GRADED' ? 'green' : 'amber'} size="sm">
                          {asg.my_submission.status === 'GRADED' ? `${asg.my_submission.score}/${asg.max_points} pts` : 'Under Review'}
                        </Badge>
                      ) : (
                        <Link to="/assignments">
                          <span className="text-xs font-semibold text-[#D96C94] hover:underline">Submit →</span>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Assessment Performance */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#F0DFE5] pb-3">
              <h3 className="text-base font-bold text-[#29252B]">Recent Quizzes</h3>
              <Link to="/assessments" className="text-xs font-semibold text-[#D96C94] hover:underline">
                All Quizzes
              </Link>
            </div>

            {attempts.length === 0 ? (
              <p className="text-xs text-[#77717A] py-4 text-center">No assessments taken yet.</p>
            ) : (
              <div className="space-y-3">
                {attempts.slice(0, 3).map((att) => (
                  <div key={att.id} className="p-3 rounded-xl border border-[#F0DFE5] bg-[#FFF5F7] flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-xs text-[#29252B]">{att.assessment_title}</div>
                      <div className="text-[11px] text-[#77717A]">{att.course_title}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-[#29252B]">{att.percentage}%</div>
                      <Badge variant={att.passed ? 'green' : 'amber'} size="sm">
                        {att.passed ? 'Passed' : 'Review'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Quick Action Hub */}
          <Card className="space-y-3 bg-[#FCE7EF]/40 border-[#F0DFE5]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#77717A]">Quick Tools</h4>
            <div className="grid grid-cols-2 gap-2">
              <Link to="/skill-gap" className="p-2.5 bg-white rounded-xl border border-[#F0DFE5] hover:border-[#E98EAD] text-xs font-semibold text-[#29252B] hover:text-[#D96C94] transition-all flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#D96C94]" /> Skill Gap
              </Link>
              <Link to="/projects" className="p-2.5 bg-white rounded-xl border border-[#F0DFE5] hover:border-[#E98EAD] text-xs font-semibold text-[#29252B] hover:text-[#D96C94] transition-all flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-[#D96C94]" /> Projects
              </Link>
              <Link to="/job-tracker" className="p-2.5 bg-white rounded-xl border border-[#F0DFE5] hover:border-[#E98EAD] text-xs font-semibold text-[#29252B] hover:text-[#D96C94] transition-all flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#D96C94]" /> Job Tracker
              </Link>
              <Link to="/profile" className="p-2.5 bg-white rounded-xl border border-[#F0DFE5] hover:border-[#E98EAD] text-xs font-semibold text-[#29252B] hover:text-[#D96C94] transition-all flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#D96C94]" /> Profile
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
