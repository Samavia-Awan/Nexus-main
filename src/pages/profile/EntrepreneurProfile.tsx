import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MessageCircle, Building2, MapPin, UserCircle, FileText, DollarSign } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';

export const EntrepreneurProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    startupHistory: '',
    investmentHistory: '',
    preferences: ''
  });
  const token = localStorage.getItem('business_nexus_token') || '';
  const isCurrentUser = currentUser?.id === id;

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const data = await authAPI.getProfile(token);
      setProfile(data);
      setFormData({
        name: data.name || '',
        bio: data.bio || '',
        startupHistory: data.startupHistory || '',
        investmentHistory: data.investmentHistory || '',
        preferences: data.preferences || ''
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      await authAPI.updateProfile(token, formData);
      setEditing(false);
      await fetchProfile();
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Profile not found</h2>
        <Link to="/dashboard/entrepreneur">
          <Button variant="outline" className="mt-4">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Profile header */}
      <Card>
        <CardBody className="sm:flex sm:items-start sm:justify-between p-6">
          <div className="sm:flex sm:space-x-6">
            <Avatar
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=random`}
              alt={profile.name}
              size="xl"
              className="mx-auto sm:mx-0"
            />
            <div className="mt-4 sm:mt-0 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
              <p className="text-gray-600 flex items-center justify-center sm:justify-start mt-1">
                <Building2 size={16} className="mr-1" />
                Entrepreneur
              </p>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-3">
                <Badge variant="primary">{profile.role}</Badge>
                <Badge variant="gray">
                  <MapPin size={14} className="mr-1" />
                  {profile.email}
                </Badge>
              </div>
            </div>
          </div>

          <div className="mt-6 sm:mt-0 flex gap-2">
            {!isCurrentUser && (
              <Link to={`/chat/${profile._id}`}>
                <Button variant="outline" leftIcon={<MessageCircle size={18} />}>
                  Message
                </Button>
              </Link>
            )}
            {isCurrentUser && (
              <Button
                variant="outline"
                leftIcon={<UserCircle size={18} />}
                onClick={() => setEditing(!editing)}
              >
                {editing ? 'Cancel' : 'Edit Profile'}
              </Button>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Edit Form */}
      {editing && isCurrentUser && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">Edit Profile</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                rows={3}
                placeholder="Tell us about yourself..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Startup History</label>
              <textarea
                value={formData.startupHistory}
                onChange={(e) => setFormData({ ...formData, startupHistory: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                rows={3}
                placeholder="Describe your startup history..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferences</label>
              <textarea
                value={formData.preferences}
                onChange={(e) => setFormData({ ...formData, preferences: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                rows={2}
                placeholder="Your investment preferences..."
              />
            </div>
            <Button fullWidth onClick={handleUpdate}>
              Save Changes
            </Button>
          </CardBody>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">About</h2>
            </CardHeader>
            <CardBody>
              <p className="text-gray-700">
                {profile.bio || 'No bio added yet.'}
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Startup History</h2>
            </CardHeader>
            <CardBody>
              <p className="text-gray-700">
                {profile.startupHistory || 'No startup history added yet.'}
              </p>
            </CardBody>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Details</h2>
            </CardHeader>
            <CardBody className="space-y-3">
              <div>
                <span className="text-sm text-gray-500">Email</span>
                <p className="text-md font-medium text-gray-900">{profile.email}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Role</span>
                <p className="text-md font-medium text-gray-900 capitalize">{profile.role}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Member Since</span>
                <p className="text-md font-medium text-gray-900">
                  {new Date(profile.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Preferences</span>
                <p className="text-md font-medium text-gray-900">
                  {profile.preferences || 'Not specified'}
                </p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Documents</h2>
            </CardHeader>
            <CardBody>
              <Link to="/documents">
                <Button fullWidth variant="outline" leftIcon={<FileText size={18} />}>
                  View My Documents
                </Button>
              </Link>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};