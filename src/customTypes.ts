/**
 * Represents a websocket connection.
 */
export type Websocket = {
    socketId: number;
    username: string;
};

export type AuthenticationPayload = {
    payloadType: PayloadSubType.auth;
    clientUsername: string;
    clientId: string;
};
/**
 * Represents an object containing a username. This one comes from the client as a POST request onOpen.
 */
export type UsernameObject = {
    payloadType: PayloadSubType;
    username: string;
    id: string;
};

export type AuthPayload = {
    payloadType: PayloadSubType.auth;
    username: string;
};

/**
 * Represents an authentication object.
 */
export type Auth = {
    payloadType: "auth";
    username: string;
};

/**
 * Represents a message object.
 */
export type Message = {
    payloadType: "message";
    message: string;
};

/**
 * Represents a message sent back to clients.
 */
export type MessageBackToClients = {
    id: string;
    sender: string;
    message: string;
};

export type ProfileUpdatePayload = {
    payloadType: PayloadSubType.profileUpdate;
    clientId: string;
    username: string;
    color: string;
    pictureUrl: string;
};

/**
 * Represents the payload type.
 */
export type PayloadType = {
    payloadType: PayloadSubType;
};

export enum PayloadSubType {
    auth,
    message,
    clientList,
    profileUpdate,
    messageList,
    typing,
    force,
}
export type UserType = {
    clientId: string;
    clientUsername: string;
    clientProfilePhoto: string;
};
export type MessageType = {
    messageId: string;
    messageSenderId: string;
    time: string;
    message: string;
};
export type QuoteType = {
    quoteId: string;
    quoteSenderId: string;
    quoteMessage: string;
    quoteTime: string;
};
export type MessagePayload = {
    payloadType: PayloadSubType;
    userType: UserType;
    messageType: MessageType;
    quoteType?: QuoteType;
};

/**
 * Represents a registered user.
 */
export type RegisteredUser = {
    id: string;
    username: string;
    clientColor: string;
    profilePhotoUrl: string;
};

export type UserDatabaseRowPre = {
    id: string;
    user: string;
};
export type UserDatabaseRow = {
    id: string;
    user: RegisteredUser;
};

export type ClientListPayload = {
    payloadType: PayloadSubType;
    clients: UserDatabaseRow[];
};

export type ColorTypes =
    | "red"
    | "blue"
    | "green"
    | "yellow"
    | "purple"
    | "orange"
    | "gray"
    | "white"
    | "black"
    | "pink"
    | "teal"
    | "cyan"
    | "lime"
    | "indigo"
    | "violet";
