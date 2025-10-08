import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Briefcase, FileText, Users, Loader2 } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { apiService } from '@/services/api';

interface DashboardStats {
  activeJobs: number;
  totalApplications: number;
  totalPositions: number;
  successRate: number;
}

interface RecentActivity {
  id: string;
  type: 'application' | 'job' | 'position';
  title: string;
  description: string;
  timestamp: string;
}

export function DashboardPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStats>({
    activeJobs: 0,
    totalApplications: 0,
    totalPositions: 0,
    successRate: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch dashboard stats
      const statsResponse = await apiService.getDashboardStats();
      
      if (statsResponse.success) {
        const data = statsResponse.data;
        
        // Map the data correctly based on backend structure
        setStats({
          activeJobs: data.jobStats?.active || 0,
          totalApplications: data.totalApplications || 0,
          totalPositions: data.totalPositions || 0,
          successRate: 85, // TODO: Calculate based on real data
        });

        // Use recent applications from dashboard data
        if (data.recentApplications && Array.isArray(data.recentApplications)) {
          const activities: RecentActivity[] = data.recentApplications.map((app: any) => ({
            id: app.id,
            type: 'application' as const,
            title: String(t('pages.dashboard.newApplicationReceived', { position: app.job?.title || 'Unknown' })),
            description: `${app.candidateName || 'Anonymous'} applied`,
            timestamp: app.createdAt,
          }));
          setRecentActivity(activities);
        }
      } else {
        // Set default values if API fails
        setStats({
          activeJobs: 0,
          totalApplications: 0,
          totalPositions: 0,
          successRate: 0,
        });
      }
    } catch (err) {
      // Error fetching dashboard data - handled by UI state
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []); // Remove 't' dependency to prevent infinite loop

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]); // Include fetchDashboardData dependency

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return String(t('pages.dashboard.justNow'));
    if (diffInHours < 24) return String(t('pages.dashboard.hoursAgo', { count: diffInHours }));
    
    const diffInDays = Math.floor(diffInHours / 24);
    return String(t('pages.dashboard.daysAgo', { count: diffInDays }));
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-primary">{String(t('common.loading'))}</span>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-600">{error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-primary">{String(t('pages.dashboard.title'))}</h2>
        <p className="text-secondary">{String(t('pages.dashboard.subtitle'))}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-primary border border-primary rounded-lg shadow-theme p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Briefcase className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary">{String(t('pages.dashboard.activeJobs'))}</p>
              <p className="text-2xl font-semibold text-primary">{stats.activeJobs}</p>
            </div>
          </div>
        </div>

        <div className="bg-primary border border-primary rounded-lg shadow-theme p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FileText className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary">{String(t('pages.dashboard.applications'))}</p>
              <p className="text-2xl font-semibold text-primary">{stats.totalApplications}</p>
            </div>
          </div>
        </div>

        <div className="bg-primary border border-primary rounded-lg shadow-theme p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary">{String(t('pages.dashboard.positions'))}</p>
              <p className="text-2xl font-semibold text-primary">{stats.totalPositions}</p>
            </div>
          </div>
        </div>

        <div className="bg-primary border border-primary rounded-lg shadow-theme p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 font-semibold">%</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary">{String(t('pages.dashboard.successRate'))}</p>
              <p className="text-2xl font-semibold text-primary">{stats.successRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-primary border border-primary rounded-lg shadow-theme">
        <div className="px-6 py-4 border-b border-primary">
          <h3 className="text-lg font-medium text-primary">{String(t('pages.dashboard.recentActivity'))}</h3>
        </div>
        <div className="p-6">
          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className={`h-2 w-2 rounded-full ${
                      activity.type === 'application' ? 'bg-green-400' :
                      activity.type === 'job' ? 'bg-blue-400' :
                      'bg-yellow-400'
                    }`}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-primary">{activity.title}</p>
                    <p className="text-xs text-tertiary">{formatTimeAgo(activity.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-tertiary">{String(t('pages.dashboard.noRecentActivity'))}</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
