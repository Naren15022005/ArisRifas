"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const prisma_1 = __importDefault(require("../src/lib/prisma"));
const http_1 = __importDefault(require("http"));
async function ensureUsers(count = 30) {
    const users = [];
    for (let i = 1; i <= count; i++) {
        const email = `stress.user${i}@local`;
        let u = await prisma_1.default.user.findUnique({ where: { email } });
        if (!u) {
            u = await prisma_1.default.user.create({ data: { email, name: `Stress User ${i}`, password: 'x' } });
        }
        users.push(u.id);
    }
    return users;
}
async function ensureRafflesAndTickets(raffleCount = 3, ticketsPerRaffle = 200) {
    const raffles = [];
    for (let r = 1; r <= raffleCount; r++) {
        const title = `Stress Raffle ${r}`;
        let raffle = await prisma_1.default.raffle.findFirst({ where: { title } });
        if (!raffle) {
            raffle = await prisma_1.default.raffle.create({ data: { title, description: 'Stress test raffle', pricePerTicket: 100, totalTickets: ticketsPerRaffle, drawDate: new Date(Date.now() + 1000 * 60 * 60 * 24) } });
        }
        const existing = await prisma_1.default.ticket.count({ where: { raffleId: raffle.id } });
        if (existing < ticketsPerRaffle) {
            const toCreate = [];
            for (let n = existing + 1; n <= ticketsPerRaffle; n++)
                toCreate.push({ raffleId: raffle.id, number: n });
            const chunk = 500;
            for (let i = 0; i < toCreate.length; i += chunk) {
                await prisma_1.default.ticket.createMany({ data: toCreate.slice(i, i + chunk) });
            }
        }
        raffles.push(raffle.id);
    }
    return raffles;
}
function postReserve(port, userId, raffleId, quantity = 1) {
    const data = JSON.stringify({ userId, raffleId, quantity });
    const options = {
        hostname: '127.0.0.1',
        port,
        path: '/api/purchases/reserve',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
        timeout: 20000,
    };
    return new Promise((resolve, reject) => {
        const req = http_1.default.request(options, (res) => {
            let buf = '';
            res.on('data', (c) => (buf += c));
            res.on('end', () => resolve({ status: res.statusCode ?? 0, body: buf }));
        });
        req.on('error', (e) => reject(e));
        req.write(data);
        req.end();
    });
}
async function main() {
    const port = process.env.PORT ? Number(process.env.PORT) : 3001;
    console.log('Preparing users and raffles...');
    const users = await ensureUsers(40);
    const raffles = await ensureRafflesAndTickets(4, 300);
    console.log(`Users: ${users.length}, Raffles: ${raffles.length}`);
    const concurrency = 220;
    console.log(`Launching ${concurrency} concurrent reserve requests (mixed users/raffles)`);
    const promises = [];
    for (let i = 0; i < concurrency; i++) {
        const userId = users[Math.floor(Math.random() * users.length)];
        const raffleId = raffles[Math.floor(Math.random() * raffles.length)];
        const qty = 1;
        promises.push(postReserve(port, userId, raffleId, qty).then((r) => ({ ok: true, r })).catch((e) => ({ ok: false, e: String(e) })));
    }
    const results = await Promise.all(promises);
    let ok = 0;
    let conflict = 0;
    let other = 0;
    for (const res of results) {
        if (!res.ok) {
            other++;
            console.log('ERR', res.e);
            continue;
        }
        const status = res.r.status;
        if (status >= 200 && status < 300)
            ok++;
        else if (status === 409)
            conflict++;
        else
            other++;
    }
    console.log('Results:', { total: concurrency, ok, conflict, other });
    const dupItems = await prisma_1.default.$queryRaw `
    SELECT ticketId, COUNT(*) as c FROM PurchaseItem GROUP BY ticketId HAVING c > 1
  `;
    console.log('Duplicate purchase items count:', dupItems.length);
    await prisma_1.default.$disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
//# sourceMappingURL=stress-test-reserve.js.map