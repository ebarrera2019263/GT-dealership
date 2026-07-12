import { type ReporteCrearInput, reporteCrearSchema } from '@concesionario/shared';
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { Publico } from '../auth/decorators/publico.decorator';
import { ReportesService } from './reportes.service';

// Reportar un anuncio no requiere cuenta. Rate limit estricto: blanco de abuso.
@Publico()
@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportes: ReportesService) {}

  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  crear(@Body(new ZodValidationPipe(reporteCrearSchema)) body: ReporteCrearInput) {
    return this.reportes.crear(body);
  }
}
