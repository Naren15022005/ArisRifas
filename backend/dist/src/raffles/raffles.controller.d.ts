import { CreateRaffleDto } from './dto/create-raffle.dto';
import { RafflesService } from './raffles.service';
import { TicketsService } from '../tickets/tickets.service';
export declare class RafflesController {
    private readonly rafflesService;
    private readonly ticketsService;
    constructor(rafflesService: RafflesService, ticketsService: TicketsService);
    findAll(): Promise<any[]>;
    findAllAdmin(): Promise<any[]>;
    create(dto: CreateRaffleDto): Promise<{
        id: number;
        title: string;
        description: string | null;
        imageUrl: string | null;
        estimatedValue: import("@prisma/client-runtime-utils").Decimal | null;
        associatedLottery: string | null;
        pricePerTicket: import("@prisma/client-runtime-utils").Decimal;
        totalTickets: number;
        drawDate: Date;
        isPublished: boolean;
        createdAt: Date;
    }>;
    createWithImage(file: any, dto: any): Promise<{
        id: number;
        title: string;
        description: string | null;
        imageUrl: string | null;
        estimatedValue: import("@prisma/client-runtime-utils").Decimal | null;
        associatedLottery: string | null;
        pricePerTicket: import("@prisma/client-runtime-utils").Decimal;
        totalTickets: number;
        drawDate: Date;
        isPublished: boolean;
        createdAt: Date;
    }>;
    update(id: number, dto: any): Promise<{
        id: number;
        title: string;
        description: string | null;
        imageUrl: string | null;
        estimatedValue: import("@prisma/client-runtime-utils").Decimal | null;
        associatedLottery: string | null;
        pricePerTicket: import("@prisma/client-runtime-utils").Decimal;
        totalTickets: number;
        drawDate: Date;
        isPublished: boolean;
        createdAt: Date;
    }>;
    updateWithImage(id: number, file: any, dto: any): Promise<{
        id: number;
        title: string;
        description: string | null;
        imageUrl: string | null;
        estimatedValue: import("@prisma/client-runtime-utils").Decimal | null;
        associatedLottery: string | null;
        pricePerTicket: import("@prisma/client-runtime-utils").Decimal;
        totalTickets: number;
        drawDate: Date;
        isPublished: boolean;
        createdAt: Date;
    }>;
    health(): Promise<{
        ok: boolean;
        db: unknown;
        error?: undefined;
    } | {
        ok: boolean;
        error: string;
        db?: undefined;
    }>;
    dbInfo(): Promise<{
        databaseUrl: string | null;
        parsed: any;
        currentDatabase: any;
        serverInfo: any;
        connectedUser: any;
        error?: undefined;
    } | {
        databaseUrl: string | null;
        parsed: any;
        error: string;
        currentDatabase?: undefined;
        serverInfo?: undefined;
        connectedUser?: undefined;
    }>;
    findOne(id: number): Promise<{
        id: number;
        title: string;
        description: string | null;
        imageUrl: string | null;
        estimatedValue: import("@prisma/client-runtime-utils").Decimal | null;
        associatedLottery: string | null;
        pricePerTicket: import("@prisma/client-runtime-utils").Decimal;
        totalTickets: number;
        drawDate: Date;
        isPublished: boolean;
        createdAt: Date;
    } | {
        id: number;
        title: string;
        description: string;
        isPublished: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAllTickets(id: number): Promise<{
        number: number;
        id: number;
        createdAt: Date;
        status: import("@prisma/client").$Enums.TicketStatus;
        reservedUntil: Date | null;
        raffleId: number;
    }[]>;
    findAvailableTickets(id: number): Promise<{
        number: number;
        id: number;
        createdAt: Date;
        status: import("@prisma/client").$Enums.TicketStatus;
        reservedUntil: Date | null;
        raffleId: number;
    }[]>;
}
