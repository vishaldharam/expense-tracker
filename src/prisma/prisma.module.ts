import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService], // 👈 Provide PrismaService
  exports: [PrismaService],   // 👈 Export it so other modules can use it
})
export class PrismaModule {}
