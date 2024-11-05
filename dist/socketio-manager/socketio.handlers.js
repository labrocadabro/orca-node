'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.orphanHandler =
  exports.findRPCSockets =
  exports.registerPulseProxyHandlers =
  exports.registerPodLifecycleHandlers =
    void 0;
const socketio_manager_service_1 = require('./socketio-manager.service');
const socketio_manager_service_2 = require('./socketio-manager.service');
const socketio_manager_service_3 = require('./socketio-manager.service');
const util = require('util');
const child_process = require('child_process');
const exec = util.promisify(child_process.exec);
const os = require('os');
const registerPodLifecycleHandlers = (
  io,
  socket,
  pulseProxyPort,
  cmClient,
  logger,
) => {
  const sslEnable = socketio_manager_service_2.configValues.sslEnable;
  let privateHost = socketio_manager_service_2.configValues.privateHost;
  const orcaSslRootCa = socketio_manager_service_2.configValues.orcaSslRootCa;
  if (process.platform === 'win32') {
    function getHostIp() {
      console.log('Finding host IP');
      const interfaces = os.networkInterfaces();
      const allowedAdapters = ['ethernet', 'wi-fi'];

      for (const name of Object.keys(interfaces)) {
        for (const net of interfaces[name]) {
          if (
            net.family === 'IPv4' &&
            !net.internal &&
            allowedAdapters.some((adapter) =>
              name.toLowerCase().includes(adapter),
            )
          ) {
            return net.address;
          }
        }
      }
    }

    privateHost = getHostIp();
    if (!privateHost) {
      throw new Error('Failed to retrieve IP address');
    }
  }
  const orcaPrivateUrl = sslEnable
    ? `wss://${privateHost}`
    : `ws://${privateHost}`;
  socket.on('orcaPulse:init', (payload) => {
    const { podImageUrl, podId, podSpec } = payload;
    if (podSpec) {
      cmClient.exists(podId).then((isPodAvailable) => {
        if (isPodAvailable) {
          logger.log(
            `Pod with podId#${podId} already exists, skipped creation.`,
          );
        } else {
          cmClient.createByPodSpec(podSpec);
        }
      });
    } else {
      cmClient.imageUrlValid(podImageUrl).then((isImageUrlValid) => {
        if (isImageUrlValid) {
          cmClient.imageExist(podImageUrl).then((isImageExist) => {
            if (isImageExist) {
              logger.log(
                `Image with imageUrl#"${podImageUrl}" already exists, skipped pulling.`,
              );
              cmClient.exists(podId).then((isPodAvailable) => {
                if (isPodAvailable) {
                  logger.log(
                    `Pod with podId#${podId} already exists, skipped creation.`,
                  );
                } else {
                  cmClient.create(
                    podId,
                    podImageUrl,
                    [],
                    [
                      `ORCA_URL=${orcaPrivateUrl}:${pulseProxyPort}/${podId}`,
                      `ORCA_POD_ID=${podId}`,
                      `ORCA_SSL_ROOT_CA="${orcaSslRootCa}"`,
                    ],
                  );
                }
              });
            } else {
              cmClient.imagePull(podImageUrl).then((res) => {
                cmClient.create(
                  podId,
                  podImageUrl,
                  [],
                  [
                    `ORCA_URL=${orcaPrivateUrl}:${pulseProxyPort}/${podId}`,
                    `ORCA_POD_ID=${podId}`,
                    `ORCA_SSL_ROOT_CA="${orcaSslRootCa}"`,
                  ],
                );
              });
            }
          });
        } else {
          logger.error(
            `User container imageURL #${podImageUrl} is not valid, It should be start with registry domainName or "localhost" when image is in the localhost registry`,
          );
        }
      });
    }
    socket.on('disconnect', (reason) => {
      logger.log('logging POD Id on disconnect', podId);
      logger.log(`orca - pulse client disconnected[reason: ${reason}]`);
      if (reason == 'client namespace disconnect') {
        logger.log(
          `orca - pulse client successfuly  disconnected after success[reason: ${reason}], shutting down pod with Id ${podId} `,
        );
        cmClient.delete(podId);
      }
    });
  });
};
exports.registerPodLifecycleHandlers = registerPodLifecycleHandlers;
const registerPulseProxyHandlers = (io, socket, logger) => {
  socket.on('pulse_proxy:init_success', (payload) => {
    logger.log(
      `[Pulse proxy]: initialization successfull for Pod Id: ${payload.podId} `,
    );
    const verifyMessage = 'verification message from orca';
    socket.emit('pulse_proxy:verify_connection', verifyMessage);
  });
  socket.on('pulse_proxy:init_error', (payload) => {
    logger.error(`[Pulse proxy]: initialization failed for Pod Id: ${payload.podId}
      Error message:
          --------------
            ${payload.message}
          `);
  });
};
exports.registerPulseProxyHandlers = registerPulseProxyHandlers;
const findRPCSockets = (podId, senderType) => {
  let receiverType = null;
  if (senderType == socketio_manager_service_1.ConnectionType.PulseProxy) {
    receiverType = socketio_manager_service_1.ConnectionType.OrcaPulse;
  } else if (
    senderType == socketio_manager_service_1.ConnectionType.OrcaPulse
  ) {
    receiverType = socketio_manager_service_1.ConnectionType.PulseProxy;
  } else {
    throw new Error(
      `Invalid connectionType found in socket.data: ${senderType} for podId: ${podId} `,
    );
  }
  return {
    senderSocket: socketio_manager_service_1.DB.sockets[podId][senderType],
    receiverSocket: socketio_manager_service_1.DB.sockets[podId][receiverType],
  };
};
exports.findRPCSockets = findRPCSockets;
const orphanHandler = (cmClient) => {
  let totalPodIdList = socketio_manager_service_3.podIdList;
  let deletePodIdList = [];
  let deleteCounter = 0;
  const deletePodMap = new Map();
  setInterval(() => {
    for (let i = 0; i < totalPodIdList.length; i++) {
      try {
        if (
          !socketio_manager_service_1.DB.sockets[totalPodIdList[i]][
            socketio_manager_service_1.ConnectionType.OrcaPulse
          ].connected ||
          !socketio_manager_service_1.DB.sockets[totalPodIdList[i]][
            socketio_manager_service_1.ConnectionType.PulseProxy
          ].connected
        ) {
          deletePodIdList.push(totalPodIdList[i]);
          deletePodMap.set(
            socketio_manager_service_3.podIdList[i],
            deleteCounter,
          );
          deleteCounter = deletePodMap.get(
            socketio_manager_service_3.podIdList[i],
          );
          deleteCounter = deleteCounter + 1;
        }
      } catch (error) {}
      try {
        deletePodIdList = deletePodIdList.filter(
          (item, index) => totalPodIdList.indexOf(item) === index,
        );
      } catch (error) {}
    }
    for (const [podId, counter] of deletePodMap) {
      if (counter >= 1) {
        try {
          cmClient.exists(podId).then((isPodAvailable) => {
            if (isPodAvailable) {
              cmClient.delete(podId);
              deletePodMap.delete(podId);
              deletePodIdList = deletePodIdList.filter((e) => e !== podId);
              totalPodIdList = totalPodIdList.filter((e) => e !== podId);
              delete socketio_manager_service_1.DB.sockets[podId];
            } else {
            }
          });
        } catch (error) {}
      }
    }
  }, 60000);
};
exports.orphanHandler = orphanHandler;
//# sourceMappingURL=socketio.handlers.js.map
