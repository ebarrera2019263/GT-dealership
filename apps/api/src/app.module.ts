import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { env } from './config/env';
import { AdminModule } from './modules/admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './modules/auth/guards/roles.guard';
import { BusquedasModule } from './modules/busquedas/busquedas.module';
import { CatalogoModule } from './modules/catalogo/catalogo.module';
import { FavoritosModule } from './modules/favoritos/favoritos.module';
import { FinanciamientoModule } from './modules/financiamiento/financiamiento.module';
import { LeadsModule } from './modules/leads/leads.module';
import { MensajeriaModule } from './modules/mensajeria/mensajeria.module';
import { ModeracionModule } from './modules/moderacion/moderacion.module';
import { ReportesModule } from './modules/reportes/reportes.module';
import { SaludModule } from './modules/salud/salud.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { VehiculosModule } from './modules/vehiculos/vehiculos.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    // Límite global laxo; los endpoints sensibles (login, registro) declaran el suyo.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    // Tareas programadas (cron de alertas de búsquedas guardadas).
    ScheduleModule.forRoot(),
    // Cola de notificaciones (emails de leads/mensajes/alertas) sobre Redis.
    BullModule.forRoot({
      connection: (() => {
        const url = new URL(env.REDIS_URL);
        return { host: url.hostname, port: Number(url.port) || 6379 };
      })(),
    }),
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
    ReportesModule,
    FinanciamientoModule,
  ],
  providers: [
    // Orden: throttling → autenticación → autorización por rol.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
