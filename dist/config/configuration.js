'use strict';
const { execSync } = require('child_process');

Object.defineProperty(exports, '__esModule', { value: true });
function getWslGateway() {
  // Method 1: Direct WSL hostname (most reliable, works without admin)
  try {
    const output = execSync('wsl hostname -I', { timeout: 5000 }).toString().trim();
    const ip = output.split(' ')[0];

    return ip;
  } catch (err) {
    console.warn('Failed to get WSL IP using hostname:', err.message);
  }

  // Method 2: Check specific podman-orca WSL instance route
  try {
    const output = execSync('wsl -d podman-orca ip route', { timeout: 5000 }).toString();
    const defaultRoute = output.split('\n').find((line) => line.startsWith('default'));
    if (defaultRoute) {
      const gateway = defaultRoute.split(' ')[2].trim();

      return gateway;
    }
  } catch (err) {
    console.warn('Failed to get WSL IP using podman-orca route:', err.message);
  }

  return 'host.containers.internal';
}

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
  privateHost:
    process.env.ORCA_PRIVATE_HOST ||
    (process.platform === 'win32' ? getWslGateway() : 'host.containers.internal'),
  apiKey: process.env.ORCA_API_KEY,
  metricsServer: process.env.METRICS_SERVER || 'http://localhost:3000/metrics',
});
//# sourceMappingURL=configuration.js.map
