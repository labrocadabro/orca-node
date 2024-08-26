'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.rpcCallHandlers = void 0;
const ss = require('socket.io-stream');
const socketio_handlers_1 = require('./socketio.handlers');
const rpcCallHandlers = async (io, socket) => {
  socket.on('rpc:request', (rpcRequest) => {
    const { senderSocket, receiverSocket } = (0,
    socketio_handlers_1.findRPCSockets)(
      socket.data.podId,
      socket.data.connectionType,
    );
    console.log('logging request', rpcRequest);
    if (receiverSocket == null) {
      senderSocket.emit('rpc:response', {
        id: rpcRequest.id,
        status: 'error',
        message: `receiver not connected`,
      });
    }
    try {
      receiverSocket.emit('rpc:request', rpcRequest);
    } catch (error) {
      console.log('reciever not connected');
    }
  });
  socket.on('rpc:response', (rpcResponse) => {
    const { senderSocket = null, receiverSocket = null } = (0,
    socketio_handlers_1.findRPCSockets)(
      socket.data.podId,
      socket.data.connectionType,
    );
    try {
      receiverSocket.emit('rpc:response', rpcResponse);
    } catch (error) {
      console.log('reciever not connected', receiverSocket);
    }
  });
  ss(socket).on('rpc:request:stream', (stream, rpcRequest) => {
    const { senderSocket = null, receiverSocket = null } = (0,
    socketio_handlers_1.findRPCSockets)(
      socket.data.podId,
      socket.data.connectionType,
    );
    const outgoingStream = ss.createStream();
    ss(receiverSocket).emit('rpc:request:stream', outgoingStream, rpcRequest);
    stream.pipe(outgoingStream);
    console.log('logging stream request', rpcRequest);
  });
  ss(socket).on('rpc:response:stream', (stream, rpcResponse) => {
    const { senderSocket = null, receiverSocket = null } = (0,
    socketio_handlers_1.findRPCSockets)(
      socket.data.podId,
      socket.data.connectionType,
    );
    const outgoingStream = ss.createStream();
    ss(receiverSocket).emit('rpc:response:stream', outgoingStream, rpcResponse);
    stream.pipe(outgoingStream);
  });
};
exports.rpcCallHandlers = rpcCallHandlers;
//# sourceMappingURL=socketio.rpc.handlers.js.map
