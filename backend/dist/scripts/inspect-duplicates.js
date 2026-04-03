"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const prisma_1 = __importDefault(require("../src/lib/prisma"));
async function main() {
    const duplicates = await prisma_1.default.$queryRaw `
    SELECT ticketId, COUNT(*) as cnt
    FROM PurchaseItem
    GROUP BY ticketId
    HAVING cnt > 1
  `;
    console.log('Duplicate ticket counts:', duplicates);
    const rows = await prisma_1.default.purchaseItem.findMany({ where: { ticketId: 1 } });
    console.log('Rows for ticketId=1:', rows);
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma_1.default.$disconnect();
});
//# sourceMappingURL=inspect-duplicates.js.map