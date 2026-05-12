import {
	scienceMuseumUserLogin,
	scienceMuseumUserLogOut,
	getScienceMuseumUserInforMation
} from '@/api/index'

export default {
	namespaced: true,
	state: {
		token: '',
		isLogin: false,
		userInfo: {},


		showPrivacyPopup: false,
	},
	getters: {

	},
	mutations: {
		setToken(state, context) {
			state.token = context
		},
		setUserInfo(state, context) {
			if (context && Object.keys(context).length > 0) {
				state.userInfo = context
				state.isLogin = true
			} else {
				state.userInfo = {}
				state.isLogin = false
			}
		},
		// 是否开启个人信息保护指引
		openPrivacyPopup(state, context) {
			state.showPrivacyPopup = context
		},
	},

	actions: {
		/* 注册帐号 || 登录帐号 */
		verificationCodeLogin({
			commit
		}, verificationCodeLoginParams) {
			return new Promise((resolve, reject) => {
				scienceMuseumUserLogin(verificationCodeLoginParams)
					.then((resp) => {
						if (resp.code === 200 && resp.message == '登录成功！') {
							uni.setStorageSync('token', resp.data.userToken)
							uni.setStorageSync('userInfo', resp.data)
							commit('setToken', resp.data.userToken)
							commit('setUserInfo', resp.data)
							uni.showToast({
								icon: 'none',
								title: resp.message
							})
							resolve(resp)
						} else {
							resolve(resp)
						}
					})
					.catch((error) => {
						console.log('调用注册帐号 || 登录帐号出错', error)
						reject(error)
					})
			})
		},
		/* 退出登录 */
		logOut({
			commit
		}) {
			return new Promise((resolve, reject) => {
				scienceMuseumUserLogOut().then(resp => {
					if (
						(resp.code == 0 && resp.message == '退出成功！') ||
						(resp.code == 0 && resp.message == '非法令牌！请携带正确的Token令牌！') ||
						(resp.code == 0 && resp.message == '请登录后，再进行此操作！')
					) {
						commit('setToken', '')
						commit('setUserInfo', {})
						uni.removeStorageSync('token')
						uni.removeStorageSync('userInfo')
						resolve(resp)
					} else {
						/* 退出登录失败 */
						resolve(resp)
					}
				}).catch(error => {
					console.log('退出登录出错', error)
					reject(error)
				})
			})
		},
		/* 获取当前用户信息 */
		getUserInfo({
			commit
		}) {
			return new Promise((resolve, reject) => {
				getScienceMuseumUserInforMation().then(resp => {
					if (resp.code == 200 && resp.message == '获取成功！') {
						uni.setStorageSync('userInfo', resp.data)
						commit('setUserInfo', resp.data)
						resolve(resp)
					} else {
						commit('setToken', '')
						commit('setUserInfo', {})
						uni.removeStorageSync('token')
						uni.removeStorageSync('userInfo')
						resolve(resp)
					}
				}).catch(error => {
					console.log('调用当前用户信息出错', error)
					reject(error)
				})
			})
		},



		// 查询小程序隐私授权
		queryWeChatAppletPrivacyAuth({
			commit
		}) {
			return new Promise((resolve, reject) => {
				if (wx.getPrivacySetting) {
					wx.getPrivacySetting({
						success: res => {
							if (res.needAuthorization) {
								commit('openPrivacyPopup', true)
								resolve(res.needAuthorization)
							} else {
								resolve(res.needAuthorization)
							}
						},
						fail: (error) => {
							reject('查询用户是否同意隐私设置失败', error)
						},
						complete: () => {},
					})
				} else {
					/* 低版本基础库不支持 wx.getPrivacySetting 接口，隐私接口可以直接调用 */
					console.log('低版本基础库，隐私接口直接调用')
					resolve()
				}
			})
		},
	}
}