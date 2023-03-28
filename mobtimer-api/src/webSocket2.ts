import { io, Socket } from "socket.io-client";
import { WebSocket2Type } from "./webSocket2Type";

export class WebSocket2 implements WebSocket2Type {
  private _socket: Socket;
  constructor(url: string) {
    console.log("connecting to", url);
    this._socket = io(url);
    console.log("opening socket");
    this._socket.on("actionInfo", (msg) => {
      console.log("message: " + msg);
    });
  }

  close = () => this._socket.close();
  isClosed = () => this._socket.disconnected;
  isOpen = () => this._socket.connected;
  send = (message: string) => {
    console.log("sending", message);
    this._socket.emit("message", message);
  };
}
