"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const prisma_1 = __importDefault(require("../src/lib/prisma"));
async function main() {
    console.log('Finding duplicate ticket assignments...');
    const dup = await prisma_1.default.$queryRaw `
    SELECT ticketId FROM PurchaseItem GROUP BY ticketId HAVING COUNT(*) > 1
  `;
    if (dup.length === 0) {
        console.log('No duplicates found');
        await prisma_1.default.$disconnect();
        return;
    }
    console.log('Duplicates found for tickets:', dup.map(d => d.ticketId));
    for (const d of dup) {
        const items = await prisma_1.default.$queryRaw `
      SELECT id, purchaseId FROM PurchaseItem WHERE ticketId = ${d.ticketId} ORDER BY id ASC
    `;
        if (items.length <= 1)
            continue;
        const keep = items[0].id;
        const remove = items.slice(1);
        for (const r of remove) {
            console.log(`Deleting duplicate PurchaseItem id=${r.id} (ticket ${d.ticketId})`);
            await prisma_1.default.purchaseItem.delete({ where: { id: r.id } });
            const remaining = await prisma_1.default.purchaseItem.count({ where: { purchaseId: r.purchaseId } });
            if (remaining === 0) {
                console.log(`No remaining items for purchase ${r.purchaseId}, marking CANCELLED`);
                await prisma_1.default.purchase.update({ where: { id: r.purchaseId }, data: { status: 'CANCELLED' } });
            }
        }
    }
    console.log('Duplicate cleanup complete');
    await prisma_1.default.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
//# sourceMappingURL=fix-duplicate-purchaseitems.js.map