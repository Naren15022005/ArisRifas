"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const prisma_1 = __importDefault(require("../src/lib/prisma"));
const http_1 = __importDefault(require("http"));
const crypto_1 = __importDefault(require("crypto"));
function post(path, data, port = 3001, headers = {}) {
    const body = JSON.stringify(data);
    const options = { hostname: '127.0.0.1', port, path, method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body), ...headers } };
    return new Promise((resolve, reject) => {
        const req = http_1.default.request(options, (res) => {
            let buf = '';
            res.on('data', c => buf += c);
            res.on('end', () => resolve({ status: res.statusCode ?? 0, body: buf }));
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}
async function main() {
    const port = process.env.PORT ? Number(process.env.PORT) : 3001;
    const purchaseId = process.argv[2] ? Number(process.argv[2]) : undefined;
    if (!purchaseId) {
        console.error('Usage: ts-node test-payments-and-webhook.ts <purchaseId>');
        process.exit(1);
    }
    console.log('Creating payment (checkout) for purchase', purchaseId);
    const resp = await post(`/api/payments/${purchaseId}/checkout`, {}, port);
    console.log('checkout resp:', resp.status, resp.body);
    const payment = await prisma_1.default.payment.findUnique({ where: { purchaseId } });
    if (!payment) {
        console.error('Payment not found in DB');
        process.exit(2);
    }
    console.log('payment from db:', { id: payment.id, wompiReference: payment.wompiReference });
    const event = { data: { id: `evt-${Date.now()}`, status: 'APPROVED', reference: payment.wompiReference } };
    const raw = JSON.stringify(event);
    const secret = process.env.WOMPI_EVENTS_SECRET || '';
    const signature = crypto_1.default.createHmac('sha256', secret).update(raw).digest('hex');
    const webhookResp = await post('/api/webhooks/wompi', event, port, { 'x-wompi-signature': signature });
    console.log('webhook resp:', webhookResp.status, webhookResp.body);
    const updated = await prisma_1.default.payment.findUnique({ where: { id: payment.id } });
    console.log('payment after webhook:', updated);
    await prisma_1.default.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
//# sourceMappingURL=test-payments-and-webhook.js.map