export default {
  namespaced: true,
  state: {
    currentTab: '/pages/tabBar/home/home',
    // 添加默认索引防止报错
    safeTabIndex: 0 
  },
  mutations: {
    SET_CURRENT_TAB(state, path) {
      console.log('path:::::', path)
      state.currentTab = path
      // 自动更新索引
      const tabMap = {
        '/pages/tabBar/home/home': 0,
        '/pages/tabBar/science/science': 1,
        '/pages/tabBar/guide/guide': 2,
        '/pages/tabBar/mine/mine': 3
      }
      state.safeTabIndex = tabMap[path] || 0
    }
  },
   actions: {
      // 传入路径，判断是否需要登录，并返回布尔值
      checkTabNeedLogin({ commit }, path) {
        // 若需要进入tabBar页面判断登录可以松开如下代码，以去mine页面为例
        // if (path === '/pages/tabBar/mine/mine') {
        //   const token = uni.getStorageSync('token')
        //   return !!token // true 表示已登录
        // }
        return true // 其他 tab 不需要登录
      }
    }
}