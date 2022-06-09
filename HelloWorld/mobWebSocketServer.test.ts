import WebSocket from "ws";
import { startMobServer } from "./mobWebSocketUtils";
import * as MobMessages from "./mobWebMessages";
import { MobTimer } from "./mobTimer";
import { Status } from "./status";
import { closeSocket, openSocket, sendMessage } from "./testUtils";

export const port = 3000 + Number(process.env.JEST_WORKER_ID);

describe("WebSocket Server", () => {
  let server;

  beforeAll(async () => {
    server = await startMobServer(port);
  });

  afterAll(() => server.close());

  test("Create mob", async () => {
    const socket = await openSocket();
    await socket.joinMob("awesome-team");
    await socket.closeSocket();
    expect(socket.getLastJson()).toEqual(new MobTimer("awesome-team").state);
  });

  test("Create 2 mobs", async () => {
    const socket = await joinMob("awesome-team");
    const socket2 = await joinMob("good-team");

    await socket.closeSocket();
    await socket2.closeSocket();

    expect(socket.getLastJson()).toEqual(new MobTimer("awesome-team").state);
    expect(socket2.getLastJson()).toEqual(new MobTimer("good-team").state);
  });

  test("Start timer", async () => {
    const socket = await joinMob("awesome-team");
    await socket.send(MobMessages.startMessage());
    await await socket.closeSocket();
    expect(socket.getLastJson().status).toEqual(Status.Running);
  });

  // test("Pause timer", async () => {
  //   const testMessage = MobMessages.joinMessage("awesome-team");
  //   sendMessage(testMessage);
  //   const pauseJson = MobMessages.pauseMessage();
  //   const parsedMessage = await sendMessage(pauseJson);
  // });
  //   test("Pause timer", async () => {
  //     const joinMessage = MobMessages.joinMessage("awesome-team");
  //     await sendMessage(joinMessage);
  //     const pauseMessage2 = MobMessages.pauseMessage();
  //     const parsedMessage = await sendMessage(pauseMessage2);
  //     expect(parsedMessage.status).toEqual(Status.Paused);
  //   });

  // todo: add tests for update and start messages
});
// todo: delete
async function joinMob(mobName: string) {
  const socket = await openSocket();
  const testMessage = MobMessages.joinMessage(mobName);
  socket.send(testMessage);
  return socket;
}
