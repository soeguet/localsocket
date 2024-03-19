import type { Server } from "bun";
import {
    PayloadSubType,
    type ClientEntity,
    type ClientListPayload,
} from "../types/payloadTypes";

export async function sendAllRegisteredUsersListToClient(
    server: Server,
    allUsers: unknown | ClientEntity[]
) {
    console.log("allUsers", allUsers);

    if (allUsers === undefined || allUsers === null) {
        throw new Error("No users found");
    }

    const clientListPayload: ClientListPayload = {
        payloadType: PayloadSubType.clientList,
        // TODO validate this
        clients: allUsers as ClientEntity[],
    };

    server.publish("the-group-chat", JSON.stringify(clientListPayload));
}
