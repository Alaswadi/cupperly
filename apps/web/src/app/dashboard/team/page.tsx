'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { User } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { formatDateTime } from '@/lib/utils';
import { toast } from 'react-hot-toast';
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
  Trash2,
  X
} from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function TeamPage() {
  const { user, organization } = useAuth();
  const router = useRouter();
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [stats, setStats] = useState({
    totalMembers: 0,
    admins: 0,
    cuppers: 0,
  });

  // Redirect non-admin users
  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      toast.error('You do not have permission to access team management');
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      loadTeamMembers();
    }
  }, [user]);

  const loadTeamMembers = async () => {
    try {
      setIsLoading(true);
      const response = await authApi.getTeamMembers();

      if (response.success && response.data) {
        const users = response.data.users;
        setTeamMembers(users);

        // Calculate stats
        const totalMembers = users.length;
        const admins = users.filter(u => u.role === 'ADMIN').length;
        const cuppers = users.filter(u => u.role === 'CUPPER').length;

        setStats({
          totalMembers,
          admins,
          cuppers,
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

  const handleCreateMember = async (memberData: any) => {
    try {
      const response = await authApi.createMember(memberData);
      if (response.success) {
        // Refresh team members list
        loadTeamMembers();
        setShowInviteModal(false);
      }
    } catch (error: any) {
      console.error('Failed to create member:', error);
      alert(error.message || 'Failed to create team member');
    }
  };

  const handleViewMember = (member: User) => {
    setSelectedMember(member);
    setShowViewModal(true);
  };

  const handleEditMember = (member: User) => {
    setSelectedMember(member);
    setShowEditModal(true);
  };

  const handleUpdateMember = async (data: any) => {
    if (!selectedMember) return;

    try {
      const response = await authApi.updateTeamMember(selectedMember.id, data);
      if (response.success) {
        setShowEditModal(false);
        setSelectedMember(null);
        // Reload team members
        loadTeamMembers();
      }
    } catch (error: any) {
      console.error('Failed to update member:', error);
      alert(error.message || 'Failed to update team member');
    }
  };

  const handleDeleteMember = (member: User) => {
    setSelectedMember(member);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedMember) return;

    try {
      const response = await authApi.deleteTeamMember(selectedMember.id);
      if (response.success) {
        setShowDeleteModal(false);
        setSelectedMember(null);
        // Reload team members
        loadTeamMembers();
      }
    } catch (error: any) {
      console.error('Failed to delete member:', error);
      alert(error.message || 'Failed to delete team member');
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
              {/* Add Member Button - Only for ADMIN */}
              {user?.role === 'ADMIN' && (
                <Button
                  className="bg-coffee-brown hover:bg-coffee-dark text-white flex items-center gap-2"
                  onClick={() => setShowInviteModal(true)}
                >
                  <UserPlus className="h-4 w-4" />
                  Add Member
                </Button>
              )}
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
                        <button
                          onClick={() => handleViewMember(member)}
                          className="w-8 h-8 flex items-center justify-center text-blue-400 hover:text-blue-600 transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {user?.role === 'ADMIN' && member.id !== user.id && (
                          <>
                            <button
                              onClick={() => handleEditMember(member)}
                              className="w-8 h-8 flex items-center justify-center text-green-400 hover:text-green-600 transition-colors"
                              title="Edit Member"
                            >
                              <SettingsIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteMember(member)}
                              className="w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-600 transition-colors"
                              title="Delete Member"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Member Modal */}
      {showInviteModal && (
        <AddMemberModal
          onClose={() => setShowInviteModal(false)}
          onSubmit={handleCreateMember}
        />
      )}

      {/* View Member Modal */}
      {showViewModal && selectedMember && (
        <ViewMemberModal
          member={selectedMember}
          onClose={() => {
            setShowViewModal(false);
            setSelectedMember(null);
          }}
        />
      )}

      {/* Edit Member Modal */}
      {showEditModal && selectedMember && (
        <EditMemberModal
          member={selectedMember}
          onClose={() => {
            setShowEditModal(false);
            setSelectedMember(null);
          }}
          onSubmit={handleUpdateMember}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedMember && (
        <DeleteMemberModal
          member={selectedMember}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedMember(null);
          }}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}

// Add Member Modal Component
interface AddMemberModalProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
}

function AddMemberModal({ onClose, onSubmit }: AddMemberModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'CUPPER',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Team Member</h3>
        <p className="text-sm text-gray-600 mb-6">
          Create a new team member account. They can log in immediately with the credentials you set.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <Input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                placeholder="John"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <Input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                placeholder="Doe"
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="john.doe@example.com"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-coffee-brown"
            >
              <option value="CUPPER">Cupper</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Minimum 8 characters"
              className="w-full"
              minLength={8}
            />
            <p className="text-xs text-gray-500 mt-1">
              The user will use this password to log in.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-coffee-brown hover:bg-coffee-dark text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Member'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// View Member Modal Component
function ViewMemberModal({ member, onClose }: { member: User; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-coffee-brown">Member Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-coffee-brown rounded-full flex items-center justify-center">
              <span className="text-2xl font-medium text-white">
                {member.firstName[0]}{member.lastName[0]}
              </span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Name</label>
            <p className="text-lg text-gray-900">{member.firstName} {member.lastName}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Email</label>
            <p className="text-lg text-gray-900">{member.email}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Role</label>
            <p className="text-lg text-gray-900">{member.role}</p>
          </div>

          {member.bio && (
            <div>
              <label className="text-sm font-medium text-gray-500">Bio</label>
              <p className="text-gray-900">{member.bio}</p>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-500">Email Verified</label>
            <p className="text-gray-900">{member.emailVerified ? 'Yes' : 'No'}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Joined</label>
            <p className="text-gray-900">
              {member.createdAt ? formatDateTime(member.createdAt) : 'Unknown'}
            </p>
          </div>

          {member.lastLoginAt && (
            <div>
              <label className="text-sm font-medium text-gray-500">Last Login</label>
              <p className="text-gray-900">{formatDateTime(member.lastLoginAt)}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

// Edit Member Modal Component
function EditMemberModal({
  member,
  onClose,
  onSubmit
}: {
  member: User;
  onClose: () => void;
  onSubmit: (data: any) => void;
}) {
  const [formData, setFormData] = useState({
    firstName: member.firstName,
    lastName: member.lastName,
    email: member.email,
    role: member.role,
    bio: member.bio || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSubmit(formData);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-coffee-brown">Edit Member</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <Input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <Input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as 'ADMIN' | 'CUPPER' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coffee-brown"
              required
            >
              <option value="ADMIN">Admin</option>
              <option value="CUPPER">Cupper</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio (Optional)
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coffee-brown"
              rows={3}
              maxLength={500}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-coffee-brown hover:bg-coffee-dark text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Member'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Delete Member Modal Component
function DeleteMemberModal({
  member,
  onClose,
  onConfirm
}: {
  member: User;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    await onConfirm();
    setIsDeleting(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-red-600">Delete Member</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            Are you sure you want to delete <strong>{member.firstName} {member.lastName}</strong>?
          </p>
          <p className="text-sm text-gray-500">
            This action cannot be undone. All data associated with this user will be permanently removed.
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            className="bg-red-600 hover:bg-red-700 text-white"
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Member'}
          </Button>
        </div>
      </div>
    </div>
  );
}
