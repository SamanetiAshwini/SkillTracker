import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, LogOut, User, Menu, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Badge } from './Badge';

interface NavbarProps {
  onMenuToggle?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuToggle }) => {
  const { user, logout, demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadgeVariant = (role?: string) => {
    if (role === 'ADMIN') return 'purple';
    if (role === 'MENTOR') return 'amber';
    return 'rose';
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#F0DFE5] px-4 lg:px-8 py-3">
      <div className="flex items-center justify-between">
        {/* Left: Mobile hamburger & Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-xl text-[#77717A] hover:bg-[#FCE7EF] hover:text-[#29252B] transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#E98EAD] to-[#FCE7EF] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-[#29252B]">
                Skill<span className="text-[#D96C94]">Track</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold uppercase tracking-wider text-[#77717A] bg-[#FCE7EF] px-1.5 py-0.5 rounded-sm">
                SaaS
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Quick Demo Role Switcher for instant testing */}
        {user && (
          <div className="hidden md:flex items-center gap-1.5 bg-[#FFF5F7] border border-[#F0DFE5] p-1 rounded-xl text-xs">
            <span className="px-2 font-medium text-[#77717A]">Quick Switch:</span>
            <button
              onClick={() => demoLogin('STUDENT')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                user.role === 'STUDENT'
                  ? 'bg-white text-[#D96C94] shadow-xs'
                  : 'text-[#77717A] hover:text-[#29252B]'
              }`}
            >
              Student
            </button>
            <button
              onClick={() => demoLogin('MENTOR')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                user.role === 'MENTOR'
                  ? 'bg-white text-amber-600 shadow-xs'
                  : 'text-[#77717A] hover:text-[#29252B]'
              }`}
            >
              Mentor
            </button>
            <button
              onClick={() => demoLogin('ADMIN')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                user.role === 'ADMIN'
                  ? 'bg-white text-purple-600 shadow-xs'
                  : 'text-[#77717A] hover:text-[#29252B]'
              }`}
            >
              Admin
            </button>
          </div>
        )}

        {/* Right: User Profile & Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end text-right">
                <span className="text-sm font-semibold text-[#29252B]">
                  {user.first_name ? `${user.first_name} ${user.last_name}` : user.username}
                </span>
                <Badge variant={getRoleBadgeVariant(user.role)} size="sm">
                  {user.role}
                </Badge>
              </div>

              <Link to="/profile" className="relative group">
                {user.profile?.avatar_url ? (
                  <img
                    src={user.profile.avatar_url}
                    alt={user.username}
                    className="w-9 h-9 rounded-xl object-cover border border-[#F0DFE5] group-hover:ring-2 ring-[#E98EAD] transition-all"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-[#FCE7EF] text-[#D96C94] flex items-center justify-center font-bold text-sm border border-[#F0DFE5]">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </Link>

              <button
                onClick={handleLogout}
                title="Logout"
                className="p-2 rounded-xl text-[#77717A] hover:bg-[#FCE7EF] hover:text-[#D96C94] transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-[#77717A] hover:text-[#29252B] hover:bg-[#FCE7EF] rounded-xl transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-medium text-white bg-[#E98EAD] hover:bg-[#D96C94] rounded-xl shadow-xs transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
