<template>
	<view class="points-container">
		<CustomNavInner title="EYE积分" />
		<view class="points-main" :style="{ top: menuInfo.menuHeight + menuInfo.menuHeightFromTop + 20 + 'px' }">
			<view class="header-1">
				<text>我的积分</text>
				<image
					:src="pointsData.goPoints"
					mode="widthFix"
					@touchstart="toSubpackagePage('/subpackages/packageMine/points/pointsRecord')"
				></image>
			</view>
			<view class="header-2">
				<text class="point-num">{{ pointsResult.points }}</text>
				<text class="point-record" @click="toSubpackagePage('/subpackages/packageMine/points/exchangeRecord')"
					>兑换记录</text
				>
			</view>

			<view class="sign-in-box">
				<view class="streak-info">
					<text>已连续签到</text>
					<text class="day-color">{{ signDays }}</text
					>天
				</view>
				<view class="days">
					<view class="day-item" v-for="(day, index) in 7" :key="index">
						<view
							:class="[
								'day-box',
								{
									signed: index < currentDayIndex,
									missed: !isMissed && index === missedIndex,
									pending: isMissed && index === currentDayIndex && signInInit.todaySigned === 0
								}
							]"
						>
							<image class="points-icon" :src="getSignIcon(index)" mode="widthFix"></image>
							<text class="points">+{{ getPoint(index) }}</text>
						</view>
						<text class="day-label" :class="{ 'signed-label': index < currentDayIndex }">
							{{ getDayLabel(index) }}
						</text>
					</view>
				</view>
				<button :class="['sign-btn', signButtonClass]" :disabled="isButtonDisabled" @click="handleSign">
					{{ buttonText }}
				</button>
			</view>

			<view class="task-center-box">
				<view class="task-center-item" v-for="(item, index) in pointsData.taskCenterList" :key="item.id">
					<view class="left-part">
						<view class="front">
							<image :src="item.iconUrl" mode="heightFix"></image>
						</view>
						<view class="after">
							<view class="top">
								<text class="t1">{{ item.title }}</text>
								<text class="t2">{{ item.pointsTips }}</text>
							</view>
							<view class="bottom">{{ item.operateTxt }}</view>
						</view>
					</view>
					<view class="operate-wrap" @click="toSubpackagePage(item.toUrl)">
						<text>{{ item.operateTxt }}</text>
					</view>
				</view>
			</view>
			<view class="redeem-box">
				<view class="tips">仅限线下领取</view>
				<view class="redeem-wrap">
					<view class="redeem-item" v-for="(item, index) in prizeResult" :key="item.prizeId">
						<view class="prize-image">
							<image :src="item.prizeUrl" mode="widthFix"></image>
						</view>
						<view class="bottom-box">
							<view class="prize-name">{{ item.prizeName }}</view>
							<view class="prize-exchange-amount">{{ item.prizeNumber }}人兑换</view>
							<view class="prize-bottom">
								<view class="left">
									<image :src="pointsData.pointsIcon" mode="widthFix"></image>
									<text class="points-number">{{ item.prizePoints }}</text>
								</view>
								<view class="operate-wrap" @click="exchange(item)">
									<text>兑换</text>
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<ExchangePopup
			:show="showPopup"
			:image="popupImage"
			:tips="popupTips"
			:type="exchangeType"
			:needPoints="needPoints"
			@update:show="showPopup = $event"
		></ExchangePopup>
	</view>
</template>

