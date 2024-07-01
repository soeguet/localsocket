import type { Server, ServerWebSocket } from "bun";
import { type AuthenticationPayload, type ClientListPayload, PayloadSubType, type ClientEntity } from "../../types/payloadTypes";
import { registerUserInDatabse, retrieveAllRegisteredUsersFromDatabase } from "../databaseHandler";
import { validateAuthPayload } from "../typeHandler";

export async function authPayloadHandler(payloadFromClientAsObject: unknown, ws: ServerWebSocket<WebSocket>, server: Server) {
    const validAuthPayload = validateAuthPayload(
        payloadFromClientAsObject
    );

    if (!validAuthPayload) {
        ws.send(
            "Invalid authentication payload type. Type check not successful!"
        );
        console.error(
            "VALIDATION OF _AUTH_ PAYLOAD FAILED. PLEASE CHECK THE PAYLOAD AND TRY AGAIN."
        );
        ws.close(
            1008,
            "Invalid authentication payload type. Type check not successful!"
        );
        return;
    }

    try {
        await registerUserInDatabse(
            payloadFromClientAsObject as AuthenticationPayload
        );
    } catch (error) {
        console.error("Error registering user in database", error);
        return;
    }

    const allUsers = await retrieveAllRegisteredUsersFromDatabase();

    if (typeof allUsers === "undefined" || allUsers === null) {
        console.error("No users found");
    }

    const clientListPayload: ClientListPayload = {
        payloadType: PayloadSubType.clientList,
        // TODO validate this
        clients: allUsers as ClientEntity[],
    };

    server.publish("the-group-chat", JSON.stringify(clientListPayload));
}