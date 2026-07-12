import { Module } from '@nestjs/common';
import { AuditoriaService } from '../../common/auditoria.service';
import { AdminUsuariosController } from './admin-usuarios.controller';
import { MiController } from './mi.controller';
import { UsuariosService } from './usuarios.service';

@Module({
  controllers: [MiController, AdminUsuariosController],
  providers: [UsuariosService, AuditoriaService],
  exports: [UsuariosService],
})
export class UsuariosModule {}
