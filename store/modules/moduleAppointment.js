export default {
  namespaced: true,
  state: {
    selectedAppointment: null,
  },
  getters: {
    selectedAppointment(state) {
      return state.selectedAppointment
    },
  },
  mutations: {
    setSelectedAppointment(state, context) {
      state.selectedAppointment = context
    },
  },
  actions: {},
}
