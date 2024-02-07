export type Websocket = {
    socketId: number;
    username: string;
};

export type Auth = {
    type: "auth";
    username: string;
};

export type Message = {
    type: "message";
    message: string;
};

export type MessageBackToClients = {
    id: string;
    sender: string;
    message: string;
};