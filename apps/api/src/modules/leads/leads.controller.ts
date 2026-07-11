import { type LeadCrearInput, leadCrearSchema } from '@concesionario/shared';
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { Publico } from '../auth/decorators/publico.decorator';
import { LeadsService } from './leads.service';

@Publico()
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  // Contacto sin cuenta (esquema §5.1). Rate limit estricto: es un formulario
  // público, blanco natural de spam (esquema §8).
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  crear(@Body(new ZodValidationPipe(leadCrearSchema)) body: LeadCrearInput) {
    return this.leadsService.crear(body);
  }
}
