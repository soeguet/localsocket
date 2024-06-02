export enum PayloadSubType {
	auth = 0,
	message = 1,
	clientList = 2,
	profileUpdate = 3,
	messageList = 4,
	typing = 5,
	force = 6,
	reaction = 7,
	delete = 8,
	edit = 9,
}

/**
 * [[ RESULTING TYPE ]]
 *  export type AuthenticationPayload = {
 *     payloadType: PayloadSubType.auth;
 *     clientUsername: string;
 *     clientDbId: string;
 *  };
 *
 *  @param {PayloadSubType} payloadType
 *  @param {string} clientDbId
 *  @param {string} clientUsername
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
 *
 *  @param {PayloadSubType} payloadType
 *  @param {string} clientDbId
 *  @param {string} clientUsername
 *  @param {string} clientColor
 *  @param {string} clientProfileImage
 */
export type ClientUpdatePayload = {
	payloadType: PayloadSubType.profileUpdate;
} & ClientEntity;

/**
 * [[ RESULTING TYPE ]]
 * export type ClientListPayload = {
 *    payloadType: PayloadSubType.clientList;
 *    clients: ClientEntity[];
 * };
 *
 * @param {PayloadSubType} payloadType
 * @param {ClientEntity[]} clients
 */
export type ClientListPayload = {
	payloadType: PayloadSubType.clientList;
	clients: ClientEntity[];
};

/**
 * [[ RESULTING TYPE ]]
 * export type ClientEntity = {
 *    clientDbId: string;
 *    clientUsername: string;
 *    clientColor?: string;
 *    clientProfileImage?: string;
 * };
 *
 * @param {string} clientDbId
 * @param {string} clientUsername
 * @param {string} clientColor
 * @param {string} clientProfileImage
 */
export type ClientEntity = {
	clientDbId: string;
	clientUsername: string;
	clientColor?: string;
	clientProfileImage?: string;
};

/**
 * [[ RESULTING TYPE ]]
 *  export type MessageEntity = {
 *     messageDbId: string;
 *     messageContext: string;
 *     messageTime: string;
 *     messageDate: string;
 *  };
 *
 * @param {string} messageDbId
 * @param {string} messageContext
 * @param {string} messageTime
 * @param {string} messageDate
 */
export type MessageEntity = {
	messageDbId: string;
	deleted: false;
	edited: false;
	messageContext: string;
	messageTime: string;
	messageDate: string;
};

/**
 * [[ RESULTING TYPE ]]
 * export type QuoteEntity = {
 *    quoteDbId: number;
 *    quoteMessageId: string;
 *    quoteClientId: string;
 *    quoteMessageContext: string;
 *    quoteTime: string;
 *    quoteDate: string;
 *  };
 *
 * @param {string} quoteDbId
 * @param {string} quoteClientId
 * @param {string} quoteMessageContext
 * @param {string} quoteTime
 * @param {string} quoteDate
 */
export type QuoteEntity = {
	quoteDbId: string;
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
 *
 * @param {int} payloadType
 * @param {string} reactionMessageId
 * @param {string} reactionContext
 * @param {string} reactionClientId
 */
export type ReactionPayload = ReactionEntity & {
	payloadType: PayloadSubType.reaction;
};

/**
 * @param {string} reactionDbId
 * @param {string} reactionMessageId
 * @param {string} reactionContext
 * @param {string} reactionClientId
 */
export type ReactionEntity = {
	reactionDbId: string;
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
 *          deleted: false;
 *          messageContext: string;
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
	quoteType?: QuoteEntity;
	reactionType?: Omit<ReactionEntity, "reactionDbId">[];
};

/**
 * [[ RESULTING TYPE ]]
 * export type MessageListPayload = {
 *    payloadType: PayloadSubType.messageList;
 *    messageList: [
 * *      messageType: {
 *          messageDbId: string;
 *          messageContext: string;
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
 *    ]
 *
 */
export type MessageListPayload = {
	payloadType: PayloadSubType.messageList;
	messageList: Omit<MessagePayload, "payloadType">[];
};

/**
 * Type for DeleteEntity.
 */
export type DeleteEntity = {
	payloadType: PayloadSubType.reaction;
	messageDbId: string;
};

/**
 * Type for DeleteEntity.
 */
export type EditEntity = {
	payloadType: PayloadSubType.reaction;
	messageDbId: string;
	messageContext: string;
};
