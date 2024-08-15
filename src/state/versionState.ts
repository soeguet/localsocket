export type VersionStateType = {
	major: number;
	minor: number;
	patch: number;
};

const versionState = {
	major: 0,
	minor: 0,
	patch: 0,
};

export function setVersionState(state: VersionStateType) {
	if (state.major > versionState.major) {
		versionState.major = state.major;
	}

	if (state.minor > versionState.minor) {
		versionState.minor = state.minor;
	}

	if (state.patch > versionState.patch) {
		versionState.patch = state.patch;
	}
}

export function getVersionState() {
	return versionState;
}