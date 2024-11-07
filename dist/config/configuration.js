"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => ({
    serverPort: parseInt(process.env.ORCA_SERVER_PORT, 10) || 3003,
    serverIp: process.env.ORCA_SERVER_IP || '0.0.0.0',
    sslEnable: typeof process.env.ORCA_SSL_ENABLE === 'undefined' ? false : JSON.parse(process.env.ORCA_SSL_ENABLE),
    sslRootCa: process.env.ORCA_SSL_ROOT_CA,
    sslKey: process.env.ORCA_SSL_KEY,
    sslCert: process.env.ORCA_SSL_CERT,
    publicHost: process.env.ORCA_PUBLIC_HOST ||
        `${process.env.ORCA_SERVER_IP}:${process.env.ORCA_SERVER_PORT}`,
    privateHost: process.env.ORCA_PRIVATE_HOST || 'host.containers.internal',
    apiKey: process.env.ORCA_API_KEY,
    metricsServer: process.env.METRICS_SERVER || "http://localhost:3000/metrics"
});
//# sourceMappingURL=configuration.js.map
