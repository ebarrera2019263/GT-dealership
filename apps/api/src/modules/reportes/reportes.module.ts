import { Module } from '@nestjs/common';
import { AuditoriaService } from '../../common/auditoria.service';
import { AdminReportesController } from './admin-reportes.controller';
import { ReportesController } from './reportes.controller';
import { ReportesService } from './reportes.service';

@Module({
  controllers: [ReportesController, AdminReportesController],
  providers: [ReportesService, AuditoriaService],
})
export class ReportesModule {}