<script>
import { mapState } from 'vuex';
import pointsData from '@/data/mine.json';
import {
	getMyPoints, // 查询剩余积分
	getScienceSignIn, // 查询签到情况
	scienceSignIn, // 签到领积分
	getSciencePrizes, // 获取礼品
	scienceExchangePrizes // 兑换礼品
} from '@/api';
import dayjs from 'dayjs';
export default {
	data() {
		return {
			pointsData: pointsData,
			pointsResult: {},
			signInInit: {},
			prizeResult: [],

			signDays: 0,
			isMissed: false,
			currentDayIndex: 0,
			missedIndex: null,
			currentDate: dayjs().format('YYYY-MM-DD'), // 用于跨天检测
			midnightTimer: null,

			showPopup: false,
			popupImage: '',
			popupTips: '',
			exchangeType: '',
			needPoints: -1
		};
	},
	computed: {
		...mapState('moduleLayout', ['menuInfo']),
		signButtonClass() {
			const { todaySigned } = this.signInInit;
			if (todaySigned === 1) return 'signed';
			if (this.isMissed && todaySigned === 0) return 'pending';
			if (!this.isMissed && this.signDays > 0 && todaySigned === 0) return 'fail';
			if (this.signDays === 0) return 'normal';
			return 'normal'; // fallback
		},
		buttonText() {
			const { todaySigned } = this.signInInit;
			if (todaySigned === 1) return '今天已签';
			if (this.isMissed && todaySigned === 0) return '继续签到';
			if (!this.isMissed && this.signDays > 0 && todaySigned === 0) return '重新签到';
			if (this.signDays === 0) return '立即签到';
			return '签到';
		},
		isButtonDisabled() {
			return this.signInInit.todaySigned;
		}
	},
	onLoad(options) {
		const zt = false;
		console.log('状态是什么：：：：：：', !zt);
		this.$store.dispatch('moduleLayout/getNavigationBarStyle');
		this.getPointsResult();
		this.getPrizeResult();
		this.loadSignData();
		this.startMidnightChecker();
	},
	onUnload() {
		if (this.midnightTimer) {
			clearInterval(this.midnightTimer);
			this.midnightTimer = null;
		}
	},
	methods: {
		async getPointsResult() {
			const { data: pointsResult } = await getMyPoints();
			this.pointsResult = pointsResult;
		},
		async getPrizeResult() {
			const { data: prizeResult } = await getSciencePrizes();
			this.prizeResult = prizeResult;
		},
		startMidnightChecker() {
			const now = dayjs().format('YYYY-MM-DD');
			console.log('？？？？？？now？？？？？？', now);
			this.midnightTimer = setInterval(() => {
				const now = dayjs().format('YYYY-MM-DD');
				if (now !== this.currentDate) {
					this.currentDate = now;
					this.getPointsResult();
					this.loadSignData();
				}
			}, 60 * 1000);
		},
		async loadSignData() {
			const { data } = await getScienceSignIn();
			console.log('当前签到的情况：', data);

			this.signInInit = data;
			this.signDays = data.signDays || 0; // 连续签到天数, 0 代表没签过
			this.isMissed = data.isMissed || false; // 是否断签了（?:是否是连续签到：false代表没有连续签到，那应该改下字段名：isContinuing）
			this.currentDayIndex = this.signDays; // 连续签到天数
			this.missedIndex = this.isMissed ? this.signDays : null;
		},
		toSubpackagePage(url) {
			uni.navigateTo({
				url: url
			});
		},
		async handleSign() {
			const { todaySigned } = this.signInInit;

			// 防止重复签到请求
			if (todaySigned === 1) {
				uni.showToast({
					title: '今天已签到，请明日再来~',
					icon: 'none'
				});
				return;
			}

			const lastSignDate = dayjs().format('YYYY-MM-DD');
			console.log(lastSignDate);
			// 判断是否是断签，断签就从第一天开始（lastSignDate = null）
			const isRestart = !this.isMissed && this.signDays > 0;
			// 这一行等价于：const isRestart = this.isMissed === false && this.signDays > 0
			console.log('是否断签：', isRestart);
			const points = this.getPoint(isRestart ? 0 : this.signDays);

			try {
				const { data } = await scienceSignIn({
					points,
					lastSignDate
				});

				// 如果是断签后重新开始，则签到天数重置为 1
				this.signDays = isRestart ? 1 : data.newSignDays || this.signDays + 1;
				this.currentDayIndex = this.signDays;
				this.isMissed = false;
				this.missedIndex = null;

				// 更新积分和签到信息
				this.getPointsResult();
				this.loadSignData();

				uni.showToast({
					title: `签到成功 +${points} 积分`,
					icon: 'success'
				});
			} catch (error) {
				uni.showToast({
					title: '签到失败，请稍后重试',
					icon: 'none'
				});
			}
		},
		getSignIcon(index) {
			const signedIcon = 'https://geducloud0617.oss-cn-shenzhen.aliyuncs.com/aier-applet/%E9%87%91%E5%B8%81.png';
			const unsignedIcon =
				'https://geducloud0617.oss-cn-shenzhen.aliyuncs.com/aier-applet/%E5%8F%AF%E7%AD%BE%E5%88%B0.png';
			// 已签到的前 N 天用已签到图标
			if (index < this.currentDayIndex) {
				return signedIcon;
			}
			// 当前是断签日（即未签到那一天）
			if (this.isMissed && index === this.missedIndex) {
				return unsignedIcon;
			}
			// 默认：未签到
			return unsignedIcon;
		},
		getPoint(index) {
			return [1, 1, 1, 2, 2, 2, 3][index];
		},
		getDayLabel(index) {
			const todaySigned = this.signInInit.todaySigned === 1; // 当天是否签了（1 签了，0 没签）
			const isMissed = this.isMissed; // 当前字段含义：true = 还在连续签到中，false = 已断签
			const isMissedDay = index === this.missedIndex;
			// ✅ 前面已签过的格子
			if (index < this.currentDayIndex) {
				return '已签到';
			}
			// ⏳ 今天该签但还没签（仍处于连续签到中）
			if (isMissed && index === this.currentDayIndex && !todaySigned) {
				return '未签到';
			}
			// ❌ 断签日（比如昨天没签，今天断签）
			if (!isMissed && isMissedDay) {
				return '已断签';
			}
			// ⚪️ 普通：未签到状态（第几天）
			return `第${index + 1}天`;
		},
		async exchange(item) {
			const exchangeResult = await scienceExchangePrizes({ prizeId: item.prizeId });
			console.log('兑换奖品请求：', exchangeResult);
			if (exchangeResult.code === 200 && exchangeResult.message === '兑换成功') {
				this.popupImage = this.pointsData.exchangeSuccess;
				this.popupTips = '请前往科普馆领取';
				this.exchangeType = 'success';
				this.showPopup = true;
				this.getPointsResult();
				this.getPrizeResult();
				console.log('进来1', this.showPopup);
			} else if (exchangeResult.code === 200 && exchangeResult.message === '当前您的积分不足，不满足兑换条件') {
				this.popupImage = this.pointsData.exchangeFailed;
				this.popupTips = '去做积分任务';
				this.exchangeType = 'failed';
				this.needPoints = item.prizePoints;
				this.showPopup = true;
				console.log('进来2', this.showPopup);
			} else {
				this.$toast({
					duration: 3000,
					message: exchangeResult.message
				});
			}
		}
	}
};
</script>

