<template>
	<view class="team-reservation-container">
		<view class="tip-title-1">
			<view>预约说明：</view>
			<view>研学合作仅供学校、团队组织等填写，以便在线提前申请参观时间。</view>
		</view>

		<view class="divider" />
		<view class="date-picker-title">日期选择</view>

		<DatePicker :disabled-weekdays="[1]" @date-selected="handleDateSelected" />

		<view class="divider" />
		<view class="time-slot-title">时段选择</view>
		<view class="tip-title-2">每时段报名满15人将自动成团，我馆提供科普讲解服务。</view>
		<view class="morning-title">上午时段</view>

		<TimeSlotPicker
			:timeSlotList="timeSlotList"
			:selectedTimeSlotIndex="selectedTimeSlotIndex"
			:needTimeSlotRequest="false"
			@timeSlotSelected="handleTimeSlotSelected"
		/>

		<view class="team-submits-info-box">
			<van-field
				label="领队姓名"
				type="text"
				maxlength="8"
				placeholder="请输入领队者姓名"
				:value="leaderName"
				:error-message="leaderNameError"
				@input="validateInput('leaderName', $event)"
			/>
			<van-field
				label="手机号码"
				type="tel"
				maxlength="11"
				placeholder="请输入联系手机号码"
				:value="phoneNumber"
				:error-message="phoneNumberError"
				@input="phoneNumber = $event.detail"
			/>
			<van-field
				label="单位名称"
				type="text"
				maxlength="20"
				placeholder="请输入单位名称"
				:value="unitName"
				:error-message="unitNameError"
				@input="validateInput('unitName', $event)"
			/>
			<van-field
				label="参观人数"
				type="digit"
				maxlength="5"
				placeholder="参观人数宜在15-50之间"
				:value="visitorsNumber"
				:error-message="visitorsNumberError"
				@input="visitorsNumber = $event.detail"
			/>
		</view>

		<OnlineAsk :askInfo="askInfo" />

		<view class="submit-btn">
			<button class="custom-button" @click="submit()">确认提交</button>
		</view>

		<ReservationPopup :show="showReservationPopup" @close="handlePopupClose" />
		<van-dialog id="van-dialog" />
	</view>
</template>

<script>
import myData from '@/data/appointment.json';
import Dialog from '@/wxcomponents/vant/dialog/dialog';
import { getReservationTimeSlot, teamReservation } from '@/api';

