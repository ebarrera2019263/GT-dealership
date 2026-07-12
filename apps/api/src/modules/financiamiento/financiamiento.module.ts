import { Module } from '@nestjs/common';
import { AuditoriaService } from '../../common/auditoria.service';
import { AdminFinanciamientoController } from './admin-financiamiento.controller';
import { AdminSolicitudesController } from './admin-solicitudes.controller';
import { FinanciamientoController } from './financiamiento.controller';
import { FinanciamientoAdminService } from './financiamiento-admin.service';
import { SolicitudesController } from './solicitudes.controller';
import { SolicitudesService } from './solicitudes.service';

@Module({
  controllers: [
    FinanciamientoController,
    AdminFinanciamientoController,
    SolicitudesController,
    AdminSolicitudesController,
  ],
  providers: [FinanciamientoAdminService, SolicitudesService, AuditoriaService],
})
export class FinanciamientoModule {}
