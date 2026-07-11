import { BadRequestException, Injectable, type PipeTransform } from '@nestjs/common';
import type { ZodType } from 'zod';

/**
 * Valida el body contra un schema Zod compartido con el frontend.
 * La validación del formulario es cortesía; esta es la de verdad.
 */
@Injectable()
export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: ZodType<T>) {}

  transform(value: unknown): T {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException({
        mensaje: 'Datos inválidos',
        errores: result.error.issues.map((i) => ({
          campo: i.path.join('.'),
          detalle: i.message,
        })),
      });
    }
    return result.data;
  }
}
