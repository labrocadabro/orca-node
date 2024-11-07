"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsService = void 0;
const common_1 = require("@nestjs/common");
const os = require("os");
let MetricsService = class MetricsService {
    async sendSystemInfo(apiUrl, id) {
        const totalMemory = os.totalmem();
        const freeMemory = os.freemem();
        const cpuUsage = os.loadavg();
        const uptime = os.uptime();
        os.cpus();
        const data = {
            "data": { "totalMemory": totalMemory, "freeMemory": freeMemory, "cpuUsage": cpuUsage, "uptime": uptime },
            "nodeIdentifier": id
        };
        try {
            const response = await fetch(apiUrl, {
                method: "POST",
                body: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json' }
            });
            if (response.ok) {
                const data = await response.json();
                return data;
            }
            else {
                console.error('Request failed with status:', response.status);
                return response;
            }
        }
        catch (error) {
            console.error('Error:', error);
        }
    }
};
exports.MetricsService = MetricsService;
exports.MetricsService = MetricsService = __decorate([
    (0, common_1.Injectable)()
], MetricsService);
//# sourceMappingURL=metrics.service.js.map
