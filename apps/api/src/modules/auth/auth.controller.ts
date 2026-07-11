import {
  type LoginInput,
  loginSchema,
  type RefreshInput,
  type RegistroInput,
  refreshSchema,
  registroSchema,
} from '@concesionario/shared';
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { AuthService } from './auth.service';
import { Publico } from './decorators/publico.decorator';

@Publico()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Rate limiting estricto en registro y login (esquema §8).
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @Post('registro')
  registro(@Body(new ZodValidationPipe(registroSchema)) body: RegistroInput) {
    return this.authService.registrar(body);
  }

  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body(new ZodValidationPipe(loginSchema)) body: LoginInput) {
    return this.authService.login(body);
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  refresh(@Body(new ZodValidationPipe(refreshSchema)) body: RefreshInput) {
    return this.authService.refresh(body.refreshToken);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  async logout(@Body(new ZodValidationPipe(refreshSchema)) body: RefreshInput) {
    await this.authService.logout(body.refreshToken);
  }
}
