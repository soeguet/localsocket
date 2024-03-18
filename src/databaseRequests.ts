import {
    PayloadSubType,
    type MessageListPayload,
    type MessagePayload,
} from "./types/payloadTypes";

export async function sendLast100MessagesToNewClient() {
    // grab all messages
    // const messages: MessagePayload[] = await postgresDb
    //     .select()
    //     .from(messagePayloadSchema)
    //     .leftJoin(
    //         messageTypeSchema,
    //         eq(messagePayloadSchema.messageId, messageTypeSchema.id)
    //     )
    //     .leftJoin(
    //         quoteTypeSchema,
    //         eq(messagePayloadSchema.id, quoteTypeSchema.payloadId)
    //     )
    //     .execute();

    // grab all reactions and add them to result
    // for (const message of messages) {
    //     const reactions = await postgresDb
    //         .select()
    //         .from(reactionTypeSchema)
    //         .where(
    //             eq(reactionTypeSchema.payloadId, message.messagePayloadType.id)
    //         )
    //         .execute();
    //
    //     message.reactionType = reactions;
    // }

    // console.log("lastMessages", messages);

    // .orderBy(desc(messagesPayloadSchema.id));
    // const messageListPayload: MessageListPayload = {
    //     payloadType: PayloadSubType.messageList,
    //     messageList: messages,
    // };
    // console.log("messageListPayload", messageListPayload);
    // return messageListPayload;
}

export async function retrieveLastMessageFromDatabase() {
    // const lastMessage = await postgresDb
    //     .select()
    //     .from(messagePayloadSchema)
    //     .leftJoin(
    //         messageTypeSchema,
    //         eq(messagePayloadSchema.messageId, messageTypeSchema.id)
    //     )
    //     .leftJoin(
    //         quoteTypeSchema,
    //         eq(messagePayloadSchema.id, quoteTypeSchema.payloadId)
    //     )
    //     .orderBy(desc(messagePayloadSchema.id))
    //     .limit(1)
    //     .execute();

    // if (
    //     lastMessage.length > 1 ||
    //     lastMessage === undefined ||
    //     lastMessage === null
    // ) {
    //     console.error(
    //         "More than one message retrieved from database, expected 1, got: ",
    //         lastMessage.length
    //     );
    //     console.error("lastMessage", lastMessage);
    //     return;
    // }

    // return lastMessage[0];
}

export async function persistMessageInDatabase(payload: MessagePayload) {
    // const messageId = await postgresDb
    //     .insert(messageTypeSchema)
    //     .values({
    //         messageId: payload.messageType.messageId,
    //         messageContext: payload.messageType.messageConext,
    //         messageTime: payload.messageType.messageTime,
    //         messageDate: payload.messageType.messageDate,
    //     })
    //     .returning();

    // if no quote, skip
    // a new message cannot have a reaction yet
    // if (payload.quoteType !== undefined) {
    //     await postgresDb.insert(quoteTypeSchema).values({
    //         quoteMessageId: payload.quoteType.quoteMessageId,
    //         quoteClientId: payload.quoteType.quoteClientId,
    //         quoteMessageContext: payload.quoteType.quoteMessageContext,
    //         quoteTime: payload.quoteType.quoteTime,
    //         payloadId: messageId[0].messageId,
    //     });
    // }

    // return messagePayloadFromDatabase[0].id;
}
