import { Controller, Get, Post, Put, Delete, Body, Param, Req } from '@nestjs/common';
import { BudgetService } from './budget.service';
import { AuthGuard } from 'src/common/decorators/auth.decorator';

@Controller('budgets')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @AuthGuard()
  @Get()
  getAllBudgets(@Req() req) {
    return this.budgetService.getAllBudgets(req.user.sub);
  }

  @AuthGuard()
  @Get(':id')
  getBudgetById(@Req() req, @Param('id') id: string) {
    return this.budgetService.getBudgetById(req.user.sub, id);
  }

  @AuthGuard()
  @Post()
  createBudget(@Req() req, @Body() body) {
    return this.budgetService.createBudget(req.user.sub, body);
  }

  @AuthGuard()
  @Put(':id')
  updateBudget(@Req() req, @Param('id') id: string, @Body() body) {
    return this.budgetService.updateBudget(req.user.sub, id, body);
  }

  @AuthGuard()
  @Delete(':id')
  deleteBudget(@Req() req, @Param('id') id: string) {
    return this.budgetService.deleteBudget(req.user.sub, id);
  }
}
