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
    userType: UserType;
    messageType: MessageType;
    quoteType?: QuoteType;
    reactionType?: ReactionType[];
};

export type ReactionType = {
    messageId: string;
    emojiName: string;
    userId: string;
};
export type UserType = {
    userId: string;
    userName: string;
    userProfilePhoto: string;
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

export type ReactionPayload = {
    messagePayloadId: number;
    payloadType: PayloadSubType.reaction;
    messageId: string;
    emoji: string;
    userId: string;
};
