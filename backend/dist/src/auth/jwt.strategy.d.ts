interface JwtPayload {
    sub: number | string;
    email: string;
    role?: string;
}
declare const JwtStrategy_base: new (...args: any) => any;
export declare class JwtStrategy extends JwtStrategy_base {
    constructor();
    validate(payload: JwtPayload): {
        id: string | number;
        email: string;
        role: string | undefined;
    };
}
export {};
