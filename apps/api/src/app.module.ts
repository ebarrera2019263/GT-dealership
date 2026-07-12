import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AdminModule } from './modules/admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './modules/auth/guards/roles.guard';
import { BusquedasModule } from './modules/busquedas/busquedas.module';
import { CatalogoModule } from './modules/catalogo/catalogo.module';
import { FavoritosModule } from './modules/favoritos/favoritos.module';
import { LeadsModule } from './modules/leads/leads.module';
import { MensajeriaModule } from './modules/mensajeria/mensajeria.module';
import { ModeracionModule } from './modules/moderacion/moderacion.module';
import { SaludModule } from './modules/salud/salud.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { VehiculosModule } from './modules/vehiculos/vehiculos.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    // Límite global laxo; los endpoints sensibles (login, registro) declaran el suyo.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    PrismaModule,
    AuthModule,
    UsuariosModule,
    CatalogoModule,
    SaludModule,
    AdminModule,
    VehiculosModule,
    ModeracionModule,
    LeadsModule,
    MensajeriaModule,
    FavoritosModule,
    BusquedasModule,
  ],
  providers: [
    // Orden: throttling → autenticación → autorización por rol.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
