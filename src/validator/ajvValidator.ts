import Ajv from "ajv";

const ajvValidator = new Ajv();

ajvValidator.addSchema(
	{
		type: "object",
		properties: {
			message: {
				type: "string",
			},
			quote: {
				type: "boolean",
			},
		},
		required: ["message"],
		additionalProperties: false,
	},
	"testValidator"
);

ajvValidator.addSchema(
	{
		type: "object",
		properties: {
			title: { type: "string", minLength: 1 },
			message: { type: "string", minLength: 1 },
			stack: { type: "string", minLength: 1 },
			time: { type: "string", minLength: 1 },
			clientDbId: { type: "string", minLength: 1 },
			clientUsername: { type: "string", minLength: 1 },
		},
		required: [
			"title",
			"message",
			"stack",
			"time",
			"clientDbId",
			"clientUsername",
		],
		additionalProperties: false,
	},
	"errorLogValidator"
);

ajvValidator.addSchema(
	{
		type: "object",
		properties: {
			payloadType: { type: "number" },
			banner: {
				type: "object",
				properties: {
					id: { type: "string", minLength: 1 },
					title: { type: "string", minLength: 1 },
					message: { type: "string", minLength: 1 },
					priority: { type: "number" },
					hidden: { type: "boolean" },
				},
				required: ["id", "title", "message", "priority", "hidden"],
				additionalProperties: false,
			},
			action: { type: "string", minLength: 1 },
		},
		required: ["payloadType", "banner", "action"],
		additionalProperties: false,
	},
	"bannerPayloadValidator"
);

ajvValidator.addSchema(
	{
		type: "object",
		properties: {
			payloadType: { type: "number" },
			banners: {
				type: ["array", "null"],
				items: {
					type: "object",
					properties: {
						id: { type: "string", minLength: 1 },
						title: { type: "string", minLength: 1 },
						message: { type: "string", minLength: 1 },
						priority: { type: "number" },
						hidden: { type: "boolean" },
					},
					required: ["id", "title", "message", "priority", "hidden"],
					additionalProperties: false,
				},
			},
		},
		required: ["payloadType"],
		additionalProperties: false,
	},
	"bannerListPayloadValidator"
);

ajvValidator.addSchema(
	{
		type: "object",
		properties: {
			payloadType: { type: "number" },
			clientDbId: { type: "string", minLength: 1 },
			imageHash: { type: "string", minLength: 1 },
			data: { type: "string", minLength: 1 },
		},
		required: ["payloadType", "clientDbId", "imageHash", "data"],
		additionalProperties: false,
	},
	"newProfilePictureValidator"
);

ajvValidator.addSchema(
	{
		type: "object",
		properties: {
			payloadType: { type: "number" },
			clientDbId: { type: "string", minLength: 1 },
		},
		required: ["payloadType", "clientDbId"],
		additionalProperties: false,
	},
	"fetchProfilePictureValidator"
);

ajvValidator.addSchema(
	{
		type: "object",
		properties: {
			payloadType: { type: "number" },
			clientDbId: { type: "string", minLength: 1 },
		},
		required: ["payloadType", "clientDbId"],
		additionalProperties: false,
	},
	"fetchCurrentClientProfilePictureHashValidator"
);

ajvValidator.addSchema(
	{
		type: "object",
		properties: {
			payloadType: { type: "number" },
		},
		required: ["payloadType"],
		additionalProperties: false,
	},
	"fetchAllProfilePicturesValidator"
);

ajvValidator.addSchema(
	{
		type: "object",
		properties: {
			payloadType: {
				type: "number",
			},
			emergencyChatId: {
				type: "string",
				minLength: 1,
			},
			messageDbId: {
				type: "string",
				minLength: 1,
			},
			clientDbId: {
				type: "string",
				minLength: 1,
			},
			time: {
				type: "string",
				minLength: 1,
			},
			message: {
				type: "string",
				minLength: 1,
			},
		},
		required: [
			"payloadType",
			"messageDbId",
			"emergencyChatId",
			"clientDbId",
			"time",
			"message",
		],
		additionalProperties: false,
	},
	"emergencyMessagePayloadValidator"
);

// export type EmergencyInitPayload = {
// 	payloadType: PayloadSubType.emergencyInit;
// 	active: boolean;
// 	emergencyChatId: string;
// 	initiatorClientDbId: string;
// };
//
// NO LENGTH CHECK SINCE THE STRINGS CAN BE EMPTY FOR DISABLED EMERGENCY CHATS
ajvValidator.addSchema(
	{
		type: "object",
		properties: {
			payloadType: {
				type: "number",
			},
			active: {
				type: "boolean",
			},
			emergencyChatId: {
				type: "string",
			},
			initiatorClientDbId: {
				type: "string",
			},
		},
		required: [
			"payloadType",
			"active",
			"emergencyChatId",
			"initiatorClientDbId",
		],
		additionalProperties: false,
	},
	"emergencyInitPayloadValidator"
);

ajvValidator.addSchema(
	{
		type: "object",
		properties: {
			payloadType: {
				type: "number",
			},
			clientUsername: {
				type: "string",
				minLength: 1,
			},
			clientDbId: {
				type: "string",
				minLength: 1,
			},
		},
		required: ["payloadType", "clientUsername", "clientDbId"],
		additionalProperties: false,
	},
	"authPayloadValidator"
);