<style lang="scss" scoped>
.points-container {
	width: 100%;
	height: 100vh;
	overflow-y: auto;
	.points-main {
		position: absolute;
		z-index: 99;
		width: 92%;
		margin-left: 50%;
		transform: translate(-50%);
		.header-1 {
			display: flex;
			align-items: center;
			text {
				color: #333;
				font-size: 40rpx;
				font-weight: 550;
				margin-right: 10rpx;
			}
			image {
				width: 21px;
				height: 21px;
			}
		}
		.header-2 {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-top: 10rpx;
			.point-num {
				font-size: 48px;
				color: #333;
				font-weight: 550;
			}
			.point-record {
				color: #02c6a2;
				border-radius: 60rpx;
				padding: 24rpx 60rpx;
				font-size: 14px;
				box-sizing: border-box;
				border: 1px solid #02c6a2;
			}
		}
		.sign-in-box,
		.task-center-box {
			margin: 80rpx auto 50rpx auto;
			width: 100%;
			min-width: 300px;
			height: 221px;
			border-radius: 0 0 40rpx 40rpx;
			background-repeat: no-repeat;
			background-size: 100% 100%; // 或 cover，根据需求选择
			background-position: center;
		}
		.sign-in-box {
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			background-image: url('https://geducloud0617.oss-cn-shenzhen.aliyuncs.com/aier-applet/%E7%AD%BE%E5%88%B0%E8%B5%9A%E7%A7%AF%E5%88%86.png');
			padding: 3% 4% 4% 5%;
			box-sizing: border-box;
			.streak-info {
				display: flex;
				justify-content: flex-end;
			}
		}
		.task-center-box {
			padding: 10% 4% 4% 5%;
			box-sizing: border-box;
			background-image: url('https://geducloud0617.oss-cn-shenzhen.aliyuncs.com/aier-applet/%E4%BB%BB%E5%8A%A1%E4%B8%AD%E5%BF%83%E7%AB%99.png');
		}
		.redeem-box {
			position: relative;
			width: 100%;
			min-height: 221px;
			z-index: 0;
			border-radius: 80px 80px 40rpx 40rpx;
			margin: 80rpx auto 50rpx auto;
			padding: 6.63px 0 8.84px 0;
			box-sizing: border-box;
			.tips {
				width: 100%;
				display: flex;
				justify-content: flex-end;
				color: #bbbbbb;
				font-size: 28rpx;
				font-weight: 550;
				display: flex;
				align-items: center;
				margin-bottom: 4%;
				padding-right: 4%;
				box-sizing: border-box;
			}
			.redeem-wrap {
				padding: 0 4% 14px 5%;
				box-sizing: border-box;
				border-radius: 0 0 40rpx 40rpx;
				width: 100%;
				display: flex;
				flex-wrap: wrap;
				justify-content: space-between;
				margin-top: 24px;
				background-color: #fff;
			}
			.redeem-item {
				width: 47%;
				border-radius: 40rpx;
				padding-bottom: 30rpx;
				margin-bottom: 40rpx;
				box-sizing: border-box;
				border: 1px solid #f0f0f0;
				background: #fff;
			}
			.redeem-item:nth-last-child(2) {
				margin-bottom: 0;
			}
			.redeem-item:last-child {
				margin-bottom: 0;
			}
			.prize-image {
				width: 100%;
				image {
					width: 100%;
				}
			}
			.bottom-box {
				padding: 0 24rpx;
				box-sizing: border-box;
			}
			.prize-name {
				color: #101010;
				font-size: 28rpx;
				margin-top: 26rpx;
			}
			.prize-exchange-amount {
				color: #bbbbbb;
				font-size: 16rpx;
			}
			.prize-bottom {
				width: 100%;
				display: flex;
				align-items: center;
				justify-content: space-between;
				margin-top: 12rpx;
				.left {
					display: flex;
					align-items: center;
					image {
						width: 15px;
						height: 15px;
					}
					.points-number {
						display: inline-block;
						margin-left: 6rpx;
						font-size: 32rpx;
						color: #ffa100;
						font-weight: 550;
					}
				}
				.operate-wrap {
					color: #fff;
					font-size: 20rpx;
					background-color: #02c6a2;
					padding: 8rpx 28rpx;
					box-sizing: border-box;
					border-radius: 40rpx;
				}
			}
		}

		.redeem-box:before {
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 221px;
			background-image: url('https://geducloud0617.oss-cn-shenzhen.aliyuncs.com/aier-applet/%E7%A7%AF%E5%88%86%E5%85%91%E6%8D%A2%E5%A4%84.png');
			background-repeat: no-repeat;
			background-size: 100% 100%; // 或 cover
			background-position: center;
			z-index: -1;
		}

		.container {
			padding: 30rpx;
			background: #fff;
		}
		.title {
			font-size: 36rpx;
			color: #1e80ff;
			font-weight: bold;
			margin-bottom: 20rpx;
		}
		.streak-info {
			color: #101010;
			font-size: 28rpx;
			font-weight: 550;
			display: flex;
			align-items: center;
			margin-bottom: 4%;
			.day-color {
				color: #32579c;
				margin: 0 20rpx;
				display: inline-block;
				font-size: 40rpx;
			}
		}
		.days {
			width: 100%;
			height: 50%;
			display: flex;
			justify-content: space-between;
			margin-bottom: 5%;
		}
		.day-item {
			width: calc((100% - 48px) / 7); // 分7份，间距8px
			height: 100%;
			display: flex;
			flex-direction: column;
			justify-content: space-between;
		}
		.day-box {
			width: 100%;
			height: 85%;
			padding: 24% 0;
			text-align: center;
			background-color: #f0f4f8;
			border-radius: 16rpx;
			box-sizing: border-box;
			display: flex;
			align-items: center;
			flex-direction: column;
			justify-items: center;
			justify-content: space-between;
		}
		.day-box.signed {
			background-color: #cce5ff; /* 已签到：浅蓝色 */
		}
		.day-box.missed {
			background-color: #ffe5e5; /* 已断签：浅红色 */
		}
		.day-box.pending {
			background-color: #e6f9e6; /* 今天未签但仍在连续签到中：浅绿色 */
		}
		.day-label {
			display: flex;
			justify-content: center;
			color: #bbbbbb;
			font-size: 20rpx;
			white-space: nowrap;
			margin-top: 16rpx;
		}
		.signed-label {
			color: #101010;
			font-weight: 550;
		}
		.points-icon {
			display: inline-block;
			margin-bottom: 16rpx;
			width: 24px;
			height: 24px;
		}
		.points {
			font-size: 26rpx;
			font-weight: bold;
			color: #1e80ff;
		}
		.sign-btn {
			width: 85%;
			height: 22%;
			border-radius: 50rpx;
			font-size: 32rpx;
			color: #fff;
			font-weight: 550;
			display: flex;
			align-items: center;
			justify-content: center;
		}
		/* 签到按钮默认样式 */
		.sign-btn.normal {
			background: linear-gradient(to right, #3ba1ff, #1e80ff);
		}
		/* 断签后重新签到 */
		.sign-btn.fail {
			background: linear-gradient(to right, #ff4d4f, #d9363e);
		}
		/* 今天还没签，但处于连续中 */
		.sign-btn.pending {
			background: linear-gradient(to right, #4ad28f, #34c471);
		}
		/* 今天已签，可保持原样或加深色 */
		.sign-btn.signed {
			background: linear-gradient(to right, #ffd54f, #fbc02d, #fb8c00);
		}

		.task-center-item {
			width: 100%;
			height: 27%;
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 2% 0;
			// box-sizing: border-box;
			border-bottom: 1px solid #f0f0f0;
			.left-part {
				width: 70%;
				height: 100%;
				display: flex;
				align-items: center;
				.front {
					// width: 84rpx;
					height: 65%;
					image {
						// width: 100%;
						height: 100%;
						width: 30px;
						height: 30px;
					}
				}
				.after {
					margin-left: 6.5%;
					display: flex;
					flex-direction: column;
					.top {
						display: flex;
						align-items: center;
						.t1 {
							color: #333;
							font-size: 30rpx;
							font-weight: 550;
						}
						.t2 {
							color: #ffa100;
							font-size: 30rpx;
							font-weight: 550;
							margin-left: 16rpx;
							display: inline-block;
						}
					}
					.bottom {
						color: #bbbbbb;
						font-size: 24rpx;
					}
				}
			}
			.operate-wrap {
				margin-right: 5%;
				display: flex;
				align-items: center;
				justify-content: center;
				color: #ffa100;
				width: 23%;
				height: 65%;
				font-size: 28rpx;
				line-height: 65%;
				border-radius: 60rpx;
				box-sizing: border-box;
				border: 1px solid #ffa100;
			}
		}
		.task-center-item:last-child {
			border-bottom: none;
		}
	}
}
</style>
