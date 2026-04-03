import type { Request } from 'express';
export declare class WebhooksController {
    handleWompi(req: Request): Promise<{
        ok: boolean;
    }>;
}
