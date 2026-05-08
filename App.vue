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
		// console.log('App Show')
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
