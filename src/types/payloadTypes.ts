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

/**
 * [[ RESULTING TYPE ]]
 *  export type AuthenticationPayload = {
 *     payloadType: PayloadSubType.auth;
 *     clientUsername: string;
 *     clientId: string;
 *  };
 */
export type AuthenticationPayload = PayloadSubType.auth &
    Pick<ClientEntity, "clientId" | "clientUsername">;

export type ClientEntity = {
    clientId: string;
    clientUsername: string;
    clientColor?: string;
    clientProfileImage?: string;
};

export type MessageEntity = {
    messageDbId: number;
    messageId: string;
    messageConext: string;
    messageTime: string;
    messageDate: Date;
};

export type QuoteEntity = {
    quoteDbId: number;
    quoteMessageId: string;
    quoteClientId: string;
    quoteMessageContext: string;
    quoteTime: string;
    quoteDate: Date;
};

/**
 * [[ RESULTING TYPE ]]
 *  export type ReactionEntity = {
 *     payloadType: PayloadSubType.reaction;
 *     reactionMessageId: string;
 *     reactionContext: string;
 *     reactionClientId: string;
 *  };
 */
export type ReactionPayload = Omit<ReactionEntity, "reactionDbId"> & {
    payloadType: PayloadSubType.reaction;
};

export type ReactionEntity = {
    reactionDbId: number;
    reactionMessageId: string;
    reactionContext: string;
    reactionClientId: string;
};

/**
 * [[ RESULTING TYPE ]]
 * export type MessagePayload = {
 *      payloadType: PayloadSubType.message;
 *      messageType: {
 *          messageId: string;
 *          messageConext: string;
 *          messageTime: string;
 *          messageDate: Date;
 *      };
 *      clientType: {
 *          clientId: string;
 *      };
 *      quoteType?: {
 *          quoteMessageId: string;
 *          quoteClientId: string;
 *          quoteMessageContext: string;
 *          quoteTime: string;
 *          quoteDate: Date;
 *      };
 *      reactionType?: {
 *          reactionMessageId: string;
 *          reactionContext: string;
 *          reactionClientId: string;
 *      }[];
 *    };
 */
export type MessagePayload = {
    payloadType: PayloadSubType.message;
    messageType: Omit<MessageEntity, "messageDbId">;
    clientType: Pick<ClientEntity, "clientId">;
    quoteType?: Omit<QuoteEntity, "quoteDbId">;
    reactionType?: Omit<ReactionEntity, "reactionDbId">[];
};

export type MessageListPayload = {
    payloadType: PayloadSubType.messageList;
    messageList: Omit<MessagePayload, "payloadType">[];
};
