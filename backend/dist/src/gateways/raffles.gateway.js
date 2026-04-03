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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RafflesGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
let RafflesGateway = class RafflesGateway {
    server;
    afterInit() {
        console.log('RafflesGateway initialized');
    }
    handleConnection(client) {
        console.log('Client connected to raffles namespace', client.id);
    }
    handleDisconnect(client) {
        console.log('Client disconnected from raffles namespace', client.id);
    }
    broadcastPurchase(payload) {
        try {
            this.server.emit('purchase:reserved', payload);
        }
        catch (err) {
            console.warn('RafflesGateway.broadcastPurchase error', err);
        }
    }
    broadcastRaffleUpdated(payload) {
        try {
            this.server.emit('raffle:updated', payload);
        }
        catch (err) {
            console.warn('RafflesGateway.broadcastRaffleUpdated error', err);
        }
    }
};
exports.RafflesGateway = RafflesGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], RafflesGateway.prototype, "server", void 0);
exports.RafflesGateway = RafflesGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ namespace: 'raffles', cors: { origin: '*' } })
], RafflesGateway);
exports.default = RafflesGateway;
//# sourceMappingURL=raffles.gateway.js.map