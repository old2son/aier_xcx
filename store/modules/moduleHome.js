import {
  getScienceHomeTopImage, // 顶部banner
  getScienceHomeRecommendations, // 精选推荐
  getScienceHomeBaseDynamics // 基地动态
} from '@/api/index'

export default {
  namespaced: true,
  state: {
    bannerSwiperList: [],
    recommendationList: [],
    baseUpdatesList: [],
    loaded: false,
    error: false,
  },
  getters: {
    bannerSwiperList: state => state.bannerSwiperList,
    recommendationList: state => state.recommendationList,
    baseUpdatesList: state => state.baseUpdatesList,
    isLoaded: state => state.loaded,
    isError: state => state.error
  },
  mutations: {
    SET_BANNER_SWIPER_LIST(state, context) {
      state.bannerSwiperList = context
    },
    SET_RECOMMENDATION_LIST(state, context) {
      state.recommendationList = context
    },
    SET_BASEUPDATES_LIST(state, context) {
      state.baseUpdatesList = context
    },
    SET_LOADED(state, context) {
      state.loaded = context
    },
    SET_ERROR(state, context) { 
      state.error = context
    }
  },
  actions: {
    async fetchHomeData({ commit, state }) {
      if (!state.loaded) {
        try {
          commit('SET_ERROR', false)
          const { data: bannerSwiperList } = await getScienceHomeTopImage()
          commit('SET_BANNER_SWIPER_LIST', bannerSwiperList)
          const { data: recommendationList } = await getScienceHomeRecommendations()
          commit('SET_RECOMMENDATION_LIST', recommendationList)
          const { data: baseUpdatesList } = await getScienceHomeBaseDynamics()
          commit('SET_BASEUPDATES_LIST', baseUpdatesList)
          commit('SET_LOADED', true)
        } catch (e) {
          console.error(e)
          commit('SET_ERROR', true)
        }
      }
    }
  }
}