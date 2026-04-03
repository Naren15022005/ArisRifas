"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const prisma_1 = __importDefault(require("../src/lib/prisma"));
async function main() {
    const deleted = await prisma_1.default.purchaseItem.deleteMany({ where: { ticketId: 1 } });
    console.log('Deleted purchaseItem rows:', deleted);
    const updated = await prisma_1.default.ticket.updateMany({ where: { id: 1 }, data: { status: 'AVAILABLE', reservedUntil: null } });
    console.log('Updated ticket rows:', updated);
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma_1.default.$disconnect();
});
//# sourceMappingURL=fix-ticket-1.js.map