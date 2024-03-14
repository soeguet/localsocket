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

export type MessageListPayload = {
    payloadType: PayloadSubType.messageList;
    messageList: MessagePayload[];
};

export type MessagePayload = {
    payloadType?: PayloadSubType.message;
    messagePayloadType: MessagePayloadType;
    messageType?: MessageType | null;
    quoteType?: QuoteType | null;
    reactionType?: ReactionType[];
};

export type MessagePayloadType = {
    id: number;
    userId: string;
    messageId: number;
};

export type ReactionType = {
    messageId: string;
    emojiName: string;
    userId: string;
};
export type MessageType = {
    id?: number;
    messageId: string;
    time: string;
    message: string;
};
export type QuoteType = {
    id?: number;
    quoteId: string | null;
    quoteSenderId: string | null;
    quoteMessage: string | null;
    quoteTime: string | null;
    payloadId?: number;
};

export type ReactionPayload = {
    messagePayloadId: number;
    payloadType: PayloadSubType.reaction;
    messageId: string;
    emoji: string;
    userId: string;
};
