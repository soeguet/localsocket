import type { RegisteredUser } from "./customTypes";
import {
    generateSimpleId,
    getRandomColor,
    getRandomProfilePicUrl,
} from "./helper";
import { Database } from "bun:sqlite";

let dbInUseFlag = false;

function createDatabase() {
    userDb = new Database("users.sqlite", { create: true });
}
function createTable() {
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

export function checkIfUsernameExists(username: string): boolean {
    const searchQuery = `%${username}%`;

    const user = userDb.query(
        "SELECT * FROM registered_users WHERE user LIKE ?;"
    );
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

/**
 * Registers a user with the given username.
 *
 * @param username - The username of the user to register.
 * @returns A Promise that resolves when the user is successfully registered.
 */
export async function registerUser(username: string): Promise<void> {
    // trying to prevent race conditions manually
    await checkIfDbInUse();

    // after waiting, check if the username exists in the database
    const doesUsernameExist = checkIfUsernameExists(username);
    if (doesUsernameExist) {
        return;
    }

    // block the database for other requests
    dbInUseFlag = true;

    const userId = generateSimpleId();
    let randomPhotoUrl = "";
    try {
        randomPhotoUrl = await getRandomProfilePicUrl();
    } catch (error) {
        console.error(error + " - no photo url found!");
    }
    const addUserStatement = userDb.query(
        "INSERT INTO registered_users (id, user) VALUES (?, ?);"
    );
    addUserStatement.all(
        userId,
        JSON.stringify({
            id: userId,
            username: username,
            clientColor: getRandomColor(),
            profilePhotoUrl: randomPhotoUrl,
        })
    );

    // release the database
    dbInUseFlag = false;
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

export function getAllUsers() {
    const allUserStatement = userDb.query("SELECT * FROM registered_users;");
    return allUserStatement.all();
}

export function clearAllUsers(): void {
    const deleteAllStatement = userDb.query("DELETE FROM registered_users;");
    deleteAllStatement.run();
}

export function getNumberOfUsers(): number {
    const allUserStatement = userDb.query("SELECT * FROM registered_users;");
    const results = allUserStatement.all();
    return results.length;
}

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
