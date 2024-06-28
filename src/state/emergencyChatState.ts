type EmergencyChatStateType = {
	active: boolean;
	emergencyChatId: string;
	initiatorClientDbId: string;
};
const emergencyChatState: EmergencyChatStateType = {
	active: false,
	emergencyChatId: "",
	initiatorClientDbId: "",
};

export function setEmergencyChatState(state: EmergencyChatStateType) {
	emergencyChatState.active = state.active;
	emergencyChatState.emergencyChatId = state.emergencyChatId;
	emergencyChatState.initiatorClientDbId = state.initiatorClientDbId;
}

export default emergencyChatState;
