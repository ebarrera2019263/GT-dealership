import { Module } from '@nestjs/common';
import { AuditoriaService } from '../../common/auditoria.service';
import { AdminCatalogoController } from './admin-catalogo.controller';
import { AdminCatalogoService } from './admin-catalogo.service';
import { CatalogoController } from './catalogo.controller';
import { CatalogoService } from './catalogo.service';

@Module({
  controllers: [CatalogoController, AdminCatalogoController],
  providers: [CatalogoService, AdminCatalogoService, AuditoriaService],
  exports: [CatalogoService],
})
export class CatalogoModule {}
