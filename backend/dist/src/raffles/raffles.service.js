"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RafflesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = __importDefault(require("../lib/prisma"));
const client_1 = require("@prisma/client");
const raffles_gateway_1 = require("../gateways/raffles.gateway");
const MOCK_RAFFLES = [
    {
        id: 1,
        title: 'Rifa de ejemplo',
        description: 'Rifa demo para desarrollo',
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];
let RafflesService = class RafflesService {
    rafflesGateway;
    constructor(rafflesGateway) {
        this.rafflesGateway = rafflesGateway;
    }
    async create(data) {
        const { title, description, imageUrl, pricePerTicket, totalTickets, drawDate, isPublished = false, estimatedValue = null, associatedLottery = null, } = data;
        const maxAttempts = 2;
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return await prisma_1.default.$transaction(async (tx) => {
                    const raffle = await tx.raffle.create({
                        data: {
                            title,
                            description,
                            imageUrl,
                            pricePerTicket: new client_1.Prisma.Decimal(pricePerTicket),
                            totalTickets,
                            drawDate: new Date(drawDate),
                            estimatedValue: estimatedValue !== null ? new client_1.Prisma.Decimal(estimatedValue) : undefined,
                            associatedLottery: associatedLottery || undefined,
                            isPublished,
                        },
                    });
                    const ticketsData = Array.from({ length: totalTickets }).map((_, i) => ({
                        raffleId: raffle.id,
                        number: i + 1,
                    }));
                    if (ticketsData.length > 0)
                        await tx.ticket.createMany({ data: ticketsData });
                    console.log(`RafflesService.create - transaction created raffle id=${raffle.id}`);
                    return raffle;
                });
            }
            catch (txErr) {
                const txMsg = txErr instanceof Error ? txErr.message : String(txErr);
                console.warn(`RafflesService.create - transaction attempt ${attempt} failed:`, txMsg);
                if (attempt < maxAttempts) {
                    await new Promise((r) => setTimeout(r, 200 * attempt));
                    continue;
                }
                console.error('RafflesService.create - all transaction attempts failed, will fallback');
                break;
            }
        }
        try {
            const raffle = await prisma_1.default.raffle.create({
                data: {
                    title,
                    description,
                    imageUrl,
                    pricePerTicket: new client_1.Prisma.Decimal(pricePerTicket),
                    totalTickets,
                    drawDate: new Date(drawDate),
                    estimatedValue: estimatedValue !== null ? new client_1.Prisma.Decimal(estimatedValue) : undefined,
                    associatedLottery: associatedLottery || undefined,
                    isPublished,
                },
            });
            const BATCH = 1000;
            let created = 0;
            while (created < totalTickets) {
                const remain = totalTickets - created;
                const batchSize = Math.min(BATCH, remain);
                const ticketsData = Array.from({ length: batchSize }).map((_, i) => ({
                    raffleId: raffle.id,
                    number: created + i + 1,
                }));
                await prisma_1.default.ticket.createMany({ data: ticketsData });
                created += batchSize;
            }
            console.log(`RafflesService.create - fallback created raffle id=${raffle.id}`);
            return raffle;
        }
        catch (fallbackErr) {
            const fmsg = fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);
            console.error('RafflesService.create - fallback also failed:', fmsg, fallbackErr);
            throw new common_1.HttpException({ status: 'error', message: 'DB unavailable, please try later', detail: fmsg }, common_1.HttpStatus.SERVICE_UNAVAILABLE);
        }
    }
    async update(id, data) {
        try {
            const updated = await prisma_1.default.$transaction(async (tx) => {
                const existing = await tx.raffle.findUnique({ where: { id } });
                if (!existing)
                    throw new common_1.NotFoundException('Raffle not found');
                const updateData = {};
                if (data.title !== undefined)
                    updateData.title = data.title;
                if (data.description !== undefined)
                    updateData.description = data.description;
                if (data.imageUrl !== undefined)
                    updateData.imageUrl = data.imageUrl;
                if (data.pricePerTicket !== undefined) {
                    updateData.pricePerTicket = new client_1.Prisma.Decimal(data.pricePerTicket);
                }
                if (data.drawDate !== undefined) {
                    updateData.drawDate = new Date(data.drawDate);
                }
                if (data.estimatedValue !== undefined) {
                    updateData.estimatedValue =
                        data.estimatedValue !== null ? new client_1.Prisma.Decimal(data.estimatedValue) : null;
                }
                if (data.associatedLottery !== undefined) {
                    updateData.associatedLottery = data.associatedLottery || null;
                }
                if (data.isPublished !== undefined) {
                    updateData.isPublished = data.isPublished;
                }
                if (data.totalTickets !== undefined && data.totalTickets !== existing.totalTickets) {
                    const newTotal = data.totalTickets;
                    const currentTotal = existing.totalTickets;
                    if (newTotal < currentTotal) {
                        const problematic = await tx.ticket.count({
                            where: {
                                raffleId: id,
                                number: { gt: newTotal },
                                status: { in: ['RESERVED', 'SOLD'] },
                            },
                        });
                        if (problematic > 0) {
                            throw new common_1.HttpException('No se puede reducir la cantidad de boletas porque hay boletas vendidas o reservadas en el rango que se eliminaría.', common_1.HttpStatus.BAD_REQUEST);
                        }
                        await tx.ticket.deleteMany({ where: { raffleId: id, number: { gt: newTotal } } });
                    }
                    else if (newTotal > currentTotal) {
                        const ticketsData = Array.from({ length: newTotal - currentTotal }).map((_, i) => ({
                            raffleId: id,
                            number: currentTotal + i + 1,
                        }));
                        if (ticketsData.length > 0) {
                            await tx.ticket.createMany({ data: ticketsData });
                        }
                    }
                    updateData.totalTickets = newTotal;
                }
                const updated = await tx.raffle.update({ where: { id }, data: updateData });
                return updated;
            });
            try {
                this.rafflesGateway?.broadcastRaffleUpdated(updated);
            }
            catch (err) {
                console.warn('RafflesService.update broadcast error', err);
            }
            return updated;
        }
        catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            console.error(`RafflesService.update(${id}) error:`, msg, error);
            if (error instanceof common_1.HttpException || error instanceof common_1.NotFoundException)
                throw error;
            throw new common_1.HttpException({ status: 'error', message: 'No se pudo actualizar la rifa', detail: msg }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async findAllPublished() {
        try {
            const raffles = await prisma_1.default.raffle.findMany({
                where: { isPublished: true },
                orderBy: { createdAt: 'desc' },
            });
            const ids = raffles.map((r) => r.id);
            if (ids.length === 0)
                return [];
            const grouped = await prisma_1.default.ticket.groupBy({
                by: ['raffleId', 'status'],
                _count: { _all: true },
                where: { raffleId: { in: ids } },
            });
            const byRaffle = new Map();
            for (const row of grouped) {
                const entry = byRaffle.get(row.raffleId) || { available: 0, reserved: 0, sold: 0 };
                if (row.status === 'AVAILABLE')
                    entry.available = row._count._all;
                else if (row.status === 'RESERVED')
                    entry.reserved = row._count._all;
                else if (row.status === 'SOLD')
                    entry.sold = row._count._all;
                byRaffle.set(row.raffleId, entry);
            }
            return raffles.map((r) => {
                const stats = byRaffle.get(r.id);
                const remaining = stats?.available ?? Math.max(0, r.totalTickets - (stats?.sold ?? 0) - (stats?.reserved ?? 0));
                return { ...r, remaining };
            });
        }
        catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            console.error('RafflesService.findAllPublished - DB error, returning mock:', msg);
            return MOCK_RAFFLES;
        }
    }
    async findAllAll() {
        try {
            const raffles = await prisma_1.default.raffle.findMany({ orderBy: { createdAt: 'desc' } });
            const ids = raffles.map((r) => r.id);
            if (ids.length === 0)
                return [];
            const grouped = await prisma_1.default.ticket.groupBy({
                by: ['raffleId', 'status'],
                _count: { _all: true },
                where: { raffleId: { in: ids } },
            });
            const byRaffle = new Map();
            for (const row of grouped) {
                const entry = byRaffle.get(row.raffleId) || { available: 0, reserved: 0, sold: 0 };
                if (row.status === 'AVAILABLE')
                    entry.available = row._count._all;
                else if (row.status === 'RESERVED')
                    entry.reserved = row._count._all;
                else if (row.status === 'SOLD')
                    entry.sold = row._count._all;
                byRaffle.set(row.raffleId, entry);
            }
            return raffles.map((r) => {
                const stats = byRaffle.get(r.id);
                const remaining = stats?.available ?? Math.max(0, r.totalTickets - (stats?.sold ?? 0) - (stats?.reserved ?? 0));
                return { ...r, remaining };
            });
        }
        catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            console.error('RafflesService.findAllAll - DB error, returning mock:', msg);
            return MOCK_RAFFLES;
        }
    }
    async findById(id) {
        try {
            const raffle = await prisma_1.default.raffle.findUnique({ where: { id } });
            if (!raffle)
                throw new common_1.NotFoundException('Raffle not found');
            return raffle;
        }
        catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            console.error(`RafflesService.findById(${id}) - DB error, falling back to mock:`, msg);
            const mock = MOCK_RAFFLES.find((r) => r.id === id);
            if (!mock)
                throw new common_1.NotFoundException('Raffle not found');
            return mock;
        }
    }
};
exports.RafflesService = RafflesService;
exports.RafflesService = RafflesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [raffles_gateway_1.RafflesGateway])
], RafflesService);
//# sourceMappingURL=raffles.service.js.map