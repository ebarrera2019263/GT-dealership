import { Module } from '@nestjs/common';
import { AuditoriaService } from '../../common/auditoria.service';
import { AdminFinanciamientoController } from './admin-financiamiento.controller';
import { FinanciamientoAdminService } from './financiamiento-admin.service';

@Module({
  controllers: [AdminFinanciamientoController],
  providers: [FinanciamientoAdminService, AuditoriaService],
})
export class FinanciamientoModule {}
