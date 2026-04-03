import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class RafflesGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    afterInit(): void;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    broadcastPurchase(payload: {
        raffleId: number;
        purchaseId: number;
        quantity: number;
    }): void;
    broadcastRaffleUpdated(payload: any): void;
}
export default RafflesGateway;