/**
 * export type MessagePayload = {
 *      payloadType: PayloadSubType.message;
 *      messageType: {
 *          messageDbId: string;
 *          deleted: false;
 *          edited: false;
 *          messageContext: string;
 *          messageTime: string;
 *          messageDate: Date;
 *      };
 *      clientType: {
 *          clientDbId: string;
 *      };
 *      quoteType?: {
 *          quoteMessageId: string;
 *          quoteClientId: string;
 *          quoteMessageContext: string;
 *          quoteTime: string;
 *          quoteDate: Date;
 *      };
 *      reactionType?: {
 *          reactionMessageId: string;
 *          reactionContext: string;
 *          reactionClientId: string;
 *      }[];
 *      imageType?: {
 *      	imageDbId: string;
 *      	type: string;
 *      	data: string;
 *      };
 *    };
 */
ajvValidator.addSchema(
	{
		type: "object",
		properties: {
			payloadType: {
				type: "number",
			},
			messageType: {
				type: "object",
				properties: {
					messageDbId: {
						type: "string",
						minLength: 1,
					},
					deleted: {
						type: "boolean",
					},
					edited: {
						type: "boolean",
					},
					messageContext: {
						type: "string",
					},
					messageTime: {
						type: "string",
						minLength: 1,
					},
					messageDate: {
						type: "string",
						minLength: 1,
					},
				},
				required: [
					"messageDbId",
					"deleted",
					"edited",
					"messageContext",
					"messageTime",
					"messageDate",
				],
				additionalProperties: false,
			},
			clientType: {
				type: "object",
				properties: {
					clientDbId: {
						type: "string",
						minLength: 1,
					},
				},
				required: ["clientDbId"],
				additionalProperties: false,
			},
			quoteType: {
				type: ["object", "null"],
				properties: {
					quoteDbId: {
						type: "string",
					},
					quoteClientId: {
						type: "string",
					},
					quoteMessageContext: {
						type: "string",
					},
					quoteTime: {
						type: "string",
					},
					quoteDate: {
						type: "string",
					},
				},
				required: [
					"quoteDbId",
					"quoteClientId",
					"quoteMessageContext",
					"quoteTime",
					"quoteDate",
				],
				additionalProperties: false,
			},
			reactionType: {
				type: ["array", "null"],
				items: {
					type: "object",
					properties: {
						reactionDbId: {
							type: "string",
						},
						reactionMessageId: {
							type: "string",
						},
						reactionContext: {
							type: "string",
						},
						reactionClientId: {
							type: "string",
						},
					},
					required: [
						"reactionDbId",
						"reactionMessageId",
						"reactionContext",
						"reactionClientId",
					],
					additionalProperties: false,
				},
			},
			imageType: {
				type: ["object", "null"],
				properties: {
					imageDbId: {
						type: "string",
						minLength: 1,
					},
					type: {
						type: "string",
						minLength: 1,
					},
					data: {
						type: "string",
						minLength: 1,
					},
				},
				required: ["imageDbId", "type", "data"],
				additionalProperties: false,
			},
		},
		required: ["payloadType", "clientType", "messageType"],
		additionalProperties: false,
	},
	"messagePayloadValidator"
);

/**
 * [[ RESULTING TYPE ]]
 *  export type ReactionEntity = {
 *     payloadType: PayloadSubType.reaction;
 *     reactionDbId: string;
 *     reactionMessageId: string;
 *     reactionContext: string;
 *     reactionClientId: string;
 *  };
 *
 * @param {int} payloadType
 * @param {string} reactionDbId
 * @param {string} reactionMessageId
 * @param {string} reactionContext
 * @param {string} reactionClientId
 */
ajvValidator.addSchema(
	{
		type: "object",
		properties: {
			payloadType: {
				type: "number",
			},
			reactionDbId: {
				type: "string",
				minLength: 1,
			},
			reactionMessageId: {
				type: "string",
				minLength: 1,
			},
			reactionContext: {
				type: "string",
				minLength: 1,
			},
			reactionClientId: {
				type: "string",
				minLength: 1,
			},
		},
		required: [
			"payloadType",
			"reactionDbId",
			"reactionMessageId",
			"reactionContext",
			"reactionClientId",
		],
		additionalProperties: false,
	},
	"reactionPayloadValidator"
);

/**
 * [[ RESULTING TYPE ]]
 *  export type DeleteEntity = {
 *     payloadType: PayloadSubType.reaction;
 *     messageDbId: string;
 *  };
 *
 * @param {int} payloadType
 * @param {string} messageDbId
 */
ajvValidator.addSchema(
	{
		type: "object",
		properties: {
			payloadType: {
				type: "number",
			},
			messageDbId: {
				type: "string",
				minLength: 1,
			},
		},
		required: ["payloadType", "messageDbId"],
		additionalProperties: false,
	},
	"deletePayloadValidator"
);

/**
 * [[ RESULTING TYPE ]]
 *  export type EditEntity = {
 *     payloadType: PayloadSubType.reaction;
 *     messageDbId: string;
 *  };
 *
 * @param {int} payloadType
 * @param {string} messageDbId
 */
ajvValidator.addSchema(
	{
		type: "object",
		properties: {
			payloadType: {
				type: "number",
			},
			messageDbId: {
				type: "string",
				minLength: 1,
			},
			messageContext: {
				type: "string",
				minLength: 1,
			},
		},
		required: ["payloadType", "messageDbId", "messageContext"],
		additionalProperties: false,
	},
	"editPayloadValidator"
);

ajvValidator.addSchema(
	{
		type: "object",
		properties: {
			payloadType: {
				type: "number",
			},
			clientDbId: {
				type: "string",
				minLength: 1,
			},
			clientUsername: {
				type: "string",
				minLength: 1,
			},
			clientColor: {
				type: "string",
			},
			clientProfileImage: {
				type: "string",
			},
			availability: {
				type: "boolean",
			},
		},
		required: [
			"payloadType",
			"clientDbId",
			"clientUsername",
			"availability",
		],
		additionalProperties: false,
	},
	"profileUpdateValidator"
);

export default ajvValidator;
