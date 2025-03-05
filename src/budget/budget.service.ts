import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Budget } from '@prisma/client';

@Injectable()
export class BudgetService {
  constructor(private prisma: PrismaService) {}

  async getAllBudgets(userId: string): Promise<Budget[]> {
    return this.prisma.budget.findMany({ where: { userId } });
  }

  async getBudgetById(userId: string, id: string): Promise<Budget> {
    try {
      const budget = await this.prisma.budget.findFirst({
        where: { id, userId },
      });

      if (!budget) {
        throw new NotFoundException(`Budget with ID ${id} not found.`);
      }

      return budget;
    } catch (error) {
      console.error(`Error fetching budget (ID: ${id}):`, error.message);
      throw new InternalServerErrorException('Failed to fetch budget. Please try again.');
    }
  }

  async createBudget(
    userId: string,
    data: Omit<Budget, 'id' | 'userId' | 'updatedAt' | 'remainingAmount'>,
  ): Promise<Budget> {
    try {
      return this.prisma.budget.create({
        data: {
          ...data,
          userId,
          remainingAmount: data.limit,
          month: data.month || new Date().getMonth() + 1, // ✅ Take from user or use current month
          year: data.year || new Date().getFullYear(), // ✅ Take from user or use current year
        },
      });
    } catch (error) {
      console.error('Error creating budget:', error.message);
      throw new Error('Failed to create budget. Please try again.');
    }
  }

  async updateBudget(
    userId: string,
    id: string,
    data: Partial<Budget>,
  ): Promise<Budget> {
    try {
      return await this.prisma.$transaction(async (prisma) => {
        const budget = await prisma.budget.findFirst({
          where: { id, userId },
        });

        if (!budget) {
          throw new Error('Budget not found');
        }

        // Calculate new values
        const newLimit = (data.limit ?? 0) + budget.limit;
        const limitDifference = newLimit - budget.limit;
        const newRemainingAmount = budget.remainingAmount + limitDifference;

        return prisma.budget.update({
          where: { id },
          data: {
            limit: newLimit,
            remainingAmount: newRemainingAmount,
            month: data.month ?? budget.month,
            year: data.year ?? budget.year,
            updatedAt: new Date(), // ✅ Update the timestamp
          },
        });
      });
    } catch (error) {
      console.error('Error updating budget:', error.message);
      throw new Error('Failed to update budget. Please try again.');
    }
  }

  async deleteBudget(userId: string, id: string): Promise<Budget> {
    try {
      return await this.prisma.$transaction(async ($tx) => {
        const budget = await this.getBudgetById(userId, id);
        return await this.prisma.budget.delete({ where: { id: budget.id } });
      });
    } catch (error) {
      console.error('Error deleting budget:', error.message);
      throw new Error('Failed to delete budget. Please try again.');
    }
  }
}
