// todo: this file is called "testUtils" but if used for non-test code also, reconsider name

import { MobSocketClient } from "./mobSocketClient";

// todo: reconsider using JEST_WORKER_ID in production code; this is a duplicate of the port in mobClientServer.test.ts
const port = 4000 + Number(process.env.JEST_WORKER_ID);

/**
 * Forces a process to wait until the socket's `readyState` becomes the specified value.
 * @param socket The socket whose `readyState` is being watched
 * @param state The desired `readyState` for the socket
 */

export function waitForSocketState(
  socket: { readyState: number },
  state: number
): Promise<void> {
  return new Promise(function (resolve) {
    const timeout = setTimeout(function () {
      if (socket.readyState === state) {
        resolve();
      } else {
        waitForSocketState(socket, state).then(resolve);
      }
    });
    timeout.unref();
  });
}

export function waitForMessage(
  socket: MobSocketClient,
  id: string
): Promise<any> {
  return new Promise(function (resolve) {
    const timeout = setTimeout(function () {
      socket.responses.forEach((response) => {
        if (JSON.parse(response).id === id) {
          resolve(response);
        }
      }, 10);
      waitForMessage(socket, id).then(resolve);
    });
    timeout.unref();
  });
}