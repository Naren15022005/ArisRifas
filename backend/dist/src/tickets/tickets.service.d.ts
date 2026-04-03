export declare class TicketsService {
    findAvailableByRaffle(raffleId: number, limit?: number): Promise<{
        number: number;
        id: number;
        raffleId: number;
        status: import("@prisma/client").$Enums.TicketStatus;
        reservedUntil: Date | null;
        createdAt: Date;
    }[]>;
    findAllByRaffle(raffleId: number): Promise<{
        number: number;
        id: number;
        raffleId: number;
        status: import("@prisma/client").$Enums.TicketStatus;
        reservedUntil: Date | null;
        createdAt: Date;
    }[]>;
    findById(id: number): Promise<{
        number: number;
        id: number;
        raffleId: number;
        status: import("@prisma/client").$Enums.TicketStatus;
        reservedUntil: Date | null;
        createdAt: Date;
    } | null>;
    revertToAvailable(id: number): Promise<{
        ok: boolean;
    }>;
    bulkMarkSold(items: {
        raffleId: number;
        numbers: number[];
    }[]): Promise<{
        updated: number;
    }>;
    sendTicket(payload: {
        name: string;
        phone: string;
        items: any[];
        date: string;
        html: string;
    }): Promise<{
        url: string;
        htmlPath: string;
    }>;
}
