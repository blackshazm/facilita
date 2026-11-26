import { Test, TestingModule } from '@nestjs/testing';
import { MatchingController } from './matching.controller';
import { MatchingService } from '../application/matching.service';

describe('MatchingController', () => {
  let provider: MatchingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchingController,
        { provide: MatchingService, useValue: { updateLocation: jest.fn(), findNearbyProviders: jest.fn() } },
      ],
    }).compile();

    provider = module.get<MatchingController>(MatchingController);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
