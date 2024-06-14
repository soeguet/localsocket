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
	"testValidator",
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
			},
			clientDbId: {
				type: "string",
			},
		},
		required: ["payloadType", "clientUsername", "clientDbId"],
		additionalProperties: false,
	},
	"authPayloadValidator",
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
					},
					messageDate: {
						type: "string",
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
					},
					type: {
						type: "string",
					},
					data: {
						type: "string",
					},
				},
				required: ["imageDbId", "type", "data"],
				additionalProperties: false,
			},
		},
		required: ["payloadType", "clientType", "messageType"],
		additionalProperties: false,
		nullable: true,
	},
	"messagePayloadValidator",
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
 * @param {boolean} availability
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
			availability: {
				type: "boolean",
			},
		},
		required: [
			"payloadType",
			"reactionDbId",
			"reactionMessageId",
			"reactionContext",
			"reactionClientId",
			"availability",
		],
		additionalProperties: false,
	},
	"reactionPayloadValidator",
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
			},
		},
		required: ["payloadType", "messageDbId"],
		additionalProperties: false,
	},
	"deletePayloadValidator",
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
			},
			messageContext: {
				type: "string",
			},
		},
		required: ["payloadType", "messageDbId", "messageContext"],
		additionalProperties: false,
	},
	"editPayloadValidator",
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
			},
			clientUsername: {
				type: "string",
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
		required: ["payloadType", "clientDbId", "clientUsername", "availability"],
		additionalProperties: false,
	},
	"profileUpdateValidator",
);

export default ajvValidator;
