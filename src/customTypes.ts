/**
 * Represents a websocket connection.
 */
export type Websocket = {
    socketId: number;
    username: string;
};

export type AuthPayload = {
    type: PayloadSubType.auth;
    username: string;
};

/**
 * Represents an authentication object.
 */
export type Auth = {
    type: "auth";
    username: string;
};

/**
 * Represents a message object.
 */
export type Message = {
    type: "message";
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

/**
 * Represents the subtypes of a payload.
 */
export enum PayloadSubType {
    auth,
    message,
}

/**
 * Represents a user.
 */
export type UserType = {
    username: string;
    isUser: boolean;
    profilePhoto: string;
};

/**
 * Represents the payload type.
 */
export type PayloadType = {
    type: PayloadSubType;
};

/**
 * Represents a message with its content and timestamp.
 */
export type MessageType = {
    message: string;
    time: string;
};

/**
 * Represents a quote with its message, time, and sender.
 */
export type QuoteType = {
    message: string;
    time: string;
    sender: string;
};

/**
 * Represents the payload of a message.
 */
export type MessagePayload = {
    id?: string;
    type: PayloadSubType;
    user: UserType;
    message: MessageType;
    quote?: QuoteType;
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
