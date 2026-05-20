import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Bell, Calendar, TrendingUp, AlertCircle, PlusCircle, Clock, User, Check, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { CollaborationRequestCard } from '../../components/collaboration/CollaborationRequestCard';
import { InvestorCard } from '../../components/investor/InvestorCard';
import { useAuth } from '../../context/AuthContext';
import { CollaborationRequest } from '../../types';
import { getRequestsForEntrepreneur } from '../../data/collaborationRequests';
import { investors } from '../../data/users';

export const EntrepreneurDashboard: React.FC = () => {
  const { user } = useAuth();
  const [collaborationRequests, setCollaborationRequests] = useState<CollaborationRequest[]>([]);
  const [recommendedInvestors] = useState(investors.slice(0, 3));
  const [meetings, setMeetings] = useState<any[]>([]);
  const [meetingLoading, setMeetingLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    if (user) {
      const requests = getRequestsForEntrepreneur(user.id);
      setCollaborationRequests(requests);
      fetchMeetings();
    }
  }, [user]);

  const fetchMeetings = async () => {
    const token = localStorage.getItem('business_nexus_token') || '';
    try {
      const response = await fetch('http://localhost:5000/api/meetings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      console.log('Fetched meetings:', data);
      setMeetings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching meetings:', err);
    }
  };

  const handleSchedule = async () => {
    const token = localStorage.getItem('business_nexus_token') || '';
    if (!title || !date || !startTime || !endTime) {
      alert('Please fill in title, date, start time and end time!');
      return;
    }
    if (!token) {
      alert('You are not logged in!');
      return;
    }
    setMeetingLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, description, date, startTime, endTime })
      });
      const data = await response.json();
      if (data._id) {
        alert('Meeting scheduled successfully!');
        setShowForm(false);
        setTitle(''); setDescription(''); setDate(''); setStartTime(''); setEndTime('');
        await fetchMeetings();
      } else {
        alert('Error: ' + (data.message || 'Failed to schedule meeting'));
      }
    } catch (err) {
      alert('Failed to schedule meeting!');
    } finally {
      setMeetingLoading(false);
    }
  };

  const handleAccept = async (id: string) => {
    const token = localStorage.getItem('business_nexus_token') || '';
    try {
      await fetch(`http://localhost:5000/api/meetings/${id}/accept`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      await fetchMeetings();
    } catch (err) {
      console.error('Error accepting meeting:', err);
    }
  };

  const handleReject = async (id: string) => {
    const token = localStorage.getItem('business_nexus_token') || '';
    try {
      await fetch(`http://localhost:5000/api/meetings/${id}/reject`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      await fetchMeetings();
    } catch (err) {
      console.error('Error rejecting meeting:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'text-green-600 bg-green-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      case 'cancelled': return 'text-gray-600 bg-gray-50';
      default: return 'text-yellow-600 bg-yellow-50';
    }
  };

  const handleRequestStatusUpdate = (requestId: string, status: 'accepted' | 'rejected') => {
    setCollaborationRequests(prev =>
      prev.map(req => req.id === requestId ? { ...req, status } : req)
    );
  };

  if (!user) return null;

  const pendingRequests = collaborationRequests.filter(req => req.status === 'pending');
  const acceptedMeetings = meetings.filter(m => m.status === 'accepted');
  const pendingMeetings = meetings.filter(m => m.status === 'pending');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.name}</h1>
          <p className="text-gray-600">Here's what's happening with your startup today</p>
        </div>
        <Link to="/investors">
          <Button leftIcon={<PlusCircle size={18} />}>Find Investors</Button>
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-primary-50 border border-primary-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-full mr-3">
                <Bell size={18} className="text-primary-700" />
              </div>
              <div>
                <p className="text-xs font-medium text-primary-700">Pending Requests</p>
                <h3 className="text-xl font-semibold text-primary-900">{pendingRequests.length}</h3>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-secondary-50 border border-secondary-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-2 bg-secondary-100 rounded-full mr-3">
                <Users size={18} className="text-secondary-700" />
              </div>
              <div>
                <p className="text-xs font-medium text-secondary-700">Total Connections</p>
                <h3 className="text-xl font-semibold text-secondary-900">
                  {collaborationRequests.filter(req => req.status === 'accepted').length}
                </h3>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-accent-50 border border-accent-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-2 bg-accent-100 rounded-full mr-3">
                <Calendar size={18} className="text-accent-700" />
              </div>
              <div>
                <p className="text-xs font-medium text-accent-700">Total Meetings</p>
                <h3 className="text-xl font-semibold text-accent-900">{meetings.length}</h3>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-success-50 border border-success-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-full mr-3">
                <TrendingUp size={18} className="text-success-700" />
              </div>
              <div>
                <p className="text-xs font-medium text-success-700">Accepted Meetings</p>
                <h3 className="text-xl font-semibold text-success-900">{acceptedMeetings.length}</h3>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          {/* Collaboration Requests */}
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Collaboration Requests</h2>
              <Badge variant="primary">{pendingRequests.length} pending</Badge>
            </CardHeader>
            <CardBody>
              {collaborationRequests.length > 0 ? (
                <div className="space-y-4">
                  {collaborationRequests.map(request => (
                    <CollaborationRequestCard
                      key={request.id}
                      request={request}
                      onStatusUpdate={handleRequestStatusUpdate}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <AlertCircle size={24} className="text-gray-500" />
                  </div>
                  <p className="text-gray-600">No collaboration requests yet</p>
                  <p className="text-sm text-gray-500 mt-1">When investors are interested in your startup, their requests will appear here</p>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Meetings Section */}
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">
                Meetings
                {meetings.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-500">({meetings.length} total)</span>
                )}
              </h2>
              <Button onClick={() => setShowForm(!showForm)}>
                {showForm ? 'Cancel' : 'Schedule Meeting'}
              </Button>
            </CardHeader>

            <CardBody className="space-y-4">
              {/* Schedule Form */}
              {showForm && (
                <div className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50">
                  <h3 className="text-sm font-semibold text-gray-800">Schedule New Meeting</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Meeting title"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Meeting description"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Time *</label>
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleSchedule}
                    disabled={meetingLoading}
                    className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 disabled:opacity-50 text-sm font-medium"
                  >
                    {meetingLoading ? 'Scheduling...' : 'Schedule Meeting'}
                  </button>
                </div>
              )}

              {/* Meetings List */}
              {meetings.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No meetings scheduled yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {meetings.map((meeting: any) => (
                    <div key={meeting._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-base font-medium text-gray-900">{meeting.title}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(meeting.status)}`}>
                              {meeting.status}
                            </span>
                          </div>
                          {meeting.description && (
                            <p className="text-gray-600 text-sm mb-2">{meeting.description}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar size={14} />
                              <span>{new Date(meeting.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock size={14} />
                              <span>{meeting.startTime} - {meeting.endTime}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <User size={14} />
                              <span>{meeting.organizer?.name || 'You'}</span>
                            </div>
                          </div>
                        </div>
                        {meeting.status === 'pending' && (
                          <div className="flex flex-col gap-2 ml-3">
                            <button
                              onClick={() => handleAccept(meeting._id)}
                              className="flex items-center px-2 py-1 text-xs text-green-600 border border-green-600 rounded-md hover:bg-green-50"
                            >
                              <Check size={12} className="mr-1" /> Accept
                            </button>
                            <button
                              onClick={() => handleReject(meeting._id)}
                              className="flex items-center px-2 py-1 text-xs text-red-600 border border-red-600 rounded-md hover:bg-red-50"
                            >
                              <X size={12} className="mr-1" /> Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

        </div>

        {/* Recommended Investors */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Recommended Investors</h2>
              <Link to="/investors" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                View all
              </Link>
            </CardHeader>
            <CardBody className="space-y-4">
              {recommendedInvestors.map(investor => (
                <InvestorCard key={investor.id} investor={investor} showActions={false} />
              ))}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};