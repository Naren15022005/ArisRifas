import { PurchasesService } from '../purchases/purchases.service';
export declare class CronController {
    private readonly purchasesService;
    constructor(purchasesService: PurchasesService);
    cleanup(): Promise<{
        releasedTickets: number;
        cancelledPurchases: number;
    }>;
}
