import { DevService, ProfilerEntry } from './dev.service';
export declare class DevController {
    private readonly devService;
    constructor(devService: DevService);
    receiveProfiler(body: any): {
        ok: boolean;
        error: string;
        received?: undefined;
    } | {
        ok: boolean;
        received: number;
        error?: undefined;
    };
    stats(): {
        totalSamples: number;
        perComponent: Record<string, any>;
        recent: ProfilerEntry[];
    };
    clear(): {
        ok: boolean;
    };
}
