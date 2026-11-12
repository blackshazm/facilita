import { Injectable, Logger } from '@nestjs/common';
// Suporte CJS / ESM para Sharp
const sharp = require('sharp');

export interface CompressedImageResult {
  buffer: Buffer;
  originalSize: number;
  compressedSize: number;
  compressionRatio: string;
  format: string;
  width?: number;
  height?: number;
}

@Injectable()
export class ImageCompressorService {
  private readonly logger = new Logger(ImageCompressorService.name);
  private readonly maxDimension = 1280;
  private readonly defaultQuality = 80;

  async compress(imageBuffer: Buffer, quality = this.defaultQuality): Promise<CompressedImageResult> {
    if (!imageBuffer || imageBuffer.length === 0) {
      throw new Error('Buffer de imagem vazio ou inválido.');
    }

    const originalSize = imageBuffer.length;

    try {
      const pipeline = sharp(imageBuffer)
        .rotate() // Auto-orienta com base nos metadados EXIF
        .resize({
          width: this.maxDimension,
          height: this.maxDimension,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality, effort: 4 });

      const compressedBuffer = await pipeline.toBuffer();
      const metadata = await sharp(compressedBuffer).metadata();

      const compressedSize = compressedBuffer.length;
      const reductionPercent = (((originalSize - compressedSize) / originalSize) * 100).toFixed(1);

      this.logger.log(
        `[ImageCompressor] Evidência otimizada: ${(originalSize / 1024).toFixed(1)} KB -> ${(compressedSize / 1024).toFixed(1)} KB (-${reductionPercent}%)`,
      );

      return {
        buffer: compressedBuffer,
        originalSize,
        compressedSize,
        compressionRatio: `${reductionPercent}%`,
        format: 'image/webp',
        width: metadata.width,
        height: metadata.height,
      };
    } catch (error: any) {
      this.logger.error(`[ImageCompressor] Falha ao processar imagem: ${error.message}`);
      // Fallback: se o buffer não puder ser processado pelo sharp, retorna o original
      return {
        buffer: imageBuffer,
        originalSize,
        compressedSize: originalSize,
        compressionRatio: '0%',
        format: 'image/jpeg',
      };
    }
  }
}
