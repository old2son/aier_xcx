import api from './index'
import store from '@/store'

const request = ({
	url = '',
	data = {},
	method = 'GET',
	header = {},
	auth = {
		needLogin: false
	}
} = {}) => {
	// 拦截器
	const interceptors = {
		// 请求拦截器
		request: (config) => {
			if (config.auth.needLogin) { // 判断接口请求的请求头是否需要携带token
				const token = uni.getStorageSync('token')
				if (token) {
					config.header.token = token
				}
			}
			return config
		},

		// 响应拦截器
		response: (response) => {
			// 当前处于未登录状态
			if (response.data.code == 0 && response.data.message == '请登录后，再进行此操作！') {
				// uni.showToast({
				//   title: '请先完成登录',
				//   icon: 'none'
				// })
			} else if ( // 令牌不匹配 || 存在多地登录其中一方登出 || 登录过期
				(response.data.code == 0 && response.data.message == '非法令牌！请携带正确的Token令牌！') ||
				(response.data.code == 401 && response.data.message == '登录验证已过期，请重新登录！')
			) {
				uni.showToast({
					title: '登录失效，请重新登录',
					icon: 'none'
				})
			}
			return response.data
		}
	}
	// 返回一个promise对象，用于异步处理请求
	return new Promise((resolve, reject) => {
		const config = interceptors.request({
			url,
			data,
			method,
			header,
			auth
		})
		uni.request({
			url: config.url,
			method: config.method,
			data: config.data,
			header: config.header,
			// 请求成功
			success: (res) => {
				const response = interceptors.response(res)
				resolve(response)
			},
			// 请求失败
			fail: (err) => {
				uni.showToast({
					title: '请求失败，请稍候重试',
					icon: 'none'
				})
				console.log('请求失败', err)
				reject(err)
			},
			// 请求完成(无论成功失败)
			complete: () => {}
		})
	})
}

export default request