import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  FileCheck2,
  HelpCircle,
  Compass,
  FolderGit2,
  Briefcase,
  User,
  Users,
  Settings,
  ShieldCheck,
  Award,
  Layers,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;

  const studentLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/courses', label: 'Course Catalog', icon: BookOpen },
    { to: '/my-learning', label: 'My Learning', icon: GraduationCap },
    { to: '/assignments', label: 'Assignments', icon: FileCheck2 },
    { to: '/assessments', label: 'Assessments', icon: Award },
    { to: '/skill-gap', label: 'Skill Gap Analyzer', icon: Compass },
    { to: '/projects', label: 'Portfolio Projects', icon: FolderGit2 },
    { to: '/job-tracker', label: 'Job Applications', icon: Briefcase },
    { to: '/profile', label: 'Profile & Settings', icon: User },
  ];

  const mentorLinks = [
    { to: '/mentor/dashboard', label: 'Mentor Dashboard', icon: LayoutDashboard },
    { to: '/mentor/courses', label: 'Manage Courses', icon: BookOpen },
    { to: '/mentor/grading', label: 'Review Submissions', icon: FileCheck2 },
    { to: '/mentor/assessments', label: 'Assessment Bank', icon: Award },
    { to: '/profile', label: 'Profile Settings', icon: User },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
    { to: '/admin/users', label: 'User Directory', icon: Users },
    { to: '/admin/courses', label: 'Course Oversight', icon: Layers },
    { to: '/admin/reports', label: 'Platform Reports', icon: ShieldCheck },
    { to: '/profile', label: 'Profile Settings', icon: User },
  ];

  const currentLinks =
    role === 'ADMIN' ? adminLinks : role === 'MENTOR' ? mentorLinks : studentLinks;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-[61px] left-0 z-50 lg:z-20 h-screen lg:h-[calc(100vh-61px)] w-64 bg-white border-r border-[#F0DFE5] flex flex-col transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#F0DFE5] lg:hidden">
          <span className="font-bold text-base text-[#29252B]">Menu</span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#77717A] hover:bg-[#FCE7EF]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-[#77717A]">
            {role === 'ADMIN' ? 'Administration' : role === 'MENTOR' ? 'Mentor Workspace' : 'Learning Portal'}
          </div>

          {currentLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => onClose()}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#FCE7EF] text-[#D96C94] font-semibold'
                      : 'text-[#77717A] hover:text-[#29252B] hover:bg-[#FFF5F7]'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <div className="p-4 border-t border-[#F0DFE5] m-3 bg-[#FFF5F7] rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-[#29252B]">Live Status: Active</span>
          </div>
          <p className="text-[11px] text-[#77717A] leading-tight">
            Role: <span className="font-semibold text-[#D96C94]">{role}</span>
          </p>
        </div>
      </aside>
    </>
  );
};
