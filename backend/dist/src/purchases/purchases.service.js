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
exports.PurchasesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = __importDefault(require("../lib/prisma"));
const raffles_gateway_1 = require("../gateways/raffles.gateway");
let PurchasesService = class PurchasesService {
    rafflesGateway;
    constructor(rafflesGateway) {
        this.rafflesGateway = rafflesGateway;
    }
    getReservationTtlSeconds() {
        const v = process.env.RESERVATION_TTL_SECONDS;
        return v ? Number(v) : 300;
    }
    async reserve(userId, raffleId, quantity, idempotencyKey) {
        if (quantity <= 0)
            throw new common_1.BadRequestException('quantity must be > 0');
        const ttlSeconds = this.getReservationTtlSeconds();
        const reservedUntil = new Date(Date.now() + ttlSeconds * 1000);
        if (idempotencyKey) {
            const existing = await prisma_1.default.idempotencyKey.findUnique({
                where: { key: idempotencyKey },
            });
            if (existing &&
                existing.expiresAt.getTime() > Date.now() &&
                existing.purchaseId) {
                return { purchaseId: existing.purchaseId, ttlSeconds };
            }
        }
        const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.BadRequestException('user not found');
        const result = await prisma_1.default.$transaction(async (tx) => {
            const raffle = await tx.raffle.findUnique({ where: { id: raffleId } });
            if (!raffle)
                throw new common_1.BadRequestException('raffle not found');
            const rows = await tx.$queryRaw `
        SELECT id FROM Ticket WHERE raffleId = ${raffleId} AND status = 'AVAILABLE' ORDER BY number ASC LIMIT ${quantity} FOR UPDATE
      `;
            if (rows.length < quantity) {
                throw new common_1.ConflictException('Not enough available tickets');
            }
            const ticketIds = rows.map((r) => r.id);
            await tx.ticket.updateMany({
                where: { id: { in: ticketIds } },
                data: { status: 'RESERVED', reservedUntil },
            });
            const price = Number(String(raffle.pricePerTicket));
            const total = (price * quantity).toFixed(2);
            const purchase = await tx.purchase.create({
                data: { userId, raffleId, total },
            });
            const items = ticketIds.map((ticketId) => ({
                purchaseId: purchase.id,
                ticketId,
            }));
            await tx.purchaseItem.createMany({ data: items });
            if (idempotencyKey) {
                await tx.idempotencyKey.create({
                    data: {
                        key: idempotencyKey,
                        purchaseId: purchase.id,
                        expiresAt: reservedUntil,
                    },
                });
            }
            return { purchaseId: purchase.id };
        });
        try {
            this.rafflesGateway?.broadcastPurchase({
                raffleId,
                purchaseId: result.purchaseId,
                quantity,
            });
        }
        catch (err) {
            console.warn('Failed to emit purchase event', err);
        }
        return { purchaseId: result.purchaseId, ttlSeconds };
    }
    async cleanupExpiredReservations() {
        const now = new Date();
        try {
            return await prisma_1.default.$transaction(async (tx) => {
                const tickets = await tx.ticket.findMany({
                    where: { status: 'RESERVED', reservedUntil: { lt: now } },
                });
                if (tickets.length === 0)
                    return { releasedTickets: 0, cancelledPurchases: 0 };
                const ticketIds = tickets.map((t) => t.id);
                const items = await tx.purchaseItem.findMany({
                    where: { ticketId: { in: ticketIds } },
                    include: { purchase: true },
                });
                const purchaseIds = Array.from(new Set(items.map((i) => i.purchaseId)));
                await tx.ticket.updateMany({
                    where: { id: { in: ticketIds } },
                    data: { status: 'AVAILABLE', reservedUntil: null },
                });
                let cancelled = 0;
                if (purchaseIds.length > 0) {
                    const res = await tx.purchase.updateMany({
                        where: { id: { in: purchaseIds }, status: 'PENDING' },
                        data: { status: 'CANCELLED' },
                    });
                    cancelled = res.count ?? 0;
                }
                await tx.idempotencyKey.deleteMany({
                    where: { expiresAt: { lt: now } },
                });
                return {
                    releasedTickets: ticketIds.length,
                    cancelledPurchases: cancelled,
                };
            });
        }
        catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            console.error('cleanupExpiredReservations - DB error, skipping cleanup:', msg);
            return { releasedTickets: 0, cancelledPurchases: 0 };
        }
    }
};
exports.PurchasesService = PurchasesService;
exports.PurchasesService = PurchasesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [raffles_gateway_1.RafflesGateway])
], PurchasesService);
exports.default = PurchasesService;
//# sourceMappingURL=purchases.service.js.map