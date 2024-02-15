import type { RegisteredUser } from "./customTypes";
import {
    generateSimpleId,
    getRandomColor,
    getRandomProfilePicUrl,
} from "./helper";
import { Database } from "bun:sqlite";

const userDb = new Database("users.sqlite", { create: true });
const createTableSQL = `
CREATE TABLE IF NOT EXISTS registered_users (
    id TEXT PRIMARY KEY,
    user TEXT NOT NULL,
);`;

userDb.query(createTableSQL);

const userRegister: Map<string, RegisteredUser> = new Map();

export async function checkIfUsernameExists(
    username: string
): Promise<boolean> {
    const map = getAllUsers();
    map.forEach((value) => {
        console.log("value.username: " + value.username);
        console.log("username: " + username);
        if (value.username === username) {
            return true;
        }
    });

    return false;
}

export async function registerUser(username: string): Promise<void> {
    const userId = generateSimpleId();
    const randomPhotoUrl = await getRandomProfilePicUrl();
    const addUser = userDb.query("INSERT INTO registered_users (id, user) VALUES (?, ?);");
    addUser.all(userId, JSON.stringify({ id: userId, username: username, clientColor: getRandomColor(), profilePhotoUrl: randomPhotoUrl }));
}

export function getUser(username: string): RegisteredUser | undefined {
    return userRegister.get(username);
}

export function deleteUser(username: string): boolean {
    return userRegister.delete(username);
}

export function getAllUsers(): Map<string, RegisteredUser> {
    return userRegister;
}

export function clearAllUsers(): void {
    userRegister.clear();
}

export function getNumberOfUsers(): number {
    return userRegister.size;
}

export function updateUser(
    id: string,
    username?: string,
    clientColor?: string,
    profilePhotoUrl?: string
): boolean {
    const user = userRegister.get(id);
    if (user) {
        if (username) user.username = username;
        if (clientColor) user.clientColor = clientColor;
        if (profilePhotoUrl) user.profilePhotoUrl = profilePhotoUrl;
        return true;
    }
    return false;
}

export default userRegister;
