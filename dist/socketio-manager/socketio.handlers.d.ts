import { ConnectionType } from './socketio-manager.service';
declare const registerPodLifecycleHandlers: (io: any, socket: any, pulseProxyPort: number, cmClient: any, logger: any) => void;
declare const registerPulseProxyHandlers: (io: any, socket: any, logger: any) => void;
declare const findRPCSockets: (podId: string, senderType: ConnectionType) => {
    senderSocket: any;
    receiverSocket: any;
};
declare const orphanHandler: (cmClient: any) => void;
export { registerPodLifecycleHandlers, registerPulseProxyHandlers, findRPCSockets, orphanHandler, };
