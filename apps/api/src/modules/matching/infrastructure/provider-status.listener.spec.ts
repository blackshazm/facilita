import { Test, TestingModule } from '@nestjs/testing';
import { ProviderStatusListener } from './provider-status.listener';

describe('ProviderStatusListener', () => {
  let provider: ProviderStatusListener;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProviderStatusListener,
        // TODO: Add mocked dependencies here
      ],
    }).compile();

    provider = module.get<ProviderStatusListener>(ProviderStatusListener);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
