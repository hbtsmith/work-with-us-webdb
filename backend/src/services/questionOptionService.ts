import { prisma } from '@/database/client';
import { NotFoundError, ConflictError, BadRequestError } from '@/errors';
import { i18n } from '@/i18n/i18n';

/**
 * Follow SOLID principles
 * DRY (Don't Repeat Yourself)
 * Single Responsibility Principle
 * Open/Closed Principle
 * Always use i18n for error messages or return messages
 * Always use ErrorHandler for error handling
 */

export interface CreateQuestionOptionData {
  label: string;
  orderIndex?: number;
}

export interface UpdateQuestionOptionData {
  label?: string;
  orderIndex?: number;
  isActive?: boolean;
}

export interface ReorderQuestionOptionsData {
  optionIds: string[];
}

export class QuestionOptionService {
  async createQuestionOption(questionId: string, optionData: CreateQuestionOptionData) {
    // Verify question exists
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      throw new NotFoundError(i18n.t('errors.question.not_found'));
    }

    // Get the next order index if not provided
    const orderIndex = optionData.orderIndex ?? await this.getNextOrderIndex(questionId);

    return await prisma.questionOption.create({
      data: {
        questionId,
        label: optionData.label,
        orderIndex,
        isActive: true,
      },
      include: {
        question: true,
      },
    });
  }

  async getQuestionOptions(questionId: string) {
    // Verify question exists
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      throw new NotFoundError(i18n.t('errors.question.not_found'));
    }

    return await prisma.questionOption.findMany({
      where: { questionId },
      orderBy: { orderIndex: 'asc' },
      include: {
        question: true,
        _count: {
          select: { answers: true },
        },
      },
    });
  }

  async getQuestionOptionById(questionId: string, optionId: string) {
    const option = await prisma.questionOption.findFirst({
      where: {
        id: optionId,
        questionId,
      },
      include: {
        question: true,
        _count: {
          select: { answers: true },
        },
      },
    });

    if (!option) {
      throw new NotFoundError(i18n.t('errors.question_option.not_found'));
    }

    return option;
  }

  async updateQuestionOption(questionId: string, optionId: string, optionData: UpdateQuestionOptionData) {
    // Check if option has answers
    const answerCount = await prisma.answer.count({
      where: { questionOptionId: optionId },
    });
    
    if (answerCount > 0) {
      throw new ConflictError(i18n.t('errors.question_option.has_answers'));
    }

    const updateData: any = {};
    if (optionData.label !== undefined) updateData.label = optionData.label;
    if (optionData.orderIndex !== undefined) updateData.orderIndex = optionData.orderIndex;
    if (optionData.isActive !== undefined) updateData.isActive = optionData.isActive;

    return await prisma.questionOption.update({
      where: {
        id: optionId,
        questionId,
      },
      data: updateData,
      include: {
        question: true,
      },
    });
  }

  async deleteQuestionOption(questionId: string, optionId: string) {
    // Check if option has answers
    const answerCount = await prisma.answer.count({
      where: { questionOptionId: optionId },
    });
    
    if (answerCount > 0) {
      throw new ConflictError(i18n.t('errors.question_option.has_answers'));
    }

    return await prisma.questionOption.delete({
      where: {
        id: optionId,
        questionId,
      },
    });
  }

  async reorderQuestionOptions(questionId: string, reorderData: ReorderQuestionOptionsData) {
    // Verify question exists
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      throw new NotFoundError(i18n.t('errors.question.not_found'));
    }

    // Verify all options belong to this question
    const options = await prisma.questionOption.findMany({
      where: {
        id: { in: reorderData.optionIds },
        questionId,
      },
    });

    if (options.length !== reorderData.optionIds.length) {
      throw new BadRequestError(i18n.t('errors.question_option.invalid_options'));
    }

    // Update order for each option
    const updatePromises = reorderData.optionIds.map((optionId, index) =>
      prisma.questionOption.update({
        where: { id: optionId },
        data: { orderIndex: index },
      })
    );

    await Promise.all(updatePromises);

    // Return updated options
    return await this.getQuestionOptions(questionId);
  }

  async toggleQuestionOptionStatus(questionId: string, optionId: string) {
    const option = await prisma.questionOption.findFirst({
      where: {
        id: optionId,
        questionId,
      },
    });

    if (!option) {
      throw new NotFoundError(i18n.t('errors.question_option.not_found'));
    }

    return await prisma.questionOption.update({
      where: { id: optionId },
      data: { isActive: !option.isActive },
      include: {
        question: true,
      },
    });
  }

  private async getNextOrderIndex(questionId: string): Promise<number> {
    const lastOption = await prisma.questionOption.findFirst({
      where: { questionId },
      orderBy: { orderIndex: 'desc' },
    });

    return lastOption ? lastOption.orderIndex + 1 : 0;
  }
}
