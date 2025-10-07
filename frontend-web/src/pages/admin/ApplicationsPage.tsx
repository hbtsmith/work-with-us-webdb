import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { apiService } from '@/services/api';
import { Application } from '@/types';
import { Layout } from '@/components/Layout';
import { toastUtils } from '@/utils/toast';
import { Eye, Trash2, Search, ChevronDown, FileText, Calendar, Briefcase } from 'lucide-react';

/**
 * Follow SOLID principles
 * DRY (Don't Repeat Yourself)
 * Single Responsibility Principle
 * Open/Closed Principle
 * Always use i18n for error messages or return messages
 * Always use ErrorHandler for error handling
 */

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function ApplicationsPage() {
  const { t, isLoading: i18nLoading } = useTranslation();
  
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  
  const [selectedJobFilter, setSelectedJobFilter] = useState<string>('');
  const [jobs, setJobs] = useState<any[]>([]);
  
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [loadingApplication, setLoadingApplication] = useState(false);

  const fetchJobs = useCallback(async () => {
    try {
      const response = await apiService.getJobs(1, 100, 'title', 'asc');
      if (response.success) {
        setJobs(response.data || []);
      }
    } catch (err: any) {
      console.error('Failed to fetch jobs:', err);
    }
  }, []);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      if (selectedJobFilter) {
        response = await apiService.getApplicationsByJob(selectedJobFilter, pagination.page, pagination.limit);
      } else {
        response = await apiService.getApplications(pagination.page, pagination.limit);
      }
      
      if (response.success) {
        setApplications(response.data || []);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      } else {
        toastUtils.error(response.message || String(t('pages.applications.fetchFailed')));
        setError(response.message || String(t('pages.applications.fetchFailed')));
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || String(t('pages.applications.fetchFailed'));
      toastUtils.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [selectedJobFilter, pagination.page, pagination.limit, t]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);
  
  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleView = async (applicationId: string) => {
    try {
      setLoadingApplication(true);
      setIsViewModalOpen(true);
      
      const response = await apiService.getApplicationById(applicationId);
      if (response.success && response.data) {
        setSelectedApplication(response.data);
      } else {
        toastUtils.error(response.message || String(t('pages.applications.fetchFailed')));
        setIsViewModalOpen(false);
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || String(t('pages.applications.fetchFailed'));
      toastUtils.error(errorMessage);
      setIsViewModalOpen(false);
    } finally {
      setLoadingApplication(false);
    }
  };
  
  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedApplication(null);
  };
  
  const handleDownloadResume = async (applicationId: string, filename: string) => {
    try {
      const blob = await apiService.downloadResume(applicationId);
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toastUtils.success(String(t('pages.applications.resumeDownloaded')));
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || String(t('pages.applications.downloadFailed'));
      toastUtils.error(errorMessage);
    }
  };
  
  const handleDelete = async (id: string) => {
    if (!confirm(String(t('pages.applications.confirmDelete')))) {
      return;
    }
    
    try {
      const response = await apiService.deleteApplication(id);
      if (response.success) {
        toastUtils.success(String(t('pages.applications.deleted')));
        await fetchApplications();
      } else {
        toastUtils.error(response.message || String(t('pages.applications.deleteFailed')));
      }
    } catch (err: any) {
      toastUtils.error(err?.response?.data?.message || err?.message || String(t('pages.applications.deleteFailed')));
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return '-';
    }
    
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const filteredApplications = applications.filter(app => {
    if (!searchTerm) return true;
    
    const search = searchTerm.toLowerCase();
    return (
      app.job?.title?.toLowerCase().includes(search) ||
      app.id?.toLowerCase().includes(search)
    );
  });

  if (i18nLoading()) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-primary">{String(t('pages.applications.title'))}</h1>
            <p className="text-secondary">{String(t('pages.applications.subtitle'))}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-secondary" />
              </div>
              <input
                type="text"
                placeholder={String(t('pages.applications.searchPlaceholder'))}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>
          </div>
          <div className="relative">
            <select
              value={selectedJobFilter}
              onChange={(e) => setSelectedJobFilter(e.target.value)}
              className="input pr-10 appearance-none cursor-pointer"
            >
              <option value="">{String(t('pages.applications.allJobs'))}</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <ChevronDown className="h-5 w-5 text-secondary" />
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary"></div>
            <p className="mt-2 text-secondary">{String(t('common.loading'))}</p>
          </div>
        ) : (
          <>
            {/* Applications List */}
            {filteredApplications.length === 0 ? (
              <div className="text-center py-12 bg-primary rounded-lg border border-primary">
                <FileText className="mx-auto h-12 w-12 text-secondary" />
                <h3 className="mt-2 text-sm font-medium text-primary">{String(t('pages.applications.noApplications'))}</h3>
                <p className="mt-1 text-sm text-secondary">{String(t('pages.applications.noApplicationsDescription'))}</p>
              </div>
            ) : (
              <div className="bg-primary rounded-lg border border-primary overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-primary">
                    <thead className="bg-tertiary">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                          {String(t('pages.applications.candidate'))}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                          {String(t('pages.applications.job'))}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                          {String(t('pages.applications.submittedAt'))}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                          {String(t('pages.applications.resume'))}
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-secondary uppercase tracking-wider">
                          {String(t('pages.applications.actions'))}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-primary divide-y divide-primary">
                      {filteredApplications.map((application) => (
                        <tr key={application.id} className="hover:bg-tertiary transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div>
                                <div className="text-sm font-medium text-primary">
                                  {String(t('pages.applications.candidateId'))} #{application.id.substring(0, 8)}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <Briefcase className="h-4 w-4 text-secondary" />
                              <div className="text-sm text-primary">{application.job?.title || '-'}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-secondary" />
                              <div className="text-sm text-secondary">{formatDate(application.createdAt)}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {application.resumeUrl ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {String(t('pages.applications.hasResume'))}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {String(t('pages.applications.noResume'))}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleView(application.id)}
                                className="text-accent-primary hover:text-accent-primary-hover transition-colors"
                                title={String(t('pages.applications.view'))}
                              >
                                <Eye className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(application.id)}
                                className="text-accent-danger hover:text-red-700 transition-colors"
                                title={String(t('pages.applications.delete'))}
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="bg-tertiary px-6 py-4 flex items-center justify-between border-t border-primary">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="relative inline-flex items-center px-4 py-2 border border-primary text-sm font-medium rounded-md text-primary bg-primary hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {String(t('common.previous'))}
                      </button>
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-primary text-sm font-medium rounded-md text-primary bg-primary hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {String(t('common.next'))}
                      </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-secondary">
                          {String(t('common.showing'))} <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> {String(t('common.to'))} <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> {String(t('common.of'))} <span className="font-medium">{pagination.total}</span> {String(t('pages.applications.results'))}
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                          <button
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={pagination.page === 1}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-primary bg-primary text-sm font-medium text-secondary hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {String(t('common.previous'))}
                          </button>
                          {[...Array(pagination.totalPages)].map((_, i) => (
                            <button
                              key={i + 1}
                              onClick={() => handlePageChange(i + 1)}
                              className={`relative inline-flex items-center px-4 py-2 border border-primary text-sm font-medium ${
                                pagination.page === i + 1
                                  ? 'z-10 bg-accent-primary text-white'
                                  : 'bg-primary text-primary hover:bg-secondary'
                              }`}
                            >
                              {i + 1}
                            </button>
                          ))}
                          <button
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={pagination.page === pagination.totalPages}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-primary bg-primary text-sm font-medium text-secondary hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {String(t('common.next'))}
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
      
      {/* View Application Modal */}
      {isViewModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[50]">
          <div className="bg-primary rounded-lg shadow-theme w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-primary">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-primary">
                  {String(t('pages.applications.viewDetails'))}
                </h3>
                <button
                  onClick={closeViewModal}
                  className="text-secondary hover:text-primary transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-140px)]">
              {loadingApplication ? (
                <div className="flex items-center justify-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary"></div>
                </div>
              ) : selectedApplication ? (
                <div className="space-y-6">
                  {/* Job Information */}
                  <div className="bg-secondary rounded-lg p-4">
                    <h4 className="text-md font-semibold text-primary mb-3 flex items-center">
                      <Briefcase className="h-5 w-5 mr-2" />
                      {String(t('pages.applications.jobInfo'))}
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-secondary">{String(t('pages.applications.jobTitle'))}:</span>
                        <span className="text-sm text-primary ml-2">{selectedApplication.job?.title}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-secondary">{String(t('pages.applications.position'))}:</span>
                        <span className="text-sm text-primary ml-2">
                          {selectedApplication.job?.position?.title} - {selectedApplication.job?.position?.level}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-secondary">{String(t('pages.applications.salary'))}:</span>
                        <span className="text-sm text-primary ml-2">{selectedApplication.job?.position?.salaryRange}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Application Date */}
                  <div className="bg-secondary rounded-lg p-4">
                    <h4 className="text-md font-semibold text-primary mb-3 flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      {String(t('pages.applications.submissionDate'))}
                    </h4>
                    <p className="text-sm text-primary">{formatDate(selectedApplication.createdAt)}</p>
                  </div>
                  
                  {/* Answers */}
                  <div className="bg-secondary rounded-lg p-4">
                    <h4 className="text-md font-semibold text-primary mb-3">
                      {String(t('pages.applications.answers'))}
                    </h4>
                    <div className="space-y-4">
                      {selectedApplication.answers && selectedApplication.answers.length > 0 ? (
                        (() => {
                          // Group answers by questionId to handle multiple answers for the same question
                          const groupedAnswers = selectedApplication.answers.reduce((acc: any, answer: any) => {
                            if (!acc[answer.questionId]) {
                              acc[answer.questionId] = {
                                question: answer.question,
                                answers: []
                              };
                            }
                            acc[answer.questionId].answers.push(answer);
                            return acc;
                          }, {});
                          
                          return Object.values(groupedAnswers).map((group: any, index: number) => (
                            <div key={index} className="border-b border-primary pb-3 last:border-0">
                              <p className="text-sm font-medium text-primary mb-2">
                                {group.question.label}
                                {group.question.isRequired && <span className="text-red-500 ml-1">*</span>}
                              </p>
                              <div className="text-sm text-secondary">
                                {group.question.type === 'SHORT_TEXT' || group.question.type === 'LONG_TEXT' ? (
                                  <p className="whitespace-pre-wrap">{group.answers[0].textValue || '-'}</p>
                                ) : group.question.type === 'SINGLE_CHOICE' ? (
                                  <p>{group.answers[0].questionOption?.label || '-'}</p>
                                ) : group.question.type === 'MULTIPLE_CHOICE' ? (
                                  <ul className="list-disc list-inside">
                                    {group.answers.map((answer: any, idx: number) => (
                                      <li key={idx}>{answer.questionOption?.label || '-'}</li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p>-</p>
                                )}
                              </div>
                            </div>
                          ));
                        })()
                      ) : (
                        <p className="text-sm text-secondary">{String(t('pages.applications.noAnswers'))}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Resume Download */}
                  {selectedApplication.resumeUrl && (
                    <div className="bg-secondary rounded-lg p-4">
                      <h4 className="text-md font-semibold text-primary mb-3 flex items-center">
                        <FileText className="h-5 w-5 mr-2" />
                        {String(t('pages.applications.resume'))}
                      </h4>
                      <button
                        onClick={() => handleDownloadResume(selectedApplication.id, selectedApplication.resumeUrl!)}
                        className="inline-flex items-center px-4 py-2 bg-accent-primary text-white rounded-md hover:bg-accent-primary-hover transition-colors"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        {String(t('pages.applications.downloadResume'))}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center text-secondary py-8">{String(t('pages.applications.noData'))}</p>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-primary flex justify-end">
              <button
                onClick={closeViewModal}
                className="px-4 py-2 text-sm font-medium text-primary bg-tertiary hover:bg-secondary rounded-md border border-primary transition-colors"
              >
                {String(t('common.close'))}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
