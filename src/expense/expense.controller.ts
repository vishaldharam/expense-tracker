import { Controller, Get, Post, Put, Delete, Body, Param, Req } from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { AuthGuard } from 'src/common/decorators/auth.decorator';

@Controller('expenses')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @AuthGuard()
  @Get()
  getAllExpenses(@Req() req) {
    return this.expenseService.getAllExpenses(req.user.sub);
  }

  @AuthGuard()
  @Get(':id')
  getExpenseById(@Req() req, @Param('id') id: string) {
    return this.expenseService.getExpenseById(req.user.sub, id);
  }

  @AuthGuard()
  @Post()
  createExpense(@Req() req, @Body() body) {
    return this.expenseService.createExpense(req.user.sub, body);
  }

  @AuthGuard()
  @Put(':id')
  updateExpense(@Req() req, @Param('id') id: string, @Body() body) {
    return this.expenseService.updateExpense(req.user.sub, id, body);
  }

  @AuthGuard()
  @Delete(':id')
  deleteExpense(@Req() req, @Param('id') id: string) {
    return this.expenseService.deleteExpense(req.user.sub, id);
  }
}
