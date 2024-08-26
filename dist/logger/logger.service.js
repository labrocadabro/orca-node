"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerService = void 0;
const common_1 = require("@nestjs/common");
let LoggerService = class LoggerService extends common_1.ConsoleLogger {
    constructor() {
        super(...arguments);
        this.errorHandler = null;
        this.warnHandler = null;
        this.logHandler = null;
    }
    log(message) {
        if (this.logHandler != null) {
            this.logHandler(message);
        }
        super.log(message);
    }
    error(message, stack, context) {
        if (this.errorHandler != null) {
            this.errorHandler(message, stack, context);
        }
        super.error(message, stack, context);
    }
    warn(message, context, ...rest) {
        if (this.warnHandler != null) {
            this.warnHandler(message, context, ...rest);
        }
        super.warn(message, context, ...rest);
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
exports.LoggerService = LoggerService = __decorate([
    (0, common_1.Injectable)()
], LoggerService);
//# sourceMappingURL=logger.service.js.map