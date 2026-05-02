import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { MatchingService } from '../application/matching.service';
import { JwtAuthGuard } from '../../../shared-kernel/guards/jwt-auth.guard';
import { CurrentUser } from '../../../shared-kernel/decorators/current-user.decorator';

@Controller('matching')
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @UseGuards(JwtAuthGuard)
  @Post('location')
  async updateLocation(
    @CurrentUser() user: any,
    @Body() body: { lat: number; lng: number }
  ) {
    return this.matchingService.updateLocation(user.sub, body.lat, body.lng);
  }

  @Get('search')
  async search(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('categoryId') categoryId: string,
    @Query('radius') radius?: string
  ) {
    return this.matchingService.findNearbyProviders(
      parseFloat(lat),
      parseFloat(lng),
      categoryId,
      radius ? parseFloat(radius) : 10
    );
  }
}
