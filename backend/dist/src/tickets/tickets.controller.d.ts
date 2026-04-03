import { TicketsService } from './tickets.service';
declare class SendTicketDto {
    name: string;
    phone: string;
    items: any[];
    date: string;
    html: string;
}
export declare class TicketsController {
    private readonly ticketsService;
    constructor(ticketsService: TicketsService);
    get(id: number): Promise<{
        number: number;
        id: number;
        createdAt: Date;
        status: import("@prisma/client").$Enums.TicketStatus;
        reservedUntil: Date | null;
        raffleId: number;
    } | null>;
    revertToAvailable(id: number): Promise<{
        ok: boolean;
    }>;
    bulkSell(body: {
        items: {
            raffleId: number;
            numbers: number[];
        }[];
    }): Promise<{
        updated: number;
    }>;
    send(body: SendTicketDto): Promise<{
        url: string;
        htmlPath: string;
    }>;
}
export {};
