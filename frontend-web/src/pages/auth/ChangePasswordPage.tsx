import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/hooks/useAuth';
import { apiService } from '@/services/api';
import { Layout } from '@/components/Layout';
import { Eye, EyeOff, Lock, AlertCircle } from 'lucide-react';

interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function ChangePasswordPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [formData, setFormData] = useState<ChangePasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<ChangePasswordFormData>>({});
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const errors: Partial<ChangePasswordFormData> = {};
    
    if (!formData.currentPassword.trim()) {
      errors.currentPassword = String(t('forms.validation.required'));
    }
    
    if (!formData.newPassword.trim()) {
      errors.newPassword = String(t('forms.validation.required'));
    } else if (formData.newPassword.length < 6) {
      errors.newPassword = String(t('forms.validation.password'));
    }
    
    if (!formData.confirmPassword.trim()) {
      errors.confirmPassword = String(t('forms.validation.required'));
    } else if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = String(t('pages.changePassword.passwordsDoNotMatch'));
    }
    
    if (formData.currentPassword === formData.newPassword) {
      errors.newPassword = String(t('pages.changePassword.samePassword'));
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      await apiService.changePassword(formData.currentPassword, formData.newPassword);
      
      setSuccess(String(t('pages.changePassword.success')));
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      // Se for primeiro login, redirecionar para dashboard após 2 segundos
      if (user?.isFirstLogin) {
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || String(t('pages.changePassword.error')));
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-secondary-900">
            {user?.isFirstLogin 
              ? String(t('pages.changePassword.firstLoginTitle'))
              : String(t('pages.changePassword.title'))
            }
          </h2>
          <p className="text-secondary-600">
            {user?.isFirstLogin 
              ? String(t('pages.changePassword.firstLoginSubtitle'))
              : String(t('pages.changePassword.subtitle'))
            }
          </p>
        </div>

        {/* First Login Alert */}
        {user?.isFirstLogin && (
          <div className="mb-6 rounded-md bg-yellow-50 border border-yellow-200 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  {String(t('pages.changePassword.firstLoginAlert'))}
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>{String(t('pages.changePassword.firstLoginMessage'))}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-md bg-red-50 border border-red-200 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium text-red-800">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 rounded-md bg-green-50 border border-green-200 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium text-green-800">{success}</div>
                {user?.isFirstLogin && (
                  <div className="mt-1 text-sm text-green-700">
                    {String(t('pages.changePassword.redirecting'))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="card p-6">
          <form className="space-y-6">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                {String(t('pages.changePassword.currentPassword'))}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-secondary-400" />
                </div>
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  className={`w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    formErrors.currentPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={String(t('pages.changePassword.currentPassword'))}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => togglePasswordVisibility('current')}
                >
                  {showPasswords.current ? (
                    <EyeOff className="h-5 w-5 text-secondary-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-secondary-400" />
                  )}
                </button>
              </div>
              {formErrors.currentPassword && (
                <p className="mt-1 text-sm text-red-600">{formErrors.currentPassword}</p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                {String(t('pages.changePassword.newPassword'))}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-secondary-400" />
                </div>
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  className={`w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    formErrors.newPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={String(t('pages.changePassword.newPassword'))}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => togglePasswordVisibility('new')}
                >
                  {showPasswords.new ? (
                    <EyeOff className="h-5 w-5 text-secondary-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-secondary-400" />
                  )}
                </button>
              </div>
              {formErrors.newPassword && (
                <p className="mt-1 text-sm text-red-600">{formErrors.newPassword}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                {String(t('pages.changePassword.confirmPassword'))}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-secondary-400" />
                </div>
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={`w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={String(t('pages.changePassword.confirmPassword'))}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => togglePasswordVisibility('confirm')}
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="h-5 w-5 text-secondary-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-secondary-400" />
                  )}
                </button>
              </div>
              {formErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full btn-primary flex justify-center py-2 px-4 text-sm font-medium"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {String(t('common.loading'))}
                  </div>
                ) : (
                  String(t('pages.changePassword.submit'))
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
