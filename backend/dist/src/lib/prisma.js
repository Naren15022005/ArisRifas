"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
if (!process.env.PRISMA_CLIENT_ENGINE_TYPE) {
    process.env.PRISMA_CLIENT_ENGINE_TYPE = 'binary';
}
const client_1 = require("@prisma/client");
const clientOptions = { log: ['query'] };
let PrismaAdapterFactory;
try {
    PrismaAdapterFactory = require('@prisma/adapter-mariadb').PrismaMariaDb;
}
catch {
    PrismaAdapterFactory = undefined;
}
if (PrismaAdapterFactory) {
    clientOptions.adapter = new PrismaAdapterFactory(process.env.DATABASE_URL);
}
exports.prisma = global.prisma ?? new client_1.PrismaClient(clientOptions);
if (process.env.NODE_ENV !== 'production')
    global.prisma = exports.prisma;
exports.default = exports.prisma;
//# sourceMappingURL=prisma.js.map