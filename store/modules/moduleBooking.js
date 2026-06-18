import { getAllScienceReservation } from '@/api/index';
import { formatReservationConfig } from '@/utils/formatReservationConfig';

export default {
	namespaced: true,
	state: {
		reservationConfigList: []
	},
	getters: {
		reservationConfigList(state) {
			return state.reservationConfigList;
		}
	},
	mutations: {
		setReservationConfigList(state, context) {
			state.reservationConfigList = Array.isArray(context) ? context : [];
		}
	},
	actions: {
		getReservationConfigList({ commit }) {
			return new Promise((resolve, reject) => {
				getAllScienceReservation()
					.then((resp) => {
						if (resp.code === 200) {
							const formattedList = formatReservationConfig(resp.data || []);
							commit('setReservationConfigList', formattedList);
							resolve(formattedList);
						} else {
							commit('setReservationConfigList', []);
							resolve([]);
						}
					})
					.catch((error) => {
						commit('setReservationConfigList', []);
						reject(error);
					});
			});
		}
	}
};
