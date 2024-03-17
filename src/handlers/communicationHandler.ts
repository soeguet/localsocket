import type { Server } from "bun";
import { PayloadSubType, type ClientEntity } from "../types/payloadTypes";

export async function sendAllRegisteredUsersListToClient(
    server: Server,
    allUsers: ClientEntity[] | unknown
) {
    console.log("allUsers", allUsers);

    if (allUsers === undefined || allUsers === null) {
        throw new Error("No users found");
    }

    server.publish(
        "the-group-chat",
        JSON.stringify({
            payloadType: PayloadSubType.clientList,
            clients: allUsers,
        })
    );
}
