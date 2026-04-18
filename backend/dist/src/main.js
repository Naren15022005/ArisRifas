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
const fs = __importStar(require("fs"));
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const publicRoot = (0, path_1.join)(process.cwd(), 'public');
    app.useStaticAssets(publicRoot);
    // If an upload is requested but the file is missing, return a small SVG placeholder
    app.use('/uploads', (req, res, next) => {
        try {
            const requested = decodeURIComponent(req.path || '').replace(/^\//, '');
            const filePath = (0, path_1.join)(process.cwd(), 'public', 'uploads', requested);
            if (fs.existsSync(filePath)) {
                return next();
            }
        }
        catch (e) {
            // ignore and fallthrough to placeholder
        }
        const svg = `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="100%" height="100%" fill="#111"/><text x="50%" y="50%" fill="#ddd" font-family="Arial, Helvetica, sans-serif" font-size="28" dominant-baseline="middle" text-anchor="middle">Imagen no disponible</text></svg>`;
        res.setHeader('Content-Type', 'image/svg+xml');
        res.status(200).send(svg);
    });
    app.use('/uploads', express.static((0, path_1.join)(process.cwd(), 'public', 'uploads')));
    // Añadimos por defecto las URLs del frontend en Vercel y del backend en Render
    // para facilitar la configuración inicial en producción. Si `FRONTEND_ORIGINS`
    // está definido en el entorno, lo respetamos. Permitimos que el valor
    // "*" actúe como wildcard para aceptar todos los orígenes en producción.
    const defaultOrigins = 'https://arisrifas.vercel.app,https://arisrifas.onrender.com';
    const originsEnv = (process.env.FRONTEND_ORIGINS || process.env.FRONTEND_ORIGIN || defaultOrigins || '').toString();
    const allowAnyOrigin = originsEnv.trim() === '*';
    const allowedOrigins = allowAnyOrigin
        ? []
        : originsEnv
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
    const isDev = process.env.NODE_ENV !== 'production';
    app.enableCors({
        origin: isDev || allowAnyOrigin
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