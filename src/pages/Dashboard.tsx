
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, 
  Users, 
  History, 
  TrendingUp, 
  Calendar,
  Mic,
  Plus,
  Star,
  Download,
  Filter
} from 'lucide-react';
import { useCallHistory } from '@/hooks/useCallHistory';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useAgentTemplates } from '@/hooks/useAgentTemplates';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const { calls, isLoading: callsLoading } = useCallHistory();
  const { campaigns, isLoading: campaignsLoading } = useCampaigns();
  const { templates, categories, isLoading: templatesLoading } = useAgentTemplates();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Calculate metrics from calls data
  const metrics = {
    totalCalls: calls?.length || 0,
    successRate: calls?.length ? Math.round((calls.filter(call => call.status === 'completed').length / calls.length) * 100) : 0,
    totalDuration: calls?.reduce((sum, call) => sum + (call.duration || 0), 0) || 0,
    successfulCalls: calls?.filter(call => call.status === 'completed').length || 0
  };

  const recentCalls = calls?.slice(0, 5) || [];
  const activeCampaigns = campaigns?.filter(c => c.status === 'active') || [];

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  const handleUseTemplate = (template: any) => {
    navigate('/assistants', { 
      state: { 
        templateData: template.template_data,
        templateName: template.name 
      } 
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's your voice AI activity overview.</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button onClick={() => navigate('/voice-agents')}>
            <Mic className="w-4 h-4 mr-2" />
            Voice Agents
          </Button>
          <Button onClick={() => navigate('/assistants')}>
            <Plus className="w-4 h-4 mr-2" />
            Create Assistant
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {callsLoading ? '...' : metrics.totalCalls}
            </div>
            <p className="text-xs text-muted-foreground">
              +{Math.floor(metrics.totalCalls * 0.12)} from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {callsLoading ? '...' : `${metrics.successRate}%`}
            </div>
            <p className="text-xs text-muted-foreground">
              +2.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaignsLoading ? '...' : activeCampaigns.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {campaigns?.length || 0} total campaigns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Minutes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {callsLoading ? '...' : Math.floor(metrics.totalDuration / 60)}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.totalDuration} seconds total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Template Marketplace */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Agent Templates</CardTitle>
              <CardDescription>
                Pre-built AI agents ready to use in your campaigns
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border rounded-md px-3 py-1"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/marketplace')}
              >
                <Filter className="w-4 h-4 mr-1" />
                Browse All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {templatesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Loading templates...</div>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No templates available yet</p>
              <Button onClick={() => navigate('/assistants')}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Assistant
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.slice(0, 6).map((template) => (
                <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {template.description}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-yellow-600">
                        <Star className="w-4 h-4 fill-current" />
                        <span>{template.rating_average?.toFixed(1) || '0.0'}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1 mb-3">
                        <Badge variant="secondary" className="text-xs">
                          {template.category}
                        </Badge>
                        {template.tags.slice(0, 2).map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        Used {template.usage_count} times
                      </span>
                      <Button 
                        size="sm" 
                        onClick={() => handleUseTemplate(template)}
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Use Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Calls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <History className="w-5 h-5 mr-2" />
              Recent Calls
            </CardTitle>
          </CardHeader>
          <CardContent>
            {callsLoading ? (
              <div className="text-center py-4 text-gray-500">Loading calls...</div>
            ) : recentCalls.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No recent calls</div>
            ) : (
              <div className="space-y-3">
                {recentCalls.map((call) => (
                  <div key={call.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div className="flex-1">
                      <p className="font-medium">{call.phone_number}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(call.created_at).toLocaleDateString()} • {call.duration}s
                      </p>
                    </div>
                    <Badge variant={
                      call.status === 'completed' ? 'default' :
                      call.status === 'failed' ? 'destructive' : 
                      'secondary'
                    }>
                      {call.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Campaigns */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Active Campaigns
            </CardTitle>
          </CardHeader>
          <CardContent>
            {campaignsLoading ? (
              <div className="text-center py-4 text-gray-500">Loading campaigns...</div>
            ) : activeCampaigns.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <p className="mb-2">No active campaigns</p>
                <Button size="sm" onClick={() => navigate('/campaigns')}>
                  Create Campaign
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {activeCampaigns.slice(0, 5).map((campaign) => (
                  <div key={campaign.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div className="flex-1">
                      <p className="font-medium">{campaign.name}</p>
                      <p className="text-sm text-gray-500">
                        {campaign.completed_calls || 0} / {campaign.total_calls || 0} calls
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{campaign.success_rate || 0}%</p>
                      <p className="text-xs text-gray-500">success rate</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
