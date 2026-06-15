import fs from "fs";
import path from "path";
import { IFileStorage } from "./IFileStorage";

const UPLOADS_DIR = path.join(__dirname, "../../../uploads");

export class LocalFileStorage implements IFileStorage {
  constructor() {
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
  }

  async upload(fileBuffer: Buffer, key: string, _mimetype: string): Promise<string> {
    const filePath = path.join(UPLOADS_DIR, key);
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, fileBuffer);
    return `/uploads/${key}`;
  }

  async getUrl(key: string): Promise<string> {
    return `/uploads/${key}`;
  }

  async delete(key: string): Promise<void> {
    const filePath = path.join(UPLOADS_DIR, key);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}
