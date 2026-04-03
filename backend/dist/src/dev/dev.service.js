"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevService = void 0;
const common_1 = require("@nestjs/common");
let DevService = class DevService {
    logs = [];
    MAX = 5000;
    addEntries(entries) {
        const arr = Array.isArray(entries) ? entries : [entries];
        for (const e of arr) {
            const item = { ...e, timestamp: e.timestamp ?? Date.now() };
            this.logs.push(item);
            if (this.logs.length > this.MAX)
                this.logs.shift();
        }
    }
    clear() {
        this.logs = [];
    }
    getStats() {
        const byId = {};
        for (const l of this.logs) {
            const id = l.id || 'unknown';
            const d = typeof l.actualDuration === 'number' ? l.actualDuration : 0;
            if (!byId[id])
                byId[id] = { count: 0, sum: 0, max: 0, min: Number.MAX_VALUE, lastSeen: 0 };
            const s = byId[id];
            s.count += 1;
            s.sum += d;
            s.max = Math.max(s.max, d);
            s.min = Math.min(s.min, d);
            s.lastSeen = Math.max(s.lastSeen, l.timestamp ?? 0);
        }
        const out = {};
        for (const k of Object.keys(byId)) {
            const v = byId[k];
            out[k] = {
                count: v.count,
                avg: v.count > 0 ? v.sum / v.count : 0,
                max: v.max === 0 ? 0 : v.max,
                min: v.min === Number.MAX_VALUE ? 0 : v.min,
                lastSeen: v.lastSeen,
            };
        }
        return {
            totalSamples: this.logs.length,
            perComponent: out,
            recent: this.logs.slice(-200),
        };
    }
};
exports.DevService = DevService;
exports.DevService = DevService = __decorate([
    (0, common_1.Injectable)()
], DevService);
//# sourceMappingURL=dev.service.js.map