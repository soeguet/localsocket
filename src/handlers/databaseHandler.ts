import prisma from "../db/db";
import { errorLogger } from "../logger/errorLogger";
import {
	type AuthenticationPayload,
	type BannerObject,
	type ClientUpdatePayloadV2,
	type DeleteEntity,
	type EditEntity,
	type EmergencyMessagePayload,
	type MessageListPayload,
	type MessagePayload,
	PayloadSubTypeEnum,
	type ProfilePictureObject,
	type ReactionPayload,
} from "../types/payloadTypes";
import type { ErrorLog } from "@prisma/client";

export async function checkForDatabaseErrors(message: string) {
	// check for null values
	if (prisma === undefined || prisma === null) {
		errorLogger.logError(new Error("Database not found"));
	}
	if (message === "" || message === undefined) {
		errorLogger.logError(new Error("Invalid message type"));
	}
	return message;
}

export async function persistErrorLogInDatabase(errorLog: ErrorLog) {
	await prisma.errorLog.create({
		data: {
			message: errorLog.message,
			title: errorLog.title,
			stack: errorLog.stack,
			time: errorLog.time,
			clientDbId: errorLog.clientDbId,
			clientUsername: errorLog.clientUsername,
		},
	});
}

export async function persistProfilePicture(payload: ProfilePictureObject) {

	const existingRecord = await prisma.pictures.findUnique({
		where: {
			imageHash: payload.imageHash,
		},
	});

	if (!existingRecord) {
		await prisma.pictures.create({
			data: {
				imageHash: payload.imageHash,
				data: payload.data,
			},
		});
		return;
	}
}

// TODO this needs to be changed/updated
export async function fetchAllProfilePictureHashes() {
	try {
		return prisma.client.findMany({
			select: {
				clientProfilePictureHash: true,
				clientDbId: true
			},
		});
	} catch (error) {
		errorLogger.logError(error);
		return null;
	}
}

export async function persistBanner(payload: BannerObject) {
	try {
		await prisma.banners.create({
			data: {
				id: payload.id,
				title: payload.title,
				message: payload.message,
				priority: payload.priority,
				hidden: payload.hidden,
			},
		});
	} catch (error) {
		errorLogger.logError(error);
		return;
	}
}

export async function deleteExistingBanner(id: string) {
	try {
		await prisma.banners.delete({
			where: {
				id: id,
			},
		});
	} catch (e) {
		errorLogger.logError(e);
		return null;
	}
}

export async function updateExistingBanner(payload: BannerObject) {
	try {
		await prisma.banners.update({
			where: {
				id: payload.id,
			},
			data: {
				title: payload.title,
				message: payload.message,
				priority: payload.priority,
				hidden: payload.hidden,
			},
		});
	} catch (error) {
		errorLogger.logError(error);
		return;
	}
}

export async function retrieveAllBanners() {
	return prisma.banners.findMany();
}

export async function persistPictureHashForClient(
	clientDbId: string,
	imageHash: string
) {
	try {
		await prisma.client.update({
			where: {
				clientDbId: clientDbId,
			},
			data: {
				clientProfilePictureHash: imageHash,
			},
		});
	} catch (error) {
		errorLogger.logError(error);
		return;
	}
}

export async function fetchPictureByHash(imageHash: string) {
	try {
		return prisma.pictures.findFirst({
			where: {
				imageHash: imageHash
			},
		});
	} catch (error) {
		errorLogger.logError(error);
		return null;
	}
}

export async function fetchAllPictures() {
	try {
		return prisma.pictures.findMany();
	} catch (error) {
		errorLogger.logError(error);
		return null;
	}
}

export async function persistEmergencyMessage(
	payload: EmergencyMessagePayload
) {
	try {
		await prisma.emergencyMessages.create({
			data: {
				emergencyChatId: payload.emergencyChatId,
				messageDbId: payload.messageDbId,
				clientDbId: payload.clientDbId,
				time: payload.time,
				message: payload.message,
			},
		});
	} catch (error) {
		errorLogger.logError(error);
		return false;
	}

	return true;
}

export async function retrieveLastEmergencyMessage(messageDbId: string) {
	try {
		return prisma.emergencyMessages.findFirst({
			// take: -1,
			// orderBy: {
			// 	messageDbId: "asc",
			// },
			where: {
				messageDbId: messageDbId,
			},
		});
	} catch (error) {
		errorLogger.logError(error);
		return null;
	}
}

export async function registerUserInDatabase(payload: AuthenticationPayload) {
	try {
		await prisma.client.upsert({
			where: {
				clientDbId: payload.clientDbId,
			},
			update: {},
			create: {
				clientDbId: payload.clientDbId,
				clientUsername: payload.clientUsername,
			},
		});
	} catch (error) {
		errorLogger.logError(error);
	}
}

