import { CloudflareR2StorageAdapter } from '../infrastructure/cloudflare-r2-storage.adapter';

describe('CloudflareR2StorageAdapter', () => {
  let adapter: CloudflareR2StorageAdapter;

  beforeEach(() => {
    delete process.env.CLOUDFLARE_R2_ACCOUNT_ID;
    delete process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
    delete process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
    adapter = new CloudflareR2StorageAdapter();
  });

  it('deve gerar presigned upload URL em modo simulado com parâmetros corretos', async () => {
    const key = 'kyc/user-123/selfie.jpg';
    const contentType = 'image/jpeg';
    const expiresIn = 900;

    const url = await adapter.generatePresignedUploadUrl(key, contentType, expiresIn);

    expect(url).toBeDefined();
    expect(url).toContain('r2.cloudflarestorage.com');
    expect(url).toContain(key);
    expect(url).toContain('action=upload');
    expect(url).toContain('image%2Fjpeg');
    expect(url).toContain('expires=900');
  });

  it('deve gerar presigned download URL em modo simulado com parâmetros corretos', async () => {
    const key = 'kyc/user-123/doc-front.png';
    const expiresIn = 600;

    const url = await adapter.generatePresignedDownloadUrl(key, expiresIn);

    expect(url).toBeDefined();
    expect(url).toContain('r2.cloudflarestorage.com');
    expect(url).toContain(key);
    expect(url).toContain('action=download');
    expect(url).toContain('expires=600');
  });
});
