import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Budget } from '@prisma/client';

@Injectable()
export class BudgetService {
  constructor(private prisma: PrismaService) {}

  async getAllBudgets(userId: string): Promise<Budget[]> {
    return this.prisma.budget.findMany({ where: { userId } });
  }

  async getBudgetById(userId: string, id: string): Promise<Budget> {
    const budget = await this.prisma.budget.findFirst({
      where: { id, userId },
    });
    if (!budget) throw new NotFoundException('Budget not found');
    return budget;
  }

  async createBudget(
    userId: string,
    data: Omit<Budget, 'id' | 'userId' | 'updatedAt' | 'remainingAmount'>,
  ): Promise<Budget> {
    return this.prisma.budget.create({
      data: {
        ...data,
        userId,
        remainingAmount: data.limit,
        month: data.month || new Date().getMonth() + 1, // ✅ Take from user or use current month
        year: data.year || new Date().getFullYear(), // ✅ Take from user or use current year
      },
    });
  }

  async updateBudget(
    userId: string,
    id: string,
    data: Partial<Budget>,
  ): Promise<Budget> {
    const budget = await this.getBudgetById(userId, id);
    return this.prisma.budget.update({ where: { id: budget.id }, data });
  }

  async deleteBudget(userId: string, id: string): Promise<void> {
    const budget = await this.getBudgetById(userId, id);
    await this.prisma.budget.delete({ where: { id: budget.id } });
  }
}
