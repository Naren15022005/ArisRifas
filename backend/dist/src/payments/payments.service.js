"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = __importDefault(require("../lib/prisma"));
let PaymentsService = class PaymentsService {
    async createPayment(purchaseId) {
        const purchase = await prisma_1.default.purchase.findUnique({
            where: { id: purchaseId },
        });
        if (!purchase)
            throw new common_1.BadRequestException('purchase not found');
        const amount = purchase.total;
        const payment = await prisma_1.default.payment.create({
            data: { purchaseId, wompiReference: `mock-${Date.now()}`, amount },
        });
        await prisma_1.default.auditLog.create({
            data: {
                entity: 'Payment',
                entityId: payment.id,
                action: 'CREATE',
                payload: { purchaseId, amount },
            },
        });
        return {
            paymentId: payment.id,
            checkoutUrl: `https://example.local/checkout/${payment.id}`,
        };
    }
    async markPaid(paymentId, wompiStatus) {
        const payment = await prisma_1.default.$transaction(async (tx) => {
            const payment = await tx.payment.update({
                where: { id: paymentId },
                data: { status: 'APPROVED', wompiStatus, paidAt: new Date() },
            });
            await tx.purchase.update({
                where: { id: payment.purchaseId },
                data: { status: 'PAID' },
            });
            const items = await tx.purchaseItem.findMany({
                where: { purchaseId: payment.purchaseId },
                select: { ticketId: true },
            });
            const ticketIds = items.map((i) => i.ticketId);
            if (ticketIds.length > 0) {
                await tx.ticket.updateMany({
                    where: { id: { in: ticketIds } },
                    data: { status: 'SOLD', reservedUntil: null },
                });
            }
            await tx.auditLog.create({
                data: {
                    entity: 'Payment',
                    entityId: payment.id,
                    action: 'PAID',
                    payload: { wompiStatus },
                },
            });
            return payment;
        });
        return payment;
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)()
], PaymentsService);
//# sourceMappingURL=payments.service.js.map