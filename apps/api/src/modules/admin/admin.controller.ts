import { Controller, Get } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminService } from './admin.service';

// Todo /api/admin/* exige rol admin (esquema §5.4).
@Roles('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('metricas')
  metricas() {
    return this.admin.metricas();
  }
}
