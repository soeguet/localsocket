import type { ServerWebSocket } from "bun";
import { Database } from "bun:sqlite";
import {
    PayloadSubType,
    type ClientListPayload,
    type RegisteredUser,
    type UsernameObject,
    type Websocket,
} from "./customTypes";
import { getRandomColor, getRandomProfilePicUrl } from "./helper";

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
            user TEXT NOT NULL
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
export function checkIfUsernameExists(clientId: string): boolean {
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

export async function registerUserv2(
    usernameObject: UsernameObject
): Promise<void> {
    // trying to prevent race conditions manually
    await checkIfDbInUse();

    // after waiting, check if the username exists in the database
    // const doesUsernameExist = checkIfUsernameExists(clientId);
    const doesUserIdExist = checkIfIdExists(usernameObject.id);
    if (doesUserIdExist) {
        return;
    }

    // block the database for other requests
    dbInUseFlag = true;

    const randomPhotoUrl = "";
    // try {
    //     randomPhotoUrl = await getRandomProfilePicUrl();
    // } catch (error) {
    //     console.error(error + " - no photo url found!");
    // }
    const addUserStatement = userDb.query(
        "INSERT INTO registered_users (id, user) VALUES (?, ?);"
    );
    try {
        addUserStatement.run(
            usernameObject.id,
            JSON.stringify({
                id: usernameObject.id,
                username: usernameObject.username,
                clientColor: getRandomColor(),
                profilePhotoUrl: randomPhotoUrl,
            })
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
export function deliverArrayOfUsersToNewClient(
    ws: ServerWebSocket<Websocket>
): void {
    const allUsers: RegisteredUser[] = getAllUsers();
    const allUsersString: ClientListPayload = {
        type: PayloadSubType.clientList,
        clients: JSON.stringify(allUsers),
    };
    console.log("send!{}" + JSON.stringify(allUsersString));
    ws.send(JSON.stringify(allUsersString));
}

/**
 * Retrieves a registered user by their client ID.
 * @param clientId The client ID of the user.
 * @returns The registered user object, or undefined if not found.
 */
export function getUser(clientId: string): RegisteredUser | undefined {
    // .get() gets the first result only! no need to check for more results
    const user = userDb.query("SELECT * FROM registered_users WHERE id = ?;");
    const result = user.get(clientId);

    return JSON.parse(result as string);
}

/**
 * Deletes a user from the registered_users table based on the provided clientId.
 * @param clientId The ID of the user to be deleted.
 */
export function deleteUser(clientId: string): void {
    const user = userDb.query("DELETE * FROM registered_users WHERE id = ?;");
    user.run(clientId);
}

/**
 * Retrieves all registered users from the database.
 * @returns An array of all registered users.
 * @type {RegisteredUser[]}
 */
export function getAllUsers(): RegisteredUser[] {
    const allUserStatement = userDb.query("SELECT * FROM registered_users;");
    return allUserStatement.all() as RegisteredUser[];
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
    const user = getUser(id);

    if (user === undefined) {
        throw new Error("User not found");
    }

    if (user) {
        if (username) user.username = username;
        if (clientColor) user.clientColor = clientColor;
        if (profilePhotoUrl) user.profilePhotoUrl = profilePhotoUrl;
    } else {
        return false;
    }

    const updateUserStatement = userDb.query(
        "UPDATE registered_users SET user = ? WHERE id = ?;"
    );
    updateUserStatement.run(JSON.stringify(user), id);

    return true;
}
function checkIfIdExists(id: string): boolean {
    const stmt = userDb.prepare("SELECT * FROM registered_users WHERE id = ?");
    const result = stmt.all(id);
    return result.length > 0;
}
