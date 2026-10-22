import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

export const LoginPage: React.FC = () => {
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();

  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginId || !password) {
      setError('Please provide your username or email and password.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await login(loginId, password);
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      const detail = err.response?.data?.detail || 'Invalid username/email or password.';
      setError(detail);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async (role: 'STUDENT' | 'MENTOR' | 'ADMIN') => {
    setError(null);
    setIsLoading(true);
    try {
      await demoLogin(role);
      navigate('/dashboard');
    } catch (err: any) {
      setError('Demo login failed. Make sure the backend server is active.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF5F7] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#E98EAD] to-[#FCE7EF] flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-[#29252B]">
              Skill<span className="text-[#D96C94]">Track</span>
            </span>
          </Link>
          <h2 className="text-xl font-bold text-[#29252B]">Welcome Back</h2>
          <p className="text-xs text-[#77717A]">Sign in to continue your personalized learning trajectory</p>
        </div>

        {/* Demo Fast Login Buttons */}
        <div className="bg-white border border-[#F0DFE5] rounded-2xl p-4 card-shadow space-y-2">
          <div className="text-xs font-semibold text-[#77717A] text-center mb-1">
            ⚡ Quick 1-Click Evaluation Access:
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('STUDENT')}
              className="px-2 py-1.5 bg-[#FFF5F7] hover:bg-[#FCE7EF] border border-[#F0DFE5] rounded-xl text-xs font-medium text-[#D96C94] transition-colors cursor-pointer text-center"
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('MENTOR')}
              className="px-2 py-1.5 bg-[#FFF5F7] hover:bg-amber-100 border border-amber-200 rounded-xl text-xs font-medium text-amber-700 transition-colors cursor-pointer text-center"
            >
              Mentor
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('ADMIN')}
              className="px-2 py-1.5 bg-[#FFF5F7] hover:bg-purple-100 border border-purple-200 rounded-xl text-xs font-medium text-purple-700 transition-colors cursor-pointer text-center"
            >
              Admin
            </button>
          </div>
        </div>

        {/* Login Form Card */}
        <Card className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#29252B] mb-1">
                Username or Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#77717A] absolute left-3 top-3" />
                <input
                  type="text"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="student@skilltrack.dev or alex_student"
                  className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-medium text-[#29252B]">
                  Password
                </label>
                <Link
                  to="/password-reset"
                  className="text-xs text-[#D96C94] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#77717A] absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              Sign In <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          <div className="pt-2 text-center text-xs text-[#77717A]">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-[#D96C94] hover:underline">
              Create an account
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
