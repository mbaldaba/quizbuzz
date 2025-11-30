import { UseGuards, applyDecorators } from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { SessionGuard } from '../guards/session.guard';
import { AdminGuard } from '../guards/admin.guard';

export function AdminOnly() {
  return applyDecorators(
    UseGuards(SessionGuard, AdminGuard),
    ApiCookieAuth('sessionId'),
    ApiUnauthorizedResponse({
      description: 'No session found or session expired',
    }),
    ApiForbiddenResponse({
      description: 'Admin access required',
    }),
  );
}
