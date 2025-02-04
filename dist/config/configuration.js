'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const getWslGateway = () => {
  if (process.platform === 'win32') {

      const { execSync } = require('child_process');
      // Get current Podman machine name
      const machineOutput = execSync('podman machine ls --format "{{.Name}}"').toString().trim().replace('*', '');
      // Get gateway IP from that machine
      const output = execSync(`wsl -d podman-${machineOutput} ip route`).toString();
      const defaultRoute = output.split('\n').find(line => line.startsWith('default'));
      if (defaultRoute) {
        return defaultRoute.split(' ')[2].trim();
      }
    }
    return 'host.containers.internal';
};

console.log(getWslGateway());
exports.default = () => ({
  serverPort: parseInt(process.env.ORCA_SERVER_PORT, 10) || 3003,
  serverIp: process.env.ORCA_SERVER_IP || '0.0.0.0',
  sslEnable:
    typeof process.env.ORCA_SSL_ENABLE === 'undefined'
      ? false
      : JSON.parse(process.env.ORCA_SSL_ENABLE),
  sslRootCa: process.env.ORCA_SSL_ROOT_CA,
  sslKey: process.env.ORCA_SSL_KEY,
  sslCert: process.env.ORCA_SSL_CERT,
  publicHost:
    process.env.ORCA_PUBLIC_HOST || `${process.env.ORCA_SERVER_IP}:${process.env.ORCA_SERVER_PORT}`,
  privateHost: process.env.ORCA_PRIVATE_HOST || (process.platform === 'win32' ? getWslGateway() : 'host.container.internal'),
  apiKey: process.env.ORCA_API_KEY,
  metricsServer: process.env.METRICS_SERVER || 'http://localhost:3000/metrics',
});
//# sourceMappingURL=configuration.js.map
