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
exports.DevController = void 0;
const common_1 = require("@nestjs/common");
const dev_service_1 = require("./dev.service");
let DevController = class DevController {
    devService;
    constructor(devService) {
        this.devService = devService;
    }
    receiveProfiler(body) {
        try {
            const entries = [];
            if (!body)
                return { ok: false, error: 'empty' };
            if (Array.isArray(body)) {
                for (const b of body)
                    entries.push(b);
            }
            else if (Array.isArray(body.entries)) {
                for (const b of body.entries)
                    entries.push(b);
            }
            else if (body.id) {
                entries.push(body);
            }
            this.devService.addEntries(entries);
            return { ok: true, received: entries.length };
        }
        catch (err) {
            return { ok: false, error: String(err) };
        }
    }
    stats() {
        return this.devService.getStats();
    }
    clear() {
        this.devService.clear();
        return { ok: true };
    }
};
exports.DevController = DevController;
__decorate([
    (0, common_1.Post)('profiler'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DevController.prototype, "receiveProfiler", null);
__decorate([
    (0, common_1.Get)('profiler/stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DevController.prototype, "stats", null);
__decorate([
    (0, common_1.Post)('profiler/clear'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DevController.prototype, "clear", null);
exports.DevController = DevController = __decorate([
    (0, common_1.Controller)('api/dev'),
    __metadata("design:paramtypes", [dev_service_1.DevService])
], DevController);
//# sourceMappingURL=dev.controller.js.map