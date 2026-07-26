import { Test, TestingModule } from '@nestjs/testing';
import { UpdateProviderRatingListener } from './update-provider-rating.listener';

describe('UpdateProviderRatingListener', () => {
  let provider: UpdateProviderRatingListener;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateProviderRatingListener,
        // TODO: Add mocked dependencies here
      ],
    }).compile();

    provider = module.get<UpdateProviderRatingListener>(UpdateProviderRatingListener);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
