import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Mail, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { authService } from '../services/authService';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

export const PasswordResetPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [devResetInfo, setDevResetInfo] = useState<{ uid: string; token: string } | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email.');
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const res = await authService.requestPasswordReset(email);
      setMessage(res.message);
      if (res.dev_reset_info) {
        setDevResetInfo(res.dev_reset_info);
      }
    } catch (err: any) {
      setError('Failed to process request.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!devResetInfo || !newPassword) return;

    setIsLoading(true);
    try {
      await authService.confirmPasswordReset(devResetInfo.uid, devResetInfo.token, newPassword);
      setResetSuccess(true);
    } catch (err: any) {
      setError('Failed to reset password. Link may have expired.');
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
          <h2 className="text-xl font-bold text-[#29252B]">Reset Password</h2>
          <p className="text-xs text-[#77717A]">We will send you instructions to recover your account</p>
        </div>

        <Card className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {resetSuccess ? (
            <div className="p-4 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="font-semibold text-sm text-[#29252B]">Password Reset Complete</h3>
              <p className="text-xs text-[#77717A]">You can now sign in using your new credentials.</p>
              <Link to="/login">
                <Button variant="primary" size="md" className="w-full mt-2">
                  Return to Sign In
                </Button>
              </Link>
            </div>
          ) : devResetInfo ? (
            <form onSubmit={handleConfirm} className="space-y-3">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs">
                Verification token generated for <strong>{email}</strong>. Enter your new password below.
              </div>
              <div>
                <label className="block text-xs font-medium text-[#29252B] mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full px-3 py-2 text-sm bg-white border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
                />
              </div>
              <Button type="submit" variant="primary" size="md" className="w-full" isLoading={isLoading}>
                Update Password
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRequest} className="space-y-3">
              {message && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                  {message}
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-[#29252B] mb-1">Account Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#77717A] absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@skilltrack.dev"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
                  />
                </div>
              </div>
              <Button type="submit" variant="primary" size="md" className="w-full mt-2" isLoading={isLoading}>
                Send Reset Link
              </Button>
            </form>
          )}

          <div className="pt-2 text-center">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-[#77717A] hover:text-[#29252B]">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
