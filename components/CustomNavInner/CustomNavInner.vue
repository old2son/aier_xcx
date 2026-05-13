<template>
	<view class="custom-nav-inner" v-if="layoutReady">
		<view
			class="custom-nav-content"
			:style="{
				height: menuInfo.menuHeight + menuInfo.menuHeightFromTop + 14 + 'px'
			}"
		>
			<view
				class="nav-title"
				:style="{
					width: menuInfo.barWidth + 'px',
					height: menuInfo.menuHeight + 'px',
					marginTop: menuInfo.menuHeightFromTop + 'px',
					paddingLeft: menuInfo.blockedLayoutWidth + 'px'
				}"
			>
				<image
					:src="returnIcon"
					:style="{ left: menuInfo.fromLeft + 'px' }"
					@touchstart="goBackOrToHome"
				></image>
				<text>{{ title }}</text>
			</view>
		</view>
	</view>
</template>

<script>
import { mapState } from 'vuex';
export default {
	name: 'CustomNavInner',
	props: {
		bgImage: {
			type: String,
			default: 'https://geducloud0617.oss-cn-shenzhen.aliyuncs.com/aier-applet/BG%20banner.png'
		},
		title: {
			type: String,
			default: ''
		},
		opacity: {
			type: Number,
			default: 0
		}
	},
	data() {
		return {
			returnIcon: 'https://geducloud0617.oss-cn-shenzhen.aliyuncs.com/aier-applet/custom-back.png',
			layoutReady: false
		};
	},
	computed: {
		...mapState('moduleLayout', ['menuInfo']),
		navGradientStyle() {
			const h = this.innerHeightPx || 200; // fallback 默认高度
			const transitionPoint = ((h * 0.85) / h) * 100; // 实际上就是 85%，但保留计算逻辑以防后期需要细调
			return {
				backgroundImage: `
              linear-gradient(
                to right,
                #e6effa 0%,
                #e8f0fa 20%,
                #e5f2f9 40%,
                #e3f4f8 60%,
                #e8faf7 80%,
                #e9faf8 100%
              ),
              linear-gradient(
                to bottom,
                rgba(255, 255, 255, 0) ${transitionPoint}%,
                #f9f9f9 100%
              )
            `,
				backgroundBlendMode: 'normal',
				backgroundRepeat: 'no-repeat',
				backgroundSize: '100% 100%'
			};
		}
	},

	watch: {
		menuInfo: {
			handler(newVal) {
				if (newVal && newVal.menuHeight && newVal.menuHeightFromTop) {
					this.layoutReady = true;
				}
			},
			immediate: true,
			deep: true
		}
	},
	methods: {
		goBackOrToHome() {
			const pages = getCurrentPages(); // 获取页面栈
			if (pages.length > 1) {
				// 有上一页，返回
				uni.navigateBack({
					delta: 1
				});
			} else {
				// 没有上一页，跳转到首页
				uni.reLaunch({
					url: '/pages/tabBar/home/home' // 根据你的首页路径修改
				});
			}
		}
	},
	mounted() {
		this.$store.dispatch('moduleLayout/getNavigationBarStyle');
	}
};
</script>

<style lang="scss" scoped>
.custom-nav-inner {
	width: 100%;
	height: 28.43vh;
	background:
		linear-gradient(to bottom, rgba(255, 255, 255, 0) 85%, #f9f9f9 100%),
		linear-gradient(to right, #e6effa 0%, #e8f0fa 20%, #e5f2f9 40%, #e3f4f8 60%, #e8faf7 80%, #e9faf8 100%);
	background-blend-mode: normal;
	background-repeat: no-repeat;
	background-size: 100% 100%;
}

.custom-nav-content {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	z-index: 9999;
	background: linear-gradient(to right, #e6effa 0%, #e8f0fa 20%, #e5f2f9 40%, #e3f4f8 60%, #e8faf7 80%, #e9faf8 100%);
	background-blend-mode: overlay; // 混合模式让两种渐变叠加
}

.back-icon {
	display: flex;
	flex-direction: column;
	justify-content: flex-end;
	height: 80%;
	image {
		height: 42%;
	}
}

.nav-title {
	position: relative;
	color: #000;
	font-size: 26rpx;
	display: flex;
	justify-content: center;
	align-items: center;
	box-sizing: border-box;
}

.nav-title text {
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}

.nav-title image {
	position: absolute;
	top: 50%;
	left: 0;
	transform: translateY(-50%);
	width: 40rpx;
	height: 40rpx;
	z-index: 999;
}
</style>
