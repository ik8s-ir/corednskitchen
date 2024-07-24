import {
  Logger,
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FastifyRequest } from 'fastify';
import { Roles } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get(Roles, context.getHandler());
    const req: FastifyRequest = context.switchToHttp().getRequest();
    const namespace = req.params['namespace'];
    if (!namespace) {
      throw new BadRequestException('namespace not supplied');
    }
    if (!roles?.length) {
      return true;
    }
    Logger.debug(req.headers);
    const nsRoles = roles.map((role: string) => `${namespace}/${role}`);

    return !!nsRoles.some((role) =>
      req.headers['x-remote-group']?.includes(role),
    );
  }
}
