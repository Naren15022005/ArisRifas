export declare class PaymentsService {
    createPayment(purchaseId: number): Promise<{
        paymentId: number;
        checkoutUrl: string;
    }>;
    markPaid(paymentId: number, wompiStatus?: string): Promise<{
        id: number;
        createdAt: Date;
        status: import("@prisma/client").$Enums.PaymentStatus;
        updatedAt: Date;
        purchaseId: number;
        wompiReference: string;
        amount: import("@prisma/client-runtime-utils").Decimal;
        wompiStatus: string | null;
        paidAt: Date | null;
    }>;
}
