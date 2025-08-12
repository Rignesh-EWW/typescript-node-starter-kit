import path from 'path';
import { S3Client } from '@aws-sdk/client-s3';
import { LocalStorage } from '@/adapters/storage/LocalStorage';
import { S3Storage } from '@/adapters/storage/S3Storage';
import type { Storage } from '@/adapters/storage/Storage';

export const createStorage = (): Storage => {
  const driver = process.env.STORAGE_DRIVER || 'local';
  if (driver === 's3') {
    const client = new S3Client({ region: process.env.AWS_REGION });
    return new S3Storage(client, process.env.AWS_S3_BUCKET!, process.env.AWS_S3_BASE_URL);
  }
  const root = process.env.LOCAL_STORAGE_PATH || path.join(process.cwd(), 'uploads');
  return new LocalStorage(root);
};
