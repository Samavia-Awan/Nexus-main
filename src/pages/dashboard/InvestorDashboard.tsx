import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, PieChart, Filter, Search, PlusCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import { usersAPI } from '../../services/api';

export const InvestorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [entrepreneurs, setEntrepreneurs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('business_nexus_token') || '';

  useEffect(() => {
    fetchEntrepreneurs();
  }, []);

  const fetchEntrepreneurs = async () => {
    try {
      const data = await usersAPI.getByRole(token, 'entrepreneur');
      setEntrepreneurs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching entrepreneurs:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const filteredEntrepreneurs = entrepreneurs.filter(entrepreneur =>
    searchQuery === '' ||
    entrepreneur.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (entrepreneur.bio && entrepreneur.bio.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Discover Startups</h1>
          <p className="text-gray-600">Find and connect with promising entrepreneurs</p>
        </div>
        <Link to="/entrepreneurs">
          <Button leftIcon={<PlusCircle size={18} />}>
            View All Startups
          </Button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-2/3">
          <Input
            placeholder="Search startups or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            startAdornment={<Search size={18} />}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary-50 border border-primary-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 rounded-full mr-4">
                <Users size={20} className="text-primary-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-primary-700">Total Startups</p>
                <h3 className="text-xl font-semibold text-primary-900">{entrepreneurs.length}</h3>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-secondary-50 border border-secondary-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-secondary-100 rounded-full mr-4">
                <PieChart size={20} className="text-secondary-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-700">Registered Users</p>
                <h3 className="text-xl font-semibold text-secondary-900">{entrepreneurs.length}</h3>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-accent-50 border border-accent-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-accent-100 rounded-full mr-4">
                <Users size={20} className="text-accent-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-accent-700">Welcome</p>
                <h3 className="text-xl font-semibold text-accent-900">{user.name}</h3>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium text-gray-900">Featured Startups</h2>
        </CardHeader>
        <CardBody>
          {loading ? (
            <p className="text-center text-gray-500 py-8">Loading startups...</p>
          ) : filteredEntrepreneurs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No startups found</p>
              <p className="text-gray-400 text-sm mt-1">Entrepreneurs will appear here once they register</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEntrepreneurs.map((entrepreneur: any) => (
                <Card key={entrepreneur._id}>
                  <CardBody>
                    <div className="flex items-start gap-3">
                      <Avatar
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(entrepreneur.name)}&background=random`}
                        alt={entrepreneur.name}
                        size="md"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900">{entrepreneur.name}</h3>
                        <p className="text-xs text-gray-500">{entrepreneur.email}</p>
                        <Badge variant="primary" className="mt-1">Entrepreneur</Badge>
                      </div>
                    </div>
                    {entrepreneur.bio && (
                      <p className="text-xs text-gray-600 mt-2 line-clamp-2">{entrepreneur.bio}</p>
                    )}
                    <div className="mt-3 flex gap-2">
                      <Link to={`/profile/entrepreneur/${entrepreneur._id}`} className="flex-1">
                        <Button variant="outline" size="sm" fullWidth>View Profile</Button>
                      </Link>
                      <Link to={`/chat/${entrepreneur._id}`} className="flex-1">
                        <Button size="sm" fullWidth>Message</Button>
                      </Link>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};