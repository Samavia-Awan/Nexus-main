import React, { useState } from 'react';
import { User, Lock, Bell, Globe, Palette, CreditCard } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('profile');
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  if (!user) return null;

  const handleSaveProfile = async () => {
    setMessage('');

    // Validate name
    const trimmed = name.trim();
    if (trimmed.length < 2 || !/^[A-Za-z\s]+$/.test(trimmed)) {
      setMessage('Please enter a valid name (letters only, min 2 characters).');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('business_nexus_token') || '';
      const data = await authAPI.updateProfile(token, { name: trimmed, bio });
      if (data && (data._id || data.name)) {
        // Update stored user so the new name shows everywhere
        const stored = JSON.parse(localStorage.getItem('business_nexus_user') || '{}');
        stored.name = trimmed;
        stored.bio = bio;
        localStorage.setItem('business_nexus_user', JSON.stringify(stored));
        setMessage('Profile saved successfully!');
      } else {
        setMessage('Save failed: ' + (data?.message || 'Unknown error'));
      }
    } catch {
      setMessage('Save failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'language', label: 'Language', icon: Globe },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'billing', label: 'Billing', icon: CreditCard },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account preferences and settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings navigation */}
        <Card className="lg:col-span-1">
          <CardBody className="p-2">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === tab.id
                        ? 'text-primary-700 bg-primary-50'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={18} className="mr-3" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </CardBody>
        </Card>

        {/* Main content */}
        <div className="lg:col-span-3 space-y-6">

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900">Profile Settings</h2>
              </CardHeader>
              <CardBody className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                    alt={user.name}
                    size="xl"
                  />
                  <p className="text-sm text-gray-500">
                    Profile photo is generated from your name.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={user.email}
                    disabled
                  />
                  <Input
                    label="Role"
                    value={user.role}
                    disabled
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    className="w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-2"
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>

                {message && (
                  <p className={`text-sm ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                    {message}
                  </p>
                )}

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => { setName(user.name); setBio(user.bio || ''); setMessage(''); }}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveProfile} isLoading={saving}>
                    Save Changes
                  </Button>
                </div>
              </CardBody>
            </Card>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900">Security Settings</h2>
              </CardHeader>
              <CardBody className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Two-Factor Authentication</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">
                        An extra layer of security is active. A verification code is required at every login.
                      </p>
                      <Badge variant="success" className="mt-1">Enabled</Badge>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Password</h3>
                  <p className="text-sm text-gray-600">
                    Your password is securely hashed using bcrypt. Password change is not available in this version.
                  </p>
                </div>
              </CardBody>
            </Card>
          )}

          {/* OTHER TABS — placeholder */}
          {['notifications', 'language', 'appearance', 'billing'].includes(activeTab) && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900 capitalize">{activeTab}</h2>
              </CardHeader>
              <CardBody>
                <p className="text-gray-500 text-center py-8">
                  This section is coming soon.
                </p>
              </CardBody>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
};