import type { Server } from "bun";
import { postgresDb } from "../db/db";
import { usersSchema } from "../db/schema/schema";
import { PayloadSubType, type AuthenticatedPayload } from "../types/payloadTypes";
import type { RegisteredUser } from "../types/userTypes";

export async function registerUserInDatabse(payload: AuthenticatedPayload) {
    try {
        //
        await postgresDb
            .insert(usersSchema)
            .values({
                id: payload.clientId,
                username: payload.clientUsername,
            })
            .onConflictDoNothing();
        //
    } catch (error) {
        console.error("Error while registering user", error);
    }
}

export async function retrieveAllRegisteredUsersFromDatabase() {
    try {
        return await postgresDb.select().from(usersSchema);
    } catch (error) {
        return error;
    }
}

export async function sendAllRegisteredUsersListToClient(server: Server, allUsers:RegisteredUser[] | unknown) {
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
