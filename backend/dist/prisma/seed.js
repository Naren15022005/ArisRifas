"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const prisma_1 = __importDefault(require("../src/lib/prisma"));
async function main() {
    console.log('Seeding database...');
    const raffle = await prisma_1.default.raffle.create({
        data: {
            title: 'Rifa de prueba',
            description: 'Rifa generada por el seed',
            pricePerTicket: 100.0,
            totalTickets: 100,
            drawDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            isPublished: true,
        },
    });
    const ticketsData = Array.from({ length: raffle.totalTickets }).map((_, i) => ({
        raffleId: raffle.id,
        number: i + 1,
    }));
    await prisma_1.default.ticket.createMany({ data: ticketsData });
    console.log('Seed completo.');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma_1.default.$disconnect();
});
//# sourceMappingURL=seed.js.map