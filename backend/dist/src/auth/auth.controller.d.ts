import { AuthService } from './auth.service';
declare class LoginDto {
    email: string;
    password: string;
}
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(body: LoginDto): Promise<{
        access_token: string;
    }>;
}
export {};
