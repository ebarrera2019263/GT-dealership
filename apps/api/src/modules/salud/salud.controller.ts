import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Publico } from '../auth/decorators/publico.decorator';

@Publico()
@Controller('salud')
export class SaludController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async salud() {
    await this.prisma.$queryRaw`SELECT 1`;
    return { ok: true, db: 'conectada', ts: new Date().toISOString() };
  }
}
