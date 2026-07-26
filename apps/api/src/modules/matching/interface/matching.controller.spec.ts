import { Test, TestingModule } from '@nestjs/testing';
import { MatchingController } from './matching.controller';

describe('MatchingController', () => {
  let provider: MatchingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchingController,
        // TODO: Add mocked dependencies here
      ],
    }).compile();

    provider = module.get<MatchingController>(MatchingController);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
