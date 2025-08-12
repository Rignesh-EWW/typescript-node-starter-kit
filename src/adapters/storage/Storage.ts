export interface Storage {
  put(path: string, content: Buffer, mimeType: string): Promise<void>;
  delete(path: string): Promise<void>;
  url(path: string): string;
}
