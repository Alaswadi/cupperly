'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { authApi } from '@/lib/api';
import { User } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { formatDateTime } from '@/lib/utils';
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  Calendar,
  Search,
  Filter,
  Crown,
  Settings as SettingsIcon,
  Coffee,
  Eye,
  MoreHorizontal
} from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function TeamPage() {
  const { user, organization } = useAuth();
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [stats, setStats] = useState({
    totalMembers: 0,
    admins: 0,
    cuppers: 0,
  });

  useEffect(() => {
    loadTeamMembers();
  }, []);

  const loadTeamMembers = async () => {
    try {
      setIsLoading(true);
      // For now, we'll show the current user as the only team member
      // In a real implementation, you'd have an API endpoint to get all users
      const currentUser = user;
      if (currentUser) {
        setTeamMembers([currentUser]);
        
        // Calculate stats based on current user
        setStats({
          totalMembers: 1,
          admins: currentUser.role === 'ADMIN' ? 1 : 0,
          cuppers: currentUser.role === 'CUPPER' ? 1 : 0,
        });
      }
    } catch (error) {
      console.error('Failed to load team members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'MANAGER':
        return 'bg-blue-100 text-blue-800';
      case 'CUPPER':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Crown className="h-4 w-4" />;
      case 'MANAGER':
        return <SettingsIcon className="h-4 w-4" />;
      case 'CUPPER':
        return <Coffee className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleInviteUser = async (inviteData: any) => {
    try {
      const response = await authApi.inviteUser(inviteData);
      if (response.success) {
        // Refresh team members list
        loadTeamMembers();
        setShowInviteModal(false);
      }
    } catch (error) {
      console.error('Failed to invite user:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Team</h2>
        <p className="text-gray-600">Manage your organization's team members and permissions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Members Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Members</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalMembers}</p>
              <p className="text-sm text-green-600 mt-1">Active team</p>
            </div>
            <div className="w-12 h-12 bg-coffee-brown/10 rounded-lg flex items-center justify-center">
              <Users className="text-coffee-brown text-xl h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Admins Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Admins</p>
              <p className="text-3xl font-bold text-gray-900">{stats.admins}</p>
              <p className="text-sm text-blue-600 mt-1">Full access</p>
            </div>
            <div className="w-12 h-12 bg-coffee-cream/20 rounded-lg flex items-center justify-center">
              <Crown className="text-coffee-cream text-xl h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Cuppers Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cuppers</p>
              <p className="text-3xl font-bold text-gray-900">{stats.cuppers}</p>
              <p className="text-sm text-orange-600 mt-1">Evaluation access</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Coffee className="text-orange-600 text-xl h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Team Members List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="flex items-center space-x-2">
                <Search className="h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search team members..."
                  className="border-none outline-none text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {/* Role Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  className="border-none outline-none text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg pr-8"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="all">All Roles</option>
                  <option value="ADMIN">Admin</option>
                  <option value="CUPPER">Cupper</option>
                </select>
              </div>
              {/* Invite Button */}
              <Button
                className="bg-coffee-brown hover:bg-coffee-dark text-white flex items-center gap-2"
                onClick={() => setShowInviteModal(true)}
              >
                <UserPlus className="h-4 w-4" />
                Invite Member
              </Button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    {teamMembers.length === 0 ? 'No team members yet. Invite your first team member to get started.' : 'No members match your search.'}
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-coffee-brown rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {member.firstName[0]}{member.lastName[0]}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {member.firstName} {member.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {member.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(member.role)}`}>
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {member.createdAt ? formatDateTime(member.createdAt).split(' ')[0] : 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
                          <Eye className="h-4 w-4" />
                        </button>
                        {user?.role === 'ADMIN' && member.id !== user.id && (
                          <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
                            <SettingsIcon className="h-4 w-4" />
                          </button>
                        )}
                        <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal Placeholder */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Invite Team Member</h3>
            <p className="text-gray-600 mb-4">
              Invite functionality will be implemented here. For now, this is a placeholder.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowInviteModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => setShowInviteModal(false)}
                className="bg-coffee-brown hover:bg-coffee-dark text-white"
              >
                Send Invite
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
