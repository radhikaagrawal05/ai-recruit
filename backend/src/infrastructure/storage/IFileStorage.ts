export interface IFileStorage {
  upload(fileBuffer: Buffer, key: string, mimetype: string): Promise<string>;
  getUrl(key: string): Promise<string>;
  delete(key: string): Promise<void>;
}
