import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import CampaignList from '@/components/CampaignList';

const STATUS_TABS = [
  { id: null, label: 'All', count: null },
  { id: 'draft', label: 'Draft', count: null },
  { id: 'pending_approval', label: 'Pending Approval', count: null },
  { id: 'approved', label: 'Approved', count: null },
  { id: 'rejected', label: 'Rejected', count: null },
];

/**
 * MyCampaignsPage - Page for viewing and managing campaigns
 */
export default function MyCampaigns() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Campaigns</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track your email advertising campaigns
          </p>
        </div>
        <Button onClick={() => navigate('/campaigns/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Campaign
        </Button>
      </div>

      {/* Status Tabs */}
      <Card>
        <CardContent className="p-2">
          <div className="flex gap-2 overflow-x-auto">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.id || 'all'}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap',
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Campaign List */}
      <CampaignList statusFilter={activeTab} />
    </div>
  );
}

