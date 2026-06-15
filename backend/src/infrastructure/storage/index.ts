import { env } from "../../shared/config/env";
import { IFileStorage } from "./IFileStorage";
import { LocalFileStorage } from "./LocalFileStorage";
import { S3FileStorage } from "./S3FileStorage";

export function createFileStorage(): IFileStorage {
  if (env.STORAGE_MODE === "s3") {
    return new S3FileStorage();
  }
  return new LocalFileStorage();
}

export const fileStorage = createFileStorage();
