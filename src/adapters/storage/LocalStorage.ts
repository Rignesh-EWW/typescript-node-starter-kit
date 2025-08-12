import { promises as fs } from 'fs';
import path from 'path';
import type { Storage } from './Storage';

export class LocalStorage implements Storage {
  constructor(private root: string) {}

  async put(filePath: string, content: Buffer): Promise<void> {
    const fullPath = path.join(this.root, filePath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content);
  }

  async delete(filePath: string): Promise<void> {
    const fullPath = path.join(this.root, filePath);
    await fs.unlink(fullPath).catch(() => undefined);
  }

  url(filePath: string): string {
    const base = process.env.APP_URL || '';
    // assuming express serves this.root as '/uploads'
    const prefix = process.env.LOCAL_STORAGE_URL_PREFIX || '/uploads';
    return `${base}${prefix}/${filePath}`.replace(/\+/g, '/');
  }
}
