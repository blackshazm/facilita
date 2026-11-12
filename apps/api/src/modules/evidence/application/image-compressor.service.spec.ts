import { ImageCompressorService } from './image-compressor.service';
const sharp = require('sharp');

describe('ImageCompressorService', () => {
  let service: ImageCompressorService;

  beforeEach(() => {
    service = new ImageCompressorService();
  });

  it('should compress a raw image buffer into WebP with dimension limit', async () => {
    // Cria uma imagem de teste 2000x2000 em JPEG
    const testImageBuffer = await sharp({
      create: {
        width: 2000,
        height: 2000,
        channels: 3,
        background: { r: 50, g: 150, b: 200 },
      },
    })
      .jpeg()
      .toBuffer();

    const result = await service.compress(testImageBuffer);

    expect(result.format).toBe('image/webp');
    expect(result.compressedSize).toBeLessThan(result.originalSize);
    expect(result.width).toBeLessThanOrEqual(1280);
    expect(result.height).toBeLessThanOrEqual(1280);
  });

  it('should preserve dimensions if image is smaller than max limit', async () => {
    // Imagem 400x300
    const smallBuffer = await sharp({
      create: {
        width: 400,
        height: 300,
        channels: 3,
        background: { r: 255, g: 0, b: 0 },
      },
    })
      .png()
      .toBuffer();

    const result = await service.compress(smallBuffer);

    expect(result.format).toBe('image/webp');
    expect(result.width).toBe(400);
    expect(result.height).toBe(300);
  });

  it('should throw an error for empty buffer', async () => {
    await expect(service.compress(Buffer.from([]))).rejects.toThrow('Buffer de imagem vazio ou inválido.');
  });
});
