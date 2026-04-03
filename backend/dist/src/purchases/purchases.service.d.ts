import { RafflesGateway } from '../gateways/raffles.gateway';
export declare class PurchasesService {
    private readonly rafflesGateway?;
    constructor(rafflesGateway?: RafflesGateway | undefined);
    private getReservationTtlSeconds;
    reserve(userId: number, raffleId: number, quantity: number, idempotencyKey?: string): Promise<{
        purchaseId: number;
        ttlSeconds: number;
    }>;
    cleanupExpiredReservations(): Promise<{
        releasedTickets: number;
        cancelledPurchases: number;
    }>;
}
export default PurchasesService;
