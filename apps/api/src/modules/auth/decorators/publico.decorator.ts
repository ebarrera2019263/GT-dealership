import { SetMetadata } from '@nestjs/common';

export const ES_PUBLICO = 'esPublico';

/** Marca un endpoint como accesible sin token (el guard global lo omite). */
export const Publico = () => SetMetadata(ES_PUBLICO, true);
