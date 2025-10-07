import { useState, useEffect, useRef } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { apiService } from '@/services/api';
import { Job, Question, Position } from '@/types';
import { Plus, Edit, Trash2, GripVertical, ChevronDown, Search, X } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { toastUtils } from '@/utils/toast';

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface QuestionFormData {
  label: string;
  type: 'SHORT_TEXT' | 'LONG_TEXT' | 'MULTIPLE_CHOICE' | 'SINGLE_CHOICE';
  isRequired: boolean;
}

interface JobFormData {
  title: string;
  description: string;
  slug: string;
  requiresResume: boolean;
  isActive: boolean;
  positionId: string;
}

export function JobsPage() {
  const { t } = useTranslation();
  const [jobs, setJobs] = useState<Job[]>([]);
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
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [activeTab, setActiveTab] = useState<'config' | 'questions'>('config');
  
  // Form states
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    description: '',
    slug: '',
    requiresResume: false,
    isActive: true,
    positionId: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<JobFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Positions and questions
  const [positions, setPositions] = useState<Position[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingPositions, setLoadingPositions] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  
  // Confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'delete' | 'save' | null>(null);
  const [confirmMessage, setConfirmMessage] = useState('');
  
  // Position select states
  const [isPositionSelectOpen, setIsPositionSelectOpen] = useState(false);
  const [positionSearchTerm, setPositionSearchTerm] = useState('');
  const [filteredPositions, setFilteredPositions] = useState<Position[]>([]);
  const positionSelectRef = useRef<HTMLDivElement>(null);

  // Question modal states
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [questionFormData, setQuestionFormData] = useState<QuestionFormData>({
    label: '',
    type: 'SHORT_TEXT',
    isRequired: false,
  });
  const [questionFormErrors, setQuestionFormErrors] = useState<{
    label?: string;
  }>({});
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);

  // Question Options modal states
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [managingQuestion, setManagingQuestion] = useState<Question | null>(null);
  const [questionOptions, setQuestionOptions] = useState<any[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  // Option form states
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);
  const [isEditingOption, setIsEditingOption] = useState(false);
  const [editingOption, setEditingOption] = useState<any>(null);
  const [optionFormData, setOptionFormData] = useState({
    label: '',
  });
  const [optionFormErrors, setOptionFormErrors] = useState<{
    label?: string;
  }>({});
  const [isSubmittingOption, setIsSubmittingOption] = useState(false);

  // Drag & Drop states
  const [draggedQuestion, setDraggedQuestion] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getJobs(
        pagination.page,
        pagination.limit,
        sortBy,
        sortOrder
      );
      
      if (response.success) {
        setJobs(response.data || []);
        setPagination(response.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        });
      } else {
        setError(response.message || 'Failed to fetch jobs');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
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
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
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
    setEditingJob(null);
    setActiveTab('config');
    setFormData({
      title: '',
      description: '',
      slug: '',
      requiresResume: false,
      isActive: true,
      positionId: '',
    });
    setFormErrors({});
    setQuestions([]);
    setIsModalOpen(true);
  };

  const openEditModal = (job: Job) => {
    setIsEditing(true);
    setEditingJob(job);
    setActiveTab('config');
    setFormData({
      title: job.title,
      description: job.description,
      slug: job.slug,
      requiresResume: job.requiresResume,
      isActive: job.isActive,
      positionId: job.position.id,
    });
    setFormErrors({});
    setIsModalOpen(true);
    fetchJobQuestions(job.id);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setEditingJob(null);
    setActiveTab('config');
    setFormData({
      title: '',
      description: '',
      slug: '',
      requiresResume: false,
      isActive: true,
      positionId: '',
    });
    setFormErrors({});
    setQuestions([]);
  };

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();
  };

  // Handle form input changes
  const handleInputChange = (field: keyof JobFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-generate slug when title changes
    if (field === 'title' && typeof value === 'string') {
      setFormData(prev => ({ 
        ...prev, 
        title: value,
        slug: generateSlug(value)
      }));
    }
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Fetch positions for select
  const fetchPositions = async () => {
    try {
      setLoadingPositions(true);
      const response = await apiService.getPositions(1, 100); // Get all positions
      if (response.success) {
        setPositions(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching positions:', err);
    } finally {
      setLoadingPositions(false);
    }
  };

  // Fetch job questions
  const fetchJobQuestions = async (jobId: string) => {
    try {
      setLoadingQuestions(true);
      const response = await apiService.getJobById(jobId);
      if (response.success && response.data) {
        setQuestions(response.data.questions || []);
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
      setQuestions([]);
    } finally {
      setLoadingQuestions(false);
    }
  };

  // Form validation
  const validateForm = (): boolean => {
    const errors: Partial<JobFormData> = {};
    
    if (!formData.title.trim()) {
      errors.title = String(t('validation.title_required'));
    }
    
    if (!formData.description.trim()) {
      errors.description = String(t('validation.description_required'));
    }
    
    if (!formData.slug.trim()) {
      errors.slug = String(t('validation.slug_required'));
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      errors.slug = String(t('validation.invalid_slug'));
    }
    
    if (!formData.positionId) {
      errors.positionId = String(t('validation.position_required'));
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Show confirmation modal
  const showConfirmation = (action: 'delete' | 'save', message: string) => {
    setConfirmAction(action);
    setConfirmMessage(message);
    setShowConfirmModal(true);
  };

  // Handle confirmation
  const handleConfirm = async () => {
    if (confirmAction === 'save') {
      await handleFormSubmit();
    } else if (confirmAction === 'delete' && editingJob) {
      await handleDelete(editingJob.id);
    }
    setShowConfirmModal(false);
    setConfirmAction(null);
    setConfirmMessage('');
  };

  // Handle form submission
  const handleFormSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setIsSubmitting(true);
      
      if (isEditing && editingJob) {
        const response = await apiService.updateJob(editingJob.id, formData);
        if (response.success) {
          toastUtils.success(String(t('pages.jobs.jobUpdated')));
          await fetchJobs();
          closeModal();
        } else {
          toastUtils.error(response.message || String(t('pages.jobs.jobUpdateFailed')));
        }
      } else {
        const response = await apiService.createJob(formData);
        if (response.success && response.data) {
          toastUtils.success(String(t('pages.jobs.jobCreated')));
          await fetchJobs();
          // Switch to questions tab for new job
          setActiveTab('questions');
          setEditingJob(response.data);
          setIsEditing(true);
        } else {
          toastUtils.error(response.message || String(t('pages.jobs.jobCreateFailed')));
        }
      }
    } catch (err: any) {
      toastUtils.error(err?.response?.data?.message || err?.message || String(t('pages.jobs.jobSaveFailed')));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (jobId: string) => {
    try {
      const response = await apiService.deleteJob(jobId);
      if (response.success) {
        toastUtils.success(String(t('pages.jobs.jobDeleted')));
        await fetchJobs();
        closeModal();
      } else {
        toastUtils.error(response.message || String(t('pages.jobs.jobDeleteFailed')));
      }
    } catch (err: any) {
      toastUtils.error(err?.response?.data?.message || err?.message || String(t('pages.jobs.jobDeleteFailed')));
    }
  };

  // Question modal functions
  const openQuestionModal = () => {
    setIsEditingQuestion(false);
    setEditingQuestion(null);
    setQuestionFormData({
      label: '',
      type: 'SHORT_TEXT',
      isRequired: false,
    });
    setQuestionFormErrors({});
    setIsQuestionModalOpen(true);
  };

  const openEditQuestionModal = (question: Question) => {
    setIsEditingQuestion(true);
    setEditingQuestion(question);
    setQuestionFormData({
      label: question.label,
      type: question.type,
      isRequired: question.isRequired,
    });
    setQuestionFormErrors({});
    setIsQuestionModalOpen(true);
  };

  const closeQuestionModal = () => {
    setIsQuestionModalOpen(false);
    setIsEditingQuestion(false);
    setEditingQuestion(null);
    setQuestionFormData({
      label: '',
      type: 'SHORT_TEXT',
      isRequired: false,
    });
    setQuestionFormErrors({});
  };

  const validateQuestionForm = (): boolean => {
    const errors: {
      label?: string;
    } = {};

    if (!questionFormData.label.trim()) {
      errors.label = String(t('common.required'));
    }

    setQuestionFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleQuestionInputChange = (field: keyof QuestionFormData, value: any) => {
    setQuestionFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (field === 'label' && questionFormErrors.label) {
      setQuestionFormErrors(prev => ({
        ...prev,
        label: undefined
      }));
    }
  };


  const handleQuestionSubmit = async () => {
    if (!validateQuestionForm() || !editingJob) return;

    try {
      setIsSubmittingQuestion(true);

      const questionData = {
        ...questionFormData
      };

      let response;
      if (isEditingQuestion && editingQuestion) {
        // Update existing question
        response = await apiService.updateJobQuestion(editingJob.id, editingQuestion.id, questionData);
      } else {
        // Create new question
        const nextOrder = questions.length + 1;
        response = await apiService.createJobQuestion(editingJob.id, {
          ...questionData,
          order: nextOrder
        });
      }

      if (response.success) {
        toastUtils.success(String(t(`pages.jobs.question${isEditingQuestion ? 'Updated' : 'Created'}`)));
        await fetchJobQuestions(editingJob.id);
        closeQuestionModal();
      } else {
        toastUtils.error(response.message || String(t(`pages.jobs.question${isEditingQuestion ? 'UpdateFailed' : 'CreateFailed'}`)));
      }
    } catch (err: any) {
      toastUtils.error(err?.response?.data?.message || err?.message || String(t(`pages.jobs.question${isEditingQuestion ? 'UpdateFailed' : 'CreateFailed'}`)));
    } finally {
      setIsSubmittingQuestion(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!editingJob) return;

    try {
      const response = await apiService.deleteJobQuestion(editingJob.id, questionId);
      if (response.success) {
        toastUtils.success(String(t('pages.jobs.questionDeleted')));
        await fetchJobQuestions(editingJob.id);
      } else {
        toastUtils.error(response.message || String(t('pages.jobs.questionDeleteFailed')));
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || String(t('pages.jobs.questionDeleteFailed'));
      toastUtils.error(errorMessage);
    }
  };

  // Question Options management functions
  const handleManageQuestionOptions = async (question: Question) => {
    setManagingQuestion(question);
    setIsOptionsModalOpen(true);
    await fetchQuestionOptions(question.id);
  };

  const fetchQuestionOptions = async (questionId: string) => {
    try {
      setLoadingOptions(true);
      const response = await apiService.getQuestionOptions(questionId);
      if (response.success) {
        setQuestionOptions(response.data || []);
      } else {
        toastUtils.error(response.message || String(t('pages.jobs.optionsFetchFailed')));
      }
    } catch (err: any) {
      toastUtils.error(err?.response?.data?.message || err?.message || String(t('pages.jobs.optionsFetchFailed')));
    } finally {
      setLoadingOptions(false);
    }
  };

  const closeOptionsModal = () => {
    setIsOptionsModalOpen(false);
    setManagingQuestion(null);
    setQuestionOptions([]);
  };

  const handleAddOption = () => {
    setIsEditingOption(false);
    setEditingOption(null);
    setOptionFormData({ label: '' });
    setOptionFormErrors({});
    setIsOptionModalOpen(true);
  };

  const handleEditOption = (option: any) => {
    setIsEditingOption(true);
    setEditingOption(option);
    setOptionFormData({ label: option.label });
    setOptionFormErrors({});
    setIsOptionModalOpen(true);
  };

  const closeOptionModal = () => {
    setIsOptionModalOpen(false);
    setIsEditingOption(false);
    setEditingOption(null);
    setOptionFormData({ label: '' });
    setOptionFormErrors({});
  };

  const validateOptionForm = (): boolean => {
    const errors: { label?: string } = {};

    if (!optionFormData.label.trim()) {
      errors.label = String(t('common.required'));
    }

    setOptionFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOptionSubmit = async () => {
    if (!validateOptionForm() || !managingQuestion) return;

    try {
      setIsSubmittingOption(true);

      let response;
      if (isEditingOption && editingOption) {
        // Update existing option
        response = await apiService.updateQuestionOption(managingQuestion.id, editingOption.id, optionFormData);
      } else {
        // Create new option
        response = await apiService.createQuestionOption(managingQuestion.id, optionFormData);
      }

      if (response.success) {
        toastUtils.success(String(t(`pages.jobs.option${isEditingOption ? 'Updated' : 'Created'}`)));
        await fetchQuestionOptions(managingQuestion.id);
        closeOptionModal();
      } else {
        toastUtils.error(response.message || String(t(`pages.jobs.option${isEditingOption ? 'UpdateFailed' : 'CreateFailed'}`)));
      }
    } catch (err: any) {
      toastUtils.error(err?.response?.data?.message || err?.message || String(t(`pages.jobs.option${isEditingOption ? 'UpdateFailed' : 'CreateFailed'}`)));
    } finally {
      setIsSubmittingOption(false);
    }
  };

  const handleDeleteOption = async (optionId: string) => {
    if (!managingQuestion) return;
    
    try {
      const response = await apiService.deleteQuestionOption(managingQuestion.id, optionId);
      if (response.success) {
        toastUtils.success(String(t('pages.jobs.optionDeleted')));
        await fetchQuestionOptions(managingQuestion.id);
      } else {
        toastUtils.error(response.message || String(t('pages.jobs.optionDeleteFailed')));
      }
    } catch (err: any) {
      toastUtils.error(err?.response?.data?.message || err?.message || String(t('pages.jobs.optionDeleteFailed')));
    }
  };

  // Drag & Drop functions
  const handleDragStart = (e: React.DragEvent, questionId: string) => {
    setDraggedQuestion(questionId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', questionId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetQuestionId: string) => {
    e.preventDefault();
    
    if (!draggedQuestion || !editingJob || draggedQuestion === targetQuestionId) {
      setDraggedQuestion(null);
      return;
    }

    try {
      setIsReordering(true);
      
      // Find the dragged and target questions
      const draggedIndex = questions.findIndex(q => q.id === draggedQuestion);
      const targetIndex = questions.findIndex(q => q.id === targetQuestionId);
      
      if (draggedIndex === -1 || targetIndex === -1) {
        setDraggedQuestion(null);
        return;
      }

      // Create new order array
      const newQuestions = [...questions];
      const [draggedItem] = newQuestions.splice(draggedIndex, 1);
      newQuestions.splice(targetIndex, 0, draggedItem);

      // Update local state immediately for better UX
      setQuestions(newQuestions);

      // Update order in backend for all affected questions
      const updatePromises = newQuestions.map((question, index) => {
        const newOrder = index + 1;
        if (question.order !== newOrder) {
          return apiService.updateJobQuestion(editingJob.id, question.id, {
            ...question,
            order: newOrder
          });
        }
        return Promise.resolve();
      });

      await Promise.all(updatePromises);
      
      // Refresh questions to ensure consistency
      await fetchJobQuestions(editingJob.id);
      
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to reorder questions');
      // Revert local state on error
      await fetchJobQuestions(editingJob.id);
    } finally {
      setIsReordering(false);
      setDraggedQuestion(null);
    }
  };

  const handleDragEnd = () => {
    setDraggedQuestion(null);
  };

  // Load positions when modal opens
  useEffect(() => {
    if (isModalOpen) {
      fetchPositions();
    }
  }, [isModalOpen]);

  // Filter positions based on search term
  useEffect(() => {
    if (positionSearchTerm.trim() === '') {
      setFilteredPositions(positions);
    } else {
      const filtered = positions.filter(position =>
        position.title.toLowerCase().includes(positionSearchTerm.toLowerCase()) ||
        position.level.toLowerCase().includes(positionSearchTerm.toLowerCase())
      );
      setFilteredPositions(filtered);
    }
  }, [positions, positionSearchTerm]);

  // Close position select when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (positionSelectRef.current && !positionSelectRef.current.contains(event.target as Node)) {
        setIsPositionSelectOpen(false);
        setPositionSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Position select functions
  const togglePositionSelect = () => {
    setIsPositionSelectOpen(!isPositionSelectOpen);
    if (!isPositionSelectOpen) {
      setPositionSearchTerm('');
    }
  };

  const selectPosition = (position: Position) => {
    handleInputChange('positionId', position.id);
    setIsPositionSelectOpen(false);
    setPositionSearchTerm('');
  };

  const getSelectedPosition = () => {
    return positions.find(p => p.id === formData.positionId);
  };

  // Utility function to format dates
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return '-';
    }
  };

  // Utility function to get question type label
  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'SHORT_TEXT':
        return String(t('pages.jobs.questionTypeShortText'));
      case 'LONG_TEXT':
        return String(t('pages.jobs.questionTypeLongText'));
      case 'SINGLE_CHOICE':
        return String(t('pages.jobs.questionTypeSingleChoice'));
      case 'MULTIPLE_CHOICE':
        return String(t('pages.jobs.questionTypeMultipleChoice'));
      default:
        return type;
    }
  };

  return (
    <Layout>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-primary">{String(t('navigation.jobs'))}</h2>
            <p className="text-secondary">{String(t('pages.jobs.subtitle'))}</p>
          </div>
          <button
            onClick={openCreateModal}
            className="btn-primary flex items-center px-4 py-2 text-sm font-medium"
          >
            <Plus className="h-4 w-4 mr-2" />
            {String(t('pages.jobs.create'))}
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
                  {String(t('pages.jobs.title'))} {getSortIcon('title')}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider cursor-pointer hover:bg-primary"
                  onClick={() => handleSort('position.title')}
                >
                  {String(t('pages.jobs.position'))} {getSortIcon('position.title')}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider"
                >
                  {String(t('pages.jobs.requiresResume'))}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider"
                >
                  {String(t('pages.jobs.status'))}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider"
                >
                  {String(t('pages.jobs.applications'))}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider cursor-pointer hover:bg-primary"
                  onClick={() => handleSort('createdAt')}
                >
                  {String(t('pages.jobs.createdAt'))} {getSortIcon('createdAt')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  {String(t('common.actions'))}
                </th>
              </tr>
            </thead>
            <tbody className="bg-primary divide-y divide-primary">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-secondary">
                    {String(t('common.loading'))}
                  </td>
                </tr>
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-secondary">
                    {String(t('pages.jobs.noJobs'))}
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-tertiary">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                      {job.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                      {job.position.title} ({job.position.level})
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                      {job.requiresResume ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {String(t('common.yes'))}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {String(t('common.no'))}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                      {job.isActive ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {String(t('pages.jobs.active'))}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {String(t('pages.jobs.inactive'))}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                      {job._count?.applications || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                      {formatDate(job.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditModal(job)}
                          className="text-accent-primary hover:text-accent-primary-hover"
                          title={String(t('pages.jobs.edit'))}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => showConfirmation('delete', String(t('pages.jobs.confirmDelete', { title: job.title })))}
                          className="text-accent-danger hover:text-red-700"
                          title={String(t('pages.jobs.delete'))}
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
                  <span className="sr-only">{String(t('common.previous'))}</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNumber) => (
                  <button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    aria-current={pagination.page === pageNumber ? 'page' : undefined}
                    className={`relative inline-flex items-center px-4 py-2 border border-secondary-300 bg-white text-sm font-medium ${
                      pagination.page === pageNumber
                        ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                        : 'text-secondary-700 hover:bg-secondary-50'
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-secondary-300 bg-white text-sm font-medium text-secondary-500 hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">{String(t('common.next'))}</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Job Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[50]">
          <div className="bg-primary rounded-lg shadow-theme w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-primary">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-primary">
                  {isEditing ? String(t('pages.jobs.edit')) : String(t('pages.jobs.create'))}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-secondary hover:text-primary transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Tabs */}
            <div className="border-b border-primary">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('config')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'config'
                      ? 'border-accent-primary text-accent-primary'
                      : 'border-transparent text-secondary hover:text-primary hover:border-secondary'
                  }`}
                >
                  {String(t('pages.jobs.configuration'))}
                </button>
                <button
                  onClick={() => setActiveTab('questions')}
                  disabled={!isEditing}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'questions'
                      ? 'border-accent-primary text-accent-primary'
                      : 'border-transparent text-secondary hover:text-primary hover:border-secondary'
                  } ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {String(t('pages.jobs.questions'))}
                </button>
              </nav>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-4 max-h-96 overflow-y-auto">
              {activeTab === 'config' ? (
                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">
                      {String(t('pages.jobs.title'))} *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className={`input w-full ${formErrors.title ? 'border-red-500' : ''}`}
                      placeholder={String(t('pages.jobs.titlePlaceholder'))}
                    />
                    {formErrors.title && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">
                      {String(t('pages.jobs.description'))} *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={3}
                      className={`input textarea w-full ${formErrors.description ? 'border-red-500' : ''}`}
                      placeholder={String(t('pages.jobs.descriptionPlaceholder'))}
                    />
                    {formErrors.description && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
                    )}
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">
                      {String(t('pages.jobs.slug'))} *
                    </label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                      className={`input w-full ${formErrors.slug ? 'border-red-500' : ''}`}
                      placeholder={String(t('pages.jobs.slugPlaceholder'))}
                    />
                    {formErrors.slug && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.slug}</p>
                    )}
                    <p className="mt-1 text-xs text-secondary">
                      {String(t('pages.jobs.slugHelp'))}
                    </p>
                  </div>

                  {/* Requires Resume */}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">
                      {String(t('pages.jobs.requiresResume'))}
                    </label>
                    <select
                      value={formData.requiresResume ? 'true' : 'false'}
                      onChange={(e) => handleInputChange('requiresResume', e.target.value === 'true')}
                      className="input w-full"
                    >
                      <option value="false">{String(t('common.no'))}</option>
                      <option value="true">{String(t('common.yes'))}</option>
                    </select>
                  </div>

                  {/* Is Active */}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">
                      {String(t('pages.jobs.status'))}
                    </label>
                    <select
                      value={formData.isActive ? 'true' : 'false'}
                      onChange={(e) => handleInputChange('isActive', e.target.value === 'true')}
                      className="input w-full"
                    >
                      <option value="true">{String(t('pages.jobs.active'))}</option>
                      <option value="false">{String(t('pages.jobs.inactive'))}</option>
                    </select>
                  </div>

                  {/* Position */}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">
                      {String(t('pages.jobs.position'))} *
                    </label>
                    <div className="relative" ref={positionSelectRef}>
                      <button
                        type="button"
                        onClick={togglePositionSelect}
                        disabled={loadingPositions}
                        className={`input w-full text-left flex items-center justify-between ${formErrors.positionId ? 'border-red-500' : ''} ${loadingPositions ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span className={getSelectedPosition() ? 'text-primary' : 'text-secondary'}>
                          {getSelectedPosition() 
                            ? getSelectedPosition()?.title
                            : String(t('pages.jobs.selectPosition'))
                          }
                        </span>
                        <ChevronDown className={`h-4 w-4 text-secondary transition-transform ${isPositionSelectOpen ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {isPositionSelectOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-primary border border-primary rounded-md shadow-theme max-h-60 overflow-hidden">
                          {/* Search input */}
                          <div className="p-2 border-b border-primary">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary" />
                              <input
                                type="text"
                                value={positionSearchTerm}
                                onChange={(e) => setPositionSearchTerm(e.target.value)}
                                placeholder={String(t('common.search'))}
                                className="input w-full pl-9 text-sm"
                                autoFocus
                              />
                            </div>
                          </div>
                          
                          {/* Options list */}
                          <div className="max-h-48 overflow-y-auto">
                            {filteredPositions.length === 0 ? (
                              <div className="px-3 py-2 text-sm text-secondary">
                                {String(t('common.noResults'))}
                              </div>
                            ) : (
                              filteredPositions.map((position) => (
                                <button
                                  key={position.id}
                                  type="button"
                                  onClick={() => selectPosition(position)}
                                  className={`w-full px-3 py-2 text-left text-sm hover:bg-tertiary focus:bg-tertiary focus:outline-none ${
                                    formData.positionId === position.id 
                                      ? 'bg-accent-primary text-white' 
                                      : 'text-primary'
                                  }`}
                                >
                                  <div className="font-medium">{position.title}</div>
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    {formErrors.positionId && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.positionId}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-md font-medium text-primary">
                      {String(t('pages.jobs.questionsList'))}
                    </h4>
                    <div className="flex items-center space-x-2">
                      {isReordering && (
                        <div className="flex items-center text-sm text-secondary">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent-primary mr-2"></div>
                          {String(t('pages.jobs.reordering'))}
                        </div>
                      )}
                      <button 
                        onClick={openQuestionModal}
                        className="btn-primary text-sm"
                        disabled={isReordering}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        {String(t('pages.jobs.addQuestion'))}
                      </button>
                    </div>
                  </div>
                  
                  {loadingQuestions ? (
                    <div className="text-center py-8 text-secondary">
                      {String(t('common.loading'))}
                    </div>
                  ) : questions.length === 0 ? (
                    <div className="text-center py-8 text-secondary">
                      {String(t('pages.jobs.noQuestions'))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {questions.map((question) => (
                        <div 
                          key={question.id} 
                          draggable
                          onDragStart={(e) => handleDragStart(e, question.id)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, question.id)}
                          onDragEnd={handleDragEnd}
                          className={`flex items-start space-x-3 p-3 border border-primary rounded-lg transition-all duration-200 ${
                            draggedQuestion === question.id 
                              ? 'opacity-50 scale-95 bg-tertiary' 
                              : 'hover:bg-tertiary cursor-move'
                          } ${isReordering ? 'pointer-events-none' : ''}`}
                        >
                          <GripVertical className={`h-5 w-5 mt-1 ${
                            draggedQuestion === question.id 
                              ? 'text-accent-primary' 
                              : 'text-secondary'
                          }`} />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-primary">{question.label}</p>
                            <p className="text-xs text-secondary">
                              {getQuestionTypeLabel(question.type)} • {question.isRequired ? String(t('common.required')) : String(t('common.optional'))}
                            </p>
                            {(question.type === 'MULTIPLE_CHOICE' || question.type === 'SINGLE_CHOICE') && question.options && question.options.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs text-secondary mb-1">{String(t('pages.jobs.questionOptions'))}:</p>
                                <div className="flex flex-wrap gap-1">
                                  {question.options.map((option, index) => (
                                    <span
                                      key={option.id || index}
                                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-tertiary text-primary border border-primary"
                                    >
                                      {option.label}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {(question.type === 'MULTIPLE_CHOICE' || question.type === 'SINGLE_CHOICE') && (
                              <button
                                onClick={() => handleManageQuestionOptions(question)}
                                className="text-accent-secondary hover:text-accent-secondary-hover mt-1"
                                title={String(t('pages.jobs.manageOptions'))}
                                disabled={isReordering}
                              >
                                <GripVertical className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => openEditQuestionModal(question)}
                              className="text-accent-primary hover:text-accent-primary-hover mt-1"
                              title={String(t('pages.jobs.editQuestion'))}
                              disabled={isReordering}
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(question.id)}
                              className="text-accent-danger hover:text-red-700 mt-1"
                              title={String(t('pages.jobs.deleteQuestion'))}
                              disabled={isReordering}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-primary flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-primary bg-tertiary hover:bg-secondary rounded-md border border-primary transition-colors"
              >
                {String(t('common.close'))}
              </button>
              <button
                onClick={() => showConfirmation('save', String(t('pages.jobs.confirmSave')))}
                disabled={isSubmitting}
                className="btn-primary px-4 py-2 text-sm font-medium disabled:opacity-50"
              >
                {isSubmitting ? String(t('common.saving')) : String(t('common.save'))}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Question Modal */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-primary rounded-lg shadow-theme w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-primary">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-primary">
                  {isEditingQuestion ? String(t('pages.jobs.editQuestion')) : String(t('pages.jobs.addQuestion'))}
                </h3>
                <button
                  onClick={closeQuestionModal}
                  className="text-secondary hover:text-primary transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="px-6 py-4 space-y-4">
              {/* Question Label */}
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  {String(t('pages.jobs.questionLabel'))} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={questionFormData.label}
                  onChange={(e) => handleQuestionInputChange('label', e.target.value)}
                  className="input w-full"
                  placeholder={String(t('pages.jobs.questionLabelPlaceholder'))}
                />
                {questionFormErrors.label && (
                  <p className="text-red-500 text-sm mt-1">{questionFormErrors.label}</p>
                )}
              </div>

              {/* Question Type */}
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  {String(t('pages.jobs.questionType'))} <span className="text-red-500">*</span>
                </label>
                <select
                  value={questionFormData.type}
                  onChange={(e) => handleQuestionInputChange('type', e.target.value)}
                  className="input w-full"
                >
                  <option value="SHORT_TEXT">{String(t('pages.jobs.questionTypeShortText'))}</option>
                  <option value="LONG_TEXT">{String(t('pages.jobs.questionTypeLongText'))}</option>
                  <option value="SINGLE_CHOICE">{String(t('pages.jobs.questionTypeSingleChoice'))}</option>
                  <option value="MULTIPLE_CHOICE">{String(t('pages.jobs.questionTypeMultipleChoice'))}</option>
                </select>
              </div>

              {/* Is Required */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isRequired"
                  checked={questionFormData.isRequired}
                  onChange={(e) => handleQuestionInputChange('isRequired', e.target.checked)}
                  className="rounded border-primary text-accent-primary focus:ring-accent-primary"
                />
                <label htmlFor="isRequired" className="text-sm font-medium text-primary">
                  {String(t('pages.jobs.questionRequired'))}
                </label>
              </div>

            </div>
            
            <div className="px-6 py-4 border-t border-primary flex justify-end space-x-3">
              <button
                onClick={closeQuestionModal}
                className="px-4 py-2 text-sm font-medium text-primary bg-tertiary hover:bg-secondary rounded-md border border-primary transition-colors"
              >
                {String(t('common.cancel'))}
              </button>
              <button
                onClick={handleQuestionSubmit}
                disabled={isSubmittingQuestion}
                className="btn-primary px-4 py-2 text-sm font-medium"
              >
                {isSubmittingQuestion ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {String(t('common.saving'))}
                  </div>
                ) : (
                  String(t('common.save'))
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Question Options Modal */}
      {isOptionsModalOpen && managingQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70]">
          <div className="bg-primary rounded-lg shadow-theme w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-primary">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-primary">
                  {String(t('pages.jobs.manageOptions'))} - {managingQuestion.label}
                </h3>
                <button
                  onClick={closeOptionsModal}
                  className="text-secondary hover:text-primary transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="px-6 py-4">
              {loadingOptions ? (
                <div className="text-center py-8 text-secondary">
                  {String(t('common.loading'))}
                </div>
              ) : questionOptions.length === 0 ? (
                <div className="text-center py-8 text-secondary">
                  {String(t('pages.jobs.noOptions'))}
                </div>
              ) : (
                <div className="space-y-3">
                  {questionOptions.map((option) => (
                    <div key={option.id} className="flex items-center space-x-3 p-3 border border-primary rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-primary">{option.label}</p>
                        <p className="text-xs text-secondary">Ordem: {option.orderIndex}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditOption(option)}
                          className="text-accent-primary hover:text-accent-primary-hover"
                          title={String(t('pages.jobs.editOption'))}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteOption(option.id)}
                          className="text-accent-danger hover:text-red-700"
                          title={String(t('pages.jobs.deleteOption'))}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 border-t border-primary flex justify-between">
              <button
                onClick={closeOptionsModal}
                className="px-4 py-2 text-sm font-medium text-primary bg-tertiary hover:bg-secondary rounded-md border border-primary transition-colors"
              >
                {String(t('common.close'))}
              </button>
              <button
                onClick={() => handleAddOption()}
                className="btn-primary px-4 py-2 text-sm font-medium"
              >
                <Plus className="h-4 w-4 mr-1" />
                {String(t('pages.jobs.addOption'))}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Option Modal */}
      {isOptionModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[80]">
          <div className="bg-primary rounded-lg shadow-theme w-full max-w-md">
            <div className="px-6 py-4 border-b border-primary">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-primary">
                  {isEditingOption ? String(t('pages.jobs.editOption')) : String(t('pages.jobs.addOption'))}
                </h3>
                <button
                  onClick={closeOptionModal}
                  className="text-secondary hover:text-primary transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="px-6 py-4 space-y-4">
              {/* Option Label */}
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  {String(t('pages.jobs.optionLabel'))} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={optionFormData.label}
                  onChange={(e) => setOptionFormData({ label: e.target.value })}
                  className="input w-full"
                  placeholder={String(t('pages.jobs.optionLabelPlaceholder'))}
                />
                {optionFormErrors.label && (
                  <p className="text-red-500 text-sm mt-1">{optionFormErrors.label}</p>
                )}
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-primary flex justify-end space-x-3">
              <button
                onClick={closeOptionModal}
                className="px-4 py-2 text-sm font-medium text-primary bg-tertiary hover:bg-secondary rounded-md border border-primary transition-colors"
              >
                {String(t('common.cancel'))}
              </button>
              <button
                onClick={handleOptionSubmit}
                disabled={isSubmittingOption}
                className="btn-primary px-4 py-2 text-sm font-medium disabled:opacity-50"
              >
                {isSubmittingOption ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {String(t('common.saving'))}
                  </div>
                ) : (
                  String(t('common.save'))
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-primary rounded-lg shadow-theme w-full max-w-md">
            <div className="px-6 py-4">
              <h3 className="text-lg font-medium text-primary mb-2">
                {String(t('common.confirm'))}
              </h3>
              <p className="text-secondary">{confirmMessage}</p>
            </div>
            <div className="px-6 py-4 border-t border-primary flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-sm font-medium text-primary bg-tertiary hover:bg-secondary rounded-md border border-primary transition-colors"
              >
                {String(t('common.cancel'))}
              </button>
              <button
                onClick={handleConfirm}
                className="btn-primary px-4 py-2 text-sm font-medium"
              >
                {String(t('common.confirm'))}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}