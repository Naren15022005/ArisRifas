export type ProfilerEntry = {
    id: string;
    phase?: string;
    actualDuration?: number;
    baseDuration?: number;
    startTime?: number;
    commitTime?: number;
    timestamp?: number;
};
export declare class DevService {
    private logs;
    private readonly MAX;
    addEntries(entries: ProfilerEntry[] | ProfilerEntry): void;
    clear(): void;
    getStats(): {
        totalSamples: number;
        perComponent: Record<string, any>;
        recent: ProfilerEntry[];
    };
}
