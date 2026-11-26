import { Test, TestingModule } from '@nestjs/testing';
import { UpdateProviderRatingListener } from './update-provider-rating.listener';
import { PrismaService } from '../../../../shared-kernel/database/prisma.service';
import { getQueueToken } from '@nestjs/bullmq';

describe('UpdateProviderRatingListener', () => {
  let provider: UpdateProviderRatingListener;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateProviderRatingListener,
        {
          provide: PrismaService,
          useValue: { review: { findMany: jest.fn() }, providerProfile: { update: jest.fn() } },
        },
        {
          provide: getQueueToken('tiering'),
          useValue: { add: jest.fn() },
        },
      ],
    }).compile();

    provider = module.get<UpdateProviderRatingListener>(UpdateProviderRatingListener);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
