import { SocketioManagerService } from './socketio-manager/socketio-manager.service';
import { LoggerService } from './logger/logger.service';
import { MacOSInstaller, WinInstaller } from './podman-install/podman-install.service';
import { MetricsService } from './metrics/metrics.service';
import { ConfigService } from '@nestjs/config';
export default class Orca {
  private socketIOManager;
  private metricsService;
  private logger;
  private winInstaller;
  private macInstaller;
  private configService;
  metricsServer: string;
  constructor(
    socketIOManager: SocketioManagerService,
    metricsService: MetricsService,
    logger: LoggerService,
    winInstaller: WinInstaller,
    macInstaller: MacOSInstaller,
    configService: ConfigService,
  );
  installPrerequisites(): Promise<void>;
  setLogHandler(fn: any): void;
  setErrorHandler(fn: any): void;
  setWarnHandler(fn: any): void;
  close(): void;
}
