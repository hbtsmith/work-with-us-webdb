import { useTranslation } from '@/hooks/useTranslation';
import { Briefcase, FileText, Users } from 'lucide-react';
import { Layout } from '@/components/Layout';

export function DashboardPage() {
  const { t } = useTranslation();

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
                      <p className="text-2xl font-semibold text-primary">12</p>
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
                      <p className="text-2xl font-semibold text-primary">48</p>
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
                      <p className="text-2xl font-semibold text-primary">8</p>
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
                      <p className="text-2xl font-semibold text-primary">85%</p>
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
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-primary">{String(t('pages.dashboard.newApplicationReceived', { position: 'Senior Developer' }))}</p>
                        <p className="text-xs text-tertiary">{String(t('pages.dashboard.hoursAgo', { count: 2 }))}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-primary">{String(t('pages.dashboard.jobPublished', { jobTitle: 'Frontend Developer' }))}</p>
                        <p className="text-xs text-tertiary">{String(t('pages.dashboard.hoursAgo', { count: 4 }))}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-2 w-2 bg-yellow-400 rounded-full"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-primary">{String(t('pages.dashboard.positionCreated', { positionTitle: 'Product Manager' }))}</p>
                        <p className="text-xs text-tertiary">{String(t('pages.dashboard.dayAgo', { count: 1 }))}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
    </Layout>
  );
}
