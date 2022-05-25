import WS from 'jest-websocket-mock';
import { MobServer } from './mobServer';
import { MobTimer, Status } from './mobTimer';
import { MobWebSocket } from './mobWebSocket';

const wssUrl = "wss://localhost:1234";

afterEach(() => {
    WS.clean();
    MobServer.reset();
});

// todo: How does this test the reset feature?
test("Test can reset mob server", async () => {
    const mockWSS = new WS(wssUrl).server;
    MobServer.createMobServer(mockWSS);
    const { socket, messagesReceivedBySocket } = await setupSocket(mockWSS);

    joinMob(socket, "awesome-team");    
    socket.send(JSON.stringify({ action: "update", value: {durationMinutes: 32 }}));    
    await waitForSocketToClose(socket);

    const parsedMessage = JSON.parse(messagesReceivedBySocket.slice(-1)[0]); 
    expect(parsedMessage.durationMinutes).toEqual(32);     
});

test("When mob server is created, when socket joins mob a new mob timer is returned", async () => {
    // Set up server
    const mockWSS = new WS(wssUrl).server;
    MobServer.createMobServer(mockWSS);

    // Set up socket
    const { socket, messagesReceivedBySocket } = await setupSocket(mockWSS);

    // Socket sends joins message
    joinMob(socket, "awesome-team");    
    await waitForSocketToClose(socket);
    const parsedMessage = JSON.parse(messagesReceivedBySocket[0]);
    expect(parsedMessage).toEqual(new MobTimer().state);     
});

test("Socket updates a timer", async () => {
    const mockWSS = new WS(wssUrl).server;
    MobServer.createMobServer(mockWSS);
    const { socket, messagesReceivedBySocket } = await setupSocket(mockWSS);

    joinMob(socket, "awesome-team");    
    socket.send(JSON.stringify({ action: "update", value: {durationMinutes: 32 }}));    
    await waitForSocketToClose(socket);

    const parsedMessage = JSON.parse(messagesReceivedBySocket.slice(-1)[0]); 
    expect(parsedMessage.durationMinutes).toEqual(32); 
});

test("Socket pauses a timer", async () => {
    const mockWSS = new WS(wssUrl).server;
    MobServer.createMobServer(mockWSS);
    const { socket, messagesReceivedBySocket } = await setupSocket(mockWSS);

    joinMob(socket, "awesome-team");    
    socket.send(JSON.stringify({ action: "pause" }));    
    await waitForSocketToClose(socket);

    const parsedMessage = JSON.parse(messagesReceivedBySocket.slice(-1)[0]); 
    expect(parsedMessage.status).toEqual(Status.Paused); 
});

test("Socket starts a timer", async () => {
    const mockWSS = new WS(wssUrl).server;
    MobServer.createMobServer(mockWSS);
    const { socket, messagesReceivedBySocket } = await setupSocket(mockWSS);
    const mobWebSocket = new MobWebSocket(socket);

    mobWebSocket.joinMob("awesome-team");    
    socket.send(JSON.stringify({ action: "start" }));    
    await mobWebSocket.waitForSocketToClose();

    const parsedMessage = JSON.parse(messagesReceivedBySocket.slice(-1)[0]); 
    expect(parsedMessage.status).toEqual(Status.Running); 
});

// todo: Should probably assert also that the other socket's timer is unchanged - similar to the three sockets test below it
test("Two sockets, first socket updates a timer", async () => {
    const mockWSS = new WS(wssUrl).server;
    MobServer.createMobServer(mockWSS); // mockWSS.server

    const { socket: socket1, messagesReceivedBySocket: messagesReceivedBySocket1 } = await setupSocket(mockWSS);
    const mobWebSocket1 = new MobWebSocket(socket1);

    const { socket: socket2, messagesReceivedBySocket: messagesReceivedBySocket2 } = await setupSocket(mockWSS);
    const mobWebSocket2 = new MobWebSocket(socket2);

    mobWebSocket1.joinMob("awesome-team");
    mobWebSocket2.joinMob("awesome-team");
    socket1.send(JSON.stringify({ action: "update", value: {durationMinutes: 32 }}));    
    await waitForSocketToClose(socket1);
    await waitForSocketToClose(socket2);

    const parsedMessage2 = JSON.parse(messagesReceivedBySocket2.slice(-1)[0]); 

    expect(parsedMessage2.durationMinutes).toEqual(32); 
});

test("Three sockets, two mobs: first socket updates a timer", async () => {
    const mockWSS = new WS(wssUrl).server;
    MobServer.createMobServer(mockWSS); // mockWSS.server
    const { socket: socket1, messagesReceivedBySocket: messagesReceivedBySocket1 } = await setupSocket(mockWSS);
    const { socket: socket2, messagesReceivedBySocket: messagesReceivedBySocket2 } = await setupSocket(mockWSS);
    const { socket: socket3, messagesReceivedBySocket: messagesReceivedBySocket3 } = await setupSocket(mockWSS);

    joinMob(socket1, "awesome-team");
    joinMob(socket2, "awesome-team");
    socket1.send(JSON.stringify({ action: "update", value: {durationMinutes: 32 }}));    
    joinMob(socket3, "good-team");
    await waitForSocketToClose(socket1);
    await waitForSocketToClose(socket2);

    const parsedMessage2 = JSON.parse(messagesReceivedBySocket2.slice(-1)[0]); 
    const parsedMessage3 = JSON.parse(messagesReceivedBySocket3.slice(-1)[0]); 

    expect(parsedMessage2.durationMinutes).toEqual(32); 
    expect(parsedMessage3.durationMinutes).toEqual(5);     
});

function joinMob(socket: WebSocket, mobName: string) {
    socket.send(JSON.stringify({ action: "join", mobName: mobName }));
}

async function setupSocket(mockWSS: any) {
    const messages = [];
    const client = new WebSocket(wssUrl);
    await mockWSS.connected;
    client.onmessage = (e) => {
        messages.push(e.data);
    };
    return { socket: client, messagesReceivedBySocket: messages };
};

function waitForSocketToClose(socket) {
    return new Promise<void>(function (resolve) {
        setTimeout(function () {
            socket.close();
            if (socket.readyState === socket.CLOSED) {
                resolve();
            } else {
                waitForSocketToClose(socket).then(resolve);
            }
        }, 5);
    });
};

