import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Link } from 'react-router-dom';
import { usersAPI } from '../../services/api';

export const InvestorsPage: React.FC = () => {
  const [investors, setInvestors] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('business_nexus_token') || '';

  useEffect(() => {
    fetchInvestors();
  }, []);

  const fetchInvestors = async () => {
    try {
      const data = await usersAPI.getByRole(token, 'investor');
      setInvestors(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching investors:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredInvestors = investors.filter(investor =>
    searchQuery === '' ||
    investor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    investor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (investor.bio && investor.bio.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Find Investors</h1>
        <p className="text-gray-600">Connect with investors who match your startup's needs</p>
      </div>

      <div className="flex items-center gap-4">
        <Input
          placeholder="Search investors by name or bio..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          startAdornment={<Search size={18} />}
          fullWidth
        />
        <span className="text-sm text-gray-600">{filteredInvestors.length} results</span>
      </div>

      {loading ? (
        <p className="text-gray-500 text-center py-8">Loading investors...</p>
      ) : filteredInvestors.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No investors found</p>
          <p className="text-gray-400 text-sm mt-1">Investors will appear here once they register</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInvestors.map((investor: any) => (
            <Card key={investor._id}>
              <CardBody>
                <div className="flex items-start gap-4">
                  <Avatar
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(investor.name)}&background=random`}
                    alt={investor.name}
                    size="lg"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900">{investor.name}</h3>
                    <p className="text-sm text-gray-500">{investor.email}</p>
                    <Badge variant="primary" className="mt-1">Investor</Badge>
                  </div>
                </div>

                {investor.bio && (
                  <p className="text-sm text-gray-600 mt-3 line-clamp-2">{investor.bio}</p>
                )}

                {investor.preferences && (
                  <p className="text-xs text-gray-500 mt-2">
                    <span className="font-medium">Preferences:</span> {investor.preferences}
                  </p>
                )}

                <div className="mt-4 flex gap-2">
                  <Link to={`/profile/investor/${investor._id}`} className="flex-1">
                    <Button variant="outline" size="sm" fullWidth>
                      View Profile
                    </Button>
                  </Link>
                  <Link to={`/chat/${investor._id}`} className="flex-1">
                    <Button size="sm" fullWidth>
                      Message
                    </Button>
                  </Link>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};