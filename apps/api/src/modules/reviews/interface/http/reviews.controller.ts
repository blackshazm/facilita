import { Controller, Post, Get, Body, Param, Req, UseGuards } from '@nestjs/common';
import { SubmitReviewUseCase } from '../../application/submit-review.usecase';
import { GetOrderReviewsUseCase } from '../../application/get-order-reviews.usecase';
import { SubmitReviewDto } from './dtos/submit-review.dto';
import { JwtAuthGuard } from '../../../../shared-kernel/guards/jwt-auth.guard';

@Controller('orders/:id/reviews')
export class ReviewsController {
  constructor(
    private readonly submitReviewUseCase: SubmitReviewUseCase,
    private readonly getOrderReviewsUseCase: GetOrderReviewsUseCase
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async submitReview(
    @Param('id') orderId: string,
    @Body() dto: SubmitReviewDto,
    @Req() req: any
  ) {
    const authorId = req.user.id;
    return this.submitReviewUseCase.execute(orderId, authorId, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getReviews(@Param('id') orderId: string) {
    return this.getOrderReviewsUseCase.execute(orderId);
  }
}
