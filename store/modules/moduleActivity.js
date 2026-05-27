import { getScienceActivityInProgress, getScienceActivityEvents } from '@/api/index';

function formatFutureList(startingList, futureList) {
	// 合并活动列表
	const allList = [...startingList, ...futureList];

	// 提取日期
	const formatList = allList.map((item) => {
		const startMatch = item.activityTime?.match(/\d{4}年\d{1,2}月\d{1,2}日/);

		const endMatch = item.endTime?.match(/\d{4}年\d{1,2}月\d{1,2}日/);

		return {
			startDate: startMatch ? startMatch[0] : '',
			endDate: endMatch ? endMatch[0] : ''
		};
	});

	// 去重
	return formatList.filter((item, index, self) => {
		return index === self.findIndex((v) => v.startDate === item.startDate && v.endDate === item.endDate);
	});
}

export default {
	namespaced: true,
	state: {
		starting: [], // 活动进行中
		future: [], // 活动即将开始
		error: false,
		hasShownActivityPopup: false, // 是否已经显示过活动弹窗
		selectedActivity: {}, // 选中的活动
		futureList: [] // 未来一个月内的活动日期
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
		},
		futureList(state) {
			return state.futureList;
		},
		hasShownActivityPopup(state) {
			return state.hasShownActivityPopup;
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
		SET_FUTURE_LIST(state, context) {
			state.futureList = context;
		},
		setSelectedActivity(state, context) {
			state.selectedActivity = context;
		},
		setHasShownActivityPopup(state, context) {
			state.hasShownActivityPopup = context;
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

				const futureListDate = formatFutureList(startingList, futureList);
				commit('SET_FUTURE_LIST', futureListDate);
			} catch (e) {
				console.error(e);
				commit('SET_ERROR', true);
			}
		}
	}
};
