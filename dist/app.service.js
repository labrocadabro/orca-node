"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const socketio_manager_service_1 = require("./socketio-manager/socketio-manager.service");
const logger_service_1 = require("./logger/logger.service");
const podman_install_service_1 = require("./podman-install/podman-install.service");
const util_1 = require("./podman-install/util");
const os = require("os");
const metrics_service_1 = require("./metrics/metrics.service");
const config_1 = require("@nestjs/config");
let Orca = class Orca {
    constructor(socketIOManager, metricsService, logger, winInstaller, macInstaller, configService) {
        this.socketIOManager = socketIOManager;
        this.metricsService = metricsService;
        this.logger = logger;
        this.winInstaller = winInstaller;
        this.macInstaller = macInstaller;
        this.configService = configService;
        socketIOManager.initialize();
        this.metricsServer = this.configService.get('metricsServer');
        const id = "node1235";
        metricsService.sendSystemInfo(this.metricsServer, id);
        setInterval(() => {
            metricsService.sendSystemInfo(this.metricsServer, id);
        }, 30 * 60 * 1000);
    }
    async installPrerequisites() {
        const isPodmanInstalled = await (0, util_1.checkPodmanVersion)();
        if (isPodmanInstalled) {
            this.logger.log(`Podman already installed, skipping installation.`);
        }
        else {
            if ((0, util_1.isWindows)()) {
                await this.winInstaller.install();
            }
            else if ((0, util_1.isMac)()) {
                await this.macInstaller.install();
            }
            else if ((0, util_1.isLinux)()) {
                this.logger.error(`Auto Installation for ${os.platform} not supported`);
            }
            else {
                throw new Error(`${os.platform} not supported`);
            }
        }
    }
    setLogHandler(fn) {
        this.logger.setLogHandler(fn);
    }
    setErrorHandler(fn) {
        this.logger.setErrorHandler(fn);
    }
    setWarnHandler(fn) {
        this.logger.setWarnHandler(fn);
    }
    close() {
        this.socketIOManager.close();
        console.debug('Orca instance closed');
    }
};
Orca = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [socketio_manager_service_1.SocketioManagerService,
        metrics_service_1.MetricsService,
        logger_service_1.LoggerService,
        podman_install_service_1.WinInstaller,
        podman_install_service_1.MacOSInstaller,
        config_1.ConfigService])
], Orca);
exports.default = Orca;
//# sourceMappingURL=app.service.js.map
