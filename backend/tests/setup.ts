import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset } from 'jest-mock-extended';

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockDeep<PrismaClient>()),
}));

beforeEach(() => {
  mockReset(prismaMock);
});

export const prismaMock = mockDeep<PrismaClient>(); 