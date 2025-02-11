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
Object.defineProperty(exports, '__esModule', { value: true });
exports.LoggerService = void 0;
const common_1 = require('@nestjs/common');
let LoggerService = class LoggerService extends common_1.ConsoleLogger {
  constructor() {
    super(...arguments);
    this.errorHandler = null;
    this.warnHandler = null;
    this.logHandler = null;
    this.setupFormatters();
  }
  setupFormatters() {
    const _this = this;
    // Log method
    const originalLog = this.log.bind(this);
    this.log = function (message, context) {
      if (typeof message === 'string' && message.includes('\n')) {
        message.split('\n').forEach(line => originalLog(line, context));
      } else {
        originalLog(message, context);
      }
    };
    // Error method
    const originalError = this.error.bind(this);
    this.error = function (message, stack, context) {
      if (typeof message === 'string' && message.includes('\n')) {
        message.split('\n').forEach(line => originalError(line, stack, context));
      } else {
        originalError(message, stack, context);
      }
    };
    // Warn method
    const originalWarn = this.warn.bind(this);
    this.warn = function (message, context) {
      if (typeof message === 'string' && message.includes('\n')) {
        message.split('\n').forEach(line => originalWarn(line, context));
      } else {
        originalWarn(message, context);
      }
    };
  }

  setLogHandler(fn) {
    this.logHandler = fn;
  }
  setErrorHandler(fn) {
    this.errorHandler = fn;
  }
  setWarnHandler(fn) {
    this.warnHandler = fn;
  }
};
exports.LoggerService = LoggerService;
exports.LoggerService = LoggerService = __decorate([(0, common_1.Injectable)()], LoggerService);
//# sourceMappingURL=logger.service.js.map