export default {
	data() {
		return {
			showReservationPopup: true,
			date: null,
			week: null,
			timeSlotList: [],
			selectedTimeSlot: null,
			selectedTimeSlotIndex: 0,
			leaderName: null,
			phoneNumber: null,
			unitName: null,
			visitorsNumber: null,
			askInfo: myData[1],

			// 错误提示字段
			leaderNameError: '',
			phoneNumberError: '',
			unitNameError: '',
			visitorsNumberError: ''
		};
	},
	onLoad() {
		this.getReservationTimeSlotData();
	},
	methods: {
		handlePopupClose() {
			this.showReservationPopup = false;
		},
		handleDateSelected({ date, week }) {
			this.date = date;
			this.week = week;
		},
		handleTimeSlotSelected(slot, index) {
			this.selectedTimeSlot = slot;
			this.selectedTimeSlotIndex = index;
		},
		getReservationTimeSlotData() {
			getReservationTimeSlot().then((res) => {
				this.timeSlotList = res.data;
				console.log('四个时间段的时间数据', this.timeSlotList);
			});
		},
		validateInput(fieldName, event) {
			const value = event.detail;
			const allowedRegex = /^[a-zA-Z\u4e00-\u9fa5\s]*$/;
			if (!allowedRegex.test(value)) {
				this[fieldName] = value.replace(/[^a-zA-Z\u4e00-\u9fa5\s]/g, '');
				uni.showToast({
					title: '只能输入英文或中文，不允许特殊符号或数字',
					icon: 'none',
					duration: 3000
				});
			} else {
				this[fieldName] = value;
			}
		},
		submit() {
			this.leaderNameError = '';
			this.phoneNumberError = '';
			this.unitNameError = '';
			this.visitorsNumberError = '';

			const nameRegex = /^[a-zA-Z\u4e00-\u9fa5\s]{1,20}$/;
			const phoneRegex = /^1[3-9]\d{9}$/;
			const visitors = Number(this.visitorsNumber);

			if (!this.leaderName) {
				this.leaderNameError = '领队者姓名不能为空';
				return;
			} else if (!nameRegex.test(this.leaderName)) {
				this.leaderNameError = '姓名只能包含中文或英文';
				return;
			}

			if (!this.phoneNumber) {
				this.phoneNumberError = '手机号不能为空';
				return;
			} else if (!phoneRegex.test(this.phoneNumber)) {
				this.phoneNumberError = '手机号格式错误';
				return;
			}

			if (!this.unitName) {
				this.unitNameError = '单位名称不能为空';
				return;
			} else if (!nameRegex.test(this.unitName)) {
				this.unitNameError = '单位名称只能包含中文或英文';
				return;
			}

			if (!this.visitorsNumber) {
				this.visitorsNumberError = '参观人数不能为空';
				return;
			} else if (isNaN(visitors) || visitors < 15 || visitors > 50) {
				this.visitorsNumberError = '参观人数需在15-50之间';
				return;
			}

			uni.showLoading({
				title: '提交中...',
				mask: true
			});

			const delayPromise = new Promise((resolve) => {
				setTimeout(resolve, 1500);
			});

			Promise.all([
				teamReservation({
					name: this.leaderName,
					phone: this.phoneNumber,
					unitName: this.unitName,
					colleagues: this.visitorsNumber,
					dateTime: this.date,
					week: this.week,
					timeSlot: this.selectedTimeSlot
				}),
				delayPromise
			])
				.then(([res]) => {
					if (res.code === 200 && res.message == '您已成功预约') {
						Dialog.alert({
							message: '您已成功预约',
							theme: 'round-button',
							confirmButtonText: '我知道了'
						}).then(() => {
							const pages = getCurrentPages();
							if (pages.length > 1) {
								uni.navigateBack({
									delta: 1
								});
							} else {
								uni.reLaunch({
									url: '/pages/tabBar/home/home'
								});
							}
						});
					} else {
						this.$toast({
							duration: 3000,
							message: res.message
						});
					}
				})
				.finally(() => {
					uni.hideLoading();
				});
		}
	}
};
</script>

<style lang="scss">
.team-reservation-container {
	width: 100%;
	height: 100%;
	overflow-y: auto;
	box-sizing: border-box;
	background-color: #f8f9ff;
	padding: 40rpx 4% 100rpx 4%;
}

.date-picker-title {
	width: 94%;
	margin: 40rpx auto;
	font-size: 36rpx;
	color: #2a2a2a;
}

.tip-title-1 {
	width: 94%;
	margin: 30rpx auto 0 auto;
	box-sizing: border-box;
	font-size: 28rpx;
	color: #7f7f7f;
	view:first-child {
		margin-bottom: 20rpx;
	}
	view:nth-child(2) {
		line-height: 1.5;
	}
}

.tip-title-2 {
	width: 94%;
	margin: 0 auto;
	font-size: 28rpx;
	color: #32579c;
	line-height: 1.5;
}

.divider {
	width: 94%;
	margin: 40rpx auto;
	border: 1rpx solid #cfcfcf;
}

.time-slot-title {
	width: 94%;
	margin: 40rpx auto 16rpx auto;
	font-size: 36rpx;
	color: #2a2a2a;
}

.morning-title {
	width: 94%;
	margin: 40rpx auto;
	font-size: 36rpx;
	color: #2a2a2a;
}

.team-submits-info-box {
	width: 94%;
	margin: 40rpx auto;
	border-radius: 24rpx;
	overflow: hidden;
	background-color: #fff;
	padding: 30rpx;
	box-sizing: border-box;

	.uni-forms-item {
		margin-bottom: 30rpx;

		&:last-child {
			margin-bottom: 0;
		}

		.uni-forms-item__label {
			color: #2a2a2a;
			font-size: 28rpx;
			width: 160rpx !important;
		}
	}
}

.submit-btn {
	width: 94%;
	margin: 60rpx auto 0 auto;
	padding-bottom: 60rpx;
	box-sizing: border-box;

	.custom-button {
		background-color: #32579c;
		color: #fff;
		border-radius: 50rpx;
		font-size: 40rpx;
		height: 88rpx;
		line-height: 88rpx;
	}
}

::v-deep .van-dialog {
	top: 83% !important;
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
	background: #32579c !important;
	height: 90rpx;
	font-size: 18px;
	color: #fff !important;
}
</style>
