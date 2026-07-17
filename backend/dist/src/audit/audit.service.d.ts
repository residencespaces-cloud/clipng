import { PrismaService } from '../prisma/prisma.service';
export declare class AuditService {
    private prisma;
    constructor(prisma: PrismaService);
    log(params: {
        actorId?: string;
        action: string;
        entityType: string;
        entityId?: string;
        metadata?: Record<string, unknown>;
    }): Promise<void>;
}
