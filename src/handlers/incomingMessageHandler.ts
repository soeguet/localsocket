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
	type SimplePayload,
	type EditEntity,
	type EmergencyMessagePayload,
	type EmergencyInitPayload,
	type AllEmergencyMessagesPayload,
	type EmergencyMessage,
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
	persistEmergencyMessage,
	retrieveLastEmergencyMessage,
	retrieveAllEmergencyMessages,
} from "./databaseHandler";
import {
	validateAuthPayload,
	validateMessagePayload,
	validateclientUpdatePayload,
	validateReactionPayload,
	validateDeletePayload,
	validateEditPayload,
	validateEmergencyMessagePayload,
	validateEmergencyInitPayload,
} from "./typeHandler";
import emergencyChatState from "../state/emergencyChatState";

function validateSimplePayload(payload: unknown): payload is SimplePayload {
	return (payload as SimplePayload).payloadType !== undefined;
}

export async function processIncomingMessage(
	ws: ServerWebSocket<WebSocket>,
	server: Server,
	message: string | Buffer
) {
	// some random checks on message & database
	const messageAsString = checkForDatabaseErrors(message) as string;

	let payloadFromClientAsObject: unknown;

	try {
		payloadFromClientAsObject = JSON.parse(messageAsString);
	} catch (error) {
		console.error(
			"Error parsing message from client. Please check the message and try again. Probably not a JSON object.",
			error
		);
		ws.send(
			"Error parsing message from client. Please check the message and try again. Probably not a JSON object."
		);
		ws.close(1008, "Error parsing message from client.");
		return;
	}

	if (!validateSimplePayload(payloadFromClientAsObject)) {
		return;
	}

	// switch part
	switch (payloadFromClientAsObject.payloadType) {
		// PayloadSubType.auth == 0
		case PayloadSubType.auth: {
			//
			const validAuthPayload = validateAuthPayload(
				payloadFromClientAsObject
			);

			if (!validAuthPayload) {
				ws.send(
					"Invalid authentication payload type. Type check not successful!"
				);
				console.error(
					"VALIDATION OF _AUTH_ PAYLOAD FAILED. PLEASE CHECK THE PAYLOAD AND TRY AGAIN."
				);
				ws.close(
					1008,
					"Invalid authentication payload type. Type check not successful!"
				);
				break;
			}

			try {
				await registerUserInDatabse(
					payloadFromClientAsObject as AuthenticationPayload
				);
			} catch (error) {
				console.error("Error registering user in database", error);
				return;
			}

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
				payloadFromClientAsObject
			);

			if (!validMessagePayload) {
				console.error(
					"VALIDATION OF _MESSAGE_ PAYLOAD FAILED. PLEASE CHECK THE PAYLOAD AND TRY AGAIN."
				);
				console.error(
					"payloadFromClientAsObject",
					payloadFromClientAsObject
				);
				ws.send(
					"Invalid message payload type. Type check not successful!"
				);
				ws.send(JSON.stringify(payloadFromClientAsObject));
				ws.close(
					1008,
					"Invalid message payload type. Type check not successful!"
				);
				break;
			}

			try {
				// PERSIST MESSAGE
				await persistMessageInDatabase(
					payloadFromClientAsObject as MessagePayload
				);
			} catch (error) {
				console.error("Error persisting message to database", error);
				return;
			}

			const lastMessagesFromDatabase =
				await retrieveLastMessageFromDatabase();

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
				payloadFromClientAsObject
			);

			if (!validMessagePayload) {
				console.error(
					"VALIDATION OF _CLIENT_UPDATE_ PAYLOAD FAILED. PLEASE CHECK THE PAYLOAD AND TRY AGAIN."
				);
				ws.send(
					"Invalid clientUpdatePayload type. Type check not successful!"
				);
				ws.send(JSON.stringify(payloadFromClientAsObject));
				ws.close(
					1008,
					"Invalid clientUpdatePayload type. Type check not successful!"
				);
				break;
			}

			const payload = payloadFromClientAsObject as ClientUpdatePayload;

			try {
				await updateClientProfileInformation(payload);
			} catch (error) {
				console.error(
					"Error updating client profile information",
					error
				);
				return;
			}

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

			//
			// also send information about active emergency chats
			const emergencyChat: EmergencyInitPayload = {
				payloadType: PayloadSubType.emergencyInit,
				...emergencyChatState,
			};
			ws.send(JSON.stringify(emergencyChat));

			// additionally send out all messages for this emergency chat to all clients
			if (!emergencyChat.active) {
				break;
			}

			const allEmergencyMessages: EmergencyMessage[] =
				await retrieveAllEmergencyMessages(
					emergencyChat.emergencyChatId
				);
			const allEmergencyMessagesWithPayloadType: AllEmergencyMessagesPayload =
				{
					payloadType: PayloadSubType.allEmergencyMessages,
					emergencyMessages: allEmergencyMessages,
					emergencyChatId: emergencyChat.emergencyChatId,
				};
			ws.send(JSON.stringify(allEmergencyMessagesWithPayloadType));

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
				payloadFromClientAsObject
			);

			if (!validatedReactionPayload) {
				ws.send(
					`Invalid reaction payload type. Type check not successful!${JSON.stringify(
						payloadFromClientAsObject
					)}`
				);
				console.error(
					"VALIDATION OF _REACTION_ PAYLOAD FAILED. PLEASE CHECK THE PAYLOAD AND TRY AGAIN."
				);
				ws.close(
					1008,
					"Invalid authentication payload type. Type check not successful!"
				);
				break;
			}

			const payload = payloadFromClientAsObject as ReactionPayload;

			try {
				await persistReactionToDatabase(payload);
			} catch (error) {
				console.error("Error persisting reaction to database", error);
				return;
			}

			const updatedMessage = await retrieveUpdatedMessageFromDatabase(
				(payloadFromClientAsObject as ReactionPayload).reactionMessageId
			);
			const updatedMessageWithPayloadType = {
				...updatedMessage,
				payloadType: PayloadSubType.reaction,
			};

			server.publish(
				"the-group-chat",
				JSON.stringify(updatedMessageWithPayloadType)
			);
			break;
		}

		// PayloadSubType.delete == 8
		case PayloadSubType.delete: {
			const validatedDeletePayload = validateDeletePayload(
				payloadFromClientAsObject
			);

			if (!validatedDeletePayload) {
				ws.send(
					`Invalid delete payload type. Type check not successful!${JSON.stringify(
						payloadFromClientAsObject
					)}`
				);
				console.error(
					"VALIDATION OF _DELETE_ PAYLOAD FAILED. PLEASE CHECK THE PAYLOAD AND TRY AGAIN."
				);
				ws.close(
					1008,
					"Invalid delete payload type. Type check not successful!"
				);
				break;
			}

			try {
				await deleteMessageStatus(
					payloadFromClientAsObject as DeleteEntity
				);
			} catch (error) {
				console.error("Error deleting message status", error);
				return;
			}

			const updatedMessage = await retrieveUpdatedMessageFromDatabase(
				(payloadFromClientAsObject as DeleteEntity).messageDbId
			);

			const updatedMessageWithPayloadType = {
				...updatedMessage,
				payloadType: PayloadSubType.delete,
			};

			server.publish(
				"the-group-chat",
				JSON.stringify(updatedMessageWithPayloadType)
			);
			break;
		}

		// PayloadSubType.edit == 9
		case PayloadSubType.edit: {
			const validatedEditPayload = validateEditPayload(
				payloadFromClientAsObject
			);

			if (!validatedEditPayload) {
				ws.send(
					`Invalid delete payload type. Type check not successful!${JSON.stringify(
						payloadFromClientAsObject
					)}`
				);
				console.error(
					"VALIDATION OF _DELETE_ PAYLOAD FAILED. PLEASE CHECK THE PAYLOAD AND TRY AGAIN."
				);
				ws.close(
					1008,
					"Invalid delete payload type. Type check not successful!"
				);
				break;
			}

			try {
				await editMessageContent(
					payloadFromClientAsObject as EditEntity
				);
			} catch (error) {
				console.error("Error editing message content", error);
				return;
			}

			const updatedMessage = await retrieveUpdatedMessageFromDatabase(
				(payloadFromClientAsObject as EditEntity).messageDbId
			);

			const updatedMessageWithPayloadType = {
				...updatedMessage,
				payloadType: PayloadSubType.edit,
			};

			server.publish(
				"the-group-chat",
				JSON.stringify(updatedMessageWithPayloadType)
			);
			break;
		}

		// PayloadSubType.emergencyInit == 10
		case PayloadSubType.emergencyInit: {
			const validatedEmergencyInitPayload = validateEmergencyInitPayload(
				payloadFromClientAsObject
			);

			if (!validatedEmergencyInitPayload) {
				ws.send(
					`Invalid emergency_init payload type. Type check not successful!${JSON.stringify(
						payloadFromClientAsObject
					)}`
				);
				console.error(
					"VALIDATION OF _EMERGENCY_INIT_ PAYLOAD FAILED. PLEASE CHECK THE PAYLOAD AND TRY AGAIN."
				);
				ws.close(
					1008,
					"Invalid emergency_init payload type. Type check not successful!"
				);
				break;
			}

			const payload = payloadFromClientAsObject as EmergencyInitPayload;

			// emergency chat mode
			// 1) deactive it
			// 2) activate - if not active
			// 3) activate -> ignore if already active
			if (!payload.active) {
				// 1)
				emergencyChatState.active = payload.active;
				emergencyChatState.emergencyChatId = payload.emergencyChatId;
				emergencyChatState.initiatorClientDbId =
					payload.initiatorClientDbId;

				server.publish("the-group-chat", message);
				return;
			} else if (payload.active && !emergencyChatState.active) {
				// 2)
				emergencyChatState.active = payload.active;
				emergencyChatState.emergencyChatId = payload.emergencyChatId;
				emergencyChatState.initiatorClientDbId =
					payload.initiatorClientDbId;
				server.publish("the-group-chat", message);
				return;
			} else {
				// 3)
				const alreadyActiveEmergencyChat = {
					...emergencyChatState,
					payloadType: PayloadSubType.emergencyInit,
				};
				server.publish(
					"the-group-chat",
					JSON.stringify(alreadyActiveEmergencyChat)
				);

				// TODO send out all messages for this emergency chat to all clients
				const allExistingEmergencyMessages: EmergencyMessage[] =
					await retrieveAllEmergencyMessages(
						alreadyActiveEmergencyChat.emergencyChatId
					);
				const allExistingEmergencyMessagesWithPayloadType: AllEmergencyMessagesPayload =
					{
						emergencyMessages: allExistingEmergencyMessages,
						payloadType: PayloadSubType.allEmergencyMessages,
						emergencyChatId:
							alreadyActiveEmergencyChat.emergencyChatId,
					};
				ws.send(
					JSON.stringify(allExistingEmergencyMessagesWithPayloadType)
				);
			}
			break;
		}

		// PayloadSubType.emergencyMessage == 11
		case PayloadSubType.emergencyMessage: {
			const validatedEmergencyPayload = validateEmergencyMessagePayload(
				payloadFromClientAsObject
			);
			if (!validatedEmergencyPayload) {
				ws.send(
					`Invalid emergency payload type. Type check not successful!${JSON.stringify(
						payloadFromClientAsObject
					)}`
				);
				console.error(
					"VALIDATION OF _EMERGENCY_MESSAGE_ PAYLOAD FAILED. PLEASE CHECK THE PAYLOAD AND TRY AGAIN."
				);
				ws.close(
					1008,
					"Invalid emergency payload type. Type check not successful!"
				);
				break;
			}

			const payload =
				payloadFromClientAsObject as EmergencyMessagePayload;

			try {
				await persistEmergencyMessage(payload);
			} catch (error) {
				console.error("Error persisting emergency message", error);
				return;
			}

			let lastEmergencyMessage;
			try {
				lastEmergencyMessage = await retrieveLastEmergencyMessage(
					payload.messageDbId
				);
			} catch (error) {
				console.error("Error retrieving last emergency message", error);
				return;
			}

			if (
				lastEmergencyMessage === undefined ||
				lastEmergencyMessage === null
			) {
				console.error("lastEmergencyMessage is undefined or null");
				return;
			}

			const updatedMessageWithPayloadType = {
				...lastEmergencyMessage,
				payloadType: PayloadSubType.emergencyMessage,
			};

			server.publish(
				"the-group-chat",
				JSON.stringify(updatedMessageWithPayloadType)
			);
			break;
		}

		default: {
			ws.send(
				"SWITCH CASES: Invalid message payload type. Type check not successful!"
			);
			console.error("switch messageType default");
			console.error("messageAsString", messageAsString);
			ws.close(
				1008,
				"Invalid message payload type. Type check not successful!"
			);
			break;
		}
	}
}
