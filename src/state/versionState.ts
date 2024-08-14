export type VersionStateType = {
	major: number;
	minor: number;
	patch: number;
	updateAvailable?: boolean;
};

let versionState = {
	major: 0,
	minor: 0,
	patch: 0,
	updateAvailable: false,
};

export function setUpdateAvailable(state: boolean) {
	versionState = {
		...versionState,
		updateAvailable: state,
	};
}

export function setVersionState(state: VersionStateType) {
	versionState = {
		...versionState,
		...state,
	};
}

export function getVersionState() {
	return versionState;
}
