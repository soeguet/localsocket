import type { ServerWebSocket, Server } from "bun";
import { type DeleteEntity, PayloadSubType } from "../../types/payloadTypes";
import { deleteMessageStatus, retrieveUpdatedMessageFromDatabase } from "../databaseHandler";
import { validateDeletePayload } from "../typeHandler";

export async function deletePayloadHandler(payloadFromClientAsObject: unknown, ws: ServerWebSocket<WebSocket>, server: Server) {

    const validatedDeletePayload = validateDeletePayload(
        payloadFromClientAsObject
    );

    if (!validatedDeletePayload) {
        ws.send(
            `Invalid delete payload type. Type check not successful! ${JSON.stringify(
                payloadFromClientAsObject
            )}`
        );
        console.error(
            "VALIDATION OF _DELETE_ PAYLOAD FAILED. PLEASE CHECK THE PAYLOAD AND TRY AGAIN."
        );
        ws.close(
            1008,
            "Invalid delete payload type. Type check not successful!"
        );
        return;
    }

    try {
        await deleteMessageStatus(
            payloadFromClientAsObject as DeleteEntity
        );
    } catch (error) {
        console.error("Error deleting message status", error);
        return;
    }

    const updatedMessage = await retrieveUpdatedMessageFromDatabase(
        (payloadFromClientAsObject as DeleteEntity).messageDbId
    );

    const updatedMessageWithPayloadType = {
        ...updatedMessage,
        payloadType: PayloadSubType.delete,
    };

    server.publish(
        "the-group-chat",
        JSON.stringify(updatedMessageWithPayloadType)
    );

}