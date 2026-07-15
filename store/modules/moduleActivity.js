import dayjs from 'dayjs';
import { getScienceActivityInProgress, getScienceActivityEvents } from '@/api/index';

function formatFutureList(startingList, futureList) {
	const allList = [...startingList, ...futureList];

	const formatList = allList.map((item) => ({
		startDate: item.activityTime || '',
		endDate: item.endDate || ''
	}));

	return formatList.filter((item, index, self) => {
		return index === self.findIndex((v) => v.startDate === item.startDate && v.endDate === item.endDate);
	});
}

function splitActivityListByToday(list = []) {
	return list.reduce(
		(result, item) => {
			if (dayjs(item.activityTime).isSame(dayjs(), 'day') || dayjs(item.activityTime).isBefore(dayjs(), 'day')) {
				result.starting.push(item);
			} else {
				result.future.push(item);
			}

			return result;
		},
		{
			starting: [],
			future: []
		}
	);
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

				const { data: activityData } = await getScienceActivityInProgress();
				// const rawStartingList = Array.isArray(activityData) ? activityData : [];
				// const { starting: startingList, future: pendingFutureList } = splitActivityListByToday(rawStartingList);
				// commit('SET_STARTING', startingList);
				commit('SET_STARTING', activityData);

				// const { data: futureData } = await getScienceActivityEvents();
				// const futureList = Array.isArray(futureData) ? futureData : [];
				// const mergedFutureList = [...pendingFutureList, ...futureList];
				// commit('SET_FUTURE', mergedFutureList);

				// const futureListDate = formatFutureList(startingList, mergedFutureList);
				const futureListDate = formatFutureList(activityData, []);
				commit('SET_FUTURE_LIST', futureListDate);
			} catch (e) {
				console.error(e);
				commit('SET_ERROR', true);
			}
		}
	}
};
