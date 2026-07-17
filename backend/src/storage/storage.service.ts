import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuid } from 'uuid';

@Injectable()
export class StorageService {
  private localPath: string;

  constructor(config: ConfigService) {
    this.localPath = config.get<string>('STORAGE_LOCAL_PATH', './uploads');
    if (!fs.existsSync(this.localPath)) {
      fs.mkdirSync(this.localPath, { recursive: true });
    }
  }

  async saveLocal(file: { buffer: Buffer; originalname: string }) {
    const key = `${uuid()}-${file.originalname}`;
    const dest = path.join(this.localPath, key);
    await fs.promises.writeFile(dest, file.buffer);
    return { key, url: `/uploads/${key}` };
  }

  getSignedUploadUrl(key: string) {
    // Production: return S3/R2 signed URL
    return { uploadUrl: `/api/storage/upload/${key}`, key };
  }
}
