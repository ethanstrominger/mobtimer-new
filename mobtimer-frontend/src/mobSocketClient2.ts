import { Action } from "mobtimer-api";
import { MobTimerRequests } from "mobtimer-api";
import { WebSocket2Type } from "./webSocket2Type";
import { WebSocket2 } from "./webSocket2";

class MobSocketClient2 {
  private _webSocket: WebSocket2Type;

  constructor(webSocket: WebSocket2Type) {
    this._webSocket = webSocket;
  }

  static openSocketSync(url: string): MobSocketClient2 {
    console.log("opening socket");
    const socket = new WebSocket2(url);
    const mobSocketClient = new MobSocketClient2(socket);
    return mobSocketClient;
  }

  static async openSocket(url: string): Promise<MobSocketClient2> {
    const socket = new WebSocket2(url);
    const mobSocketClient = new MobSocketClient2(socket);
    await MobSocketClient2.waitForSocketState(
      mobSocketClient.webSocket,
      "open"
    );
    return mobSocketClient;
  }

  /**
   * Forces a process to wait until the socket's `readyState` becomes the specified value.
   * @param socket The socket whose `readyState` is being watched
   * @param state The desired `readyState` for the socket
   */
  static waitForSocketState(
    socket: WebSocket2Type,
    state: string
  ): Promise<void> {
    return new Promise(function (resolve) {
      setTimeout(function () {
        const isReady = state === "open" ? socket.isOpen() : socket.isClosed();
        if (isReady) {
          resolve();
        } else {
          MobSocketClient2.waitForSocketState(socket, state).then(resolve);
        }
      });
      // todo: timeout.unref() fails when running from frontend; why?
      // timeout.unref();
    });
  }

  public waitForSocketState(state: string): Promise<void> {
    return MobSocketClient2.waitForSocketState(this._webSocket, state);
  }

  sendEchoRequest() {
    this._sendJSON({ action: Action.Echo } as MobTimerRequests.EchoRequest);
  }

  joinMob(mobName: string) {
    this._sendJSON({
      action: Action.Join,
      mobName,
    } as MobTimerRequests.JoinRequest);
  }

  update(durationMinutes: number) {
    this._sendJSON({
      action: Action.Update,
      value: { durationMinutes },
    } as MobTimerRequests.UpdateRequest);
  }

  addParticipant(name: string) {
    this._sendJSON({
      action: Action.AddParticipant,
      name: name,
    } as MobTimerRequests.AddParticipantRequest);
  }

  rotateParticipants() {
    this._sendJSON({
      action: Action.RotateParticipants,
    } as MobTimerRequests.RotateParticipantsRequest);
  }

  start() {
    console.log("sending start request");
    this._sendJSON({ action: Action.Start } as MobTimerRequests.StartRequest);
  }

  pause() {
    console.log("sending pause request");
    this._sendJSON({ action: Action.Pause } as MobTimerRequests.PauseRequest);
  }

  private _sendJSON(request: MobTimerRequests.MobTimerRequest) {
    this._webSocket.send(JSON.stringify(request));
  }

  public get webSocket(): WebSocket2Type {
    return this._webSocket;
  }

  async closeSocket() {
    this.webSocket.close();
    await this.waitForSocketState("closed");
  }
}

export { MobSocketClient2 };
