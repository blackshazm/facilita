import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { KycService } from '../application/kyc.service';
import { JwtAuthGuard } from '../../../shared-kernel/guards/jwt-auth.guard';

@Controller('identity/kyc')
@UseGuards(JwtAuthGuard)
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @Post('upload-url')
  @HttpCode(HttpStatus.OK)
  async getUploadUrl(
    @Request() req,
    @Body() body: { type: 'selfie' | 'document_front' | 'document_back'; mimeType: string },
  ) {
    return this.kycService.getUploadUrl(req.user.id, body.type, body.mimeType);
  }

  @Post('submit')
  async submit(
    @Request() req,
    @Body()
    body: {
      selfieKey: string;
      documentFrontKey: string;
      documentBackKey?: string;
    },
  ) {
    return this.kycService.submit(req.user.id, body);
  }
}