export async function retrieveAllRegisteredUsersFromDatabase() {
	return prisma.client.findMany();
}

export async function editMessageContent(payload: EditEntity) {
	try {
		await prisma.messagePayload.update({
			where: {
				messagePayloadDbId: payload.messageDbId,
			},
			data: {
				messageType: {
					update: {
						edited: true,
						messageContext: payload.messageContext,
					},
				},
			},
		});
	} catch (error) {
		errorLogger.logError(error);
		return false;
	}
	return true;
}

export async function deleteMessageStatus(payload: DeleteEntity) {
	try {
		await prisma.messagePayload.update({
			where: {
				messagePayloadDbId: payload.messageDbId,
			},
			data: {
				messageType: {
					update: {
						deleted: true,
					},
				},
			},
		});

		return true;
	} catch (error) {
		errorLogger.logError(error);
		return false;
	}
}

export async function persistReactionToDatabase(payload: ReactionPayload) {
	try {
		await prisma.reactionType.create({
			data: {
				reactionDbId: payload.reactionDbId,
				reactionMessageId: payload.reactionMessageId,
				reactionContext: payload.reactionContext,
				reactionClientId: payload.reactionClientId,
			},
		});
	} catch (error) {
		errorLogger.logError(error);
		return null;
	}
}

export async function sendLast100MessagesToNewClient() {
	// grab all messages
	const messageList = await prisma.messagePayload.findMany({
		take: -100,
		orderBy: {
			messagePayloadDbId: "asc",
		},
		select: {
			messageType: true,
			quoteType: true,
			reactionType: true,
			clientType: {
				select: {
					clientDbId: true,
				},
			},
			imageType: true,
		},
	});
	return {
		payloadType: PayloadSubTypeEnum.enum.messageList,
		messageList: messageList,
	} as MessageListPayload;
}

export async function updateClientProfileInformation(
	payload: ClientUpdatePayloadV2
) {
	try {
		await prisma.client.upsert({
			where: { clientDbId: payload.clientDbId },
			update: {
				clientUsername: payload.clientUsername,
				clientProfilePictureHash: payload.clientProfilePictureHash,
				clientColor: payload.clientColor,
				availability: payload.availability,
			},
			create: {
				clientDbId: payload.clientDbId,
				clientUsername: payload.clientUsername,
				clientProfilePictureHash: payload.clientProfilePictureHash,
				clientColor: payload.clientColor,
				availability: payload.availability,
			},
		});
	} catch (error) {
		errorLogger.logError(error);
		return;
	}
}

export async function retrieveLastMessageFromDatabase() {
	return prisma.messagePayload.findFirst({
		take: -1,
		orderBy: {
			messagePayloadDbId: "asc",
		},
		select: {
			messageType: true,
			quoteType: true,
			reactionType: true,
			clientType: {
				select: {
					clientDbId: true,
				},
			},
			imageType: true,
		},
	});
}

export async function persistMessageInDatabase(payload: MessagePayload) {
	try {
		await prisma.messagePayload.create({
			data: {
				messagePayloadDbId: payload.messageType.messageDbId,
				messageType: {
					create: {
						messageContext: payload.messageType.messageContext,
						messageTime: payload.messageType.messageTime,
						messageDate: payload.messageType.messageDate,
						deleted: payload.messageType.deleted,
						edited: payload.messageType.edited,
					},
				},
				clientType: {
					connect: {
						clientDbId: payload.clientType.clientDbId,
					},
				},
				quoteType: {
					create: {
						quoteClientId: payload.quoteType?.quoteClientId,
						quoteDate: payload.quoteType?.quoteDate,
						quoteMessageContext:
							payload.quoteType?.quoteMessageContext,
						quoteTime: payload.quoteType?.quoteTime,
					},
				},
				imageType: {
					create: {
						data: payload.imageType?.data,
						type: payload.imageType?.type,
					},
				},
			},
		});
	} catch (error) {
		errorLogger.logError(error);
		return null;
	}
}

export async function retrieveUpdatedMessageFromDatabase(messageDbId: string) {
	return prisma.messagePayload.findFirst({
		where: {
			messagePayloadDbId: messageDbId,
		},
		select: {
			messageType: true,
			quoteType: true,
			reactionType: true,
			clientType: {
				select: {
					clientDbId: true,
				},
			},
			imageType: true,
		},
	});
}

export async function retrieveAllEmergencyMessages(emergencyChatId: string) {
	return prisma.emergencyMessages.findMany({
		where: {
			emergencyChatId: emergencyChatId,
		},
		select: {
			messageDbId: true,
			clientDbId: true,
			emergencyChatId: true,
			time: true,
			message: true,
		},
	});
}