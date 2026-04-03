"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const prisma_1 = __importDefault(require("../src/lib/prisma"));
const http_1 = __importDefault(require("http"));
async function ensureTestUser() {
    const email = 'concurrency@test.local';
    const existing = await prisma_1.default.user.findUnique({ where: { email } });
    if (existing)
        return existing.id;
    const u = await prisma_1.default.user.create({ data: { email, name: 'Concurrency Tester', password: 'x' } });
    return u.id;
}
function postReserve(port, userId, raffleId) {
    const data = JSON.stringify({ userId, raffleId, quantity: 1 });
    const options = {
        hostname: '127.0.0.1',
        port,
        path: '/api/purchases/reserve',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
        timeout: 10000,
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
    const userId = await ensureTestUser();
    const raffleId = 1;
    const concurrency = 30;
    console.log(`Running concurrency test: ${concurrency} concurrent requests against /api/purchases/reserve (port ${port})`);
    const promises = [];
    for (let i = 0; i < concurrency; i++) {
        promises.push(postReserve(port, userId, raffleId));
    }
    const results = await Promise.allSettled(promises);
    let success = 0;
    let conflict = 0;
    let other = 0;
    for (const r of results) {
        if (r.status === 'fulfilled') {
            const { status, body } = r.value;
            if (status === 200)
                success++;
            else if (status === 409)
                conflict++;
            else
                other++;
            console.log(`resp ${status} -> ${body}`);
        }
        else {
            other++;
            console.log('request failed', r.reason);
        }
    }
    console.log('Summary:', { total: concurrency, success, conflict, other });
    await prisma_1.default.$disconnect();
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=concurrency-test-reserve.js.map