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
exports.MacOSInstaller = exports.WinInstaller = void 0;
const common_1 = require('@nestjs/common');
const fs = require('node:fs');
const path = require('node:path');
const util_1 = require('./util');
const child_process = require('child_process');
const util = require('util');
const exec = util.promisify(child_process.exec);
const logger_service_1 = require('../logger/logger.service');
const os = require('os');
const axios = require('axios');
const binDir = path.resolve(__dirname, '../../assets');
async function download_bnaries(binaryUrl, binaryPath) {
  axios({
    method: 'get',
    url: binaryUrl,
    responseType: 'stream',
  })
    .then((response) => {
      response.data
        .pipe(fs.createWriteStream(binaryPath))
        .on('finish', () => {
          fs.chmodSync(binaryPath, 0o755);
          console.log(`Downloaded and installed binary to ${binaryPath}`);
        })
        .on('error', (err) => {
          console.error('Error downloading binary:', err);
          process.exit(1);
        });
    })
    .catch((err) => {
      console.error('Error fetching binary:', err);
      process.exit(1);
    });
}
let WinInstaller = class WinInstaller {
  constructor(logger) {
    this.logger = logger;
  }
  async install() {
    const binaryUrl = `https://github.com/containers/podman/releases/download/v4.8.3/podman-4.8.3-setup.exe`;
    const binaryPath = path.join(binDir, `podman-${os.platform}-${os.arch}.exe`);
    await download_bnaries(binaryUrl, binaryPath);
    const setupPath = path.resolve(
      (0, util_1.getAssetsFolder)(),
      `podman-${os.platform()}-${os.arch()}.exe`,
    );
    try {
      if (fs.existsSync(setupPath)) {
        try {
          const { stdout } = await exec(`${setupPath} /install /norestart`);
        } catch (err) {
          throw new Error(err.message);
        }
        return true;
      } else {
        throw new Error(`Can't find Podman setup package! Path: ${setupPath} doesn't exists.`);
      }
    } catch (err) {
      this.logger.error('Error during install!');
      this.logger.error(err);
      return false;
    } finally {
    }
  }
};
exports.WinInstaller = WinInstaller;
exports.WinInstaller = WinInstaller = __decorate(
  [(0, common_1.Injectable)(), __metadata('design:paramtypes', [logger_service_1.LoggerService])],
  WinInstaller,
);
let MacOSInstaller = class MacOSInstaller {
  constructor(logger) {
    this.logger = logger;
  }
  async install() {
    const pkgArch = process.arch === 'arm64' ? 'aarch64' : 'amd64';
    const binaryUrl = `https://github.com/containers/podman/releases/download/v4.8.3/podman-installer-macos-${pkgArch}.pkg`;
    const binaryPath = path.join(binDir, `podman-${os.platform}-${os.arch}.pkg`);
    await download_bnaries(binaryUrl, binaryPath);
    const pkgPath = path.resolve(
      (0, util_1.getAssetsFolder)(),
      `podman-${os.platform}-${os.arch}.pkg`,
    );
    try {
      if (fs.existsSync(pkgPath)) {
        try {
          await exec(`open ${pkgPath} -W`);
        } catch (err) {
          this.logger.error(err.stderr);
        }
        if (fs.existsSync('/opt/podman/bin/podman')) {
          this.logger.log('Podman Installed Successfully');
          return true;
        } else {
          return false;
        }
      } else {
        throw new Error(`Can't find Podman package! Path: ${pkgPath} doesn't exists.`);
      }
    } catch (err) {
      this.logger.error('Error during install!');
      this.logger.error(err);
      return false;
    }
  }
};
exports.MacOSInstaller = MacOSInstaller;
exports.MacOSInstaller = MacOSInstaller = __decorate(
  [(0, common_1.Injectable)(), __metadata('design:paramtypes', [logger_service_1.LoggerService])],
  MacOSInstaller,
);
//# sourceMappingURL=podman-install.service.js.map
