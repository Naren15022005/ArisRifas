"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtAdminGuard = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
class JwtAdminGuard extends (0, passport_1.AuthGuard)('jwt') {
    handleRequest(err, user, info, context) {
        if (err || !user) {
            throw err || new common_1.UnauthorizedException();
        }
        if (user.role !== 'ADMIN') {
            throw new common_1.ForbiddenException('Admins only');
        }
        return user;
    }
}
exports.JwtAdminGuard = JwtAdminGuard;
//# sourceMappingURL=jwt-admin.guard.js.map