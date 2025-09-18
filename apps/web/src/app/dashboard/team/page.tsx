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
  Coffee
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
    managers: 0,
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
          managers: currentUser.role === 'MANAGER' ? 1 : 0,
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
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team</h1>
          <p className="text-gray-600 mt-2">Manage your organization's team members and permissions</p>
        </div>
        <Button 
          className="flex items-center gap-2"
          onClick={() => setShowInviteModal(true)}
        >
          <UserPlus className="h-4 w-4" />
          Invite Member
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Members</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalMembers}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Admins</p>
                <p className="text-3xl font-bold text-red-600">{stats.admins}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Crown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Managers</p>
                <p className="text-3xl font-bold text-blue-600">{stats.managers}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <SettingsIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cuppers</p>
                <p className="text-3xl font-bold text-green-600">{stats.cuppers}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Coffee className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search team members by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="MANAGER">Manager</option>
                <option value="CUPPER">Cupper</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Members List */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            {filteredMembers.length} of {teamMembers.length} members
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredMembers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {teamMembers.length === 0 ? 'No team members yet' : 'No members match your filters'}
              </h3>
              <p className="text-gray-500 mb-6">
                {teamMembers.length === 0 
                  ? 'Invite your first team member to get started.'
                  : 'Try adjusting your search or filter criteria.'
                }
              </p>
              {teamMembers.length === 0 && (
                <Button onClick={() => setShowInviteModal(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite First Member
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMembers.map((member) => (
                <div key={member.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {member.firstName[0]}{member.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {member.firstName} {member.lastName}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-4 w-4" />
                          <span>{member.email}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          {getRoleIcon(member.role)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                            {member.role}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          <span>Joined {member.createdAt ? formatDateTime(member.createdAt) : 'Unknown'}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          View Profile
                        </Button>
                        {user?.role === 'ADMIN' && member.id !== user.id && (
                          <Button variant="outline" size="sm">
                            Manage
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invite Modal Placeholder */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Invite Team Member</h3>
            <p className="text-gray-600 mb-4">
              Invite functionality will be implemented here. For now, this is a placeholder.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowInviteModal(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowInviteModal(false)}>
                Send Invite
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
