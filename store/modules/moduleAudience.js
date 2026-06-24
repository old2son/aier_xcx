export function normalizeAudienceItem(item = {}) {
	return {
		...item,
		id: item.id || '',
		userName: item.userName || item.name || '',
		userPhone: item.userPhone || '',
		userAge: item.userAge ?? '',
		idNumber: item.idNumber || '',
		documentType: item.documentType || ''
	};
}

export function normalizeAudienceList(list = []) {
	return Array.isArray(list) ? list.map((item) => normalizeAudienceItem(item)) : [];
}

export default {
	namespaced: true,

	state: {
		selectedAudienceList: []
	},

	getters: {
		selectedAudienceList(state) {
			return state.selectedAudienceList;
		}
	},

	mutations: {
		setSelectedAudienceList(state, list) {
			state.selectedAudienceList = normalizeAudienceList(list);
		},

		clearSelectedAudienceList(state) {
			state.selectedAudienceList = [];
		}
	}
};
