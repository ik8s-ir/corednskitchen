import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FastifyRequest } from 'fastify';
import { Roles } from './roles.decorator';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const IdTokenVerifier = require('idtoken-verifier');

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get(Roles, context.getHandler());

    const req: FastifyRequest = context.switchToHttp().getRequest();
    const namespace = req.params['namespace'];
    Logger.debug(req.headers);
    if (!namespace)
      throw new BadRequestException('namespace (tenant) not supplied');
    if (!roles) {
      return true;
    }
    const id_token = req.headers.authorization?.replace('Bearer', '').trim();
    if (!id_token) throw new BadRequestException("idToken hasn't supplied");
    const verifier = new IdTokenVerifier({
      issuer: 'https://iam.stg.ik8s.ir/oidc',
      audience: 'k3s',
      jwksURI: 'https://iam.stg.ik8s.ir/oidc/jwks',
    });

    try {
      const payload: any = await new Promise((resolve, reject) => {
        verifier.verify(id_token, (err, payload) => {
          if (err) reject(err);
          resolve(payload);
        });
      });
      return payload.groups?.some((group: string) =>
        roles.map((role: string) => `${namespace}/${role}`).includes(group),
      )
        ? true
        : false;
    } catch (e) {
      return false;
    }
  }
}
