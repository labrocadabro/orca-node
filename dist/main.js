'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.bootstrap = void 0;
const core_1 = require('@nestjs/core');
const app_module_1 = require('./app.module');
const app_service_1 = require('./app.service');
const logger_service_1 = require('./logger/logger.service');
async function bootstrap() {
  const app = await core_1.NestFactory.create(app_module_1.AppModule, {
    bufferLogs: true,
  });
  app.useLogger(app.get(logger_service_1.LoggerService));
  await app.listen(3000);
  return app.get(app_service_1.default);
}
exports.bootstrap = bootstrap;
//# sourceMappingURL=main.js.map
