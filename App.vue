<script>
export default {
	onLaunch: function () {
		uni.hideTabBar();
		// 微信小程序原生Tab监听
		// 统一监听所有页面显示（包括tab页和非tab页）
		uni.onAppRoute(async (res) => {
			const path = res.path.startsWith('/') ? res.path : '/' + res.path;
			// 判断是否允许跳转
			const allowed = await this.$store.dispatch('moduleTab/checkTabNeedLogin', path);
			if (!allowed) {
				uni.reLaunch({ url: '/subpackages/packageLogin/login' });
				return;
			}
			// 正常设置 tab 状态
			this.$store.commit('moduleTab/SET_CURRENT_TAB', path);
		});
		// 微信小程序专属tab监听（双保险）
		// #ifdef MP-WEIXIN
		if (typeof uni.onTabItemTap === 'function') {
			uni.onTabItemTap((item) => {
				const path = item.pagePath.startsWith('/') ? item.pagePath : `/${item.pagePath}`;
				this.$store.commit('moduleTab/SET_CURRENT_TAB', path);
			});
		}
		// #endif
	},
	onShow: function () {
		let updateManager = uni.getUpdateManager();
		
		if (!updateManager) {
			return;
		} else {
			//新版本更新
			if (uni.canIUse('getUpdateManager')) {
				//判断当前微信版本是否支持版本更新
				updateManager.onCheckForUpdate(function (res) {
					if (res.hasUpdate) {
						// 请求完新版本信息的回调
						updateManager.onUpdateReady(function () {
							uni.showModal({
								title: '更新提示',
								content: '新版本已经准备好，是否重启应用？',
								success: function (res) {
									if (res.confirm) {
										// 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
										updateManager.applyUpdate();
									}
								}
							});
						});
						updateManager.onUpdateFailed(function () {
							uni.showModal({
								// 新的版本下载失败
								title: '已经有新版本了哟~',
								content:
									'新版本已经上线啦~，请您删除当前小程序，到微信 “发现-小程序” 页，重新搜索打开哦~'
							});
						});
					} else {
					}
				});
			} else {
				uni.showModal({
					// 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
					title: '溫馨提示',
					content: '当前微信版本过低，部分功能无法使用，请升级到最新微信版本后重试。'
				});
			}
		}
	},
	onHide: function () {
		// console.log('App Hide')
	}
};
</script>

<style lang="scss">
/* vant-weapp样式 */
@import 'wxcomponents/vant/common/index.wxss';
/*每个页面公共css */
@import '@/uni_modules/uni-scss/index.scss';
/* #ifndef APP-NVUE */
@import '@/static/customicons.css';
// 设置整个项目的背景色
page {
	width: 100%;
	height: 100%;
	overflow-y: auto;
	background-color: #f9f9f9;
}
.van-checkbox {
	display: flex;
	align-items: stretch !important;
}
image {
	font-size: 0;
	vertical-align: middle;
}

.empty-box {
	width: 100%;
	height: 65vh;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	.empty-image {
		width: 120px;
		height: 120px;
	}
	.empty-text {
		margin-top: 60rpx;
		color: #bbbbbb;
		font-size: 24rpx;
		font-weight: 550;
	}
}
/* #endif */
</style>
