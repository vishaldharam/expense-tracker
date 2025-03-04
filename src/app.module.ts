import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma/prisma.service';
import { BudgetModule } from './budget/budget.module';
import { ExpenseModule } from './expense/expense.module';
import { PrismaModule } from './prisma/prisma.module';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

@Module({
  imports: [AuthModule, ExpenseModule, BudgetModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService, PrismaService, JwtAuthGuard, JwtService],
})
export class AppModule {}
