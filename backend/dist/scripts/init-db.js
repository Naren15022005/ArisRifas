"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../src/lib/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prismaClient = prisma_1.prisma;
async function main() {
    console.log('Creating sample data...');
    const email = process.env.SEED_ADMIN_EMAIL || 'test@example.com';
    const password = process.env.SEED_ADMIN_PASSWORD || 'changeme';
    const hashed = await bcryptjs_1.default.hash(password, 10);
    await prismaClient.user.upsert({
        where: { email },
        update: { password: hashed, name: 'Test User' },
        create: { email, password: hashed, name: 'Test User', phone: '' },
    });
    const raffle = await prismaClient.raffle.create({
        data: {
            title: 'Rifa inicial',
            description: 'Rifa creada por el script de inicialización',
            pricePerTicket: '10.00',
            totalTickets: 100,
            drawDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
            isPublished: true,
        },
    });
    const ticketsData = Array.from({ length: 100 }, (_, i) => ({ raffleId: raffle.id, number: i + 1 }));
    for (let i = 0; i < ticketsData.length; i += 20) {
        const chunk = ticketsData.slice(i, i + 20);
        await prismaClient.ticket.createMany({ data: chunk });
    }
    console.log('Seed complete. User:', email);
}
main()
    .then(() => process.exit(0))
    .catch((e) => {
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=init-db.js.map