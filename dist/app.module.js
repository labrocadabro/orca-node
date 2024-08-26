"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const container_lifecycle_manager_service_1 = require("./container-lifecycle-manager/container-lifecycle-manager.service");
const socketio_manager_service_1 = require("./socketio-manager/socketio-manager.service");
const config_1 = require("@nestjs/config");
const configuration_1 = require("./config/configuration");
const app_service_1 = require("./app.service");
const logger_module_1 = require("./logger/logger.module");
const socketio_manager_module_1 = require("./socketio-manager/socketio-manager.module");
const podman_install_service_1 = require("./podman-install/podman-install.service");
const metrics_service_1 = require("./metrics/metrics.service");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                load: [configuration_1.default],
                isGlobal: true,
                ignoreEnvFile: true,
            }),
            logger_module_1.LoggerModule,
            socketio_manager_module_1.SocketioManagerModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            config_1.ConfigService,
            container_lifecycle_manager_service_1.ContainerLifecycleManagerService,
            socketio_manager_service_1.SocketioManagerService,
            podman_install_service_1.WinInstaller, podman_install_service_1.MacOSInstaller,
            app_service_1.default,
            metrics_service_1.MetricsService,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map