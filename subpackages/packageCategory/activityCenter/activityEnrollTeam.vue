<template>
	<view class="team-reservation-container">
		<view class="txt-1">{{ requestResult.activityName }}</view>
		<view class="txt-2">
			<text class="txt-2-1" :class="activityStatusInfo.className">{{ activityStatusInfo.text }}</text>
			<text class="txt-2-2">{{ requestResult.endDate }} {{ requestResult.endTime }} 结束</text>
		</view>

		<view class="tip-title-1">
			<view>预约说明：</view>
			<view>研学合作仅供学校、团队组织等填写，以便在线提前申请参观时间。</view>
		</view>

		<ExcelSave />

		<view class="divider" />
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
			@date-selected="handleDateSelected"
			@time-slot-numbers="updateTimeSlotNumbers"
			@time-slot-selected="handleTimeSlotSelected"
			@select-cal="selectedCal = $event"
		/>

		<ReservationTeamPanel
			theme="activity"
			:form-data="{ leaderName, phoneNumber, unitName, visitorsNumber }"
			:errors="{ leaderNameError, phoneNumberError, unitNameError, visitorsNumberError }"
			@change="handleTeamFormChange"
		/>

		<ExcelUpload @getFile="handleExcelFile" />

		<OnlineAsk :askInfo="askInfo" />

		<view class="tip-title">提示：活动时段固定，名额有限，报满即止。</view>

		<view class="submit-btn">
			<button class="custom-button" @click="submit()">确认提交</button>
		</view>

		<!-- <ReservationPopup :show="showReservationPopup" @close="handlePopupClose" /> -->

		<van-dialog id="van-dialog" />
	</view>
</template>

<script>
import dayjs from 'dayjs';
import { mapState } from 'vuex';
import myData from '@/data/appointment.json';
import { handleReservationResult } from '@/utils/reservation.js';
import { personalActivityTeamReservation } from '@/api/index';

export default {
	data() {
		return {
			title: '',
			requestResult: {},

			showReservationPopup: false,
			date: null,
			week: null,
			needTimeSlotRequest: true,
			selectedTimeSlot: null,
			selectedTimeSlotIndex: -1,
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
			base64File: '',
			isInActivityDateRange: true
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
					disabled: !this.date || !this.isInActivityDateRange || surplusNumber <= 0 || isActivitySlotClosed
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
		},
		handlePopupClose() {
			this.showReservationPopup = false;
		},
		handleDateSelected({ date, week, isInSelectedActivityRange }) {
			this.date = date;
			this.week = week;
			this.isInActivityDateRange = isInSelectedActivityRange !== false;
			this.selectedTimeSlot = null;
			this.selectedTimeSlotIndex = -1;
		},
		handleTimeSlotSelected(slot, index) {
			this.selectedTimeSlot = slot;
			this.selectedTimeSlotIndex = index;
		},
		updateTimeSlotNumbers() {},
		handleExcelFile(file) {
			this.base64File = file;
		},
		handleTeamFormChange({ field, value }) {
			this[field] = value;
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

			if (!this.date) {
				uni.showToast({
					title: '请选择预约日期',
					icon: 'none',
					duration: 3000
				});
				return;
			}

			if (!this.selectedTimeSlot) {
				uni.showToast({
					title: '当前日期暂无可预约活动时段',
					icon: 'none',
					duration: 3000
				});
				return;
			}

			const surplusNumber = this.getActivitySurplusNumber();
			if (!Number.isNaN(surplusNumber) && visitors > surplusNumber) {
				this.visitorsNumberError = `最多可预约 ${surplusNumber} 人`;
				uni.showToast({
					title: `最多可预约 ${surplusNumber} 人`,
					icon: 'none',
					duration: 3000
				});
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
				personalActivityTeamReservation({
					activityId: this.requestResult.activityId,
					activityName: this.requestResult.activityName,
					name: this.leaderName,
					phone: this.phoneNumber,
					unitName: this.unitName,
					colleagues: this.visitorsNumber,
					dateTime: this.date,
					week: this.week,
					// timeSlot: this.selectedTimeSlot,
					excelUrl: this.base64File
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

<style lang="scss">
.team-reservation-container {
	width: 100%;
	overflow-y: auto;
	box-sizing: border-box;
	background-color: #f8f9ff;
	padding: 40rpx 4% 100rpx 4%;

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
}

.tip-title-1 {
	width: 94%;
	margin: 30rpx 0 0 0;
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

.divider {
	height: 1px;
	background-color: #eaeaea;
	margin: 30rpx 0;
}

.tip-title {
	margin: 60rpx 0 12rpx 0;
	color: #999;
	font-size: 24rpx;
}

.download-card {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 24rpx;
	margin-top: 24rpx;
	border-radius: 100rpx;
	background: #fff;
	box-shadow: 0 12rpx 32rpx rgba(50, 87, 156, 0.12);
}

.download-left {
	flex: 1;
	margin-right: 20rpx;
}

.download-title {
	line-height: 1.5;
	color: #5b79ab;
	font-size: 24rpx;
	font-weight: 400;
}

::v-deep .download-card .van-button {
	padding: 0 28rpx;
	border-radius: 100rpx !important;
	color: #fff !important;
	border-color: #4794ff !important;
	background: #4794ff !important;
}

.file-popup {
	display: flex;
	flex-direction: column;
	gap: 24rpx;
	padding: 40rpx 32rpx calc(env(safe-area-inset-bottom) + 32rpx);
}

.popup-title {
	margin-bottom: 12rpx;
	color: #2a2a2a;
	text-align: center;
	font-size: 32rpx;
	font-weight: bold;
}

.popup-tip {
	line-height: 1.7;
	margin: 12rpx 0 28rpx;
	color: #888;
	text-align: center;
	font-size: 24rpx;
}

.upload-card {
	width: 94%;
	margin: 40rpx auto;
	padding: 28rpx;
	border-radius: 24rpx;
	box-sizing: border-box;
	background: #fafdff;
}

.upload-title {
	font-size: 30rpx;
	font-weight: bold;
	color: #2a2a2a;
}

.upload-desc {
	margin-top: 12rpx;
	font-size: 24rpx;
	color: #888;
	line-height: 1.6;
}

.upload-btn {
	margin-top: 24rpx;
	height: 84rpx;
	line-height: 84rpx;
	text-align: center;
	border-radius: 999rpx;
	border: 2rpx dashed #7fa8ef;
	background: #eef5ff;
	color: #5b79ab;
	font-size: 28rpx;
}

.delete-btn {
	width: 96rpx;
	height: 56rpx;
	line-height: 56rpx;
	text-align: center;
	border-radius: 28rpx;
	background: #fbe9e9;
	color: #d85b5b;
	font-size: 24rpx;
	flex-shrink: 0;
}

.file-row {
	margin-top: 24rpx;
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.uploaded-file {
	flex: 1;
	min-width: 0;
	padding: 14rpx 20rpx;
	border-radius: 16rpx;
	background: #eef5ff;
	font-size: 24rpx;
	color: #32579c;
	word-break: break-all;
}

.submit-btn {
	width: 100%;
	margin: 32rpx auto 0 auto;
	padding-bottom: 60rpx;
	box-sizing: border-box;

	.custom-button {
		height: 88rpx;
		line-height: 88rpx;
		font-size: 40rpx;
		border-radius: 50rpx;
		color: #fff;
		background-color: #32579c;
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
