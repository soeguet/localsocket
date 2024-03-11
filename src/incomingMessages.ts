import type { Server, ServerWebSocket } from "bun";
import { usersDatabase } from "./schema/usersDatabase";
import { usersSchema } from "./schema/users_schema";
import {
    PayloadSubType,
    type AuthenticatedPayload,
    type ReactionPayload,
} from "./types/payloadTypes";
import type { RegisteredUser } from "./types/userTypes";
import { persistMessageInDatabase } from "./databaseRequests";
import { messagesDb } from "./schema/messagesDatabase";
import { reactionType } from "./schema/messages_schema";

export async function processIncomingMessage(
    ws: ServerWebSocket<WebSocket>,
    server: Server,
    message: string | Buffer
) {
    // console.log("message received", message);
    // check for null values
    if (usersDatabase === undefined || usersDatabase === null) {
        console.error("Database not found");
        return;
    }
    if (typeof message !== "string") {
        console.error("Invalid message type");
        return;
    }

    // switch part
    const payloadFromClientAsObject = JSON.parse(message);
    switch (payloadFromClientAsObject.payloadType) {
        ////
        case PayloadSubType.auth:
            // first part
            // register the user in the database
            // eslint-disable-next-line no-case-declarations
            const authenticationPayload: AuthenticatedPayload =
                JSON.parse(message);
            await usersDatabase
                .insert(usersSchema)
                .values({
                    id: authenticationPayload.clientId,
                    username: authenticationPayload.clientUsername,
                })
                .onConflictDoNothing();

            // second part
            // send the list of all users to the client
            // eslint-disable-next-line no-case-declarations
            const allUsers: RegisteredUser[] = await usersDatabase
                .select()
                .from(usersSchema);
            // console.log("allUsers", allUsers);
            ws.publish(
                "the-group-chat",
                JSON.stringify({
                    payloadType: PayloadSubType.clientList,
                    clients: allUsers,
                })
            );
            break;

        ////
        case PayloadSubType.message:
            console.log("message received", message);
            // PERSIST MESSAGE
            await persistMessageInDatabase(message);
            server.publish("the-group-chat", message);
            break;

        ////
        case PayloadSubType.profileUpdate:
            console.log("profileUpdate received", message);
            break;

        ////
        case PayloadSubType.clientList:
            console.log("clientList received", message);
            break;

        ////
        case PayloadSubType.typing:
        case PayloadSubType.force:
            server.publish("the-group-chat", message);
            break;

        ////
        case PayloadSubType.reaction:
            console.log("reaction received", message);
            await persistReactionToDatabase(message);
            break;

        default: {
            console.log("switch messageType default");
            console.log("messageAsString", message);
            break;
        }
    }
}

export async function persistReactionToDatabase(message: string | Buffer) {
    if (typeof message !== "string") {
        console.error("Invalid message type");
        return;
    }
    const payloadFromClientAsObject: ReactionPayload = JSON.parse(message);

    await messagesDb.insert(reactionType).values({
        messageId: payloadFromClientAsObject.messageId,
        emojiName: payloadFromClientAsObject.emoji,
        userId: payloadFromClientAsObject.userId,
    });
    console.log("persistReactionToDatabase", payloadFromClientAsObject);
}
