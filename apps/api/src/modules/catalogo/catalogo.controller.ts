import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { Publico } from '../auth/decorators/publico.decorator';
import { CatalogoService } from './catalogo.service';

@Publico()
@Controller('catalogo')
export class CatalogoController {
  constructor(private readonly catalogoService: CatalogoService) {}

  @Get('marcas')
  marcas() {
    return this.catalogoService.marcas();
  }

  @Get('marcas/:id/modelos')
  modelos(@Param('id', ParseIntPipe) marcaId: number) {
    return this.catalogoService.modelosDeMarca(marcaId);
  }

  @Get('carrocerias')
  carrocerias() {
    return this.catalogoService.carrocerias();
  }

  @Get('combustibles')
  combustibles() {
    return this.catalogoService.combustibles();
  }

  @Get('transmisiones')
  transmisiones() {
    return this.catalogoService.transmisiones();
  }

  @Get('caracteristicas')
  caracteristicas() {
    return this.catalogoService.caracteristicas();
  }

  @Get('departamentos')
  departamentos() {
    return this.catalogoService.departamentos();
  }
}
