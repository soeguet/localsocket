export enum PayloadSubType {
    auth,
    message,
    clientList,
    profileUpdate,
    messageList,
    typing,
    force,
    reaction,
}

export type AuthenticatedPayload = {
    payloadType: PayloadSubType.auth;
    clientUsername: string;
    clientId: string;
};

export type MessagePayload = {
    payloadId?: number;
    payloadType: PayloadSubType;
    userId: string;
    messageType: MessageType;
    quoteType?: QuoteType;
    reactionType?: ReactionType[];
};

export type ReactionType = {
    messageId: string;
    emojiName: string;
    userId: string;
};
export type MessageType = {
    messageId: string;
    time: string;
    message: string;
};
export type QuoteType = {
    quoteId: string;
    quoteSenderId: string;
    quoteMessage: string;
    quoteTime: string;
};

export type ReactionPayload = {
    messagePayloadId: number;
    payloadType: PayloadSubType.reaction;
    messageId: string;
    emoji: string;
    userId: string;
};
