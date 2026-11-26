import { Test, TestingModule } from '@nestjs/testing';
import { ProviderStatusListener } from './provider-status.listener';
import { PrismaService } from '../../../shared-kernel/database/prisma.service';

describe('ProviderStatusListener', () => {
  let provider: ProviderStatusListener;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProviderStatusListener,
        {
          provide: PrismaService,
          useValue: { activeProvider: { upsert: jest.fn(), update: jest.fn() } },
        },
      ],
    }).compile();

    provider = module.get<ProviderStatusListener>(ProviderStatusListener);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
