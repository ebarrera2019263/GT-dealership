import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

interface RegistroAuditoria {
  usuarioId: number | null;
  accion: string;
  entidad: string;
  entidadId: number;
  datosAntes?: Prisma.InputJsonValue;
  datosDespues?: Prisma.InputJsonValue;
  ip?: string;
}

/**
 * Esquema §3.7: sin esto no sabés quién aprobó o borró qué.
 * Acepta un cliente transaccional para que el registro sea atómico
 * con el cambio que documenta.
 */
@Injectable()
export class AuditoriaService {
  constructor(private readonly prisma: PrismaService) {}

  registrar(datos: RegistroAuditoria, tx: Prisma.TransactionClient = this.prisma) {
    return tx.auditoria.create({
      data: {
        usuarioId: datos.usuarioId,
        accion: datos.accion,
        entidad: datos.entidad,
        entidadId: datos.entidadId,
        datosAntes: datos.datosAntes,
        datosDespues: datos.datosDespues,
        ip: datos.ip,
      },
    });
  }
}
