import winston from 'winston';
export declare class Logger {
    private logger;
    private context;
    constructor(context?: string);
    private createLogger;
    info(message: string, meta?: any): void;
    error(message: string, error?: any): void;
    warn(message: string, meta?: any): void;
    debug(message: string, meta?: any): void;
    verbose(message: string, meta?: any): void;
    silly(message: string, meta?: any): void;
    log(level: string, message: string, meta?: any): void;
    profile(id: string, meta?: any): void;
    startTimer(): winston.Profiler;
    child(options: winston.LoggerOptions): winston.Logger;
    add(transport: winston.transport): winston.Logger;
    remove(transport: winston.transport): winston.Logger;
    clear(): winston.Logger;
    close(): winston.Logger;
    isLevelEnabled(level: string): boolean;
    configure(options: winston.LoggerOptions): void;
    getLogger(): winston.Logger;
}
//# sourceMappingURL=logger.d.ts.map