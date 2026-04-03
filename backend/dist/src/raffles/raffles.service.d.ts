import { Prisma } from '@prisma/client';
import { RafflesGateway } from '../gateways/raffles.gateway';
export declare class RafflesService {
    private readonly rafflesGateway?;
    constructor(rafflesGateway?: RafflesGateway | undefined);
    create(data: {
        title: string;
        description?: string | null;
        imageUrl?: string | null;
        pricePerTicket: number;
        totalTickets: number;
        drawDate: string | Date;
        isPublished?: boolean;
        estimatedValue?: number | null;
        associatedLottery?: string | null;
    }): Promise<{
        id: number;
        createdAt: Date;
        title: string;
        description: string | null;
        imageUrl: string | null;
        estimatedValue: Prisma.Decimal | null;
        associatedLottery: string | null;
        pricePerTicket: Prisma.Decimal;
        totalTickets: number;
        drawDate: Date;
        isPublished: boolean;
    }>;
    update(id: number, data: {
        title?: string;
        description?: string | null;
        imageUrl?: string | null;
        pricePerTicket?: number;
        totalTickets?: number;
        drawDate?: string | Date;
        isPublished?: boolean;
        estimatedValue?: number | null;
        associatedLottery?: string | null;
    }): Promise<{
        id: number;
        createdAt: Date;
        title: string;
        description: string | null;
        imageUrl: string | null;
        estimatedValue: Prisma.Decimal | null;
        associatedLottery: string | null;
        pricePerTicket: Prisma.Decimal;
        totalTickets: number;
        drawDate: Date;
        isPublished: boolean;
    }>;
    findAllPublished(): Promise<any[]>;
    findAllAll(): Promise<any[]>;
    findById(id: number): Promise<{
        id: number;
        createdAt: Date;
        title: string;
        description: string | null;
        imageUrl: string | null;
        estimatedValue: Prisma.Decimal | null;
        associatedLottery: string | null;
        pricePerTicket: Prisma.Decimal;
        totalTickets: number;
        drawDate: Date;
        isPublished: boolean;
    } | {
        id: number;
        title: string;
        description: string;
        isPublished: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
