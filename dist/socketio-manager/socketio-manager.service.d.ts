import { ContainerLifecycleManagerService } from '../container-lifecycle-manager/container-lifecycle-manager.service';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from 'src/logger/logger.service';
export declare enum ConnectionType {
    PulseProxy = "pulse_proxy",
    OrcaPulse = "orcaPulse"
}
export declare const DB: {
    [Name: string]: any;
};
export declare let podIdList: any;
export declare const configValues: {
    [Name: string]: any;
};
export declare class SocketioManagerService {
    private configService;
    private containerLifecycleManager;
    private logger;
    private socketServer;
    private io;
    private httpServer;
    cmClient: any;
    pulseProxyPort: number;
    port: number;
    host: string;
    sslEnable: boolean;
    sslKey: string;
    sslCert: string;
    constructor(configService: ConfigService, containerLifecycleManager: ContainerLifecycleManagerService, logger: LoggerService);
    initialize(): void;
    private _initialize_middleware;
    private _initialize_listeners;
    close(): void;
}
