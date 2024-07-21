import type { Server, ServerWebSocket } from "bun";
import { retrieveAllBanners } from "../databaseHandler";
import {
	PayloadSubType,
	type BannerListPayload,
	type BannerObject,
	type Priority,
} from "../../types/payloadTypes";
import { errorLogger } from "../../logger/errorLogger";

function priorityConverter(priority: number): Priority {
	switch (priority) {
		case 1:
			return 1;
		case 2:
			return 2;
		case 3:
			return 3;
		case 4:
			return 4;
		case 5:
			return 5;
		default:
			return 1;
	}
}

export async function fetchAllBannersPayloadHandler(server: Server) {
	const banners = await retrieveAllBanners();

	const bannersAsArray: BannerObject[] = [];
	for (const banner of banners) {
		bannersAsArray.push({
			id: banner.id,
			title: banner.title,
			message: banner.message,
			priority: priorityConverter(banner.priority),
			hidden: banner.hidden,
		});
	}
	if (banners === undefined || banners === null) {
		errorLogger.logError(new Error("No banners found"));
		return;
	}

	const fetchAllBannersPayload: BannerListPayload = {
		payloadType: PayloadSubType.fetchAllBanners,
		banners: bannersAsArray,
	};

	server.publish("the-group-chat", JSON.stringify(fetchAllBannersPayload));
}
