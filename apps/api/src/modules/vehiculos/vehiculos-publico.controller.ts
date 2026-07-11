import { type VehiculosFiltros, vehiculosFiltrosSchema } from '@concesionario/shared';
import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { Publico } from '../auth/decorators/publico.decorator';
import { VehiculosService } from './vehiculos.service';

@Publico()
@Controller('vehiculos')
export class VehiculosPublicoController {
  constructor(private readonly vehiculosService: VehiculosService) {}

  @Get()
  listar(@Query(new ZodValidationPipe(vehiculosFiltrosSchema)) filtros: VehiculosFiltros) {
    return this.vehiculosService.listar(filtros);
  }

  @Get(':id/similares')
  similares(@Param('id', ParseIntPipe) id: number) {
    return this.vehiculosService.similares(id);
  }

  @Get(':slug')
  ficha(@Param('slug') slug: string) {
    return this.vehiculosService.fichaPorSlug(slug);
  }
}
