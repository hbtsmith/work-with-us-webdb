import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { apiService } from '@/services/api';
import { Job, Question } from '@/types';
import { 
  FileText, 
  Upload, 
  Calendar,
  Briefcase,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';

interface ApplicationFormData {
  resume: File | null;
  answers: Record<string, string | string[]>;
}

export function ApplicationPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { t, isLoading: i18nLoading } = useTranslation();
  
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState<ApplicationFormData>({
    resume: null,
    answers: {}
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (slug) {
      fetchJob();
    }
  }, [slug]);

  const fetchJob = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getJobBySlug(slug!);
      if (response.success && response.data) {
        setJob(response.data);
      } else {
        setError(response.message || 'Job not found');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load job');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ApplicationFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleAnswerChange = (questionId: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: value
      }
    }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (job?.requiresResume && !formData.resume) {
      errors.resume = String(t('pages.application.errors.resumeRequired') || 'Currículo é obrigatório');
    }
    
    // Validate dynamic questions
    if (job?.questions) {
      job.questions.forEach(question => {
        if (question.isRequired) {
          const answer = formData.answers[question.id];
          if (!answer || (Array.isArray(answer) && answer.length === 0)) {
            errors[`question_${question.id}`] = String(t('pages.application.errors.questionRequired') || 'Esta pergunta é obrigatória');
          }
        }
      });
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSubmitting(true);
      
      // TODO: Implement application submission
      // const formDataToSend = new FormData();
      // if (formData.resume) {
      //   formDataToSend.append('resume', formData.resume);
      // }
      // formDataToSend.append('answers', JSON.stringify(formData.answers));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestionField = (question: Question) => {
    const value = formData.answers[question.id] || '';
    const error = formErrors[`question_${question.id}`];
    
    switch (question.type) {
      case 'SHORT_TEXT':
        return (
          <div key={question.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {question.label}
              {question.isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="text"
              value={value as string}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${error ? 'border-red-500' : ''}`}
              placeholder={String(t('pages.application.placeholders.shortText') || 'Digite sua resposta')}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );
        
      case 'LONG_TEXT':
        return (
          <div key={question.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {question.label}
              {question.isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              value={value as string}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y ${error ? 'border-red-500' : ''}`}
              rows={4}
              placeholder={String(t('pages.application.placeholders.longText') || 'Digite sua resposta detalhada')}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );
        
      case 'SINGLE_CHOICE':
        return (
          <div key={question.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {question.label}
              {question.isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="space-y-2">
              {question.options?.map((option, index) => (
                <label key={option.id || index} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name={`question_${question.id}`}
                    value={option.value}
                    checked={value === option.value}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );
        
      case 'MULTIPLE_CHOICE':
        const selectedValues = (value as string[]) || [];
        return (
          <div key={question.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {question.label}
              {question.isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="space-y-2">
              {question.options?.map((option, index) => (
                <label key={option.id || index} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    value={option.value}
                    checked={selectedValues.includes(option.value)}
                    onChange={(e) => {
                      const newValues = e.target.checked
                        ? [...selectedValues, option.value]
                        : selectedValues.filter(v => v !== option.value);
                      handleAnswerChange(question.id, newValues);
                    }}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );
        
      default:
        return null;
    }
  };

  if (loading || i18nLoading()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{String(t('pages.application.errorTitle') || 'Vaga não encontrada')}</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
          >
            {String(t('pages.application.goHome') || 'Voltar ao início')}
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{String(t('pages.application.successTitle') || 'Candidatura enviada!')}</h1>
          <p className="text-gray-600 mb-6">{String(t('pages.application.successMessage') || 'Sua candidatura foi enviada com sucesso. Entraremos em contato em breve.')}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
          >
            {String(t('pages.application.goHome') || 'Voltar ao início')}
          </button>
        </div>
      </div>
    );
  }

  if (!job) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{job.title}</h1>
          <div className="flex items-center justify-center space-x-6 text-gray-600">
            <div className="flex items-center space-x-2">
              <Briefcase className="h-5 w-5" />
              <span>{job.position?.title}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>{new Date(job.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Job Description */}
        <div className="bg-white rounded-lg p-6 mb-8 shadow-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{String(t('pages.application.jobDescription') || 'Descrição da vaga')}</h2>
          <div className="prose prose-sm max-w-none text-gray-700">
            {job.description.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-3">{paragraph}</p>
            ))}
          </div>
        </div>

        {/* Application Form */}
        <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">{String(t('pages.application.formTitle') || 'Formulário de candidatura')}</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Resume Upload */}
            {job.requiresResume && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {String(t('pages.application.resume') || 'Currículo')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Upload className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleInputChange('resume', e.target.files?.[0] || null)}
                    className={`w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 ${formErrors.resume ? 'border-red-500' : ''}`}
                  />
                </div>
                {formErrors.resume && <p className="text-sm text-red-500">{formErrors.resume}</p>}
                <p className="text-xs text-gray-500">{String(t('pages.application.resumeHelp') || 'Formatos aceitos: PDF, DOC, DOCX (máximo 5MB)')}</p>
              </div>
            )}

            {/* Dynamic Questions */}
            {job.questions && job.questions.length > 0 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">{String(t('pages.application.additionalQuestions') || 'Perguntas adicionais')}</h3>
                <div className="space-y-4">
                  {job.questions.map(renderQuestionField)}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{String(t('pages.application.submitting') || 'Enviando...')}</span>
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    <span>{String(t('pages.application.submit') || 'Enviar candidatura')}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
