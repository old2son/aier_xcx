<template>
	<view class="activity-detail-container">
		<view class="banner">
			<image :src="requestResult.activityCoverUrl" mode="widthFix"></image>
		</view>
		<view class="txt-1">{{ requestResult.activityName }}</view>
		<view class="txt-2">
			<text class="txt-2-1">进行中</text>
			<text class="txt-2-2">{{ requestResult.endTime }} 结束</text>
		</view>
		<view class="txt-3">
			<view class="txt-3-1">活动背景：{{ requestResult.theBackground }}</view>
			<view class="txt-3-2">活动地点：{{ requestResult.place }}</view>
			<view class="txt-3-3">活动时间：{{ requestResult.beginFullDate }} - {{ requestResult.endDay }}</view>
			<view class="txt-3-4">
				{{ requestResult.beginDay }} - {{ requestResult.endDay }}&nbsp;&nbsp;&nbsp;{{
					requestResult.beginShijian
				}}
				- {{ requestResult.endShijian }}
			</view>
		</view>
		<view class="bottom-box">
			<van-button
				round
				size="large"
				color="#f0f0f0"
				open-type="share"
				custom-class="btn-1"
				custom-style="width: 202rpx;height: 104rpx;"
			>
				<image :src="shareIcon" mode="heightFix"></image>
				<text>分享</text>
			</van-button>
			<view class="btn-2" @click="openSignupPopup">立即报名</view>
		</view>

		<van-popup
			:show="showSignupPopup"
			round
			position="center"
			:close-on-click-overlay="true"
			custom-style="width: 84%; overflow: hidden;"
			@close="closeSignupPopup"
		>
			<view class="sign-box">
				<view class="sign-title">报名类型</view>
				<view class="sign-desc">为方便您顺利报名，活动设置两类报名通道：</view>
				<view class="sign-row">
					<text class="sign-label">个人预约：</text>
					<text>社会群众个人报名</text>
				</view>
				<view class="sign-row">
					<text class="sign-label">团队预约：</text>
					<text>学校/企事业单位/社区/旅行社等团体</text>
				</view>
				<view class="sign-act">
					<view class="sign-btns">
						<view class="sign-btn btn-person" @click="goToPersonalSignup">个人预约</view>
						<view class="sign-btn btn-team" @click="goToTeamSignup">团队预约</view>
					</view>
				</view>
			</view>
		</van-popup>
	</view>
</template>

<script>
import { getScienceActivityInProgress, getScienceActivityEvents } from '@/api';
import { mapState } from 'vuex';
import categoryData from '@/data/category.json';

export default {
	data() {
		return {
			title: '',
			requestResult: {},
			shareIcon: categoryData.shareIcon,
			showSignupPopup: false
		};
	},
	computed: {
		...mapState('moduleActivity', ['selectedActivity'])
	},
	methods: {
		// 抽离分享配置
		getShareConfig() {
			return {
				title: this.requestResult.activityName,
				path: `/subpackages/packageCategory/activityCenter/activityDetail?title=${this.title}`,
				imageUrl: this.requestResult.activityCoverUrl
			};
		},
		async getDetailData(options) {
			// activityItem
			
			console.log('Vuex的参数：', this.selectedActivity);
			this.requestResult = this.selectedActivity;

			// 添加新的字段，不影响原字段
			this.$set(this.requestResult, 'beginDay', this.extractDate(this.requestResult.activityTime));
			this.$set(this.requestResult, 'endDay', this.extractDate(this.requestResult.endTime));
			this.$set(this.requestResult, 'beginShijian', this.extractTime(this.requestResult.activityTime));
			this.$set(this.requestResult, 'endShijian', this.extractTime(this.requestResult.endTime));
			this.$set(this.requestResult, 'beginFullDate', this.extractFullDate(this.requestResult.activityTime));
			this.$set(this.requestResult, 'endFullDate', this.extractFullDate(this.requestResult.endTime));
			console.log('数据：', this.requestResult);
		},
		// 处理生成“几月几号”
		extractDate(dateStr) {
			const match = dateStr.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
			if (match) {
				return `${match[2]}月${match[3]}号`;
			}
			return '';
		},
		// 提取“几点几分”
		extractTime(dateStr) {
			const match = dateStr.match(/(\d{1,2})[:：](\d{1,2})/);
			if (match) {
				return `${match[1]}:${match[2]}`;
			}
			return '';
		},
		// 提取完整“年月日”
		extractFullDate(dateStr) {
			const match = dateStr.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
			if (match) {
				return `${match[1]}年${match[2]}月${match[3]}日`;
			}
			return '';
		},
		openSignupPopup() {
			this.showSignupPopup = true;
		},
		closeSignupPopup() {
			this.showSignupPopup = false;
		},
		goToPersonalSignup() {
			this.closeSignupPopup();
			this.toSubpackagePage('/subpackages/packageCategory/activityCenter/activityEnroll');
		},
		goToTeamSignup() {
			this.closeSignupPopup();
			uni.navigateTo({
				url: '/subpackages/packageAppointment/teamAppointment'
			});
		},
		toSubpackagePage(url) {
			console.log(url);
			uni.navigateTo({
				url: url + `?title=${this.title}`
			});
		}
	},
	onLoad(options) {
		console.log('接收到父组件的参数：', options);
		this.getDetailData(options);
	},
	// 分享到微信好友
	onShareAppMessage() {
		return this.getShareConfig();
	},
	// 分享到朋友圈
	onShareTimeline() {
		return this.getShareConfig();
	}
};
</script>

