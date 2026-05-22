<template>
	<view class="activity-enroll-container">
		<view class="txt-1">{{ requestResult.activityName }}</view>
		<view class="txt-2">
			<text class="txt-2-1">进行中</text>
			<text class="txt-2-2">{{ requestResult.endTime }} 结束</text>
		</view>
		<view class="date-picker-title">日期选择</view>

		<view class="date-picker-wrap">
			<DatePicker
				:isActivity="true"
				:disabled-weekdays="[1]"
				:selected-cal="selectedCal"
				:needTimeSlotRequest="needTimeSlotRequest"
				@date-selected="handleDateSelected"
				@time-slot-numbers="updateTimeSlotNumbers"
			/>
			<view class="calendar-trigger" @click="isShowCal = true">
				<van-icon name="calendar-o" :color="calendarIconColor" />
				<van-icon name="arrow-down" :color="calendarIconColor" />
			</view>
		</view>
		<CalendarPick
			:show-popup="isShowCal"
			:what-a-day="date"
			@closePopup="handleCalendarClose"
			@selectCal="handleSelectCal"
		/>

		<view class="divider" />
		<view class="time-slot-title">时段选择</view>
		<view class="morning-title">上午时段</view>

		<TimeSlotPicker
			:weight="true"
			:timeSlotList="combinedTimeSlotList"
			:selectedTimeSlotIndex="selectedTimeSlotIndex"
			:needTimeSlotRequest="needTimeSlotRequest"
			:select-day="date"
			@timeSlotSelected="handleTimeSlotSelected"
		/>

		<ReservationMemberPanel :member-list="memberList" :child-age-max="17" @change="memberList = $event" />

		<view class="partner-title">您了解本次活动的渠道</view>
		<van-dropdown-menu>
			<van-dropdown-item :value="channelValue" :options="partnerOptionC" @change="handleDropdownChangeC" />
		</van-dropdown-menu>

		<view class="submit-btn">
			<van-button color="#32579c" round size="large" @click="submit">确认提交</van-button>
		</view>

		<ReservationPopup :show="showReservationPopup" @close="handlePopupClose" />
		<van-dialog id="van-dialog" />
	</view>
</template>

<script>
import { mapState } from 'vuex';
import ReservationMemberPanel from '@/components/ReservationMemberPanel/ReservationMemberPanel.vue';
import Dialog from '@/wxcomponents/vant/dialog/dialog';
import { getReservationTimeSlot, getReservationWeekNumbers, personalActivityReservation } from '@/api/index';

