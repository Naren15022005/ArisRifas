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
exports.WebhooksController = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = __importDefault(require("../lib/prisma"));
let WebhooksController = class WebhooksController {
    async handleWompi(req) {
        const secret = process.env.WOMPI_EVENTS_SECRET || '';
        const signature = req.headers['x-wompi-signature'];
        if (!signature)
            throw new common_1.BadRequestException('Missing signature');
        const r = req;
        const raw = r.rawBody ?? JSON.stringify(r.body);
        const hmac = crypto_1.default.createHmac('sha256', secret).update(raw).digest('hex');
        if (hmac !== signature)
            throw new common_1.BadRequestException('Invalid signature');
        const event = req.body;
        const eventData = event.data ?? {};
        const eventId = eventData.id ?? event.id;
        if (!eventId)
            throw new common_1.BadRequestException('Missing event id');
        const existing = await prisma_1.default.auditLog.findFirst({
            where: { action: 'WEBHOOK:' + eventId },
        });
        if (existing)
            return { ok: true };
        if (eventData.status === 'APPROVED' || eventData.status === 'PAID') {
            const ref = eventData.reference ?? eventData.payment_id;
            const payment = await prisma_1.default.payment.findUnique({
                where: { wompiReference: ref },
            });
            if (payment) {
                await prisma_1.default.$transaction(async (tx) => {
                    await tx.payment.update({
                        where: { id: payment.id },
                        data: {
                            status: 'APPROVED',
                            paidAt: new Date(),
                            wompiStatus: eventData.status,
                        },
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
                            entity: 'Webhook',
                            entityId: null,
                            action: 'WEBHOOK:' + eventId,
                            payload: event,
                        },
                    });
                });
            }
        }
        return { ok: true };
    }
};
exports.WebhooksController = WebhooksController;
__decorate([
    (0, common_1.Post)('wompi'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WebhooksController.prototype, "handleWompi", null);
exports.WebhooksController = WebhooksController = __decorate([
    (0, common_1.Controller)('api/webhooks')
], WebhooksController);
//# sourceMappingURL=webhooks.controller.js.map