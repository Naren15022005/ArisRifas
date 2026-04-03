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
exports.TicketsController = void 0;
const common_1 = require("@nestjs/common");
const tickets_service_1 = require("./tickets.service");
const jwt_admin_guard_1 = require("../auth/jwt-admin.guard");
class SendTicketDto {
    name;
    phone;
    items;
    date;
    html;
}
let TicketsController = class TicketsController {
    ticketsService;
    constructor(ticketsService) {
        this.ticketsService = ticketsService;
    }
    get(id) {
        return this.ticketsService.findById(id);
    }
    async revertToAvailable(id) {
        return this.ticketsService.revertToAvailable(id);
    }
    async bulkSell(body) {
        return this.ticketsService.bulkMarkSold(body.items || []);
    }
    async send(body) {
        return this.ticketsService.sendTicket(body);
    }
};
exports.TicketsController = TicketsController;
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TicketsController.prototype, "get", null);
__decorate([
    (0, common_1.UseGuards)(jwt_admin_guard_1.JwtAdminGuard),
    (0, common_1.Post)(':id/revert-to-available'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "revertToAvailable", null);
__decorate([
    (0, common_1.UseGuards)(jwt_admin_guard_1.JwtAdminGuard),
    (0, common_1.Post)('bulk-sell'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "bulkSell", null);
__decorate([
    (0, common_1.Post)('send'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SendTicketDto]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "send", null);
exports.TicketsController = TicketsController = __decorate([
    (0, common_1.Controller)('api/tickets'),
    __metadata("design:paramtypes", [tickets_service_1.TicketsService])
], TicketsController);
//# sourceMappingURL=tickets.controller.js.map