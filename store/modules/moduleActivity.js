import { getScienceActivityInProgress, getScienceActivityEvents } from '@/api/index';

export default {
	namespaced: true,
	state: {
		starting: [], // 活动进行中
		future: [], // 活动即将开始
		error: false,
		selectedActivity: {} // 选中的活动
	},
	getters: {
		starting(state) {
			return state.starting;
		},
		future(state) {
			return state.future;
		},
		selectedActivity(state) {
			return state.selectedActivity;
		}
	},
	mutations: {
		SET_STARTING(state, context) {
			state.starting = context;
		},
		SET_FUTURE(state, context) {
			state.future = context;
		},
		SET_ERROR(state, context) {
			state.error = context;
		},
		setSelectedActivity(state, context) {
			state.selectedActivity = context;
		}
	},
	actions: {
		async fetchActivities({ commit, state }) {
			try {
				commit('SET_ERROR', false);
				const { data: startingList } = await getScienceActivityInProgress();
				commit('SET_STARTING', startingList);
				const { data: futureList } = await getScienceActivityEvents();
				commit('SET_FUTURE', futureList);
			} catch (e) {
				console.error(e);
				commit('SET_ERROR', true);
			}
		}
	}
};
