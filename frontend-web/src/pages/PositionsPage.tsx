import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { apiService } from '@/services/api';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { Layout } from '@/components/Layout';

interface Position {
  id: string;
  title: string;
  level: string;
  salaryRange: string;
  createdAt: string;
  updatedAt: string;
}

interface PositionFormData {
  title: string;
  level: string;
  salaryRange: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function PositionsPage() {
  const { t } = useTranslation();
  const [positions, setPositions] = useState<Position[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [formData, setFormData] = useState<PositionFormData>({
    title: '',
    level: '',
    salaryRange: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<PositionFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Confirmation modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'create' | 'update' | 'delete' | null>(null);
  const [confirmMessage, setConfirmMessage] = useState('');

  const fetchPositions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getPositions(
        pagination.page,
        pagination.limit,
        sortBy,
        sortOrder
      );
      
      if (response.success) {
        setPositions(response.data || []);
        setPagination(response.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        });
      } else {
        setError(response.message || 'Failed to fetch positions');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to fetch positions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
  }, [pagination.page, pagination.limit, sortBy, sortOrder]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (newLimit: number) => {
    setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  // Modal functions
  const openCreateModal = () => {
    setIsEditing(false);
    setEditingPosition(null);
    setFormData({ title: '', level: '', salaryRange: '' });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (position: Position) => {
    setIsEditing(true);
    setEditingPosition(position);
    setFormData({
      title: position.title,
      level: position.level,
      salaryRange: position.salaryRange,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setEditingPosition(null);
    setFormData({ title: '', level: '', salaryRange: '' });
    setFormErrors({});
  };

  // Form validation
  const validateForm = (): boolean => {
    const errors: Partial<PositionFormData> = {};
    
    if (!formData.title.trim()) {
      errors.title = String(t('forms.validation.required'));
    }
    
    if (!formData.level.trim()) {
      errors.level = String(t('forms.validation.required'));
    }
    
    if (!formData.salaryRange.trim()) {
      errors.salaryRange = String(t('forms.validation.required'));
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Confirmation functions
  const showConfirmation = (action: 'create' | 'update' | 'delete', message: string) => {
    setConfirmAction(action);
    setConfirmMessage(message);
    setShowConfirmModal(true);
  };

  const handleConfirm = async () => {
    if (!confirmAction) return;
    
    setShowConfirmModal(false);
    setIsSubmitting(true);
    
    try {
      if (confirmAction === 'create') {
        await apiService.createPosition(formData);
        setConfirmMessage(String(t('pages.positions.created')));
      } else if (confirmAction === 'update' && editingPosition) {
        await apiService.updatePosition(editingPosition.id, formData);
        setConfirmMessage(String(t('pages.positions.updated')));
      } else if (confirmAction === 'delete' && editingPosition) {
        await apiService.deletePosition(editingPosition.id);
        setConfirmMessage(String(t('pages.positions.deleted')));
      }
      
      closeModal();
      await fetchPositions();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = () => {
    if (!validateForm()) return;
    
    const action = isEditing ? 'update' : 'create';
    const message = isEditing 
      ? String(t('pages.positions.confirmUpdate'))
      : String(t('pages.positions.confirmCreate'));
    
    showConfirmation(action, message);
  };

  const handleDelete = (position: Position) => {
    setEditingPosition(position);
    showConfirmation('delete', String(t('pages.positions.confirmDelete')));
  };

  return (
    <Layout>
              {/* Page Header */}
              <div className="mb-8">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-primary">{String(t('navigation.positions'))}</h2>
                    <p className="text-secondary">{String(t('pages.positions.subtitle'))}</p>
                  </div>
                  <button 
                    onClick={openCreateModal}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>{String(t('pages.positions.create'))}</span>
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 rounded-md bg-red-50 border border-red-200 p-4">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-red-800">{error}</div>
                  </div>
                </div>
              )}

              {/* Table Controls */}
              <div className="mb-4 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-secondary">
                    {String(t('common.show'))}:
                  </label>
                  <select
                    value={pagination.limit}
                    onChange={(e) => handleLimitChange(Number(e.target.value))}
                    className="border border-primary bg-primary text-primary rounded-md px-3 py-1 text-sm"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
                
                <div className="text-sm text-secondary">
                  {String(t('common.showing'))} {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} {String(t('common.of'))} {pagination.total} {String(t('common.results'))}
                </div>
              </div>

              {/* Table */}
              <div className="bg-primary border border-primary rounded-lg shadow-theme overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-primary">
                    <thead className="bg-tertiary">
                      <tr>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider cursor-pointer hover:bg-primary"
                          onClick={() => handleSort('title')}
                        >
                          {String(t('pages.positions.title'))} {getSortIcon('title')}
                        </th>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider cursor-pointer hover:bg-primary"
                          onClick={() => handleSort('level')}
                        >
                          {String(t('pages.positions.level'))} {getSortIcon('level')}
                        </th>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider cursor-pointer hover:bg-primary"
                          onClick={() => handleSort('salaryRange')}
                        >
                          {String(t('pages.positions.salaryRange'))} {getSortIcon('salaryRange')}
                        </th>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider cursor-pointer hover:bg-primary"
                          onClick={() => handleSort('createdAt')}
                        >
                          {String(t('pages.positions.createdAt'))} {getSortIcon('createdAt')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                          {String(t('common.actions'))}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-primary divide-y divide-primary">
                      {loading ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 text-center text-secondary">
                            {String(t('common.loading'))}
                          </td>
                        </tr>
                      ) : positions.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 text-center text-secondary">
                            {String(t('pages.positions.noPositions'))}
                          </td>
                        </tr>
                      ) : (
                        positions.map((position) => (
                          <tr key={position.id} className="hover:bg-tertiary">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                              {position.title}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                              {position.level}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                              {position.salaryRange}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                              {new Date(position.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button 
                                  onClick={() => openEditModal(position)}
                                  className="text-accent-primary hover:text-accent-primary-hover"
                                  title={String(t('common.edit'))}
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button 
                                  onClick={() => handleDelete(position)}
                                  className="text-accent-danger hover:text-red-700"
                                  title={String(t('common.delete'))}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-secondary-300 text-sm font-medium rounded-md text-secondary-700 bg-white hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {String(t('common.previous'))}
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-secondary-300 text-sm font-medium rounded-md text-secondary-700 bg-white hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {String(t('common.next'))}
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-secondary">
                        {String(t('common.showing'))} <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> {String(t('common.to'))} <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> {String(t('common.of'))} <span className="font-medium">{pagination.total}</span> {String(t('common.results'))}
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => handlePageChange(pagination.page - 1)}
                          disabled={pagination.page === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-secondary-300 bg-white text-sm font-medium text-secondary-500 hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {String(t('common.previous'))}
                        </button>
                        
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                          const pageNum = i + 1;
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                pagination.page === pageNum
                                  ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                                  : 'bg-white border-secondary-300 text-secondary-500 hover:bg-secondary-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        
                        <button
                          onClick={() => handlePageChange(pagination.page + 1)}
                          disabled={pagination.page === pagination.totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-secondary-300 bg-white text-sm font-medium text-secondary-500 hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {String(t('common.next'))}
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}

              {/* Position Modal */}
              {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                  <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeModal}></div>
                    
                    <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                      <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-medium text-gray-900">
                            {isEditing ? String(t('pages.positions.edit')) : String(t('pages.positions.create'))}
                          </h3>
                          <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                            <X className="h-6 w-6" />
                          </button>
                        </div>
                        
                        <form className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {String(t('pages.positions.title'))}
                            </label>
                            <input
                              type="text"
                              value={formData.title}
                              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                                formErrors.title ? 'border-red-500' : 'border-gray-300'
                              }`}
                              placeholder={String(t('pages.positions.title'))}
                            />
                            {formErrors.title && (
                              <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>
                            )}
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {String(t('pages.positions.level'))}
                            </label>
                            <input
                              type="text"
                              value={formData.level}
                              onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                                formErrors.level ? 'border-red-500' : 'border-gray-300'
                              }`}
                              placeholder={String(t('pages.positions.level'))}
                            />
                            {formErrors.level && (
                              <p className="mt-1 text-sm text-red-600">{formErrors.level}</p>
                            )}
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {String(t('pages.positions.salaryRange'))}
                            </label>
                            <input
                              type="text"
                              value={formData.salaryRange}
                              onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
                              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                                formErrors.salaryRange ? 'border-red-500' : 'border-gray-300'
                              }`}
                              placeholder={String(t('pages.positions.salaryRange'))}
                            />
                            {formErrors.salaryRange && (
                              <p className="mt-1 text-sm text-red-600">{formErrors.salaryRange}</p>
                            )}
                          </div>
                        </form>
                      </div>
                      
                      <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                          onClick={handleFormSubmit}
                          disabled={isSubmitting}
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                        >
                          {isSubmitting ? String(t('common.loading')) : String(t('common.save'))}
                        </button>
                        <button
                          onClick={closeModal}
                          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                          {String(t('common.cancel'))}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Confirmation Modal */}
              {showConfirmModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                  <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
                    
                    <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                      <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                          </div>
                          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                              {String(t('common.confirm'))}
                            </h3>
                            <div className="mt-2">
                              <p className="text-sm text-gray-500">
                                {confirmMessage}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                          onClick={handleConfirm}
                          disabled={isSubmitting}
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                        >
                          {isSubmitting ? String(t('common.loading')) : String(t('common.confirm'))}
                        </button>
                        <button
                          onClick={() => setShowConfirmModal(false)}
                          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                          {String(t('common.cancel'))}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
    </Layout>
  );
}
