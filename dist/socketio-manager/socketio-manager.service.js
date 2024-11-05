'use strict';
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
          ? (desc = Object.getOwnPropertyDescriptor(target, key))
          : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function')
      return Reflect.metadata(k, v);
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.SocketioManagerService =
  exports.configValues =
  exports.podIdList =
  exports.DB =
  exports.ConnectionType =
    void 0;
const common_1 = require('@nestjs/common');
const socket_io_1 = require('socket.io');
const https = require('https');
const http = require('http');
const express = require('express');
const container_lifecycle_manager_service_1 = require('../container-lifecycle-manager/container-lifecycle-manager.service');
const config_1 = require('@nestjs/config');
const socketio_handlers_1 = require('./socketio.handlers');
const socketio_rpc_handlers_1 = require('./socketio.rpc.handlers');
const logger_service_1 = require('../logger/logger.service');
var ConnectionType;
(function (ConnectionType) {
  ConnectionType['PulseProxy'] = 'pulse_proxy';
  ConnectionType['OrcaPulse'] = 'orcaPulse';
})(ConnectionType || (exports.ConnectionType = ConnectionType = {}));
exports.DB = {
  rpcCalls: {},
  sockets: {},
};
exports.podIdList = [];
exports.configValues = {
  sslEnable: {},
  privateHost: {},
  orcaSslRootCa: {},
};
function authentication_middleware(socket, next) {
  const podId = socket.nsp.name.slice(1);
  const { connectionType } = socket.handshake.auth;
  socket.data.connectionType = connectionType;
  socket.data.podId = podId;
  exports.podIdList.push(podId);
  exports.podIdList = [...new Set(exports.podIdList)];
  if (!exports.DB.sockets.hasOwnProperty(podId)) {
    exports.DB.sockets[podId] = {};
  }
  exports.DB.sockets[podId][connectionType] = socket;
  next();
}
let SocketioManagerService = class SocketioManagerService {
  constructor(configService, containerLifecycleManager, logger) {
    this.configService = configService;
    this.containerLifecycleManager = containerLifecycleManager;
    this.logger = logger;
    this.port = this.configService.get('serverPort');
    this.host = this.configService.get('serverIp');
    this.sslEnable = this.configService.get('sslEnable');
    this.sslKey = this.configService.get('sslKey');
    this.sslCert = this.configService.get('sslCert');
    const privateHost = this.configService.get('privateHost');
    const sslRootCa = this.configService.get('sslRootCa');
    exports.configValues.sslEnable = this.sslEnable;
    exports.configValues.privateHost = privateHost;
    exports.configValues.orcaSslRootCa = sslRootCa;
  }
  initialize() {
    const app = express();
    this.cmClient = this.containerLifecycleManager;
    let httpServer;
    if (this.sslEnable) {
      const options = {
        key: this.sslKey,
        cert: this.sslCert,
      };
      httpServer = https.createServer(options, app);
      this.logger.log('Server started in ssl mode');
    } else {
      httpServer = http.createServer(app);
      this.logger.log('Server started in http mode');
    }
    const io = new socket_io_1.Server(httpServer, {});
    const workspaces = io.of(/^\/\w+$/);
    httpServer.listen(this.port, this.host, () => {
      this.logger.log(
        `Server started on port ${this.port} and host ${this.host}`,
      );
    });
    this.socketServer = workspaces;
    this.io = io;
    this.httpServer = httpServer;
    this.pulseProxyPort = this.port;
    this._initialize_middleware();
    this._initialize_listeners();
  }
  _initialize_middleware() {
    this.socketServer.use(authentication_middleware);
  }
  _initialize_listeners() {
    this.socketServer.on('connection', (socket) => {
      const workspace = socket.nsp;
      (0, socketio_handlers_1.registerPodLifecycleHandlers)(
        this.socketServer,
        socket,
        this.pulseProxyPort,
        this.cmClient,
        this.logger,
      );
      (0, socketio_handlers_1.registerPulseProxyHandlers)(
        this.socketServer,
        socket,
        this.logger,
      );
      (0, socketio_rpc_handlers_1.rpcCallHandlers)(this.socketServer, socket);
      (0, socketio_handlers_1.orphanHandler)(this.cmClient);
    });
  }
  close() {
    this.io.close();
    this.httpServer.close();
    this.cmClient.disconnectAll();
  }
};
exports.SocketioManagerService = SocketioManagerService;
exports.SocketioManagerService = SocketioManagerService = __decorate(
  [
    (0, common_1.Injectable)(),
    __metadata('design:paramtypes', [
      config_1.ConfigService,
      container_lifecycle_manager_service_1.ContainerLifecycleManagerService,
      logger_service_1.LoggerService,
    ]),
  ],
  SocketioManagerService,
);
//# sourceMappingURL=socketio-manager.service.js.map
