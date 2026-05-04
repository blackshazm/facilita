import { Controller, Post, Param, Body, UseGuards } from '@nestjs/common';
import { OrderService } from '../application/order.service';
import { JwtAuthGuard } from '../../../shared-kernel/guards/jwt-auth.guard';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':id/check-in')
  async checkIn(
    @Param('id') id: string,
    @Body() body: { lat: number; lng: number }
  ) {
    await this.orderService.checkIn(id, body.lat, body.lng);
    return { success: true, message: 'Check-in successful' };
  }
}
