import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsController } from './reviews.controller';
import { SubmitReviewUseCase } from '../../application/submit-review.usecase';
import { GetOrderReviewsUseCase } from '../../application/get-order-reviews.usecase';

describe('ReviewsController', () => {
  let provider: ReviewsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewsController],
      providers: [
        { provide: SubmitReviewUseCase, useValue: { execute: jest.fn() } },
        { provide: GetOrderReviewsUseCase, useValue: { execute: jest.fn() } },
      ],
    }).compile();

    provider = module.get<ReviewsController>(ReviewsController);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
