import { PaymentsService } from './payments.service';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    createCheckout(id: number): Promise<{
        paymentId: number;
        checkoutUrl: string;
    }>;
}
