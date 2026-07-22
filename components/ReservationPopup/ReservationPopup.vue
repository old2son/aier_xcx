<template>
	<van-popup
		round
		position="center"
		:show="showPopup"
		:close-on-click-overlay="false"
		custom-style="width:85%;height:90%"
	>
		<view class="personal" v-if="type === 0">
			<view class="tips-title">温馨提示</view>
			<view class="tips-content">
				<view class="h2-tl">（一）开放时间</view>
				<text class="overview"
					>预约须知中的开放时间修改为上午 08:30-12:00 下午 14:30-17:00（17:00后停止入馆）</text
				>
				<view class="h2-tl">（二）个人预约规则</view>
				<view class="tips-img">
					<image
						mode="widthFix"
						src="https://geducloud0617.oss-cn-shenzhen.aliyuncs.com/aier-applet/personal_tips.png"
					></image>
				</view>

				<van-checkbox :value="checked" shape="square" @change="toggleCheckbox"
					>我已阅读并同意温馨提示内容</van-checkbox
				>
				<van-button
					round
					color="#32579c"
					size="large"
					:disabled="!checked"
					@click="confirmPopup"
					custom-style="margin-top: 40rpx"
					>我知道了</van-button
				>
			</view>
		</view>
		<view class="team" v-if="type === 1">
			<view class="tips-title">温馨提示</view>
			<view class="tips-content">
				<view class="h2-tl">（一）开放时间</view>
				<text class="overview"
					>预约须知中的开放时间修改为上午 08:30-12:00 下午14:30-17:00（17:00后停止入馆）</text
				>
				<view class="h2-tl">（二）团队预约规则</view>
				<view class="tips-img">
					<image
						mode="widthFix"
						src="https://geducloud0617.oss-cn-shenzhen.aliyuncs.com/aier-applet/team_tips.png"
					></image>
				</view>

				<van-checkbox :value="checked" shape="square" @change="toggleCheckbox"
					>我已阅读并同意温馨提示内容</van-checkbox
				>
				<van-button
					round
					color="#32579c"
					size="large"
					:disabled="!checked"
					@click="confirmPopup"
					custom-style="margin-top: 40rpx"
					>我知道了</van-button
				>
			</view>
		</view>
	</van-popup>
</template>

<script>
export default {
	name: 'ReservationPopup',
	options: {
		styleIsolation: 'shared'
	},
	props: {
		show: {
			type: Boolean,
			default: true
		},
		type: {
			type: Number,
			required: true
		}
	},
	data() {
		return {
			showPopup: this.show, // 内部控制弹出层显示状态
			checked: false // 默认未勾选
		};
	},
	watch: {
		show(val) {
			this.showPopup = val; // 父组件状态变化时更新内部状态
		}
	},
	methods: {
		toggleCheckbox() {
			this.checked = !this.checked;
		},
		confirmPopup() {
			// 通知父组件关闭弹出层
			this.$emit('close');
			this.innerShow = false;
		}
	}
};
</script>

<style lang="scss" scoped>
.popup-content {
	width: 85%;
	max-width: 870rpx;
	height: 90%;
	border-radius: 24rpx;
	background-color: #fff;
	display: flex;
	flex-direction: column;
}

.tips-title {
	position: sticky;
	top: 0;
	z-index: 2;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 30rpx 0;
	letter-spacing: 6rpx;
	border-radius: 24rpx 24rpx 0 0;
	text-align: center;
	color: #fff;
	font-size: 40rpx;
	background-color: #004ea2;
}

.tips-content {
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 90%;
	padding: 0 48rpx 5%;
	overflow-y: auto;
	box-sizing: border-box;
	color: #333;

	.tips-img {
		margin: 0 -24rpx;

		image {
			width: 100%;
			max-width: 100%;
			height: auto;
		}
	}
}

.personal {
	.h1-tl,
	.h2-tl,
	.h3-tl {
		color: #ff9400;
	}
}

.team {
	.bold {
		display: inline;
		font-weight: 600;
	}

	.bg-blue {
		display: inline;
		background-color: #eef5ff;
	}

	.li-sub {
		position: relative;
		margin-left: 24rpx;
		padding-left: 24rpx;
		line-height: 1.8;
		color: #5f6f85;
		font-size: 26rpx;
	}

	.li-sub::before {
		position: absolute;
		left: 0;
		top: 24rpx;
		width: 6rpx;
		height: 6rpx;
		content: '';
		transform: translateY(-50%) rotate(45deg);
		background-color: #5f6f85;
	}
}

.team {
	.h1-tl,
	.h2-tl,
	.h3-tl {
		color: #4794ff;
	}
}

.h1-tl {
	padding: 8% 0 4%;
	font-size: 36rpx;
	text-align: center;
	color: #004ea2;
}

.h2-tl {
	text-align: center;
	font-weight: 600;
	margin-top: 40rpx;
}

.h3-tl {
	font-weight: 600;
	margin-top: 32rpx;
}

.overview {
	display: block;
	line-height: 1.6;
	margin-top: 16rpx;
	color: #555;
	font-weight: 400;
	font-size: 26rpx;
	font-family:
		-apple-system, 'PingFang SC', 'Heiti SC', 'Microsoft YaHei', '微软雅黑', 'Noto Sans CJK SC',
		'Source Han Sans CN', sans-serif;
}

.txt {
	text-align: justify;
	font-size: 30rpx;
	line-height: 2;
}

.ul {
	margin-top: 16rpx;
	font-size: 26rpx;
	line-height: 1.8;
}

.li {
	width: 100%;
	white-space: normal;
}

.ul + .h3-tl,
.ul + .h2-tl {
	margin-top: 44rpx;
}

.overview + .h3-tl,
.overview + .h2-tl {
	margin-top: 44rpx;
}

.tips-content > .h2-tl:first-child,
.tips-content > .small-title:first-child {
	margin-top: 24rpx;
}

.small-title {
	margin-top: 40rpx;
	font-weight: 600;
}

.first-txt,
.second-txt {
	display: block;
	margin-top: 16rpx;
	line-height: 1.8;
	font-size: 30rpx;
}

.first-txt + .small-title,
.second-txt + .small-title {
	margin-top: 44rpx;
}

.checkbox-container {
	display: flex;
	align-items: center;
	margin-top: 30rpx;
}

.checkbox-label {
	color: #b1b1b1;
	font-size: 30rpx;
	margin-left: 10rpx;
}

.confirm-btn {
	margin-top: 30rpx;
	border-radius: 12rpx;
	font-size: 36rpx;
	padding: 40rpx 0;
	box-sizing: border-box;
	background-color: #32579c;
	color: #fff;
}

.confirm-btn[disabled] {
	background-color: #cccccc;
	color: #999999;
}

::v-deep .van-checkbox__icon {
	font-size: 36rpx;
}

::v-deep .van-checkbox {
	margin-top: 36rpx;
}
</style>
