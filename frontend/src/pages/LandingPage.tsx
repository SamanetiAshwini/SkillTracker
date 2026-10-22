import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  Award,
  Compass,
  Briefcase,
  Users,
  ShieldCheck,
  TrendingUp,
  GraduationCap
} from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { user, demoLogin } = useAuth();

  return (
    <div className="min-h-screen bg-[#FFF5F7] text-[#29252B]">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#F0DFE5] px-6 lg:px-12 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#E98EAD] to-[#FCE7EF] flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-[#29252B]">
              Skill<span className="text-[#D96C94]">Track</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#77717A]">
            <a href="#features" className="hover:text-[#D96C94] transition-colors">Features</a>
            <a href="#roles" className="hover:text-[#D96C94] transition-colors">Portals</a>
            <a href="#analyzer" className="hover:text-[#D96C94] transition-colors">Skill Gap Engine</a>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <Link to="/dashboard">
                <Button variant="primary" size="md">
                  Go to Dashboard <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="md">Log In</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="md">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 px-6 lg:px-12">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FCE7EF] border border-[#F0DFE5] text-xs font-semibold text-[#D96C94]">
            <Sparkles className="w-3.5 h-3.5" />
            Next-Generation Career & Learning Intelligence
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#29252B] leading-tight">
            Accelerate your engineering journey with <span className="text-[#D96C94]">SkillTrack</span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg text-[#77717A] leading-relaxed">
            A cohesive platform connecting rigorous curriculum tracking, mentor-reviewed assignments, verified quizzes, and targeted skill gap analytics tailored to your dream software roles.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link to="/register">
              <Button variant="primary" size="lg" className="shadow-md">
                Start Learning Free <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/courses">
              <Button variant="outline" size="lg">
                Explore Curriculum
              </Button>
            </Link>
          </div>

          {/* Quick Demo Login Cards for pair programming verification */}
          <div className="pt-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#77717A] mb-3">
              Instant 1-Click Evaluation Access
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => demoLogin('STUDENT')}
                className="px-4 py-2 bg-white border border-[#F0DFE5] hover:border-[#E98EAD] rounded-xl text-xs font-medium text-[#29252B] hover:text-[#D96C94] shadow-xs transition-all cursor-pointer flex items-center gap-2"
              >
                <GraduationCap className="w-4 h-4 text-[#E98EAD]" />
                Demo as Student
              </button>
              <button
                onClick={() => demoLogin('MENTOR')}
                className="px-4 py-2 bg-white border border-[#F0DFE5] hover:border-[#E98EAD] rounded-xl text-xs font-medium text-[#29252B] hover:text-[#D96C94] shadow-xs transition-all cursor-pointer flex items-center gap-2"
              >
                <Users className="w-4 h-4 text-amber-500" />
                Demo as Mentor
              </button>
              <button
                onClick={() => demoLogin('ADMIN')}
                className="px-4 py-2 bg-white border border-[#F0DFE5] hover:border-[#E98EAD] rounded-xl text-xs font-medium text-[#29252B] hover:text-[#D96C94] shadow-xs transition-all cursor-pointer flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-purple-500" />
                Demo as Admin
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features Grid */}
      <section id="features" className="py-16 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#29252B]">Engineered for True Competency</h2>
          <p className="text-[#77717A] mt-2">Every feature is backed by relational database integrity and strict server-side rules.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card hoverable className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FCE7EF] flex items-center justify-center text-[#D96C94]">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#29252B]">Modular Learning Engine</h3>
            <p className="text-sm text-[#77717A] leading-relaxed">
              Track course topics with Not Started, In Progress, and Completed states. Course percentages are computed live from authentic topic progress records.
            </p>
          </Card>

          <Card hoverable className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FCE7EF] flex items-center justify-center text-[#D96C94]">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#29252B]">Skill Gap Analyzer</h3>
            <p className="text-sm text-[#77717A] leading-relaxed">
              Compare your current proficiency against real job requirements (Python, Django, PostgreSQL, Docker). Get weighted coverage scores and prioritized study recommendations.
            </p>
          </Card>

          <Card hoverable className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FCE7EF] flex items-center justify-center text-[#D96C94]">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#29252B]">Verified Assessments</h3>
            <p className="text-sm text-[#77717A] leading-relaxed">
              Server-evaluated multiple choice and conceptual quizzes with protected answer keys, timed sessions, and detailed post-quiz explanation breakdowns.
            </p>
          </Card>

          <Card hoverable className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FCE7EF] flex items-center justify-center text-[#D96C94]">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#29252B]">Mentor Code Reviews</h3>
            <p className="text-sm text-[#77717A] leading-relaxed">
              Submit GitHub repository links and deployment demos. Faculty mentors provide qualitative remarks and validated point scores.
            </p>
          </Card>

          <Card hoverable className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FCE7EF] flex items-center justify-center text-[#D96C94]">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#29252B]">Job Application Tracker</h3>
            <p className="text-sm text-[#77717A] leading-relaxed">
              Maintain your career pipeline across Applied, Screening, Interviewing, and Offer statuses with notes and salary expectations.
            </p>
          </Card>

          <Card hoverable className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FCE7EF] flex items-center justify-center text-[#D96C94]">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#29252B]">Portfolio Project Manager</h3>
            <p className="text-sm text-[#77717A] leading-relaxed">
              Showcase capstone projects with technology tags, live demo URLs, and GitHub links directly within your candidate profile.
            </p>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#F0DFE5] bg-white py-10 px-6 lg:px-12 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#77717A]">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-[#29252B]">SkillTrack</span>
            <span>— Smart Learning & Career Progress Platform</span>
          </div>
          <div>Built with Django 5.x REST Framework, PostgreSQL, React, TypeScript, and Tailwind CSS.</div>
        </div>
      </footer>
    </div>
  );
};
