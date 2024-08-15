import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { FastifyRequest } from 'fastify';

describe('RolesGuard', () => {
  let rolesGuard: RolesGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    rolesGuard = module.get<RolesGuard>(RolesGuard);
  });

  it('should be defined', () => {
    expect(rolesGuard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should throw BadRequestException if namespace is not supplied.', () => {
      const contextMock: ExecutionContext = {
        switchToHttp: () => ({
          getRequest: () =>
            ({
              params: {},
              headers: {},
            } as FastifyRequest),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as any;

      expect(() => rolesGuard.canActivate(contextMock)).toThrow(
        BadRequestException,
      );
    });

    it('should return true if no roles are specified', async () => {
      const contextMock: ExecutionContext = {
        switchToHttp: () => ({
          getRequest: () =>
            ({
              params: { namespace: 'testNamespace' },
              headers: {},
            } as FastifyRequest),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as any;

      const result = rolesGuard.canActivate(contextMock);

      expect(result).toBe(true);
    });
  });
});
