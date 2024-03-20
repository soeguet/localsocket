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
 *     clientDbId: string;
 *  };
 */
export type AuthenticationPayload = {
    payloadType: PayloadSubType.auth;
} & Pick<ClientEntity, "clientDbId" | "clientUsername">;

/**
 * [[ RESULTING TYPE ]]
 *  export type ClientUpdatePayload = {
 *     payloadType: PayloadSubType.auth;
 *     clientDbId: string;
 *     clientUsername: string;
 *     clientColor?: string;
 *     clientProfileImage?: string;
 *  };
 */
export type ClientUpdatePayload = {
    payloadType: PayloadSubType.profileUpdate;
} & ClientEntity;

export type ClientListPayload = {
    payloadType: PayloadSubType.clientList;
    clients: ClientEntity[];
};

export type ClientEntity = {
    clientDbId: string;
    clientUsername: string;
    clientColor?: string;
    clientProfileImage?: string;
};

export type MessageEntity = {
    messageDbId: string;
    messageConext: string;
    messageTime: string;
    messageDate: string;
};

export type QuoteEntity = {
    quoteDbId: number;
    quoteMessageId: string;
    quoteClientId: string;
    quoteMessageContext: string;
    quoteTime: string;
    quoteDate: string;
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
 *          messageDbId: string;
 *          messageConext: string;
 *          messageTime: string;
 *          messageDate: Date;
 *      };
 *      clientType: {
 *          clientDbId: string;
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
    messageType: MessageEntity;
    clientType: Pick<ClientEntity, "clientDbId">;
    quoteType?: Omit<QuoteEntity, "quoteDbId">;
    reactionType?: Omit<ReactionEntity, "reactionDbId">[];
};

export type MessageListPayload = {
    payloadType: PayloadSubType.messageList;
    messageList: Omit<MessagePayload, "payloadType">[];
};
