import type { Server, ServerWebSocket } from "bun";
import { Database } from "bun:sqlite";
import {
    type RegisteredUser,
    type Websocket,
    type AuthenticationPayload,
    PayloadSubType,
} from "./customTypes";

let dbInUseFlag = false;

/**
 * Creates a new database file if it does not exist.
 * @returns {void}
 */
function createDatabase(): void {
    userDb = new Database("users.sqlite", { create: true });
}

/**
 * Creates the registered_users table if it does not exist.
 * @returns {void}
 */
function createTable(): void {
    const createTableSQL = `
        CREATE TABLE IF NOT EXISTS registered_users (
            id TEXT PRIMARY KEY,
            username TEXT NOT NULL,
            clientColor TEXT,
            profilePhotoUrl TEXT
        );`;

    const statement = userDb.query(createTableSQL);
    statement.run();
}

let userDb: Database;
createDatabase();
createTable();

/**
 * Checks if a username exists in the database.
 * @param clientId The client ID of the user.
 * @returns True if the username exists, false otherwise.
 */
export function checkIfUserExists(clientId: string): boolean {
    const searchQuery = `%${clientId}%`;

    const user = userDb.query("SELECT * FROM registered_users WHERE id = ?;");
    const result = user.all(searchQuery);
    if (result.length > 0) {
        return true;
    }
    return false;
}

/**
 * Checks if the database is currently in use. Just there to delay the execution of the code and prevent race conditions with the database.
 * @returns {Promise<void>} A promise that resolves when the database is not in use.
 */
async function checkIfDbInUse(): Promise<void> {
    while (dbInUseFlag) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }
}

export async function registerUserv2(payload: string): Promise<void> {
    // trying to prevent race conditions manually
    await checkIfDbInUse();

    const authenticationPayload: AuthenticationPayload = JSON.parse(payload);

    // after waiting, check if the username exists in the database
    // const doesUsernameExist = checkIfUserExists(clientId);
    const doesUserIdExist = checkIfIdExists(authenticationPayload.clientId);
    if (doesUserIdExist) {
        return;
    }

    // block the database for other requests
    dbInUseFlag = true;

    const addUserStatement = userDb.query(
        "INSERT INTO registered_users (id, username, clientColor, profilePhotoUrl) VALUES (?, ?, ?, ?);"
    );
    try {
        // insert values into the database
        addUserStatement.run(
            authenticationPayload.clientId,
            authenticationPayload.clientUsername,
            "",
            ""
        );
    } catch (error) {
        console.error(error);
    }

    // release the database
    dbInUseFlag = false;
}

/**
 * Sends the list of all users to the new client.
 * @param ws The WebSocket of the new client.
 * @returns {void}
 */
export function deliverArrayOfUsersToNewClient(server: Server): void {
    const allUsersPre: RegisteredUser[] | undefined = getAllUsers();

    if (allUsersPre === undefined) {
        throw new Error("No users found");
    }

    server.publish(
        "the-group-chat",
        JSON.stringify({
            payloadType: PayloadSubType.clientList,
            clients: allUsersPre,
        })
    );
}

/**
 * Retrieves a registered user by their client ID.
 * @param clientId The client ID of the user.
 * @returns The registered user object, or undefined if not found.
 */
export function getUser(clientId: string): RegisteredUser | null {
    try {
        // .get() gets the first result only! no need to check for more results
        const user = userDb.query(
            "SELECT * FROM registered_users WHERE id = ?;"
        );
        const result: RegisteredUser | null = user.get(
            clientId
        ) as RegisteredUser | null;
        return result;
    } catch (error) {
        console.error(error);
    }
    return null;
}

/**
 * Deletes a user from the registered_users table based on the provided clientId.
 * @param clientId The ID of the user to be deleted.
 */
export function deleteUser(clientId: string): void {
    const user = userDb.query("DELETE * FROM registered_users WHERE id = ?;");
    user.run(clientId);
}

export function getAllUsers() {
    try {
        const statement = userDb.query("SELECT * FROM registered_users;");
        const allUsers = statement.all();

        const allRegisteredUsers: RegisteredUser[] = allUsers.map((user) => {
            const registeredUser: RegisteredUser = {
                id: (user as RegisteredUser).id,
                username: (user as RegisteredUser).username,
                clientColor: (user as RegisteredUser).clientColor,
                profilePhotoUrl: (user as RegisteredUser).profilePhotoUrl,
            };

            return registeredUser;
        });
        // console.log("getAllUsers", allRegisteredUsers);
        return allRegisteredUsers as RegisteredUser[];
    } catch (error) {
        console.error(error);
    }
}

/**
 * Deletes all users from the registered_users table.
 * @returns {void}
 */
export function clearAllUsers(): void {
    const deleteAllStatement = userDb.query("DELETE FROM registered_users;");
    deleteAllStatement.run();
}

/**
 * Retrieves the number of registered users.
 * @returns The number of registered users.
 * @type {number}
 */
export function getNumberOfUsers(): number {
    const allUserStatement = userDb.query("SELECT * FROM registered_users;");
    const results = allUserStatement.all();
    return results.length;
}

/**
 * Updates the user's information in the database.
 * @param id The ID of the user to be updated.
 * @param username The new username for the user.
 * @param clientColor The new client color for the user.
 * @param profilePhotoUrl The new profile photo URL for the user.
 * @returns True if the user was updated, false otherwise.
 */
export function updateUser(
    id: string,
    username?: string,
    clientColor?: string,
    profilePhotoUrl?: string
): boolean {
    const user: RegisteredUser | null = getUser(id);

    if (user === null) {
        throw new Error("User not found");
    }

    if (user) {
        if (username) user.username = username;
        if (clientColor) user.clientColor = clientColor;
        if (profilePhotoUrl) user.profilePhotoUrl = profilePhotoUrl;
    } else {
        return false;
    }

    // "INSERT INTO registered_users (id, username, clientColor, profilePhotoUrl) VALUES (?, ?, ?, ?);"
    const updateUserStatement = userDb.query(
        "UPDATE registered_users SET username = ?, clientColor = ?, profilePhotoUrl = ? WHERE id = ?;"
    );
    updateUserStatement.run(
        user.username,
        user.clientColor,
        user.profilePhotoUrl,
        id
    );

    return true;
}
function checkIfIdExists(id: string): boolean {
    const stmt = userDb.prepare("SELECT * FROM registered_users WHERE id = ?");
    const result = stmt.all(id);
    return result.length > 0;
}
