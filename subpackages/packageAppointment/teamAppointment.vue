<template>
	<view class="team-reservation-container">
		<view class="tip-title-1">
			<view>预约说明：</view>
			<view>研学合作仅供学校、团队组织等填写，以便在线提前申请参观时间。</view>
		</view>

		<ExcelSave />

		<ReservationDateTimePanel
			:selected-cal="selectedCal"
			:need-time-slot-request="false"
			:date="date"
			:timeSlotList="timeSlotList"
			:selected-time-slot-index="selectedTimeSlotIndex"
			time-tip="每时段报名满15人将自动成团，我馆提供科普讲解服务。"
			@date-selected="handleDateSelected"
			@time-slot-selected="handleTimeSlotSelected"
			@select-cal="selectedCal = $event"
		/>

		<ReservationTeamPanel
			:form-data="{ leaderName, phoneNumber, unitName, visitorsNumber }"
			:errors="{ leaderNameError, phoneNumberError, unitNameError, visitorsNumberError }"
			@change="handleTeamFormChange"
		/>

		<ExcelUpload @getFile="handleExcelFile" />

		<OnlineAsk :askInfo="askInfo" />

		<view class="submit-btn">
			<button class="custom-button" @click="submit()">确认提交</button>
		</view>

		<ReservationPopup :type="1" :show="showReservationPopup" @close="handlePopupClose" />

		<van-dialog id="van-dialog" />
	</view>
</template>

<script>
import myData from '@/data/appointment.json';
import { handleReservationResult } from '@/utils/reservation.js';
import { getReservationTimeSlot, teamReservation } from '@/api/index.js';

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

			isShowCal: false,
			isShowFilePopup: false,

			// 错误提示字段
			leaderNameError: '',
			phoneNumberError: '',
			unitNameError: '',
			visitorsNumberError: '',

			selectedCal: null,
			base64File: ''
		};
	},
	computed: {},
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
		handleExcelFile(file) {
			this.base64File = file;
		},
		handleTeamFormChange({ field, value }) {
			this[field] = value;
		},
		getReservationTimeSlotData() {
			getReservationTimeSlot().then((res) => {
				this.timeSlotList = res.data;
			});
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

			if (!this.base64File) {
				uni.showToast({
					title: '请上传预约文件',
					icon: 'none',
					duration: 3000
				});
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
					timeSlot: this.selectedTimeSlot,
					excelUrl: this.base64File
				}),
				delayPromise
			])
				.then(([res]) => {
					handleReservationResult(this, res, false);
				})
				.finally(() => {
					uni.hideLoading();
				});
		}
	},
	onLoad() {
		this.getReservationTimeSlotData();
	}
};
</script>

<style lang="scss">
.team-reservation-container {
	width: 100%;
	overflow-y: auto;
	box-sizing: border-box;
	background-color: #f8f9ff;
	padding: 40rpx 4% 100rpx 4%;
}

.tip-title-1 {
	width: 94%;
	margin: 30rpx auto 0 auto;
	box-sizing: border-box;
	color: #7f7f7f;
	font-size: 28rpx;

	view:first-child {
		margin-bottom: 20rpx;
	}
	view:nth-child(2) {
		line-height: 1.5;
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
