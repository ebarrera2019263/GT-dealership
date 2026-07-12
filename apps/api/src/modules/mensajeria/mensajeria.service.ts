import type { EnviarMensajeInput, IniciarConversacionInput } from '@concesionario/shared';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { UsuarioAutenticado } from '../auth/auth.types';

const RESUMEN_VEHICULO = {
  select: {
    id: true,
    slug: true,
    anio: true,
    estado: true,
    marca: { select: { nombre: true } },
    modelo: { select: { nombre: true } },
    imagenes: { where: { esPrincipal: true }, take: 1, select: { urlThumb: true, url: true } },
  },
} as const;

const PARTICIPANTE = { select: { id: true, nombre: true } } as const;

@Injectable()
export class MensajeriaService {
  constructor(private readonly prisma: PrismaService) {}

  /** El comprador abre (o reusa) la conversación sobre un anuncio y deja el primer mensaje. */
  async iniciar(usuario: UsuarioAutenticado, input: IniciarConversacionInput) {
    const vehiculo = await this.prisma.vehiculo.findUnique({
      where: { id: input.vehiculoId },
      select: { id: true, usuarioId: true, estado: true },
    });
    if (!vehiculo || vehiculo.estado !== 'publicado') {
      throw new NotFoundException('Anuncio no encontrado');
    }
    if (vehiculo.usuarioId === usuario.id) {
      throw new BadRequestException('No podés escribirte a vos mismo sobre tu propio anuncio');
    }

    // Una conversación por (anuncio, comprador): unique en el schema.
    const existente = await this.prisma.conversacion.findUnique({
      where: { vehiculoId_compradorId: { vehiculoId: vehiculo.id, compradorId: usuario.id } },
      select: { id: true },
    });

    if (existente) {
      await this.prisma.$transaction([
        this.prisma.mensaje.create({
          data: { conversacionId: existente.id, emisorId: usuario.id, contenido: input.contenido },
        }),
        this.prisma.conversacion.update({
          where: { id: existente.id },
          data: { ultimoMensajeEn: new Date() },
        }),
      ]);
      return { id: existente.id };
    }

    // Conversación nueva = un contacto más para la métrica del vendedor.
    const [conversacion] = await this.prisma.$transaction([
      this.prisma.conversacion.create({
        data: {
          vehiculoId: vehiculo.id,
          compradorId: usuario.id,
          vendedorId: vehiculo.usuarioId,
          ultimoMensajeEn: new Date(),
          mensajes: { create: { emisorId: usuario.id, contenido: input.contenido } },
        },
        select: { id: true },
      }),
      this.prisma.vehiculo.update({
        where: { id: vehiculo.id },
        data: { contactos: { increment: 1 } },
      }),
    ]);
    return { id: conversacion.id };
  }

  /** Lista mis conversaciones (sea como comprador o como vendedor), con no-leídos. */
  async misConversaciones(usuario: UsuarioAutenticado) {
    const conversaciones = await this.prisma.conversacion.findMany({
      where: { OR: [{ compradorId: usuario.id }, { vendedorId: usuario.id }] },
      orderBy: { ultimoMensajeEn: 'desc' },
      select: {
        id: true,
        compradorId: true,
        vendedorId: true,
        ultimoMensajeEn: true,
        vehiculo: RESUMEN_VEHICULO,
        comprador: PARTICIPANTE,
        vendedor: PARTICIPANTE,
        mensajes: {
          orderBy: { creadoEn: 'desc' },
          take: 1,
          select: { contenido: true, creadoEn: true, emisorId: true },
        },
        _count: {
          select: { mensajes: { where: { leido: false, NOT: { emisorId: usuario.id } } } },
        },
      },
    });

    return conversaciones.map((c) => {
      const soyComprador = c.compradorId === usuario.id;
      return {
        id: c.id,
        vehiculo: c.vehiculo,
        // "El otro": si soy comprador veo al vendedor, y viceversa.
        contraparte: soyComprador ? c.vendedor : c.comprador,
        rolPropio: soyComprador ? 'comprador' : 'vendedor',
        ultimoMensaje: c.mensajes[0] ?? null,
        noLeidos: c._count.mensajes,
        ultimoMensajeEn: c.ultimoMensajeEn,
      };
    });
  }

  /** Detalle con todos los mensajes; marca como leídos los que me mandó la contraparte. */
  async detalle(usuario: UsuarioAutenticado, id: number) {
    const conversacion = await this.obtenerParticipante(usuario, id);

    await this.prisma.mensaje.updateMany({
      where: { conversacionId: id, leido: false, NOT: { emisorId: usuario.id } },
      data: { leido: true },
    });

    const [vehiculo, contraparte, mensajes] = await Promise.all([
      this.prisma.vehiculo.findUnique({
        where: { id: conversacion.vehiculoId },
        ...RESUMEN_VEHICULO,
      }),
      this.prisma.usuario.findUnique({
        where: {
          id:
            conversacion.compradorId === usuario.id
              ? conversacion.vendedorId
              : conversacion.compradorId,
        },
        ...PARTICIPANTE,
      }),
      this.prisma.mensaje.findMany({
        where: { conversacionId: id },
        orderBy: { creadoEn: 'asc' },
        select: { id: true, emisorId: true, contenido: true, creadoEn: true },
      }),
    ]);

    return {
      id: conversacion.id,
      rolPropio: conversacion.compradorId === usuario.id ? 'comprador' : 'vendedor',
      vehiculo,
      contraparte,
      mensajes: mensajes.map((m) => ({ ...m, mio: m.emisorId === usuario.id })),
    };
  }

  /** Responde en una conversación existente. */
  async enviar(usuario: UsuarioAutenticado, id: number, input: EnviarMensajeInput) {
    await this.obtenerParticipante(usuario, id);
    const [mensaje] = await this.prisma.$transaction([
      this.prisma.mensaje.create({
        data: { conversacionId: id, emisorId: usuario.id, contenido: input.contenido },
        select: { id: true, emisorId: true, contenido: true, creadoEn: true },
      }),
      this.prisma.conversacion.update({
        where: { id },
        data: { ultimoMensajeEn: new Date() },
      }),
    ]);
    return { ...mensaje, mio: true };
  }

  /** Cuenta de mensajes sin leer en todas mis conversaciones (para el badge del nav). */
  async noLeidos(usuario: UsuarioAutenticado) {
    const total = await this.prisma.mensaje.count({
      where: {
        leido: false,
        NOT: { emisorId: usuario.id },
        conversacion: { OR: [{ compradorId: usuario.id }, { vendedorId: usuario.id }] },
      },
    });
    return { total };
  }

  /** Autorización: solo comprador o vendedor de la conversación (o admin). */
  private async obtenerParticipante(usuario: UsuarioAutenticado, id: number) {
    const conversacion = await this.prisma.conversacion.findUnique({
      where: { id },
      select: { id: true, vehiculoId: true, compradorId: true, vendedorId: true },
    });
    if (!conversacion) {
      throw new NotFoundException('Conversación no encontrada');
    }
    const participa =
      conversacion.compradorId === usuario.id || conversacion.vendedorId === usuario.id;
    if (!participa && usuario.rol !== 'admin') {
      throw new ForbiddenException('No participás en esta conversación');
    }
    return conversacion;
  }
}