export default {
	components: {
		ReservationMemberPanel
	},
	data() {
		return {
			title: '',
			requestResult: {},

			showReservationPopup: false, // 控制弹出层的显示状态

			date: null,
			week: null,
			selectedTimeSlot: null, // 当前选中的时段
			selectedTimeSlotIndex: 0, // 当前选中的时段索引
			timeSlotList: [], // 四个预约时间段
			timeSlotNumbers: null, // 子组件返回的预约人数数据
			needTimeSlotRequest: true, // 是否需要请求时间段信息

			radio: '0',
			needExplainServiceNum: 50, // 需要讲解服务的人数，后台获取
			channelValue: 1,
			partnerOptionC: [
				{ text: '公众号/抖音推送', value: 0 },
				{ text: '人人通', value: 1 },
				{ text: '科普馆社群', value: 2 },
				{ text: '患者社群', value: 3 },
				{ text: '朋友/家人推荐', value: 4 },
				{ text: '其他', value: 5 }
			],
			channel: '人人通',

			isShowCal: false,
			memberList: [],

			selectedCal: null
		};
	},
	computed: {
		...mapState('moduleActivity', ['selectedActivity']),
		calendarIconColor() {
			return this.isDateInPickerRange(this.date) ? '#32579c' : '#60a2fe';
		},
		// 合并时段数据和预约人数
		combinedTimeSlotList() {
			if (this.timeSlotNumbers) {
				return this.timeSlotList.map((slot, index) => {
					const numbersKey = `numbers${index + 1}`;
					// 获取对应的预约人数，默认为 0
					const reservationNumber = this.timeSlotNumbers[numbersKey] || 0;
					console.log('预约人数：：', reservationNumber);
					return {
						...slot, // 保留原有时段对象的所有属性
						reservationNumber // 添加 reservationNumber 字段
					};
				});
			}
			// 如果没有 timeSlotNumbers 数据，直接返回 timeSlotList
			return this.timeSlotList;
		}
	},
	methods: {
		parseDateText(dateText) {
			if (!dateText) {
				return null;
			}
			const match = String(dateText).match(/^(\d{4})年(\d{2})月(\d{2})日$/);
			if (!match) {
				return null;
			}
			const [, year, month, day] = match;
			return new Date(Number(year), Number(month) - 1, Number(day));
		},
		isDateInPickerRange(dateText) {
			const selectedDate = this.parseDateText(dateText);
			if (!selectedDate) {
				return true;
			}
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			const endDate = new Date(today);
			endDate.setDate(today.getDate() + 4);
			return selectedDate >= today && selectedDate <= endDate;
		},
		async getDetailData() {
			this.requestResult = this.selectedActivity;
		},
		handlePopupClose() {
			this.showReservationPopup = false; // 监听子组件关闭事件
		},
		// 获取初始的时段数据
		getReservationTimeSlotData() {
			getReservationTimeSlot().then((res) => {
				this.timeSlotList = res.data;
				console.log('四个时间段的时间数据', this.timeSlotList);
			});
		},
		// 处理日期选择
		handleDateSelected({ date, week }) {
			this.date = date;
			this.week = week;
			// if (this.date && this.selectedTimeSlot) {
			// 	getReservationWeekNumbers({
			// 		dateTime: this.date,
			// 		timeSlot: this.selectedTimeSlot
			// 	}).then((res) => {
			// 		if (res.code === 200 && res.message === '查询成功') {
			// 			this.needExplainServiceNum = res.data.numbers;
			// 		}
			// 	});
			// }
		},
		// 接收子组件返回的预约人数数据
		updateTimeSlotNumbers(numbers) {
			console.log('预约人数', numbers);
			this.timeSlotNumbers = numbers;
		},
		// 选择四个时间段
		handleTimeSlotSelected(slot, index) {
			this.selectedTimeSlot = slot;
			this.selectedTimeSlotIndex = index;
			if (this.date && this.selectedTimeSlot) {
				getReservationWeekNumbers({
					dateTime: this.date,
					timeSlot: this.selectedTimeSlot
				}).then((res) => {
					console.log('选择讲解服务的人数', res);
					if (res.code === 200 && res.message == '查询成功') {
						this.needExplainServiceNum = res.data.numbers;
					}
				});
			}
		},
		handleDropdownChangeC(value) {
			this.channel = this.partnerOptionC[value.detail].text;
		},
		handleCalendarClose() {
			this.isShowCal = false;
		},
		handleSelectCal(res) {
			this.selectedCal = res;
		},
		submit() {
			if (this.memberList.length === 0) {
				this.$toast({
					duration: 3000,
					message: '至少需要添加一位成年人'
				});
				return;
			}

			const hasAdultMember = this.memberList.some((item) => !!item.idNumber);
			if (!hasAdultMember) {
				this.$toast({
					duration: 3000,
					message: '至少需要添加一位成年人'
				});
				return;
			}

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
					channel: this.channel,
					dateTime: this.date,
					timeSlot: this.selectedTimeSlot,
					week: this.week,
					members: this.memberList
				}),
				delayPromise
			])
				.then(([res]) => {
					if (res.code === 200 && res.message === '您已成功预约') {
						Dialog.alert({
							message: '您已成功预约',
							theme: 'round-button',
							confirmButtonText: '我知道了',
							beforeClose: (action) =>
								new Promise((resolve) => {
									if (action === 'confirm') {
										uni.reLaunch({
											url: `/subpackages/packageMine/points/index?remind=true`
										});
									}
									resolve(true); // 无论是否跳转都允许关闭
								})
						});
					} else {
						uni.hideLoading();
						setTimeout(() => {
							this.$toast({
								duration: 3000,
								message: res.message
							});
						}, 50);
					}
				})
				.finally(() => {
					uni.hideLoading();
				});
		}
	},
	onLoad() {
		this.getDetailData();
		this.getReservationTimeSlotData();
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
		.txt-2-2 {
			color: #7c7e80;
			margin-left: 16rpx;
			display: inline-block;
		}
	}
	.date-picker-title {
		color: #2a2a2a;
		font-size: 32rpx;
		font-weight: 550;
		margin: 56rpx auto 6rpx auto;
	}
	.divider {
		height: 1px;
		background-color: #eaeaea;
		margin: 30rpx 0;
	}
	.morning-title {
		color: #2a2a2a;
		font-weight: 550;
		font-size: 32rpx;
	}
}