<style lang="scss" scoped>
.activity-detail-container {
	width: 100%;
	height: 100vh;
	box-sizing: border-box;
	background-color: #fff;
	overflow-y: auto;
	padding: 32rpx 32rpx 80px 32rpx;

	.banner {
		width: 100%;
		image {
			border-radius: 20rpx;
			width: 100%;
		}
	}

	.txt-1 {
		color: #333;
		font-size: 28rpx;
		font-weight: 900;
		margin-top: 20rpx;
	}
	.txt-2 {
		display: flex;
		align-items: center;
		white-space: nowrap;
		font-size: 20rpx;
		margin-top: 8rpx;
		.txt-2-1 {
			color: #02c6a2;
		}
		.txt-2-2 {
			color: #7c7e80;
			margin-left: 16rpx;
			display: inline-block;
		}
	}

	.txt-3 {
		color: #333;
		font-size: 28rpx;
		text-align: justify;
		margin-top: 30rpx;
		.txt-3-1 {
			line-height: 2;
		}
		.txt-3-2,
		.txt-3-3,
		.txt-3-4 {
			margin: 40rpx 0;
		}
	}

	.bottom-box {
		position: fixed;
		left: 0;
		bottom: 0;
		width: 100%;
		display: flex;
		align-items: center;
		background-color: #fff;
		justify-content: space-between;
		border-top: 1px solid #e8e8e8;
		box-sizing: border-box;
		padding: 12rpx 32rpx 20rpx 32rpx;
		.btn-1 {
			display: flex;
			align-items: center;
			justify-content: center;
			image {
				height: 44rpx;
				display: inline-block;
				margin-right: 6rpx;
			}
			text {
				color: #32579c;
				font-size: 32rpx;
				font-weight: 550;
			}
		}
		.btn-2 {
			width: calc(100% - 230rpx);
			height: 104rpx;
			line-height: 104rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			background-color: #32579c;
			font-size: 44rpx;
			border-radius: 50rpx;
			color: #fff;
			letter-spacing: 8px;
		}
	}

	.sign-box {
		padding: 48rpx 40rpx 40rpx;
		box-sizing: border-box;
		color: #333;
	}

	.sign-title {
		font-size: 36rpx;
		font-weight: 600;
		text-align: center;
		margin-bottom: 36rpx;
	}

	.sign-desc,
	.sign-row {
		font-size: 28rpx;
		line-height: 1.8;
	}

	.sign-label {
		font-weight: 600;
	}

	.sign-act {
		margin-top: 44rpx;
	}

	.sign-btns {
		display: flex;
		justify-content: space-between;
		gap: 20rpx;
	}

	.sign-btn {
		flex: 1;
		height: 88rpx;
		border-radius: 44rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 30rpx;
		font-weight: 600;
	}

	.btn-person {
		background-color: #32579c;
		color: #fff;
	}

	.btn-team {
		background-color: #eef4ff;
		border: 1px solid #32579c;
		color: #32579c;
	}
}
</style>
