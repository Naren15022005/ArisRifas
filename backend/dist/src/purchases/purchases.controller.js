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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchasesController = void 0;
const common_1 = require("@nestjs/common");
const purchases_service_1 = require("./purchases.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
class ReserveDto {
    raffleId;
    quantity;
}
let PurchasesController = class PurchasesController {
    service;
    constructor(service) {
        this.service = service;
    }
    async reserve(req, body, idempotencyKey) {
        const userId = req.user.id;
        const { raffleId, quantity } = body;
        const res = await this.service.reserve(userId, Number(raffleId), Number(quantity), idempotencyKey);
        return { purchaseId: res.purchaseId, ttlSeconds: res.ttlSeconds };
    }
};
exports.PurchasesController = PurchasesController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('reserve'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('idempotency-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, ReserveDto, String]),
    __metadata("design:returntype", Promise)
], PurchasesController.prototype, "reserve", null);
exports.PurchasesController = PurchasesController = __decorate([
    (0, common_1.Controller)('api/purchases'),
    __metadata("design:paramtypes", [purchases_service_1.PurchasesService])
], PurchasesController);
exports.default = PurchasesController;
//# sourceMappingURL=purchases.controller.js.map