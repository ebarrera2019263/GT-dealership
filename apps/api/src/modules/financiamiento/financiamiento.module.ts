import { Module } from '@nestjs/common';
import { AuditoriaService } from '../../common/auditoria.service';
import { AdminFinanciamientoController } from './admin-financiamiento.controller';
import { FinanciamientoController } from './financiamiento.controller';
import { FinanciamientoAdminService } from './financiamiento-admin.service';

@Module({
  controllers: [FinanciamientoController, AdminFinanciamientoController],
  providers: [FinanciamientoAdminService, AuditoriaService],
})
export class FinanciamientoModule {}
