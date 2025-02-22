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
const os = require("os");

    const fs = require("fs");
const path = require("path");

function execSync(cmdstr) {
  try {
    const stdout = child_process.execSync(cmdstr);
  } catch (error) {
    console.error(error);
  }
}
let ContainerLifecycleManagerService = class ContainerLifecycleManagerService {
  constructor(logger) {
    this.logger = logger;
  }
  async exists(podId) {
    try {
      const { stdout, stderr } = await exec(`podman pod exists ${podId}`);
      return true;
    } catch (error) {
      if (Number(error.code) == 1) {
        return false;
      }
    }
  }
  async imageUrlValid(imageUrl) {
    const hostnameRegexStr =
      '((([-a-z0-9]{1,63}\\.)*?[a-z0-9]([-a-z0-9]{0,253}[a-z0-9])?\\.[a-z]{2,63})|((\\d{1,3}\\.){3}\\d{1,3}))(:\\d{1,5})?((\\/|\\?)((%[0-9a-f]{2})|[-\\w\\+\\.\\?\\/@~#&=])*)?$';
    const hostnameRegex = new RegExp(hostnameRegexStr);
    let tempUrlArray = imageUrl.split('/');
    if (tempUrlArray.length >= 2) {
      if (hostnameRegex.test(tempUrlArray[0]) || tempUrlArray[0] == 'localhost') {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  async imageExist(imageUrl) {
    try {
      const { stdout, stderr } = await exec(`podman image inspect ${imageUrl}`);
      return true;
    } catch (error) {
      return false;
    }
  }
  async imagePull(imageUrl) {
    try {
      const { stdout, stderr } = await exec(`podman pull ${imageUrl}`);
    } catch (error) {
      this.logger.error(error.stderr);
    }
  }
  async create(podId, imageUrl, userEnvVariables, internalEnvVariables) {
    const inVol = `${podId}-in`;
    const outVol = `${podId}-out`;
    const userContainerName = `user-${podId}`;
    const userEnvVariableString = userEnvVariables.map((v) => `-e ${v}`).join(' ');
    const userContainerCommand = `podman run -d --restart=always --pod ${podId} -v ${inVol}:/in -v ${outVol}:/out:Z,U --pull always --name=${userContainerName} ${userEnvVariableString} ${imageUrl}`;
    const pulseProxyContainerName = `pulse-proxy-${podId}`;
    const pulseProxyImageUrl = 'docker.io/labrocadabro/pulse-proxy:0.1';
    const pulseProxyEnvVariables = internalEnvVariables.map((v) => `-e ${v}`).join(' ');
    const network =
      process.platform === 'win32' ? 'bridge' : 'slirp4netns:allow_host_loopback=true';
    const pulseProxyContainerCommand = `podman run -d --restart=always --pod new:${podId} -v ${inVol}:/in:Z,U -v ${outVol}:/out --pull always --network ${network} --name=${pulseProxyContainerName} ${pulseProxyEnvVariables}  ${pulseProxyImageUrl}`;
    try {
      const { stdout, stderr } = await exec(pulseProxyContainerCommand);
      await exec(userContainerCommand);
      this.logger.log(stdout);
    } catch (error) {
      this.logger.error(error.stderr);
    }
  }

async createByPodSpec(podSpec, podId) {
  try {

    await exec("podman pull k8s.gcr.io/pause:3.5");

    const network = process.platform === "win32" ? "bridge" : "slirp4netns:allow_host_loopback=true";

    const yamlFile = path.join(os.tmpdir(), `podspec-${podId}.yaml`);
    const testYamlFile = path.join(__dirname, `podspec-test.yaml`);
    fs.writeFileSync(yamlFile, podSpec.replace(/\r\n/g, "\n"), "utf8");
    fs.writeFileSync(testYamlFile, podSpec.replace(/\r\n/g, "\n"), "utf8");

    console.log(testYamlFile);
    let yamlForPodman = yamlFile;

    if (process.platform === "win32") {
      // Convert Windows paths to root-relative format for Podman
      yamlForPodman = yamlFile.replace(/\\/g, "/"); // Convert backslashes to forward slashes
      yamlForPodman = yamlForPodman.slice(2); // remove drive letter
    }

    const command = `podman play kube --network ${network} ${yamlForPodman}`;
    const { stdout, stderr } = await exec(command, { shell: true });

    // Cleanup
    fs.unlinkSync(yamlFile);

    if (stdout) this.logger.log(`stdout: ${stdout}`);
    if (stderr) this.logger.error(`stderr: ${stderr}`);

  } catch (error) {
    this.logger.error(`Error in createByPodSpec: ${error.message}`);
    this.logger.error(`Full error object: ${JSON.stringify(error, null, 2)}`);
  }
}

  async deleteAll() {
    const podStopCommand = `podman pod stop -a`;
    const podPruneCommand = `podman pod prune -f`;
    const podRmCommand = `podman pod rm -a`;
    const volumePruneCommand = `podman volume prune -f`;
    try {
      await execSync(podStopCommand);
      await execSync(podPruneCommand);
      await execSync(podRmCommand);
      await execSync(volumePruneCommand);
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
      await execSync(podStopCommand);
      await execSync(podRmCommand);
      await execSync(volumeInRmCommand);
      await execSync(volumeOutRmCommand);
    } catch (error) {
      this.logger.error(error.stderr);
    }
  }
  disconnectAll() {
    const containerStopCommand = `podman pod stop -a`;
    try {
      execSync(containerStopCommand);
    } catch (error) {
      this.logger.error(error.stderr);
    }
  }
  disconnect(podId) {
    if (!podId) {
      throw new Error('podId is required');
    }
    const containerStopCommand = `podman pod stop ${podId}`;
    try {
      execSync(containerStopCommand);
    } catch (error) {
      this.logger.error(error.stderr);
    }
  }
};
exports.ContainerLifecycleManagerService = ContainerLifecycleManagerService;
exports.ContainerLifecycleManagerService = ContainerLifecycleManagerService = __decorate(
  [(0, common_1.Injectable)(), __metadata('design:paramtypes', [logger_service_1.LoggerService])],
  ContainerLifecycleManagerService,
);
//# sourceMappingURL=container-lifecycle-manager.service.js.map
