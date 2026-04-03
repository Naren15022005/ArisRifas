import { PurchasesService } from '../purchases/purchases.service';
export declare class SchedulerService {
    private readonly purchasesService;
    private readonly logger;
    constructor(purchasesService: PurchasesService);
    handleCleanupCron(): Promise<void>;
}
