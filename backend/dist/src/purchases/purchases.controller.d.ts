import type { Request as ExRequest } from 'express';
import { PurchasesService } from './purchases.service';
declare class ReserveDto {
    raffleId: number;
    quantity: number;
}
export declare class PurchasesController {
    private readonly service;
    constructor(service: PurchasesService);
    reserve(req: ExRequest & {
        user?: {
            id: number;
        };
    }, body: ReserveDto, idempotencyKey?: string): Promise<{
        purchaseId: number;
        ttlSeconds: number;
    }>;
}
export default PurchasesController;
