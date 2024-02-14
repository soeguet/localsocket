import type { RegisteredUser } from "./customTypes";
import { generateSimpleId, getRandomColor, getRandomProfilePicUrl } from "./helper";

const userRegister: Map<string, RegisteredUser> = new Map();

export function checkIfUsernameExists(username: string): boolean {
    return userRegister.has(username);
}

export async function registerUser(username: string): Promise<void> {
    const userId = generateSimpleId();
    const randomPhotoUrl = await getRandomProfilePicUrl();
    userRegister.set(userId, {
        id: userId,
        username: username,
        clientColor: getRandomColor(),
        profilePhotoUrl: randomPhotoUrl,
    });
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
