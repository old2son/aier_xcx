import store from '@/store'

export default {
  beforeEach(to, from, next) {
    if(to.path === '/pages/tabBar/home/home'){
      console.log("首页：",to.path)
      uni.hideTabBar()
    }
    const meta = to.meta
    console.log('路由前置守卫meta::', meta)
    if (meta.needLogin) {
      const token = uni.getStorageSync('token')
      console.log('路由前置守卫获取token::', token)
      if (token) {
        // 有 token，验证是否有效
        store.dispatch('moduleUser/getUserInfo').then((resp) => {
          if (
            (resp.code == 0 && resp.message == '非法令牌！请携带正确的Token令牌！') ||
            (resp.code == 401 && resp.message == '登录验证已过期，请重新登录！')
          ) {
            next({
              path: '/subpackages/packageLogin/login'
            })
          } else {
            next()
          }
        })
      } else {
        // 无 token
        console.log('无令牌')
        next({
          path: '/subpackages/packageLogin/login'
        })
      }
      return
    }
    next()
  }
    // afterEach(to, from) {
    //   console.log('后置守卫to', to)
    //   console.log('后置守卫from', from)
    //   console.log('跳转结束')
    // },
}
