import { z } from 'zod';
import { error } from '@/i18n/i18n';

/**
 * Follow SOLID principles
 * DRY (Don't Repeat Yourself)
 * Single Responsibility Principle
 * Open/Closed Principle
 * Always use i18n for error messages or return messages
 * Always use ErrorHandler for error handling
 */

// Common schemas
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const idParamSchema = z.object({
  id: z.string().cuid(),
});

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email(error('validation.invalid_email')),
  password: z.string().min(6, error('validation.invalid_password')),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, error('validation.current_password_required')),
  newPassword: z.string().min(6, error('validation.new_password_invalid')),
});

export const updateAdminSchema = z.object({
  email: z.string().email(error('validation.invalid_email')).optional(),
  password: z.string().min(6, error('validation.invalid_password')).optional(),
});

// Position schemas
export const createPositionSchema = z.object({
  title: z.string().min(1, error('validation.title_required')).max(100, error('validation.title_too_long')),
  level: z.string().min(1, error('validation.level_required')).max(50, error('validation.level_too_long')),
  salaryRange: z.string().min(1, error('validation.salary_range_required')).max(100, error('validation.salary_range_too_long')),
});

export const updatePositionSchema = createPositionSchema.partial();

// Question schemas
export const questionOptionSchema = z.object({
  id: z.string(),
  label: z.string().min(1, error('validation.option_label_required')),
  value: z.string().min(1, error('validation.option_value_required')),
});

export const createQuestionSchema = z.object({
  label: z.string().min(1, error('validation.question_label_required')).max(500, error('validation.label_too_long')),
  type: z.enum(['SHORT_TEXT', 'LONG_TEXT', 'MULTIPLE_CHOICE', 'SINGLE_CHOICE']),
  isRequired: z.boolean().default(false),
  options: z.array(questionOptionSchema).optional(),
  order: z.number().int().min(0, error('validation.order_non_negative')),
});

export const updateQuestionSchema = createQuestionSchema.partial();

// Question management schemas
export const createJobQuestionSchema = z.object({
  label: z.string().min(1, error('validation.question_label_required')).max(500, error('validation.label_too_long')),
  type: z.enum(['SHORT_TEXT', 'LONG_TEXT', 'MULTIPLE_CHOICE', 'SINGLE_CHOICE']),
  isRequired: z.boolean().default(false),
  options: z.array(questionOptionSchema).optional(),
  order: z.number().int().min(0, error('validation.order_non_negative')),
});

export const updateJobQuestionSchema = createJobQuestionSchema.partial();

export const jobQuestionParamsSchema = z.object({
  jobId: z.string().cuid(error('validation.invalid_job_id')),
  questionId: z.string().cuid(error('validation.invalid_question_id')),
});

export const jobIdParamSchema = z.object({
  jobId: z.string().cuid(error('validation.invalid_job_id')),
});

// Job schemas
export const createJobSchema = z.object({
  title: z.string().min(1, error('validation.title_required')).max(200, error('validation.title_too_long')),
  description: z.string().min(1, error('validation.description_required')).max(5000, error('validation.description_too_long')),
  slug: z.string()
    .min(1, error('validation.slug_required'))
    .max(100, error('validation.slug_too_long'))
    .regex(/^[a-z0-9-]+$/, error('validation.invalid_slug')),
  requiresResume: z.boolean().default(false),
  positionId: z.string().cuid(error('validation.invalid_position_id')),
});

export const updateJobSchema = z.object({
  title: z.string().min(1, error('validation.title_required')).max(200, error('validation.title_too_long')).optional(),
  description: z.string().min(1, error('validation.description_required')).max(5000, error('validation.description_too_long')).optional(),
  slug: z.string()
    .min(1, error('validation.slug_required'))
    .max(100, error('validation.slug_too_long'))
    .regex(/^[a-z0-9-]+$/, error('validation.invalid_slug'))
    .optional(),
  requiresResume: z.boolean().optional(),
  isActive: z.boolean().optional(),
  positionId: z.string().cuid(error('validation.invalid_position_id')).optional(),
});

export const jobSlugParamSchema = z.object({
  slug: z.string().min(1, error('validation.slug_required')),
});

// Application schemas
export const applicationAnswerSchema = z.object({
  questionId: z.string().cuid(error('validation.invalid_question_id')),
  textValue: z.string().optional(),
  questionOptionId: z.string().cuid(error('validation.invalid_option_id')).optional(),
}).refine(
  (data) => data.textValue || data.questionOptionId,
  {
    message: error('validation.answer_required'),
    path: ['textValue'],
  }
);

export const submitApplicationSchema = z.object({
  answers: z.array(applicationAnswerSchema).min(1, error('validation.at_least_one_answer')),
  recaptchaToken: z.string().min(1, error('validation.recaptcha_token_required')),
});

// Clone job schema
export const cloneJobSchema = z.object({
  title: z.string().min(1, error('validation.title_required')).max(200, error('validation.title_too_long')),
  slug: z.string()
    .min(1, error('validation.slug_required'))
    .max(100, error('validation.slug_too_long'))
    .regex(/^[a-z0-9-]+$/, error('validation.invalid_slug')),
});

// Question Option schemas
export const questionOptionParamsSchema = z.object({
  questionId: z.string().cuid(error('validation.invalid_question_id')),
  optionId: z.string().cuid(error('validation.invalid_option_id')).optional(),
});

export const createQuestionOptionSchema = z.object({
  label: z.string().min(1, error('validation.option_label_required')).max(200, error('validation.option_label_too_long')),
  orderIndex: z.number().int().min(0, error('validation.order_non_negative')).optional(),
});

export const updateQuestionOptionSchema = z.object({
  label: z.string().min(1, error('validation.option_label_required')).max(200, error('validation.option_label_too_long')).optional(),
  orderIndex: z.number().int().min(0, error('validation.order_non_negative')).optional(),
  isActive: z.boolean().optional(),
});

export const reorderQuestionOptionsSchema = z.object({
  optionIds: z.array(z.string().cuid(error('validation.invalid_option_id'))).min(1, error('validation.at_least_one_option')),
});