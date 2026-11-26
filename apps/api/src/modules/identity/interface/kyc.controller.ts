import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { KycService } from '../application/kyc.service';
import { JwtAuthGuard } from '../../../shared-kernel/guards/jwt-auth.guard';
import { RunProviderVerificationUseCase } from '../../fraud/application/run-provider-verification.usecase';

@Controller('identity/kyc')
@UseGuards(JwtAuthGuard)
export class KycController {
  constructor(
    private readonly kycService: KycService,
    private readonly runProviderVerification: RunProviderVerificationUseCase,
  ) {}

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

  @Get('admin/pending')
  async listPending() {
    return this.kycService.listPendingSubmissions();
  }

  @Post('admin/:id/approve')
  @HttpCode(HttpStatus.OK)
  async approve(@Param('id') id: string, @Request() req) {
    const adminId = req?.user?.id ?? 'admin-system';
    return this.kycService.approveSubmission(id, adminId);
  }

  @Post('admin/:id/reject')
  @HttpCode(HttpStatus.OK)
  async reject(
    @Param('id') id: string,
    @Body() body: { reason?: string },
    @Request() req,
  ) {
    const adminId = req?.user?.id ?? 'admin-system';
    return this.kycService.rejectSubmission(id, body?.reason ?? '', adminId);
  }

  /**
   * Endpoint para iniciar a verificação completa de segurança do prestador.
   * Deve ser chamado após o upload dos documentos via /upload-url.
   */
  @Post('verify-provider')
  @HttpCode(HttpStatus.ACCEPTED)
  async verifyProvider(
    @Request() req,
    @Body()
    body: {
      cnpj: string;
      cpf: string;
      selfieUrl: string;
      documentUrl: string;
      documentType: 'RG' | 'CNH';
    },
  ) {
    const result = await this.runProviderVerification.execute({
      providerId: req.user.id,
      userId: req.user.id,
      cpf: body.cpf,
      cnpj: body.cnpj,
      selfieUrl: body.selfieUrl,
      documentUrl: body.documentUrl,
      documentType: body.documentType,
    });

    return {
      status: result.status,
      message: this.statusMessage(result.status),
    };
  }

  private statusMessage(status: string): string {
    const messages: Record<string, string> = {
      APPROVED: 'Verificação concluída com sucesso. Seu cadastro foi aprovado!',
      BLOCKED:
        'Infelizmente não foi possível aprovar seu cadastro. Entre em contato com o suporte.',
      MANUAL_REVIEW:
        'Seus dados estão em análise. Entraremos em contato em até 3 dias úteis.',
    };
    return messages[status] ?? 'Status desconhecido.';
  }
}
