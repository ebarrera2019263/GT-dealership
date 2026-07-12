import { Controller, Get } from '@nestjs/common';
import { Publico } from '../auth/decorators/publico.decorator';
import { FinanciamientoAdminService } from './financiamiento-admin.service';

// Planes públicos para el simulador de la ficha (sin cuenta).
@Publico()
@Controller('financiamiento')
export class FinanciamientoController {
  constructor(private readonly financiamiento: FinanciamientoAdminService) {}

  @Get('planes')
  planes() {
    return this.financiamiento.planesPublicos();
  }
}
