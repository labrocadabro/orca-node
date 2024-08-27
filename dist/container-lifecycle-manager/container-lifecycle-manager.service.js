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
exports.ContainerLifecycleManagerService = void 0;
const common_1 = require('@nestjs/common');
const child_process = require('child_process');
const util = require('util');
const logger_service_1 = require('../logger/logger.service');
const exec = util.promisify(child_process.exec);
const execSync = child_process.execSync;

let ContainerLifecycleManagerService = class ContainerLifecycleManagerService {
  constructor(logger) {
    this.logger = logger;
  }
  async exists(podId) {
    try {
      await exec(`podman pod exists ${podId}`);
      this.logger.log(stdout);
      return true;
    } catch (error) {
      this.logger.error(error.stderr);
      if (Number(error.code) == 1) {
        return false;
      }
      throw error;
    }
  }
  imageUrlValid(imageUrl) {
    const hostnameRegexStr =
      '((([-a-z0-9]{1,63}\\.)*?[a-z0-9]([-a-z0-9]{0,253}[a-z0-9])?\\.[a-z]{2,63})|((\\d{1,3}\\.){3}\\d{1,3}))(:\\d{1,5})?((\\/|\\?)((%[0-9a-f]{2})|[-\\w\\+\\.\\?\\/@~#&=])*)?$';
    const hostnameRegex = new RegExp(hostnameRegexStr);
    let tempUrlArray = imageUrl.split('/');
    if (tempUrlArray.length >= 2) {
      if (
        hostnameRegex.test(tempUrlArray[0]) ||
        tempUrlArray[0] == 'localhost'
      ) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  async getImageDigest(imageUrl) {
    try {
      const { stdout } = await exec(
        `podman image inspect ${imageUrl} --format '{{.Digest}}'`,
      );
      this.logger.log(stdout);
      return stdout;
    } catch (error) {
      this.logger.error(error.stderr);
    }
  }
  async isImageUnchanged(imageDigest, imageUrl) {
    try {
      await exec(`podman pull --quiet ${imageUrl}`);
      const { stdout } = await exec(
        `podman image inspect ${imageUrl} --format '{{.Digest}}'`,
      );
      return stdout === imageDigest;
    } catch (error) {
      this.logger.error(error.stderr);
      throw error;
    }
  }
  async imagePull(imageUrl) {
    try {
      const { stdout } = await exec(`podman pull ${imageUrl}`);
      this.logger.log(stdout);
    } catch (error) {
      this.logger.error(error.stderr);
    }
  }
  async create(podId, imageUrl, internalEnvVariables, userEnvVariables = []) {
    const inVol = `${podId}-in`;
    const outVol = `${podId}-out`;
    const userContainerName = `user-${podId}`;
    const userEnvVariableString = userEnvVariables
      .map((v) => `-e ${v}`)
      .join(' ');

    const userContainerCommand = `podman run -d --restart=always --pod ${podId} -v ${inVol}:/in -v ${outVol}:/out:Z,U --pull always --name=${userContainerName} ${userEnvVariableString} ${imageUrl}`;
    const pulseProxyContainerName = `pulse-proxy-${podId}`;
    const pulseProxyImageUrl = 'docker.io/orcacompute/pulse-proxy:main';
    const pulseProxyEnvVariables = internalEnvVariables
      .map((v) => `-e ${v}`)
      .join(' ');
    const pulseProxyContainerCommand = `podman run -d --restart=always --pod new:${podId} -v ${inVol}:/in:Z,U -v ${outVol}:/out --pull always --network slirp4netns:allow_host_loopback=true  --name=${pulseProxyContainerName} ${pulseProxyEnvVariables}  ${pulseProxyImageUrl}`;
    try {
      const { stdout } = await exec(pulseProxyContainerCommand);
      await exec(userContainerCommand);
      this.logger.log(stdout);
    } catch (error) {
      this.logger.error(error.stderr);
    }
  }
  async createByPodSpec(podSpec) {
    try {
      const { stdout } = await exec(
        `echo "${podSpec}" | podman play kube --network slirp4netns:allow_host_loopback=true -`,
      );
      this.logger.log(stdout);
    } catch (error) {
      this.logger.error(error.stderr);
    }
  }
  async deleteAll() {
    const podStopCommand = `podman pod stop -a`;
    const podPruneCommand = `podman pod prune -f`;
    const podRmCommand = `podman pod rm -a`;
    const volumePruneCommand = `podman volume prune -f`;
    try {
      execSync(podStopCommand);
      execSync(podPruneCommand);
      execSync(podRmCommand);
      execSync(volumePruneCommand);
    } catch (error) {
      this.logger.error(error.stderr);
    }
  }
  async delete(podId) {
    const podStopCommand = `podman pod stop ${podId}`;
    const podRmCommand = `podman pod rm ${podId}`;
    const volumeInRmCommand = `podman volume rm ${podId}-in`;
    const volumeOutRmCommand = `podman volume rm ${podId}-out`;
    try {
      execSync(podStopCommand);
      execSync(podRmCommand);
      execSync(volumeInRmCommand);
      execSync(volumeOutRmCommand);
    } catch (error) {
      this.logger.error(error.stderr);
      throw error;
    }
  }
};
exports.ContainerLifecycleManagerService = ContainerLifecycleManagerService;
exports.ContainerLifecycleManagerService = ContainerLifecycleManagerService =
  __decorate(
    [
      (0, common_1.Injectable)(),
      __metadata('design:paramtypes', [logger_service_1.LoggerService]),
    ],
    ContainerLifecycleManagerService,
  );
//# sourceMappingURL=container-lifecycle-manager.service.js.map
