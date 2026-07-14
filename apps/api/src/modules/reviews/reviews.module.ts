import { Module } from '@nestjs/common';
import { ReviewsController } from './interface/http/reviews.controller';
import { SubmitReviewUseCase } from './application/submit-review.usecase';
import { GetOrderReviewsUseCase } from './application/get-order-reviews.usecase';
import { SharedKernelModule } from '../../shared-kernel/shared-kernel.module';

@Module({
  imports: [SharedKernelModule],
  controllers: [ReviewsController],
  providers: [SubmitReviewUseCase, GetOrderReviewsUseCase],
  exports: [],
})
export class ReviewsModule {}
