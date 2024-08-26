import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { DomainRepository } from '../../infrastructure/database/domain.repository';

@Injectable()
export class DomainOwnerGuard implements CanActivate {
  constructor(private readonly domainRepository: DomainRepository) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: FastifyRequest = context.switchToHttp().getRequest();
    const domainId = req.params['domainId'];
    const namespace = req.params['namespace'];
    const count = await this.domainRepository.count({
      where: { id: domainId, namespace },
    });
    return !!count;
  }
}
