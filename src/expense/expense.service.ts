import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Expense } from '@prisma/client';

@Injectable()
export class ExpenseService {
  constructor(private prisma: PrismaService) {}

  async getAllExpenses(userId: string): Promise<Expense[]> {
    try {
      return await this.prisma.expense.findMany({ where: { userId } });
    } catch (error) {
      console.error('Error fetching all expenses:', error.message);
      throw new InternalServerErrorException(
        'Failed to fetch expenses. Please try again.',
      );
    }
  }

  async getExpenseById(userId: string, id: string): Promise<Expense> {
    try {
      const expense = await this.prisma.expense.findFirst({
        where: { id, userId },
      });

      if (!expense) {
        throw new NotFoundException(`Expense with ID ${id} not found.`);
      }

      return expense;
    } catch (error) {
      console.error(`Error fetching expense (ID: ${id}):`, error.message);
      throw new InternalServerErrorException(
        'Failed to fetch expense. Please try again.',
      );
    }
  }

  async createExpense(
    userId: string,
    data: Omit<Expense, 'id' | 'userId' | 'updatedAt'>,
  ): Promise<Expense> {
    try {
      return await this.prisma.$transaction(async (prisma) => {
        // Find the budget for this category
        const budget = await prisma.budget.findFirst({
          where: { userId, category: data.category },
        });

        if (!budget) {
          throw new NotFoundException(
            `No budget found for category ${data.category}.`,
          );
        }

        // Ensure there's enough budget remaining
        if (budget.remainingAmount < data.amount) {
          throw new Error(`Insufficient budget for ${data.category}.`);
        }

        // Create the expense
        const expense = await prisma.expense.create({
          data: {
            ...data,
            userId,
            month: new Date(data.date).getMonth() + 1,
            year: new Date(data.date).getFullYear(),
          },
        });

        // Update the budget's remainingAmount
        await prisma.budget.update({
          where: { id: budget.id },
          data: { remainingAmount: budget.remainingAmount - data.amount },
        });

        return expense;
      });
    } catch (error) {
      console.error('Error creating expense:', error.message);
      throw new InternalServerErrorException(
        'Failed to create expense. Please try again.',
      );
    }
  }

  async updateExpense(
    userId: string,
    id: string,
    data: Partial<Expense>,
  ): Promise<Expense> {
    try {
      return await this.prisma.$transaction(async (prisma) => {
        // Get the existing expense
        const expense = await prisma.expense.findFirst({
          where: { id, userId },
        });

        if (!expense) {
          throw new NotFoundException(`Expense with ID ${id} not found.`);
        }

        // Find the corresponding budget
        const budget = await prisma.budget.findFirst({
          where: { userId, category: expense.category },
        });

        if (!budget) {
          throw new NotFoundException(
            `No budget found for category ${expense.category}.`,
          );
        }

        // Calculate the new remaining amount
        const oldAmount = expense.amount;
        const newAmount = data.amount ?? 0;
        const amountDifference = newAmount - oldAmount;

        // Ensure the new budget limit allows the updated expense
        if (budget.remainingAmount - amountDifference < 0) {
          throw new Error(
            `Insufficient budget to update expense in ${expense.category}.`,
          );
        }

        // Update the expense
        const updatedExpense = await prisma.expense.update({
          where: { id },
          data: {
            ...data,
            updatedAt: new Date(), // Ensure `updatedAt` is always updated
          },
        });

        // Update the budget's remainingAmount
        await prisma.budget.update({
          where: { id: budget.id },
          data: { remainingAmount: budget.remainingAmount - amountDifference },
        });

        return updatedExpense;
      });
    } catch (error) {
      console.error(`Error updating expense (ID: ${id}):`, error.message);
      throw new InternalServerErrorException(
        'Failed to update expense. Please try again.',
      );
    }
  }

  async deleteExpense(userId: string, id: string): Promise<void> {
    try {
      await this.prisma.$transaction(async (prisma) => {
        // Find the expense before deleting it
        const expense = await prisma.expense.findFirst({ where: { id, userId } });
  
        if (!expense) {
          throw new NotFoundException(`Expense with ID ${id} not found.`);
        }
  
        // Find the corresponding budget
        const budget = await prisma.budget.findFirst({
          where: { userId, category: expense.category },
        });
  
        if (!budget) {
          throw new NotFoundException(`No budget found for category ${expense.category}.`);
        }
  
        // Delete the expense
        await prisma.expense.delete({ where: { id } });
  
        // Increase the remainingAmount in the budget
        await prisma.budget.update({
          where: { id: budget.id },
          data: { remainingAmount: budget.remainingAmount + expense.amount },
        });
      });
    } catch (error) {
      console.error(`Error deleting expense (ID: ${id}):`, error.message);
      throw new InternalServerErrorException('Failed to delete expense. Please try again.');
    }
  }
  
}
