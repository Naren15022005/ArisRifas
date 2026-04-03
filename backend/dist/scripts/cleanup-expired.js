"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const prisma_1 = __importDefault(require("../src/lib/prisma"));
const purchases_service_1 = require("../src/purchases/purchases.service");
async function main() {
    const svc = new purchases_service_1.PurchasesService();
    const res = await svc.cleanupExpiredReservations();
    console.log('cleanup result:', res);
    await prisma_1.default.$disconnect();
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=cleanup-expired.js.map