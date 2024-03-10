import type { ServerWebSocket } from "bun";
import { PayloadSubType, type MessagePayload } from "./types/payloadTypes";
import { messagesDb } from "./schema/messagesDatabase";
import { messagesPayloadSchema } from "./schema/messages_schema";
import { desc } from "drizzle-orm";

export async function sendLast100MessagesToNewClient(
    ws: ServerWebSocket<WebSocket>
) {
    const lastMessages = await messagesDb
        .select()
        .from(messagesPayloadSchema)
        .limit(100)
        .orderBy(desc(messagesPayloadSchema.id));
    const messageListPayload = {
        payloadType: PayloadSubType.messageList,
        messageList: lastMessages,
    };
    console.log("messageListPayload", messageListPayload);
    ws.send(JSON.stringify(messageListPayload));
}

export async function persistMessageInDatabase(
    message: string | Buffer
) {
    if (typeof message !== "string") {
        console.error("Invalid message type");
        return;
    }
    const payloadFromClientAsObject: MessagePayload = JSON.parse(message);
    await messagesDb.insert(messagesPayloadSchema).values({
        clientId: payloadFromClientAsObject.userType.clientId,
        messageId: payloadFromClientAsObject.messageType.messageId,
        payloadType: payloadFromClientAsObject.payloadType,
        quoteId: payloadFromClientAsObject.quoteType?.quoteId,
    });
}
