/**
 * Checks if the given message is a string or a buffer.
 * If the message is a string, it returns the message.
 * If the message is a buffer, it throws an error.
 * @param message - The message to be checked.
 * @returns The message if it is a string.
 * @throws Error if the message is not a string.
 */
export function checkIfMessageIsString(message: string | Buffer): string {
    if (typeof message === "string") {
        try {
            return message;
        } catch (error) {
            throw new Error("message parsing error occured");
        }
    } else {
        throw new Error("not a string!");
    }
}

/**
 * Generates a simple unique ID.
 * The ID is a combination of the current timestamp and a random string.
 * 
 * @returns The generated unique ID.
 */
export function generateSimpleId() {
    const id = `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    console.log("unique id : " + id);
    
    return id;
}