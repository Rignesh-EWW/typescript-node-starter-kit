import { S3Client } from '@aws-sdk/client-s3';
import { LocalStorage } from '@/adapters/storage/LocalStorage';
import { S3Storage } from '@/adapters/storage/S3Storage';
import type { Storage } from '@/adapters/storage/Storage';
const config = require("../../config");

export const createStorage = (): Storage => {
  const driver = config.storage.driver;
  if (driver === 's3') {
    const client = new S3Client({ region: config.storage.aws.region });
    return new S3Storage(
      client,
      config.storage.aws.bucket!,
      config.storage.aws.baseUrl
    );
  }
  const root = config.storage.local.path;
  return new LocalStorage(root);
};
