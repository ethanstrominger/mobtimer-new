import { Room } from "./room";
import WebSocket from "ws";
import { MobTimer } from "../mobTimer";
import { Action } from "./action";

export class RoomManager {
    
    /*
    todo:
    - Make private what can
    - Rename functions, including underscores removed/added as appropriate
    - Review this file and mobSocketServer.ts - how do they look? anything else to move? rename?
    - Decide whether this should be a module or class
    */

    private static _mapOfMobNameToRoom: Map<string, Room> = new Map();
    private static _mapOfSocketToMobName: Map<WebSocket, string> = new Map();

    static _getMobTimer(mobName: string): MobTimer | undefined {
        return RoomManager._mapOfMobNameToRoom.get(mobName)?.mobTimer;
    }

    static _getMobTimerFromSocket(socket: WebSocket) {
      const mobName = RoomManager._mapOfSocketToMobName.get(socket) || ""; // socket.mobName no longer exists, so get the mob name from the socket another way
      const mobTimer = RoomManager._getMobTimer(mobName);
      return mobTimer;
    }
    
    static _getSocketsForSingleMob(mobName: string): Set<WebSocket> | undefined {
        return RoomManager._mapOfMobNameToRoom.get(mobName)?.sockets;
    }

    static _getOrRegisterRoom(
        wss: WebSocket.Server,
        mobName: string,
        socket: WebSocket
    ) {
        let mobTimer = RoomManager._getMobTimer(mobName);
        if (!mobTimer) {
            // todo extract these three lines into a create room function
            mobTimer = new MobTimer(mobName);
            mobTimer.expireFunc = () =>
                RoomManager.broadcastToClients(wss, mobTimer as MobTimer, Action.Expired);
            RoomManager._mapOfMobNameToRoom.set(mobName, { mobTimer: mobTimer, sockets: new Set<WebSocket> });
        }
        RoomManager._mapOfMobNameToRoom.get(mobName)?.sockets.add(socket);
        RoomManager._mapOfSocketToMobName.set(socket, mobName);

        return mobTimer;
    }
    
    static broadcastToClients(
        wss: WebSocket.Server<WebSocket.WebSocket>,
        mobTimer: MobTimer,
        action: Action
      ) {
        let response = JSON.stringify({
          actionInfo: { action: action },
          mobState: mobTimer.state,
        });
        RoomManager.broadcast(mobTimer.state.mobName, response);
      }
      
      static broadcast(mobName: string, messageToClients: string) {
        const sockets = RoomManager._getSocketsForSingleMob(mobName);
        if (!sockets) {
          return;
        }
        sockets.forEach((socketClient: WebSocket) => {
          socketClient.send(messageToClients);
        });
      }

      static resetRooms() {
        RoomManager._mapOfMobNameToRoom.clear();
        RoomManager._mapOfSocketToMobName.clear();
      }
}
      