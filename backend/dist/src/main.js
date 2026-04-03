"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const path_1 = require("path");
const express = __importStar(require("express"));
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const publicRoot = (0, path_1.join)(process.cwd(), 'public');
    app.useStaticAssets(publicRoot);
    app.use('/uploads', express.static((0, path_1.join)(process.cwd(), 'public', 'uploads')));
    const originsEnv = process.env.FRONTEND_ORIGINS || process.env.FRONTEND_ORIGIN || 'http://localhost:3000';
    const allowedOrigins = originsEnv
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    const isDev = process.env.NODE_ENV !== 'production';
    app.enableCors({
        origin: isDev
            ? true
            : (origin, callback) => {
                if (!origin)
                    return callback(null, true);
                if (allowedOrigins.includes(origin))
                    return callback(null, true);
                return callback(null, false);
            },
        credentials: false,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'idempotency-key',
            'x-requested-with',
        ],
        maxAge: 600,
    });
    const port = process.env.PORT ? Number(process.env.PORT) : 3001;
    const host = process.env.HOST || '0.0.0.0';
    await app.listen(port, host);
    console.log(`Server listening on ${host}:${port}`);
}
void bootstrap();
//# sourceMappingURL=main.js.map