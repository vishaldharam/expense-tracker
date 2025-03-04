import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Expense } from '@prisma/client';

@Injectable()
export class ExpenseService {
  constructor(private prisma: PrismaService) {}

  async getAllExpenses(userId: string): Promise<Expense[]> {
    return this.prisma.expense.findMany({ where: { userId } });
  }

  async getExpenseById(userId: string, id: string): Promise<Expense> {
    const expense = await this.prisma.expense.findFirst({ where: { id, userId } });
    if (!expense) throw new NotFoundException('Expense not found');
    return expense;
  }

  async createExpense(userId: string, data: Omit<Expense, 'id' | 'userId' | 'updatedAt'>): Promise<Expense> {
    return this.prisma.expense.create({
      data: { ...data, userId, month: new Date(data.date).getMonth() + 1, year: new Date(data.date).getFullYear() },
    });
  }

  async updateExpense(userId: string, id: string, data: Partial<Expense>): Promise<Expense> {
    const expense = await this.getExpenseById(userId, id);
    return this.prisma.expense.update({ where: { id: expense.id }, data });
  }

  async deleteExpense(userId: string, id: string): Promise<void> {
    const expense = await this.getExpenseById(userId, id);
    await this.prisma.expense.delete({ where: { id: expense.id } });
  }
}
