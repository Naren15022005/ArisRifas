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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminAuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const prisma_service_1 = require("../lib/prisma.service");
const bcrypt = __importStar(require("bcryptjs"));
class AdminLoginDto {
    email;
    password;
}
class AdminRegisterDto {
    email;
    password;
    name;
}
let AdminAuthController = class AdminAuthController {
    authService;
    prisma;
    constructor(authService, prisma) {
        this.authService = authService;
        this.prisma = prisma;
    }
    async login(body) {
        try {
            const { email, password } = body;
            if (!email || !password) {
                throw new common_1.BadRequestException('Email and password required');
            }
            const user = await this.authService.validateUser(email, password);
            if (!user || user.role !== 'ADMIN') {
                throw new common_1.BadRequestException('Invalid credentials');
            }
            return this.authService.login({ id: user.id, email: user.email, role: user.role });
        }
        catch (err) {
            try {
                console.error('AdminAuthController.login error:', err && err.stack ? err.stack : err);
            }
            catch (logErr) {
                // ignore logging errors
            }
            throw err;
        }
    }
    async register(body) {
        const { email, password, name } = body;
        if (!email || !password || !name) {
            throw new common_1.BadRequestException('Email, name and password are required');
        }
        const hasMinLength = password.length >= 12;
        const hasLetter = /[A-Za-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSymbol = /[^A-Za-z0-9]/.test(password);
        if (!hasMinLength || !hasLetter || !hasNumber || !hasSymbol) {
            throw new common_1.BadRequestException('Password too weak. Use at least 12 characters with letters, numbers and symbols.');
        }
        const existingAdmin = await this.prisma.client.user.findFirst({ where: { role: 'ADMIN' } });
        if (existingAdmin) {
            throw new common_1.ForbiddenException('Admin registration is disabled once an admin exists');
        }
        const existingByEmail = await this.prisma.client.user.findUnique({ where: { email } });
        if (existingByEmail) {
            throw new common_1.BadRequestException('Email already registered');
        }
        const hashed = await bcrypt.hash(password, 10);
        const user = await this.prisma.client.user.create({
            data: {
                email,
                name,
                password: hashed,
                role: 'ADMIN',
            },
        });
        return this.authService.login({ id: user.id, email: user.email, role: user.role });
    }
};
exports.AdminAuthController = AdminAuthController;
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AdminLoginDto]),
    __metadata("design:returntype", Promise)
], AdminAuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AdminRegisterDto]),
    __metadata("design:returntype", Promise)
], AdminAuthController.prototype, "register", null);
exports.AdminAuthController = AdminAuthController = __decorate([
    (0, common_1.Controller)('api/admin'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        prisma_service_1.PrismaService])
], AdminAuthController);
//# sourceMappingURL=admin-auth.controller.js.map