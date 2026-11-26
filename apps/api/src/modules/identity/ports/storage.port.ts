export abstract class StoragePort {
  abstract generatePresignedUploadUrl(
    key: string,
    contentType: string,
    expiresInSeconds?: number,
  ): Promise<string>;

  abstract generatePresignedDownloadUrl(
    key: string,
    expiresInSeconds?: number,
  ): Promise<string>;
}
