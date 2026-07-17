import { ConfigService } from '@nestjs/config';
export declare class StorageService {
    private localPath;
    constructor(config: ConfigService);
    saveLocal(file: {
        buffer: Buffer;
        originalname: string;
    }): Promise<{
        key: string;
        url: string;
    }>;
    getSignedUploadUrl(key: string): {
        uploadUrl: string;
        key: string;
    };
}
