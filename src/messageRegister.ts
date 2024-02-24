import { Database } from "bun:sqlite";
import { type MessagePayload } from "./customTypes";
import { transform } from "typescript";

let messageDb: Database;

/**
 * Creates a new database file if it does not exist.
 * @returns {void}
 */
function createDatabase(): void {
    messageDb = new Database("messages.sqlite", { create: true });
}

/**
 * Creates the registered_users table if it does not exist.
 * @returns {void}
 */
function createUserTypeTable(): void {
    const createTableSQL = `       
        CREATE TABLE IF NOT EXISTS UserType (
            clientId TEXT PRIMARY KEY,
            clientUsername TEXT NOT NULL,
            clientProfilePhoto TEXT NOT NULL
        );`;

    const statement = messageDb.query(createTableSQL);
    statement.run();
}
function createMessageTypeTable(): void {
    const createTableSQL = `
        CREATE TABLE IF NOT EXISTS MessageType (
            messageId TEXT PRIMARY KEY,
            messageSenderId TEXT NOT NULL,
            time TEXT NOT NULL,
            message TEXT NOT NULL,
            FOREIGN KEY (messageSenderId) REFERENCES UserType(clientId)
        );`;

    const statement = messageDb.query(createTableSQL);
    statement.run();
}

function createQuoteTypeTable(): void {
    const createTableSQL = `
        CREATE TABLE IF NOT EXISTS QuoteType (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            quoteId TEXT KEY,
            quoteSenderId TEXT NOT NULL,
            quoteMessage TEXT NOT NULL,
            quoteTime TEXT NOT NULL,
            FOREIGN KEY (quoteSenderId) REFERENCES UserType(clientId)
        );`;

    const statement = messageDb.query(createTableSQL);
    statement.run();
}
function createMessagePayloadTable(): void {
    const createTableSQL = `
        CREATE TABLE IF NOT EXISTS MessagePayload (
            payloadId TEXT PRIMARY KEY,
            payloadType INTEGER NOT NULL,
            clientId TEXT NOT NULL,
            messageId TEXT NOT NULL,
            quoteId TEXT,
            FOREIGN KEY (clientId) REFERENCES UserType(clientId),
            FOREIGN KEY (messageId) REFERENCES MessageType(messageId),
            FOREIGN KEY (quoteId) REFERENCES QuoteType(id)
        );`;

    const statement = messageDb.query(createTableSQL);
    statement.run();
}

export function persistIncomingMessage(message: MessagePayload) {
    const transaction = messageDb.transaction(() => {
        messageDb.run(
            "INSERT OR IGNORE INTO UserType (clientId, clientUsername, clientProfilePhoto) VALUES (?, ?, ?)",
            [
                message.userType.clientId,
                message.userType.clientUsername,
                message.userType.clientProfilePhoto,
            ]
        );

        messageDb.run(
            "INSERT INTO MessageType (messageId, messageSenderId, time, message) VALUES (?, ?, ?, ?)",
            [
                message.messageType.messageId,
                message.messageType.messageSenderId,
                message.messageType.time,
                message.messageType.message,
            ]
        );

        if (message.quoteType) {
            messageDb.run(
                "INSERT INTO QuoteType (quoteId, quoteSenderId, quoteMessage, quoteTime) VALUES (?, ?, ?, ?)",
                [
                    message.quoteType.quoteId,
                    message.quoteType.quoteSenderId,
                    message.quoteType.quoteMessage,
                    message.quoteType.quoteTime,
                ]
            );
        }

        messageDb.run(
            "INSERT INTO MessagePayload (payloadId, payloadType, clientId, messageId, quoteId) VALUES (?, ?, ?, ?, ?)",
            [
                message.messageType.messageId,
                message.payloadType,
                message.userType.clientId,
                message.messageType.messageId,
                message.quoteType?.quoteId || null,
            ]
        );
    });

    transaction();
}

export function retrieveLast100Messages(): MessagePayload[] {
    const result = messageDb
        .query(
            `
        SELECT mp.payloadId, mp.payloadType, mp.clientId, mp.messageId, mp.quoteId,
               ut.clientUsername, ut.clientProfilePhoto,
               mt.time, mt.message,
               qt.quoteId AS qt_quoteId, qt.quoteSenderId, qt.quoteMessage, qt.quoteTime
        FROM MessagePayload AS mp
        LEFT JOIN UserType AS ut ON mp.clientId = ut.clientId
        LEFT JOIN MessageType AS mt ON mp.messageId = mt.messageId
        LEFT JOIN QuoteType AS qt ON mp.quoteId = qt.quoteId
        ORDER BY mp.payloadId DESC
        LIMIT 100
    `
        )
        .all();

    const messages: MessagePayload[] = result.map((row) => ({
        payloadType: row.payloadType,
        userType: {
            clientId: row.clientId,
            clientUsername: row.clientUsername,
            clientProfilePhoto: row.clientProfilePhoto,
        },
        messageType: {
            messageId: row.messageId,
            messageSenderId: row.clientId,
            time: row.time,
            message: row.message,
        },
        quoteType: row.quoteId
            ? {
                  quoteId: row.qt_quoteId,
                  quoteSenderId: row.quoteSenderId,
                  quoteMessage: row.quoteMessage,
                  quoteTime: row.quoteTime,
              }
            : null,
    }));

    return messages;
}

createDatabase();
createUserTypeTable();
createMessageTypeTable();
createQuoteTypeTable();
createMessagePayloadTable();
