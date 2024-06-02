import type { ServerWebSocket, Server } from "bun";
import {
	PayloadSubType,
	type AuthenticationPayload,
	type ClientListPayload,
	type ClientEntity,
	type ClientUpdatePayload,
	type ReactionPayload,
	type MessagePayload,
	type MessageListPayload,
	type DeleteEntity,
} from "../types/payloadTypes";
import {
	checkForDatabaseErrors,
	registerUserInDatabse,
	retrieveAllRegisteredUsersFromDatabase,
	persistMessageInDatabase,
	retrieveLastMessageFromDatabase,
	updateClientProfileInformation,
	persistReactionToDatabase,
	retrieveUpdatedMessageFromDatabase,
	sendLast100MessagesToNewClient,
	deleteMessageStatus,
	editMessageContent,
} from "./databaseHandler";
import {
	validateAuthPayload,
	validateMessagePayload,
	validateclientUpdatePayload,
	validateReactionPayload,
	validateDeletePayload,
	validateEditPayload,
} from "./typeHandler";

export async function processIncomingMessage(
	ws: ServerWebSocket<WebSocket>,
	server: Server,
	message: string | Buffer,
) {
	// some random checks on message & database
	const messageAsString = checkForDatabaseErrors(message) as string;

	let payloadFromClientAsObject;

	try {
		payloadFromClientAsObject = JSON.parse(messageAsString);
	} catch (error) {
		console.error(
			"Error parsing message from client. Please check the message and try again. Probably not a JSON object.",
		);
		ws.send(
			"Error parsing message from client. Please check the message and try again. Probably not a JSON object.",
		);
		ws.close(1008, "Error parsing message from client.");
		return;
	}

	// switch part
	switch (payloadFromClientAsObject.payloadType) {
		// PayloadSubType.auth == 0
		case PayloadSubType.auth: {
			//
			const validAuthPayload = validateAuthPayload(payloadFromClientAsObject);

			if (!validAuthPayload || payloadFromClientAsObject.clientDbId === "") {
				ws.send(
					"Invalid authentication payload type. Type check not successful!",
				);
				console.error(
					"VALIDATION OF _AUTH_ PAYLOAD FAILED. PLEASE CHECK THE PAYLOAD AND TRY AGAIN.",
				);
				ws.close(
					1008,
					"Invalid authentication payload type. Type check not successful!",
				);
				break;
			}

			await registerUserInDatabse(
				payloadFromClientAsObject as AuthenticationPayload,
			);

			const allUsers = await retrieveAllRegisteredUsersFromDatabase();

			if (typeof allUsers === "undefined" || allUsers === null) {
				throw new Error("No users found");
			}

			const clientListPayload: ClientListPayload = {
				payloadType: PayloadSubType.clientList,
				// TODO validate this
				clients: allUsers as ClientEntity[],
			};

			server.publish("the-group-chat", JSON.stringify(clientListPayload));

			break;
		}

		// PayloadSubType.message == 1
		case PayloadSubType.message: {
			const validMessagePayload = validateMessagePayload(
				payloadFromClientAsObject,
			);

			// redefine for LSP compliance
			const messagePayload: MessagePayload = payloadFromClientAsObject;

			if (
				!validMessagePayload ||
				messagePayload.messageType.messageDbId === "" ||
				messagePayload.clientType.clientDbId === ""
			) {
				console.error(
					"VALIDATION OF _MESSAGE_ PAYLOAD FAILED. PLEASE CHECK THE PAYLOAD AND TRY AGAIN.",
				);
				console.error("messagePayload", messagePayload);
				ws.send("Invalid message payload type. Type check not successful!");
				ws.send(JSON.stringify(messagePayload));
				ws.close(
					1008,
					"Invalid message payload type. Type check not successful!",
				);
				break;
			}

			// PERSIST MESSAGE
			await persistMessageInDatabase(messagePayload);

			const lastMessagesFromDatabase = await retrieveLastMessageFromDatabase();

			const finalPayload = {
				...lastMessagesFromDatabase,
				payloadType: PayloadSubType.message,
			};

			server.publish("the-group-chat", JSON.stringify(finalPayload));
			break;
		}

		// PayloadSubType.clientList == 2
		case PayloadSubType.clientList: {
			const allUsers = await retrieveAllRegisteredUsersFromDatabase();
			if (allUsers === undefined || allUsers === null) {
				throw new Error("No users found");
			}

			const clientListPayload: ClientListPayload = {
				payloadType: PayloadSubType.clientList,
				// TODO validate this
				clients: allUsers as ClientEntity[],
			};

			server.publish("the-group-chat", JSON.stringify(clientListPayload));
			break;
		}

		// PayloadSubType.profileUpdate == 3
		case PayloadSubType.profileUpdate: {
			const validMessagePayload = validateclientUpdatePayload(
				payloadFromClientAsObject,
			);

			// redefine for LSP compliance
			const clientUpdatePayload: ClientUpdatePayload =
				payloadFromClientAsObject;

			if (
				!validMessagePayload ||
				clientUpdatePayload.clientDbId === "" ||
				clientUpdatePayload.clientUsername === ""
			) {
				console.error(
					"VALIDATION OF _CLIENT_UPDATE_ PAYLOAD FAILED. PLEASE CHECK THE PAYLOAD AND TRY AGAIN.",
				);
				ws.send("Invalid clientUpdatePayload type. Type check not successful!");
				ws.send(JSON.stringify(clientUpdatePayload));
				ws.close(
					1008,
					"Invalid clientUpdatePayload type. Type check not successful!",
				);
				break;
			}

			await updateClientProfileInformation(payloadFromClientAsObject);

			const allUsers = await retrieveAllRegisteredUsersFromDatabase();
			if (allUsers === undefined || allUsers === null) {
				throw new Error("No users found");
			}

			const clientListPayload: ClientListPayload = {
				payloadType: PayloadSubType.clientList,
				// TODO validate this
				clients: allUsers as ClientEntity[],
			};

			server.publish("the-group-chat", JSON.stringify(clientListPayload));

			break;
		}

		// PayloadSubType.messageList == 4
		case PayloadSubType.messageList: {
			const messageListPayload: MessageListPayload =
				await sendLast100MessagesToNewClient();
			ws.send(JSON.stringify(messageListPayload));
			break;
		}

		// PayloadSubType.typing == 5
		case PayloadSubType.typing:
		// PayloadSubType.force == 6
		case PayloadSubType.force: {
			server.publish("the-group-chat", messageAsString);
			break;
		}

		// PayloadSubType.reaction == 7
		case PayloadSubType.reaction: {
			const validatedReactionPayload = validateReactionPayload(
				payloadFromClientAsObject,
			);

			// set to object of type ReactionPayload for LSP compliance
			const reactionPayload: ReactionPayload = payloadFromClientAsObject;

			if (
				!validatedReactionPayload ||
				reactionPayload.reactionDbId === "" ||
				reactionPayload.reactionMessageId === "" ||
				reactionPayload.reactionContext === "" ||
				reactionPayload.reactionClientId === ""
			) {
				ws.send(
					"Invalid reaction payload type. Type check not successful!" +
						JSON.stringify(reactionPayload),
				);
				console.error(
					"VALIDATION OF _REACTION_ PAYLOAD FAILED. PLEASE CHECK THE PAYLOAD AND TRY AGAIN.",
				);
				ws.close(
					1008,
					"Invalid authentication payload type. Type check not successful!",
				);
				break;
			}

			await persistReactionToDatabase(payloadFromClientAsObject);
			const updatedMessage = await retrieveUpdatedMessageFromDatabase(
				payloadFromClientAsObject.reactionMessageId,
			);
			const updatedMessageWithPayloadType = {
				...updatedMessage,
				payloadType: PayloadSubType.reaction,
			};

			server.publish(
				"the-group-chat",
				JSON.stringify(updatedMessageWithPayloadType),
			);
			break;
		}

		// PayloadSubType.delete == 8
		case PayloadSubType.delete: {
			const validatedDeletePayload = validateDeletePayload(
				payloadFromClientAsObject,
			);

			if (!validatedDeletePayload) {
				ws.send(
					"Invalid delete payload type. Type check not successful!" +
						JSON.stringify(payloadFromClientAsObject),
				);
				console.error(
					"VALIDATION OF _DELETE_ PAYLOAD FAILED. PLEASE CHECK THE PAYLOAD AND TRY AGAIN.",
				);
				ws.close(
					1008,
					"Invalid delete payload type. Type check not successful!",
				);
				break;
			}

			await deleteMessageStatus(payloadFromClientAsObject);

			const updatedMessage = await retrieveUpdatedMessageFromDatabase(
				payloadFromClientAsObject.messageDbId,
			);

			const updatedMessageWithPayloadType = {
				...updatedMessage,
				payloadType: PayloadSubType.delete,
			};

			server.publish(
				"the-group-chat",
				JSON.stringify(updatedMessageWithPayloadType),
			);
			break;
		}

		// PayloadSubType.edit == 9
		case PayloadSubType.edit: {
			const validatedEditPayload = validateEditPayload(
				payloadFromClientAsObject,
			);

			if (!validatedEditPayload) {
				ws.send(
					"Invalid delete payload type. Type check not successful!" +
						JSON.stringify(payloadFromClientAsObject),
				);
				console.error(
					"VALIDATION OF _DELETE_ PAYLOAD FAILED. PLEASE CHECK THE PAYLOAD AND TRY AGAIN.",
				);
				ws.close(
					1008,
					"Invalid delete payload type. Type check not successful!",
				);
				break;
			}

			await editMessageContent(payloadFromClientAsObject);

			const updatedMessage = await retrieveUpdatedMessageFromDatabase(
				payloadFromClientAsObject.messageDbId,
			);

			const updatedMessageWithPayloadType = {
				...updatedMessage,
				payloadType: PayloadSubType.edit,
			};

			server.publish(
				"the-group-chat",
				JSON.stringify(updatedMessageWithPayloadType),
			);
			break;
		}
		case null:
		case undefined:
		default: {
			ws.send(
				"SWITCH CASES: Invalid message payload type. Type check not successful!",
			);
			console.error("switch messageType default");
			console.error("messageAsString", messageAsString);
			ws.close(
				1008,
				"Invalid message payload type. Type check not successful!",
			);
			break;
		}
	}
}
