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

export function generateSimpleId() {
    const id = `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    console.log("unique id : " + id);
    
    return id;
}