"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = __importDefault(require("../lib/prisma"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let TicketsService = class TicketsService {
    async findAvailableByRaffle(raffleId, limit = 50) {
        return prisma_1.default.ticket.findMany({
            where: { raffleId, status: 'AVAILABLE' },
            orderBy: { number: 'asc' },
            take: limit,
        });
    }
    async findAllByRaffle(raffleId) {
        const [raffle, existingCount] = await Promise.all([
            prisma_1.default.raffle.findUnique({ where: { id: raffleId } }),
            prisma_1.default.ticket.count({ where: { raffleId } }),
        ]);
        if (!raffle) {
            throw new common_1.NotFoundException('Rifa no encontrada');
        }
        if (existingCount === 0 && raffle.totalTickets > 0) {
            const ticketsData = Array.from({ length: raffle.totalTickets }).map((_, i) => ({
                raffleId,
                number: i + 1,
            }));
            if (ticketsData.length > 0) {
                await prisma_1.default.ticket.createMany({ data: ticketsData });
            }
        }
        return prisma_1.default.ticket.findMany({
            where: { raffleId },
            orderBy: { number: 'asc' },
        });
    }
    async findById(id) {
        return prisma_1.default.ticket.findUnique({ where: { id } });
    }
    async revertToAvailable(id) {
        if (!id)
            throw new common_1.BadRequestException('ticket id requerido');
        const result = await prisma_1.default.ticket.updateMany({
            where: { id, status: 'SOLD' },
            data: { status: 'AVAILABLE', reservedUntil: null },
        });
        if (!result.count) {
            throw new common_1.BadRequestException('Ticket no encontrado o no está en estado SOLD');
        }
        return { ok: true };
    }
    async bulkMarkSold(items) {
        if (!items || items.length === 0)
            return { updated: 0 };
        const result = await prisma_1.default.$transaction(async (tx) => {
            let updated = 0;
            for (const item of items) {
                const nums = Array.from(new Set(item.numbers)).filter((n) => Number.isInteger(n));
                if (!item.raffleId || nums.length === 0)
                    continue;
                const res = await tx.ticket.updateMany({
                    where: {
                        raffleId: item.raffleId,
                        number: { in: nums },
                        status: 'AVAILABLE',
                    },
                    data: { status: 'SOLD', reservedUntil: null },
                });
                updated += res.count ?? 0;
            }
            return { updated };
        });
        return result;
    }
    async sendTicket(payload) {
        const logger = new common_1.Logger('TicketsService');
        try {
            const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
            if (!fs.existsSync(uploadsDir))
                fs.mkdirSync(uploadsDir, { recursive: true });
            const filenameBase = `${Date.now()}-ticket`;
            const htmlFilename = `${filenameBase}.html`;
            const htmlPath = path.join(uploadsDir, htmlFilename);
            fs.writeFileSync(htmlPath, payload.html, 'utf8');
            const baseUrl = process.env.BASE_URL ? process.env.BASE_URL.replace(/\/$/, '') : '';
            const url = baseUrl ? `${baseUrl}/uploads/${htmlFilename}` : `/uploads/${htmlFilename}`;
            return { url, htmlPath };
        }
        catch (e) {
            logger.error('Failed to save ticket HTML', e);
            throw e;
        }
    }
};
exports.TicketsService = TicketsService;
exports.TicketsService = TicketsService = __decorate([
    (0, common_1.Injectable)()
], TicketsService);
//# sourceMappingURL=tickets.service.js.map