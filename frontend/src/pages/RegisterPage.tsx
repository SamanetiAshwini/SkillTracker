import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Lock, Mail, User, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    role: 'STUDENT',
    password: '',
    password_confirm: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password || !formData.password_confirm) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    if (formData.password !== formData.password_confirm) {
      setError('Passwords do not match.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      if (err.response?.data) {
        const errors = err.response.data;
        const msg = Object.entries(errors)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          .join(' | ');
        setError(msg);
      } else {
        setError('Registration failed. Please check your network connection.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF5F7] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#E98EAD] to-[#FCE7EF] flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-[#29252B]">
              Skill<span className="text-[#D96C94]">Track</span>
            </span>
          </Link>
          <h2 className="text-xl font-bold text-[#29252B]">Create Your Account</h2>
          <p className="text-xs text-[#77717A]">Start tracking real learning progress and career readiness</p>
        </div>

        <Card className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#29252B] mb-1">First Name</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="Jane"
                  className="w-full px-3 py-2 text-sm bg-white border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#29252B] mb-1">Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Doe"
                  className="w-full px-3 py-2 text-sm bg-white border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#29252B] mb-1">Username *</label>
              <div className="relative">
                <User className="w-4 h-4 text-[#77717A] absolute left-3 top-3" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="janedoe_dev"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#29252B] mb-1">Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#77717A] absolute left-3 top-3" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="jane@example.com"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#29252B] mb-1">Platform Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm bg-white border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
              >
                <option value="STUDENT">Student (Access courses, quizzes, skill tracker)</option>
                <option value="MENTOR">Mentor (Manage course content, grade assignments)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#29252B] mb-1">Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#77717A] absolute left-3 top-3" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min 8 chars"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#29252B] mb-1">Confirm Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#77717A] absolute left-3 top-3" />
                  <input
                    type="password"
                    name="password_confirm"
                    value={formData.password_confirm}
                    onChange={handleChange}
                    placeholder="Re-type password"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-3"
              isLoading={isLoading}
            >
              Register Account <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          <div className="pt-2 text-center text-xs text-[#77717A]">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#D96C94] hover:underline">
              Sign In
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
