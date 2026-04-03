"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../src/lib/prisma"));
async function main() {
    try {
        const rows = await prisma_1.default.$queryRaw `SELECT id, title, estimatedValue, associatedLottery, createdAt FROM Raffle ORDER BY id DESC LIMIT 5`;
        console.log('RESULT', JSON.stringify(rows, null, 2));
    }
    catch (err) {
        console.error('ERR', err);
        process.exit(1);
    }
    finally {
        await prisma_1.default.$disconnect();
    }
}
main();
//# sourceMappingURL=queryRaffles.js.map