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

const jsYaml = require('js-yaml');
const internal = require('stream');

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
  async create(
    podId,
    imageUrl,
    internalEnvVariables,
    userEnvVariables = [],
    additionalConfiguration = null,
  ) {
    const inVol = `${podId}-in`;
    const outVol = `${podId}-out`;
    const userContainerName = `user-${podId}`;
    const userEnvVariableString = userEnvVariables
      .map((v) => `-e ${v}`)
      .join(' ');
    let userContainerCommand;
    if (additionalConfiguration) {
      userContainerCommand = `podman run -d --restart=always --pod ${podId} -v ${inVol}:/in -v ${outVol}:/out:Z,U --pull always --name=${userContainerName} ${userEnvVariableString} ${imageUrl} ${additionalConfiguration}`;
    } else {
      userContainerCommand = `podman run -d --restart=always --pod ${podId} -v ${inVol}:/in -v ${outVol}:/out:Z,U --pull always --name=${userContainerName} ${userEnvVariableString} ${imageUrl}`;
    }
    const pulseProxyContainerName = `pulse-proxy-${podId}`;
    const pulseProxyImageUrl = 'docker.io/orcacompute/pulse-proxy:main';
    const pulseProxyEnvVariables = internalEnvVariables
      .map((v) => `-e ${v}`)
      .join(' ');
    const pulseProxyContainerCommand = `podman run -d --restart=always --pod new:${podId} -v ${inVol}:/in:Z,U -v ${outVol}:/out --pull always --network slirp4netns:allow_host_loopback=true  --name=${pulseProxyContainerName} ${pulseProxyEnvVariables}  ${pulseProxyImageUrl}`;
    try {
      const { stdout: proxyStdout } = await exec(pulseProxyContainerCommand);
      this.logger.log(proxyStdout);
      const { stdout: userStdout } = await exec(userContainerCommand);
      this.logger.log(userStdout);
      for (let command of additionalContainerCommands) {
        const { stdout: additionalStdout } = await exec(command);
        this.logger.log(additionalStdout);
      }
    } catch (error) {
      this.logger.error(error.stderr);
      throw new Error('Error while creating pod:', stderr);
    }
  }
  async createByPodSpec(podSpec, podId, internalEnvVariables) {
    const config = this.processPodSpec(podSpec);
    await this.create(
      podId,
      config.imageUrl,
      internalEnvVariables,
      config.userEnvVariables,
      config.customConfig,
    );
  }
  processPodSpec(podSpec) {
    try {
      const rawConfig = jsYaml.load(podSpec);
      const mainContainer = rawConfig.spec.containers[0];
      const additionalContainers = rawConfig.spec.containers.slice(1);
      const additionalContainerCommands =
        this.podspecToPodman(additionalContainers);
      const imageUrl = mainContainer.image;
      const userEnvVariables = [];
      const envVars = container.env || [];
      envVars.forEach((env) => {
        userEnvVariables.push('--env', `${env.name}=${env.value}`);
      });
      const additionalConfig = this.podmanAdditionalConfig(mainContainer);

      const hostname = podSpec.spec.hostname;
      if (hostname) {
        additionalConfig.push('--hostname', hostname);
      }

      const dnsConfig = podSpec.spec.dnsConfig || {};
      if (dnsConfig.nameservers) {
        dnsConfig.nameservers.forEach((ns) =>
          additionalConfig.push('--dns', ns),
        );
      }
      if (dnsConfig.searches) {
        dnsConfig.searches.forEach((search) =>
          additionalConfig.push('--dns-search', search),
        );
      }
      if (dnsConfig.options) {
        dnsConfig.options.forEach((opt) =>
          additionalConfig.push('--dns-opt', `${opt.name}=${opt.value || ''}`),
        );
      }

      return {
        imageUrl,
        userEnvVariables: userEnvVariables.join(' '),
        additionalConfig: additionalConfig.join(' '),
        additionalContainerCommands,
      };
    } catch (error) {
      this.logger.error(error);
      throw new Error('Error processing pod spec:', error);
    }
  }

  podspecToPodman(containers) {
    const podmanCommands = containers.map((container) => {
      if (!container.name) throw new Error(`Container name is required`);
      if (!container.image)
        throw new Error(`${container.name}: Image is required`);
      let cmd = ['podman', 'run', '-d'];

      cmd.push('--name', container.name);
      cmd.push(container.image);

      const livenessProbe = container.livenessProbe || {};
      if (livenessProbe.exec) {
        const command = livenessProbe.exec.command.join(' ');
        cmd.push('--health-cmd', `\"${command}\"`);

        if (livenessProbe.periodSeconds) {
          cmd.push('--health-interval', `${livenessProbe.periodSeconds}s`);
        }

        if (livenessProbe.timeoutSeconds) {
          cmd.push('--health-timeout', `${livenessProbe.timeoutSeconds}s`);
        }

        if (livenessProbe.failureThreshold) {
          cmd.push('--health-retries', livenessProbe.failureThreshold);
        }
      }

      const envVars = container.env || [];
      envVars.forEach((env) => {
        if (envVars.length > 0) {
          cmd.push('--env', `${env.name}=${env.value}`);
        }
      });
      const additionalConfig = this.podmanAdditionalConfig(container);
      cmd.push(additionalConfig.join(' '));
      return cmd.join(' ');
    });

    return podmanCommands;
  }
  podmanAdditionalConfig(container) {
    const additionalConfig = [];
    const commands = container.command || [];
    if (commands.length > 0) {
      additionalConfig.push('--entrypoint', commands.join(' '));
    }
    const args = container.args || [];
    if (args.length > 0) {
      additionalConfig = additionalConfig.concat(args);
    }
    const ports = container.ports || [];
    ports.forEach((port) => {
      const hostPort = port.hostPort || port.containerPort;
      const containerPort = port.containerPort;
      additionalConfig.push('-p', `${hostPort}:${containerPort}`);
    });

    const volumeMounts = container.volumeMounts || [];
    volumeMounts.forEach((mount) => {
      const hostPath = mount.mountPath;
      const containerPath = mount.mountPath;
      additionalConfig.push('-v', `${hostPath}:${containerPath}`);
    });

    // Handle security context (user, group, capabilities, privileged mode, SELinux options)
    const securityContext = container.securityContext || {};

    if (securityContext.runAsUser || securityContext.runAsGroup) {
      const user = securityContext.runAsUser || '';
      const group = securityContext.runAsGroup
        ? `:${securityContext.runAsGroup}`
        : '';
      additionalConfig.push('--user', `${user}${group}`);
    }

    if (securityContext.capabilities) {
      const addCaps = securityContext.capabilities.add || [];
      const dropCaps = securityContext.capabilities.drop || [];
      addCaps.forEach((cap) => additionalConfig.push('--cap-add', cap));
      dropCaps.forEach((cap) => additionalConfig.push('--cap-drop', cap));
    }

    if (securityContext.privileged) {
      additionalConfig.push('--privileged');
    }

    if (securityContext.seLinuxOptions) {
      const seLinuxOptions = securityContext.seLinuxOptions;
      if (seLinuxOptions.level) {
        additionalConfig.push(
          '--security-opt',
          `label=level:${seLinuxOptions.level}`,
        );
      }
    }

    if (securityContext.readOnlyRootFilesystem) {
      additionalConfig.push('--read-only');
    }

    // Handle sysctls
    const sysctls = securityContext.sysctls || {};
    for (const [key, value] of Object.entries(sysctls)) {
      additionalConfig.push('--sysctl', `${key}=${value}`);
    }

    // Handle logging drivers
    const logConfig = container.logging || {};
    if (logConfig.driver) {
      additionalConfig.push('--log-driver', logConfig.driver);
    }

    return additionalConfig;
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
    const volumePruneCommand = `podman volume prune -f`;
    try {
      execSync(podStopCommand);
      execSync(podRmCommand);
      execSync(volumePruneCommand);
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
