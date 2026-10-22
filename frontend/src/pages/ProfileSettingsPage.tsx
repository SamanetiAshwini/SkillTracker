import React, { useState } from 'react';
import { User, Lock, Mail, CheckCircle2, AlertCircle, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';

export const ProfileSettingsPage: React.FC = () => {
  const { user, updateUser } = useAuth();

  // Profile fields state
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [headline, setHeadline] = useState(user?.profile?.headline || '');
  const [bio, setBio] = useState(user?.profile?.bio || '');
  const [phone, setPhone] = useState(user?.profile?.phone || '');
  const [location, setLocation] = useState(user?.profile?.location || '');
  const [githubUrl, setGithubUrl] = useState(user?.profile?.github_url || '');
  const [linkedinUrl, setLinkedinUrl] = useState(user?.profile?.linkedin_url || '');
  const [portfolioUrl, setPortfolioUrl] = useState(user?.profile?.portfolio_url || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.profile?.avatar_url || '');

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password fields state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passSuccess, setPassSuccess] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileError(null);
    setProfileSuccess(false);

    try {
      const updated = await authService.updateProfile({
        first_name: firstName,
        last_name: lastName,
        headline,
        bio,
        phone,
        location,
        github_url: githubUrl,
        linkedin_url: linkedinUrl,
        portfolio_url: portfolioUrl,
        avatar_url: avatarUrl,
      });
      updateUser(updated);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: any) {
      setProfileError('Failed to update profile information.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== newPasswordConfirm) {
      setPassError('New passwords do not match.');
      return;
    }

    setIsChangingPass(true);
    setPassError(null);
    setPassSuccess(false);

    try {
      await authService.changePassword(oldPassword, newPassword, newPasswordConfirm);
      setPassSuccess(true);
      setOldPassword('');
      setNewPassword('');
      setNewPasswordConfirm('');
      setTimeout(() => setPassSuccess(false), 3000);
    } catch (err: any) {
      const detail = err.response?.data?.old_password?.[0] || 'Password update failed.';
      setPassError(detail);
    } finally {
      setIsChangingPass(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#29252B] tracking-tight">Account & Profile Settings</h1>
        <p className="text-sm text-[#77717A]">
          Manage your contact information, candidate headline, and account security
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Summary */}
        <div className="space-y-6">
          <Card className="text-center p-6 space-y-4">
            <div className="relative inline-block mx-auto">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user?.username}
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-[#E98EAD] shadow-md"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-[#FCE7EF] text-[#D96C94] flex items-center justify-center font-bold text-3xl border-2 border-[#F0DFE5]">
                  {user?.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div>
              <h3 className="font-bold text-base text-[#29252B]">
                {firstName ? `${firstName} ${lastName}` : user?.username}
              </h3>
              <p className="text-xs text-[#77717A] mt-0.5">{user?.email}</p>
              <div className="pt-2">
                <Badge variant={user?.role === 'ADMIN' ? 'purple' : user?.role === 'MENTOR' ? 'amber' : 'rose'}>
                  {user?.role}
                </Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* Right 2 Columns: Forms */}
        <div className="md:col-span-2 space-y-6">
          {/* Profile Form */}
          <Card className="space-y-4">
            <h3 className="text-base font-bold text-[#29252B] border-b border-[#F0DFE5] pb-3">
              Personal Information
            </h3>

            {profileSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Profile updated successfully.</span>
              </div>
            )}

            {profileError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#29252B] mb-1">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#29252B] mb-1">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#29252B] mb-1">Professional Headline</label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Full-Stack Python & React Engineer | Cloud Architecture"
                  className="w-full px-3 py-2 text-sm bg-white border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#29252B] mb-1">Bio / Summary</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share a brief overview of your background, learning goals, and experience..."
                  className="w-full px-3 py-2 text-sm bg-white border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#29252B] mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="San Francisco, CA"
                    className="w-full px-3 py-2 text-sm bg-white border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#29252B] mb-1">Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3 py-2 text-sm bg-white border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#29252B] mb-1">Avatar Image URL</label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 text-sm bg-white border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#29252B] mb-1">GitHub Profile URL</label>
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/username"
                    className="w-full px-3 py-2 text-sm bg-white border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#29252B] mb-1">LinkedIn Profile URL</label>
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full px-3 py-2 text-sm bg-white border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit" variant="primary" size="sm" isLoading={isSavingProfile}>
                  <Save className="w-4 h-4 mr-1.5" /> Save Changes
                </Button>
              </div>
            </form>
          </Card>

          {/* Password Change Form */}
          <Card className="space-y-4">
            <h3 className="text-base font-bold text-[#29252B] border-b border-[#F0DFE5] pb-3">
              Change Password
            </h3>

            {passSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Password changed successfully.</span>
              </div>
            )}

            {passError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{passError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#29252B] mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#29252B] mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full px-3 py-2 text-sm bg-white border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#29252B] mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={newPasswordConfirm}
                    onChange={(e) => setNewPasswordConfirm(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit" variant="outline" size="sm" isLoading={isChangingPass}>
                  Update Password
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};
