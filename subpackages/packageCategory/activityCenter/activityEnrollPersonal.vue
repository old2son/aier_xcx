<template>
	<view class="activity-enroll-container">
		<view class="txt-1">{{ requestResult.activityName }}</view>
		<view class="txt-2">
			<text class="txt-2-1" :class="activityStatusInfo.className">{{ activityStatusInfo.text }}</text>
			<text class="txt-2-2">{{ requestResult.endDate }} {{ requestResult.endTime }} 结束</text>
		</view>
		<ReservationDateTimePanel
			theme="activity"
			:is-activity="true"
			:selected-cal="selectedCal"
			:need-time-slot-request="needTimeSlotRequest"
			:date="date"
			:timeSlotList="combinedTimeSlotList"
			:selected-time-slot-index="selectedTimeSlotIndex"
			time-title="活动时段"
			morning-title="固定时间"
			:weight="true"
			@date-selected="handleDateSelected"
			@time-slot-numbers="updateTimeSlotNumbers"
			@time-slot-selected="handleTimeSlotSelected"
			@select-cal="selectedCal = $event"
		/>

		<ReservationMemberPanel :member-list="memberList" :child-age-max="17" @change="memberList = $event" />

		<!-- <view class="partner-title">您了解本次活动的渠道</view>
		<van-dropdown-menu>
			<van-dropdown-item :value="channelValue" :options="partnerOptionC" @change="handleDropdownChangeC" />
		</van-dropdown-menu> -->

		<view class="submit-btn">
			<van-button color="#32579c" round size="large" @click="submit">确认提交</van-button>
		</view>

		<!-- <ReservationPopup :show="showReservationPopup" @close="handlePopupClose" /> -->

		<van-dialog id="van-dialog" />
	</view>
</template>

<script>
import dayjs from 'dayjs';
import { mapState } from 'vuex';
import { requestSubscribe, handleReservationResult } from '@/utils/reservation.js';
import { personalActivityReservation } from '@/api/index';

export default {
	data() {
		return {
			title: '',
			requestResult: {},

			showReservationPopup: false, // 控制弹出层的显示状态

			date: null,
			week: null,
			selectedTimeSlot: null, // 当前选中的时段
			selectedTimeSlotIndex: -1, // 当前选中的时段索引
			timeSlotNumbers: null, // 子组件返回的预约人数数据
			needTimeSlotRequest: true, // 是否需要请求时间段信息

			radio: '0',
			channelValue: 1,
			// partnerOptionC: [
			// 	{ text: '公众号/抖音推送', value: 0 },
			// 	{ text: '人人通', value: 1 },
			// 	{ text: '科普馆社群', value: 2 },
			// 	{ text: '患者社群', value: 3 },
			// 	{ text: '朋友/家人推荐', value: 4 },
			// 	{ text: '其他', value: 5 }
			// ],
			// channel: '人人通',

			memberList: [],

			selectedCal: null
		};
	},
	computed: {
		...mapState('moduleActivity', ['selectedActivity']),
		activityStatusInfo() {
			const startAt = this.buildActivityDateTime(this.requestResult.activityTime, this.requestResult.startTime);
			const endAt = this.buildActivityDateTime(this.requestResult.endDate, this.requestResult.endTime);
			const now = dayjs();

			if (endAt && now.isAfter(endAt)) {
				return {
					text: '已结束',
					className: 'status-end'
				};
			}

			if (startAt && now.isBefore(startAt)) {
				return {
					text: '即将开始',
					className: 'status-soon'
				};
			}

			return {
				text: '进行中',
				className: 'status-ing'
			};
		},
		// 合并时段数据和预约人数
		combinedTimeSlotList() {
			const fixedTimeSlot = this.getFixedTimeSlotName();
			const surplusNumber = this.getActivitySurplusNumber();
			const isActivitySlotClosed = this.isActivitySlotClosed();

			if (!fixedTimeSlot) {
				return [];
			}

			return [
				{
					name: fixedTimeSlot,
					surplusNumber,
					disabled: !this.date || surplusNumber <= 0 || isActivitySlotClosed
				}
			];
		}
	},
	methods: {
		padNumber(value) {
			return String(value).padStart(2, '0');
		},
		normalizeDateText(dateText) {
			if (!dateText) {
				return '';
			}

			const match = String(dateText).match(/(\d{4})[年/-](\d{1,2})[月/-](\d{1,2})/);
			if (!match) {
				return '';
			}

			const [, year, month, day] = match;
			return `${year}-${this.padNumber(month)}-${this.padNumber(day)}`;
		},
		normalizeTimeText(timeText) {
			if (!timeText) {
				return '';
			}

			const match = String(timeText).match(/(\d{1,2})[:：](\d{1,2})/);
			if (!match) {
				return '';
			}

			const [, hour, minute] = match;
			return `${this.padNumber(hour)}:${this.padNumber(minute)}`;
		},
		buildActivityDateTime(dateText, timeText) {
			const normalizedDate = this.normalizeDateText(dateText);
			const normalizedTime = this.normalizeTimeText(timeText);

			if (!normalizedDate || !normalizedTime) {
				return null;
			}

			const dateTime = dayjs(`${normalizedDate} ${normalizedTime}`);
			return dateTime.isValid() ? dateTime : null;
		},
		isActivitySlotClosed() {
			if (!this.date) {
				return false;
			}

			const slotStartAt = this.buildActivityDateTime(this.date, this.requestResult.startTime);

			if (!slotStartAt) {
				return false;
			}

			return dayjs().isAfter(slotStartAt.subtract(30, 'minute'));
		},
		getFixedTimeSlotName() {
			const startTime = this.normalizeTimeText(this.requestResult.startTime);
			const endTime = this.normalizeTimeText(this.requestResult.endTime);

			if (!startTime || !endTime) {
				return '';
			}

			return `${startTime}-${endTime}`;
		},
		getActivitySurplusNumber() {
			const requestResult = this.requestResult || {};
			const candidateKeys = ['surplusNumber', 'numbers', 'remainNumber', 'remainingNumber', 'residueNumber'];

			for (let i = 0; i < candidateKeys.length; i++) {
				const value = requestResult[candidateKeys[i]];
				if (value !== undefined && value !== null && value !== '') {
					return Number(value) || 0;
				}
			}

			return 0;
		},
		async getDetailData() {
			this.requestResult = this.selectedActivity;
			console.log('报名详情数据', this.selectedActivity);
		},
		handlePopupClose() {
			this.showReservationPopup = false; // 监听子组件关闭事件
		},
		// 处理日期选择
		handleDateSelected({ date, week }) {
			this.date = date;
			this.week = week;
			this.selectedTimeSlot = null;
			this.selectedTimeSlotIndex = -1;
		},
		// 接收子组件返回的预约人数数据
		updateTimeSlotNumbers(numbers) {
			// this.timeSlotNumbers = numbers;
		},
		// 选择四个时间段
		handleTimeSlotSelected(slot, index) {
			this.selectedTimeSlot = slot;
			this.selectedTimeSlotIndex = index;
		},
		// handleDropdownChangeC(value) {
		// 	this.channel = this.partnerOptionC[value.detail].text;
		// },
		async submit() {
			if (!this.date) {
				this.$toast({
					duration: 3000,
					message: '请选择预约日期'
				});
				return;
			}

			if (!this.selectedTimeSlot) {
				this.$toast({
					duration: 3000,
					message: '当前日期暂无可预约活动时段'
				});
				return;
			}

			const hasAdultMember = this.memberList.some((item) => !!item.userPhone);
			if (this.memberList.length === 0 || !hasAdultMember) {
				this.$toast({
					duration: 3000,
					message: '至少需要添加一位成年人'
				});
				return;
			}

			await requestSubscribe();

			uni.showLoading({
				title: '提交中...',
				mask: true
			});
			// 包装请求和定时器为一个 Promise
			const delayPromise = new Promise((resolve) => {
				setTimeout(resolve, 1500); // 至少展示 1500 毫秒
			});

			Promise.all([
				personalActivityReservation({
					activityId: this.requestResult.activityId,
					activityName: this.requestResult.activityName,
					// channel: this.channel,
					dateTime: this.date,
					timeSlot: this.selectedTimeSlot,
					week: this.week,
					members: this.memberList
				}),
				delayPromise
			])
				.then(([res]) => {
					handleReservationResult(this, res);
				})
				.finally(() => {
					uni.hideLoading();
				});
		}
	},
	onLoad() {
		this.getDetailData();
	}
};
</script>

