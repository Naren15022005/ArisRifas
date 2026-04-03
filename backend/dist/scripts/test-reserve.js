"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const purchases_service_1 = __importDefault(require("../src/purchases/purchases.service"));
const prisma_1 = __importDefault(require("../src/lib/prisma"));
(async () => {
    let user = await prisma_1.default.user.findUnique({ where: { id: 1 } });
    if (!user) {
        user = await prisma_1.default.user.create({ data: { email: 'test@example.com', name: 'Test', password: 'changeme' } });
        console.log('created test user', user.id);
    }
    const svc = new purchases_service_1.default();
    try {
        const res = await svc.reserve(user.id, 1, 1);
        console.log('reserve result:', res);
    }
    catch (e) {
        console.error('reserve error:', e);
    }
    finally {
        process.exit(0);
    }
})();
//# sourceMappingURL=test-reserve.js.map