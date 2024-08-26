'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.getAssetsFolder =
  exports.checkPodmanVersion =
  exports.getPodmanCli =
  exports.appHomeDir =
  exports.isLinux =
  exports.isMac =
  exports.isWindows =
    void 0;
const os = require('node:os');
const path = require('node:path');
const child_process = require('child_process');
const util = require('util');
const exec = util.promisify(child_process.exec);
const windows = os.platform() === 'win32';
function isWindows() {
  return windows;
}
exports.isWindows = isWindows;
const mac = os.platform() === 'darwin';
function isMac() {
  return mac;
}
exports.isMac = isMac;
const linux = os.platform() === 'linux';
function isLinux() {
  return linux;
}
exports.isLinux = isLinux;
const xdgDataDirectory = '.local/share/containers';
function appHomeDir() {
  return xdgDataDirectory + '/podman';
}
exports.appHomeDir = appHomeDir;
function getPodmanCli() {
  if (isWindows()) {
    return 'podman.exe';
  }
  return 'podman';
}
exports.getPodmanCli = getPodmanCli;
async function checkPodmanVersion() {
  try {
    const { stdout } = await exec(`${getPodmanCli()} --version`);
    console.log(stdout);
    return true;
  } catch (error) {
    console.error(error.stderr);
    return false;
  }
}
exports.checkPodmanVersion = checkPodmanVersion;
function getAssetsFolder() {
  return path.resolve(__dirname, '../../assets');
}
exports.getAssetsFolder = getAssetsFolder;
//# sourceMappingURL=util.js.map
