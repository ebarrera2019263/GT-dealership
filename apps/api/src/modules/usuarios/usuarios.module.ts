import { Module } from '@nestjs/common';
import { MiController } from './mi.controller';
import { UsuariosService } from './usuarios.service';

@Module({
  controllers: [MiController],
  providers: [UsuariosService],
  exports: [UsuariosService],
})
export class UsuariosModule {}
