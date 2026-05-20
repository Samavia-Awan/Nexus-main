import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Check, X } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const MeetingsPage: React.FC = () => {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const token = localStorage.getItem('business_nexus_token') || '';

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/meetings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setMeetings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching meetings:', err);
    }
  };

  const handleSchedule = async () => {
    if (!title || !date || !startTime || !endTime) {
      alert('Please fill in title, date, start time and end time!');
      return;
    }

    if (!token) {
      alert('You are not logged in!');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description,
          date,
          startTime,
          endTime
        })
      });

      const data = await response.json();
      console.log('Meeting response:', data);

      if (data._id) {
        alert('Meeting scheduled successfully!');
        setShowForm(false);
        setTitle('');
        setDescription('');
        setDate('');
        setStartTime('');
        setEndTime('');
        await fetchMeetings();
      } else {
        alert('Error: ' + (data.message || 'Failed to schedule meeting'));
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Failed to schedule meeting!');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id: string) => {
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meetings</h1>
          <p className="text-gray-600">Schedule and manage your meetings</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Schedule Meeting'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">Schedule New Meeting</h2>
          </CardHeader>
          <CardBody className="space-y-4">
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
              disabled={loading}
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 disabled:opacity-50 text-sm font-medium"
            >
              {loading ? 'Scheduling...' : 'Schedule Meeting'}
            </button>
          </CardBody>
        </Card>
      )}

      <div className="space-y-4">
        {meetings.length === 0 ? (
          <Card>
            <CardBody>
              <div className="text-center py-8">
                <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No meetings scheduled yet</p>
              </div>
            </CardBody>
          </Card>
        ) : (
          meetings.map((meeting: any) => (
            <Card key={meeting._id}>
              <CardBody>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{meeting.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(meeting.status)}`}>
                        {meeting.status}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{meeting.description}</p>
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar size={16} />
                        <span>{new Date(meeting.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={16} />
                        <span>{meeting.startTime} - {meeting.endTime}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User size={16} />
                        <span>{meeting.organizer?.name || 'You'}</span>
                      </div>
                    </div>
                  </div>
                  {meeting.status === 'pending' && (
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleAccept(meeting._id)}
                        className="flex items-center px-3 py-1 text-sm text-green-600 border border-green-600 rounded-md hover:bg-green-50"
                      >
                        <Check size={16} className="mr-1" />
                        Accept
                      </button>
                      <button
                        onClick={() => handleReject(meeting._id)}
                        className="flex items-center px-3 py-1 text-sm text-red-600 border border-red-600 rounded-md hover:bg-red-50"
                      >
                        <X size={16} className="mr-1" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};