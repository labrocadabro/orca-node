import { ConsoleLogger } from '@nestjs/common';
export declare class LoggerService extends ConsoleLogger {
    private errorHandler;
    private warnHandler;
    private logHandler;
    log(message: any): void;
    error(message: any, stack?: string, context?: string): void;
    warn(message: any, context?: string, ...rest: any): void;
    setLogHandler(fn: any): void;
    setErrorHandler(fn: any): void;
    setWarnHandler(fn: any): void;
}
