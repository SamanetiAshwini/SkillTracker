import React, { useEffect, useState } from 'react';
import { Users, Search, ShieldCheck, CheckCircle2, XCircle, AlertCircle, Edit2 } from 'lucide-react';
import { authService } from '../services/authService';
import { User, UserRole } from '../types';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

export const AdminUserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await authService.getUsers();
      setUsers(data.results || data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleActive = async (user: User) => {
    setActionError(null);
    try {
      await authService.updateUserAdmin(user.id, {
        is_active: !user.is_active,
      });
      await loadUsers();
    } catch (err: any) {
      console.error(err);
      setActionError('Failed to update user active status.');
    }
  };

  const handleRoleChange = async (userId: number, newRole: UserRole) => {
    setActionError(null);
    try {
      await authService.updateUserAdmin(userId, {
        role: newRole,
      });
      await loadUsers();
    } catch (err: any) {
      console.error(err);
      setActionError('Failed to update user role.');
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeVariant = (role: UserRole) => {
    if (role === 'ADMIN') return 'purple';
    if (role === 'MENTOR') return 'amber';
    return 'rose';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#29252B] tracking-tight">User Directory & Governance</h1>
        <p className="text-sm text-[#77717A]">
          Audit registered users, update permissions, toggle roles, and manage account statuses
        </p>
      </div>

      {actionError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <Card className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#77717A] absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users by name, username, or email address..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-[#FFF5F7] border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 text-xs font-semibold bg-[#FFF5F7] border border-[#F0DFE5] rounded-xl text-[#29252B] focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
            >
              <option value="ALL">All Roles</option>
              <option value="STUDENT">Students</option>
              <option value="MENTOR">Mentors</option>
              <option value="ADMIN">Administrators</option>
            </select>
          </div>
        </div>
      </Card>

      {/* User Directory Table */}
      {isLoading ? (
        <LoadingSkeleton rows={5} />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFF5F7] border-b border-[#F0DFE5] text-[#77717A] uppercase font-semibold text-[11px]">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Current Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Joined</th>
                  <th className="p-4 text-right">Role Assignment</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0DFE5]">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-[#77717A]">
                      No users match the search filter.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-[#FFF5F7]/40 transition-colors">
                      <td className="p-4 font-bold text-[#29252B] flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#FCE7EF] text-[#D96C94] flex items-center justify-center font-bold text-xs">
                          {u.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span>{u.first_name ? `${u.first_name} ${u.last_name}` : u.username}</span>
                          <div className="text-[10px] text-[#77717A] font-normal">@{u.username}</div>
                        </div>
                      </td>
                      <td className="p-4 text-[#77717A]">{u.email}</td>
                      <td className="p-4">
                        <Badge variant={getRoleBadgeVariant(u.role)} size="sm">
                          {u.role}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant={u.is_active ? 'green' : 'amber'} size="sm">
                          {u.is_active ? 'Active' : 'Deactivated'}
                        </Badge>
                      </td>
                      <td className="p-4 text-[#77717A]">
                        {new Date(u.date_joined).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                          className="px-2 py-1 text-xs bg-white border border-[#F0DFE5] rounded-lg text-[#29252B] focus:outline-none focus:ring-1 focus:ring-[#E98EAD]"
                        >
                          <option value="STUDENT">Student</option>
                          <option value="MENTOR">Mentor</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          variant={u.is_active ? 'ghost' : 'secondary'}
                          size="sm"
                          onClick={() => handleToggleActive(u)}
                        >
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
