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
exports.RafflesController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const fs = __importStar(require("fs"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const create_raffle_dto_1 = require("./dto/create-raffle.dto");
const raffles_service_1 = require("./raffles.service");
const supabase_js_1 = require("@supabase/supabase-js");
let supabaseClient = null;

// Debug: presence of Supabase-related env vars (DO NOT log secrets)
(function logSupabasePresence() {
    try {
        const status = {
            SUPABASE_URL: !!process.env.SUPABASE_URL,
            SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
            SUPABASE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
            SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
            SUPABASE_UPLOAD_BUCKET: !!process.env.SUPABASE_UPLOAD_BUCKET,
        };
        console.error('Supabase env presence:', status);
    }
    catch (e) {
        console.error('Error checking supabase env presence:', e && e.message ? e.message : e);
    }
})();

function getSupabase() {
    if (supabaseClient)
        return supabaseClient;
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    if (!url || !key) {
        console.error('Supabase client not initialized: missing SUPABASE_URL or SUPABASE key (SERVICE_ROLE/KEY/ANON).');
        return null;
    }
    try {
        supabaseClient = (0, supabase_js_1.createClient)(url, key);
        return supabaseClient;
    }
    catch (e) {
        console.error('Failed to initialize Supabase client:', e && e.message ? e.message : e);
        supabaseClient = null;
        return null;
    }
}

async function uploadToSupabase(file) {
    const bucket = process.env.SUPABASE_UPLOAD_BUCKET || 'uploads';
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${require('path').extname(file.originalname)}`;
    const supabase = getSupabase();
    if (!supabase) {
        throw new Error('Supabase client not initialized. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in environment.');
    }
    const { error } = await supabase.storage.from(bucket).upload(filename, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
    });
    if (error)
        throw new Error('Upload failed: ' + error.message);
    const { data } = supabase.storage.from(bucket).getPublicUrl(filename);
    return data.publicUrl;
}
const tickets_service_1 = require("../tickets/tickets.service");
const jwt_admin_guard_1 = require("../auth/jwt-admin.guard");
let RafflesController = class RafflesController {
    rafflesService;
    ticketsService;
    constructor(rafflesService, ticketsService) {
        this.rafflesService = rafflesService;
        this.ticketsService = ticketsService;
    }
    findAll() {
        return this.rafflesService.findAllPublished();
    }
    findAllAdmin() {
        return this.rafflesService.findAllAll();
    }
    create(dto) {
        const price = Number(dto.pricePerTicket);
        const total = Number(dto.totalTickets);
        if (Number.isNaN(price) || Number.isNaN(total)) {
            throw new common_1.BadRequestException('pricePerTicket and totalTickets must be numeric');
        }
        try {
            return this.rafflesService.create({
                ...dto,
                pricePerTicket: price,
                totalTickets: total,
            });
        }
        catch (err) {
            console.error('RafflesController.create error:', err);
            throw err;
        }
    }
    async createWithImage(file, dto) {
        if (!file)
            throw new common_1.BadRequestException('Imagen requerida');
            const imageUrl = await uploadToSupabase(file);
        const price = Number(dto.pricePerTicket);
        const total = Number(dto.totalTickets);
        if (Number.isNaN(price) || Number.isNaN(total)) {
            throw new common_1.BadRequestException('pricePerTicket and totalTickets must be numeric');
        }
        const payload = {
            title: dto.title,
            description: dto.description,
            imageUrl,
            pricePerTicket: price,
            totalTickets: total,
            drawDate: dto.drawDate,
            estimatedValue: dto.estimatedValue !== undefined ? Number(dto.estimatedValue) : undefined,
            associatedLottery: dto.associatedLottery,
            isPublished: dto.isPublished === 'true' || dto.isPublished === true,
        };
        try {
            return await this.rafflesService.create(payload);
        }
        catch (err) {
            console.error('RafflesController.createWithImage error:', err);
            throw err;
        }
    }
    async update(id, dto) {
        const price = dto.pricePerTicket !== undefined ? Number(dto.pricePerTicket) : undefined;
        const total = dto.totalTickets !== undefined ? Number(dto.totalTickets) : undefined;
        if (price !== undefined && Number.isNaN(price)) {
            throw new common_1.BadRequestException('pricePerTicket must be numeric');
        }
        if (total !== undefined && Number.isNaN(total)) {
            throw new common_1.BadRequestException('totalTickets must be numeric');
        }
        return this.rafflesService.update(id, {
            title: dto.title,
            description: dto.description,
            pricePerTicket: price,
            totalTickets: total,
            drawDate: dto.drawDate,
            estimatedValue: dto.estimatedValue !== undefined ? Number(dto.estimatedValue) : undefined,
            associatedLottery: dto.associatedLottery,
            isPublished: dto.isPublished,
        });
    }
    async updateWithImage(id, file, dto) {
        if (!file)
            throw new common_1.BadRequestException('Imagen requerida');
            const imageUrl = await uploadToSupabase(file);
        const price = dto.pricePerTicket !== undefined ? Number(dto.pricePerTicket) : undefined;
        const total = dto.totalTickets !== undefined ? Number(dto.totalTickets) : undefined;
        if (price !== undefined && Number.isNaN(price)) {
            throw new common_1.BadRequestException('pricePerTicket must be numeric');
        }
        if (total !== undefined && Number.isNaN(total)) {
            throw new common_1.BadRequestException('totalTickets must be numeric');
        }
        const payload = {
            title: dto.title,
            description: dto.description,
            imageUrl,
            pricePerTicket: price,
            totalTickets: total,
            drawDate: dto.drawDate,
            estimatedValue: dto.estimatedValue !== undefined ? Number(dto.estimatedValue) : undefined,
            associatedLottery: dto.associatedLottery,
            isPublished: dto.isPublished,
        };
        try {
            return await this.rafflesService.update(id, payload);
        }
        catch (err) {
            console.error('RafflesController.updateWithImage error:', err);
            throw err;
        }
    }
    async remove(id) {
        try {
            const deleted = await prisma_1.default.$transaction(async (tx) => {
                const purchases = await tx.purchase.findMany({ where: { raffleId: id }, select: { id: true } });
                const purchaseIds = purchases.map((p) => p.id);
                if (purchaseIds.length > 0) {
                    await tx.purchaseItem.deleteMany({ where: { purchaseId: { in: purchaseIds } } });
                    await tx.payment.deleteMany({ where: { purchaseId: { in: purchaseIds } } });
                    await tx.purchase.deleteMany({ where: { id: { in: purchaseIds } } });
                }
                await tx.ticket.deleteMany({ where: { raffleId: id } });
                const r = await tx.raffle.delete({ where: { id } });
                return r;
            });
            try {
                if (this.rafflesService && this.rafflesService.rafflesGateway) {
                    try {
                        this.rafflesService.rafflesGateway.broadcastRaffleUpdated && this.rafflesService.rafflesGateway.broadcastRaffleUpdated(deleted);
                    }
                    catch (e) { }
                }
            }
            catch (e) { }
            return { ok: true };
        }
        catch (error) {
            console.error('RafflesController.remove error:', error);
            throw new common_1.HttpException('No se pudo eliminar la rifa', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async health() {
        try {
            const res = await prisma_1.default.$queryRaw `SELECT 1 as ok`;
            return { ok: true, db: res };
        }
        catch (err) {
            console.error('Health check failed:', err);
            return { ok: false, error: String(err) };
        }
    }
    async dbInfo() {
        const databaseUrl = process.env.DATABASE_URL || null;
        let parsed = null;
        try {
            if (databaseUrl) {
                const u = new URL(databaseUrl);
                parsed = {
                    protocol: u.protocol.replace(':', ''),
                    host: u.hostname,
                    port: u.port,
                    user: u.username,
                    database: u.pathname ? u.pathname.replace('/', '') : null,
                };
            }
        }
        catch (e) {
            parsed = { error: String(e) };
        }
        try {
            const dbName = await prisma_1.default.$queryRaw `SELECT DATABASE() as db`;
            const server = await prisma_1.default.$queryRaw `SELECT @@hostname as hostname, @@port as port`;
            const user = await prisma_1.default.$queryRaw `SELECT USER() as user`;
            const sanitize = (v) => {
                if (v === null || v === undefined)
                    return v;
                if (typeof v === 'bigint')
                    return v.toString();
                if (Array.isArray(v))
                    return v.map(sanitize);
                if (typeof v === 'object') {
                    const out = {};
                    for (const k of Object.keys(v)) {
                        out[k] = sanitize(v[k]);
                    }
                    return out;
                }
                return v;
            };
            return {
                databaseUrl,
                parsed,
                currentDatabase: sanitize(dbName?.[0]?.db ?? null),
                serverInfo: sanitize(server?.[0] ?? null),
                connectedUser: sanitize(user?.[0]?.user ?? null),
            };
        }
        catch (err) {
            console.error('db-info check failed:', err);
            return { databaseUrl, parsed, error: String(err) };
        }
    }
    findOne(id) {
        return this.rafflesService.findById(id);
    }
    findAllTickets(id) {
        return this.ticketsService.findAllByRaffle(id);
    }
    findAvailableTickets(id) {
        return this.ticketsService.findAvailableByRaffle(id);
    }
};
exports.RafflesController = RafflesController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RafflesController.prototype, "findAll", null);
__decorate([
    (0, common_1.UseGuards)(jwt_admin_guard_1.JwtAdminGuard),
    (0, common_1.Get)('admin/all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RafflesController.prototype, "findAllAdmin", null);
__decorate([
    (0, common_1.UseGuards)(jwt_admin_guard_1.JwtAdminGuard),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_raffle_dto_1.CreateRaffleDto]),
    __metadata("design:returntype", void 0)
], RafflesController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(jwt_admin_guard_1.JwtAdminGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image', {
            storage: (0, multer_1.memoryStorage)(),
        })),
    (0, common_1.Post)('with-image'),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RafflesController.prototype, "createWithImage", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], RafflesController.prototype, "update", null);
__decorate([
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image', {
        storage: (0, multer_1.memoryStorage)(),
    })),
    (0, common_1.Put)(':id/with-image'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], RafflesController.prototype, "updateWithImage", null);
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RafflesController.prototype, "health", null);
__decorate([
    (0, common_1.Get)('db-info'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RafflesController.prototype, "dbInfo", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], RafflesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/tickets/all'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], RafflesController.prototype, "findAllTickets", null);
__decorate([
    (0, common_1.Get)(':id/tickets'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], RafflesController.prototype, "findAvailableTickets", null);
__decorate([
    (0, common_1.UseGuards)(jwt_admin_guard_1.JwtAdminGuard),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], RafflesController.prototype, "remove", null);
exports.RafflesController = RafflesController = __decorate([
    (0, common_1.Controller)('api/raffles'),
    __metadata("design:paramtypes", [raffles_service_1.RafflesService,
        tickets_service_1.TicketsService])
], RafflesController);
//# sourceMappingURL=raffles.controller.js.map

