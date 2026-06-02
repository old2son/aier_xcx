import { getHotRecommendInpage } from '@/api/index';

export default {
	namespaced: true,
	state: {
		asknScienceList: [],
		loaded: false,
		error: false
	},
	getters: {
		asknScienceList: state => state.asknScienceList
	},
	mutations: {
		SET_LIST(state, context) {
			state.asknScienceList = context;
		},
		SET_LOADED(state, context) {
			state.loaded = context;
		},
		SET_ERROR(state, context) {
			state.error = context;
		},
	},
	actions: {
		async getScienceArticleList({ commit }, params) {
			try {
				commit('SET_ERROR', false);
				const { data } = await getHotRecommendInpage(params);
				commit('SET_LIST', data);
				commit('SET_LOADED', true);
			} catch (e) {
				console.error(e);
				commit('SET_ERROR', true);
			}
		},
	},
};
