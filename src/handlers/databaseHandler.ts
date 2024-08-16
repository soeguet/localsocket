import prisma from "../db/db";
import { errorLogger } from "../logger/errorLogger";
import {
	type AuthenticationPayload,
	type ClientUpdatePayload,
	type MessageListPayload,
	type MessagePayload,
	PayloadSubType,
	type ReactionPayload,
	type DeleteEntity,
	type EditEntity,
	type EmergencyMessagePayload,
	type ProfilePictureObject,
	type BannerObject,
	type ErrorLog,
} from "../types/payloadTypes";

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
	await prisma.profilePictures.upsert({
		where: {
			clientDbId: payload.clientDbId,
		},
		update: {
			imageHash: payload.imageHash,
			data: payload.data,
		},
		create: {
			clientDbId: payload.clientDbId,
			imageHash: payload.imageHash,
			data: payload.data,
		},
	});
}

export async function fetchAllProfilePictureHashes() {
	return prisma.profilePictures.findMany({
		select: {
			clientDbId: true,
			imageHash: true,
		},
	});
}

export async function persistBanner(payload: BannerObject) {
	await prisma.banners.create({
		data: {
			id: payload.id,
			title: payload.title,
			message: payload.message,
			priority: payload.priority,
			hidden: payload.hidden,
		},
	});
}

export async function deleteExistingBanner(id: string) {
	await prisma.banners.delete({
		where: {
			id: id,
		},
	});
}

export async function updateExistingBanner(payload: BannerObject) {
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
}

export async function retrieveAllBanners() {
	return prisma.banners.findMany();
}

export async function persistProfilePictureHashForClient(
	clientDbId: string,
	imageHash: string
) {
	await prisma.client.update({
		where: {
			clientDbId: clientDbId,
		},
		data: {
			clientProfileImage: imageHash,
		},
	});
}

export async function fetchProfilePicture(clientDbId: string) {
	return prisma.profilePictures.findFirst({
		where: {
			clientDbId: clientDbId,
		},
	});
}

export async function fetchAllProfilePictures() {
	return prisma.profilePictures.findMany();
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
		await errorLogger.logError(error);
	}
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
		await errorLogger.logError(error);
		return;
	}
}

export async function registerUserInDatabse(payload: AuthenticationPayload) {
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
		await errorLogger.logError(error);
	}
}

export async function retrieveAllRegisteredUsersFromDatabase() {
	return prisma.client.findMany();
}
export async function editMessageContent(payload: EditEntity) {
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
}

export async function deleteMessageStatus(payload: DeleteEntity) {
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
}

export async function persistReactionToDatabase(payload: ReactionPayload) {
	await prisma.reactionType.create({
		data: {
			reactionDbId: payload.reactionDbId,
			reactionMessageId: payload.reactionMessageId,
			reactionContext: payload.reactionContext,
			reactionClientId: payload.reactionClientId,
		},
	});
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
		payloadType: PayloadSubType.messageList,
		messageList: messageList,
	} as MessageListPayload;
}

export async function updateClientProfileInformation(
	payload: ClientUpdatePayload
) {
	await prisma.client.upsert({
		where: { clientDbId: payload.clientDbId },
		update: {
			clientUsername: payload.clientUsername,
			clientProfileImage: payload.clientProfileImage,
			clientColor: payload.clientColor,
			availability: payload.availability,
		},
		create: {
			clientDbId: payload.clientDbId,
			clientUsername: payload.clientUsername,
			clientProfileImage: payload.clientProfileImage,
			clientColor: payload.clientColor,
			availability: payload.availability,
		},
	});
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
					quoteMessageContext: payload.quoteType?.quoteMessageContext,
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

