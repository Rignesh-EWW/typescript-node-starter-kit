import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import type { Storage } from './Storage';

export class S3Storage implements Storage {
  constructor(private client: any, private bucket: string, private baseUrl?: string) {}

  async put(path: string, content: Buffer, mimeType: string): Promise<void> {
    await this.client.send(
      new PutObjectCommand({ Bucket: this.bucket, Key: path, Body: content, ContentType: mimeType })
    );
  }

  async delete(path: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: path }));
  }

  url(path: string): string {
    if (this.baseUrl) {
      return `${this.baseUrl.replace(/\/$/, '')}/${path}`;
    }
    const region = process.env.AWS_REGION;
    return `https://${this.bucket}.s3.${region}.amazonaws.com/${path}`;
  }
}