.time-slot-title,
.member-title,
.name-title,
.age-title,
.phone-title,
.partner-title {
	font-weight: 550;
	font-size: 32rpx;
	margin: 40rpx 0 20rpx 0;
}
.date-picker-title {
	font-size: 32rpx;
	margin-bottom: 20rpx;
}

.morning-title {
	font-size: 32rpx;
	color: #2a2a2a;
}

.divider {
	height: 1px;
	background-color: #eaeaea;
	margin: 30rpx 0;
}

.date-picker-wrap {
	display: flex;
	justify-content: space-between;
	align-items: center;
	width: 100%;
	gap: 20rpx;
}

.calendar-trigger {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}

.add-member-btns {
	display: flex;
	justify-content: space-between;
	gap: 20px;
	margin-top: 30rpx;

	van-button {
		flex: 1;
	}
}

.member-title {
	display: flex;
	justify-content: space-between;
	align-items: center;

	.tips {
		color: #999;
		font-size: 30rpx;
	}
}

.add-detail-wrap {
	padding: 30rpx;

	.add-title {
		font-size: 38rpx;
	}

	.time-slot-title,
	.member-title,
	.name-title,
	.age-title,
	.phone-title,
	.partner-title,
	.idtype-title,
	.id-title,
	.explain-service-title {
		margin: 50rpx 0 20rpx 0;
		font-size: 32rpx;
	}

	::v-deep .custom-field {
		padding: 8rpx 24rpx;
		border: 2rpx solid #dcdfe6;
		border-radius: 16rpx;
		background: #ebf1ff;
	}

	::v-deep .custom-input {
		color: #333;
		font-size: 28rpx;
	}

	::v-deep .act-btns {
		display: flex;
		justify-content: space-between;
		gap: 0 20rpx;
		padding: 50rpx 0 20rpx;

		van-button {
			flex: 1;
			width: 100%;
		}
	}
}

.member-list {
	display: flex;
	flex-direction: column;
	gap: 12rpx;

	.member-detail {
		display: flex;
		align-items: center;
		padding: 0 20rpx;
		overflow: hidden;
		border-bottom: 1px solid #eaeaea;
		// border-radius: 24rpx;
		// box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
		// background: #fff;
	}

	.delete-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 48rpx;
		height: 48rpx;
		border-radius: 50%;
		background-color: red;
	}

	.member-info {
		display: flex;
		flex-direction: column;
		justify-content: center;
		flex: 1;
		padding: 24rpx 30rpx;
	}

	.member-top {
		display: flex;
		align-items: center;
		gap: 0 20rpx;
	}

	.member-name {
		color: #333;
		font-size: 32rpx;
		font-weight: 600;
	}

	.member-phone {
		color: #666;
		font-size: 28rpx;
		margin-top: 12rpx;
	}

	.member-bottom {
		margin-top: 16rpx;
		word-break: break-all;
		color: #999;
		font-size: 26rpx;
	}
}

.submit-btn {
	margin-top: 40rpx;
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
