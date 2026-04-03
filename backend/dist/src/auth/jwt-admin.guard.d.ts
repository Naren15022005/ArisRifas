declare const JwtAdminGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class JwtAdminGuard extends JwtAdminGuard_base {
    handleRequest(err: unknown, user: any, info: unknown, context: unknown): any;
}
export {};
