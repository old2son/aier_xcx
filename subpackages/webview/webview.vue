<template>
	<view class="webview-container">
		<web-view :src="h5Url" @message="onWebviewMessage"></web-view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				h5Url: ''
			};
		},
		// onShow() {
		//   if (uni.hideHomeButton) {
		//      console.log('uni.hideHomeButton')
		//      wx.hideHomeButton()
		//   }
		// },
		onLoad() {
			this.loadH5Url()
		},
		methods: {
			loadH5Url() {
				uni.getStorage({ // 异步读取 h5Url
					key: 'h5Url',
					success: (res) => {
						this.h5Url = res.data
						console.log('微信小程序中的读取到的h5Url:', this.h5Url)
					},
					fail: (err) => {
						console.error('获取 h5Url 失败:', err)
						uni.showToast({
							title: '解析h5失败，请尝试重新点击',
							icon: 'none'
						})
						// 返回上一个页面让用户重新操作
						uni.navigateBack()
					}
				})
			},
			onWebviewMessage(e) {
				console.log('h5信息', e.detail)
			}
		}
	}
</script>