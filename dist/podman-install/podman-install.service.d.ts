import { LoggerService } from 'src/logger/logger.service';
export declare class WinInstaller {
    private logger;
    constructor(logger: LoggerService);
    install(): Promise<boolean>;
}
export declare class MacOSInstaller {
    private logger;
    constructor(logger: LoggerService);
    install(): Promise<boolean>;
}