<style lang="scss" scoped>
.activity-enroll-container {
	width: 100%;
	box-sizing: border-box;
	background-color: #fff;
	overflow-y: auto;
	padding: 32rpx 32rpx 80px 32rpx;
	.txt-1 {
		color: #333;
		font-size: 32rpx;
		font-weight: 550;
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
		.txt-2-1.status-ing {
			color: #02c6a2;
		}
		.txt-2-1.status-soon {
			color: #ff9400;
		}
		.txt-2-1.status-end {
			color: #999;
		}
		.txt-2-2 {
			color: #7c7e80;
			margin-left: 16rpx;
			display: inline-block;
		}
	}
	.divider {
		height: 1px;
		background-color: #eaeaea;
		margin: 30rpx 0;
	}
}

.partner-title {
	font-weight: 550;
	font-size: 32rpx;
	margin: 40rpx 0 20rpx 0;
}
.submit-btn {
	margin-top: 80rpx;
}

::v-deep .van-radio {
	margin-top: 24rpx;
}
::v-deep .van-cell {
	width: 58%;
	border-radius: 20rpx;
	background-color: #ebf1ff;
	border: 1px solid #d0d7f6;
}
::v-deep .van-dropdown-item__option .van-cell {
	border: none;
	background-color: transparent;
}
::v-deep .van-cell--clickable {
	width: 100%;
	border-radius: 20rpx;
}
::v-deep .van-dropdown-menu {
	width: 58%;
	border-radius: 20rpx;
	margin-bottom: 30rpx;
}
::v-deep .travel-field {
	margin-top: 14rpx;
}
::v-deep .van-dropdown-item {
	width: 53%;
	margin-left: 3%;
	margin-top: 40rpx;
	border-radius: 20rpx;
	overflow: hidden;
	border: 1px solid #d1cece;
}
::v-deep .van-dropdown-item__option {
	box-shadow: none;
}
::v-deep .van-dropdown-menu__item {
	display: flex;
	justify-content: space-between;
}
::v-deep .van-dropdown-menu__title {
	width: 90%;
	padding-left: 12%;
	box-sizing: border-box;
}

::v-deep .van-dialog {
	color: #434343;
	font-size: 56rpx;
}
::v-deep .van-dialog__message-text {
	color: #434343;
	font-size: 45rpx;
}
::v-deep .van-dialog__message {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 90rpx;
	padding: 40rpx 0;
}
::v-deep .van-button--danger {
	background: #32579c;
	height: 90rpx;
	font-size: 18px;
	color: #fff !important;
}
</style>
