<template>
	<view class="date-time-panel" :class="[`theme-${theme}`]">
		<view class="date-title">{{ dateTitle }}</view>

		<view class="date-wrap">
			<DatePicker
				v-if="Array.isArray(activeList)"
				:isActivity="isActivity"
				:disabled-weekdays="disabledWeekdays"
				:selected-cal="selectedCal"
				:needTimeSlotRequest="needTimeSlotRequest"
				:active-list="activeList"
				:reservation-config-list="reservationConfigList"
				@date-selected="handleDateSelected"
				@time-slot-numbers="handleTimeSlotNumbers"
			/>
			<view class="calendar-trigger" @click="isShowCal = true">
				<van-icon name="calendar-o" :color="calendarIconColor" />
				<van-icon name="arrow-down" :color="calendarIconColor" />
			</view>
		</view>

		<CalendarPick
			v-if="Array.isArray(activeList)"
			:show-popup="isShowCal"
			:what-a-day="date"
			:active-list="activeList"
			:reservation-config-list="reservationConfigList"
			@closePopup="handleCalendarClose"
			@selectCal="handleSelectCal"
		/>

		<view v-if="showDivider" class="divider" />

		<view class="time-title">{{ timeTitle }}</view>
		<view v-if="timeTip" class="time-tip">{{ timeTip }}</view>
		<view class="morning-title">{{ morningTitle }}</view>

		<TimeSlotPicker
			:weight="weight"
			:timeSlotList="timeSlotList"
			:selectedTimeSlotIndex="selectedTimeSlotIndex"
			:needTimeSlotRequest="needTimeSlotRequest"
			:select-day="date"
			@timeSlotSelected="handleTimeSlotSelected"
		/>
	</view>
</template>

<script>
import { mapState, mapActions } from 'vuex';
export default {
	name: 'ReservationDateTimePanel',
	props: {
		theme: {
			type: String,
			default: 'default'
		},
		isActivity: {
			type: Boolean,
			default: false
		},
		disabledWeekdays: {
			type: Array,
			default: () => [1]
		},
		selectedCal: {
			type: Object,
			default: null
		},
		needTimeSlotRequest: {
			type: Boolean,
			default: true
		},
		date: {
			type: String,
			default: ''
		},
		timeSlotList: {
			type: Array,
			default: () => []
		},
		selectedTimeSlotIndex: {
			type: Number,
			default: 0
		},
		dateTitle: {
			type: String,
			default: '日期选择'
		},
		timeTitle: {
			type: String,
			default: '时段选择'
		},
		morningTitle: {
			type: String,
			default: '上午时段'
		},
		timeTip: {
			type: String,
			default: ''
		},
		showDivider: {
			type: Boolean,
			default: true
		},
		weight: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			isShowCal: false,
			activeList: null
		};
	},
	computed: {
		...mapState('moduleActivity', ['futureList']),
		...mapState('moduleBooking', ['reservationConfigList']),
		calendarIconColor() {
			return this.isDateInPickerRange(this.date) ? '#32579c' : '#60a2fe';
		}
	},
	methods: {
		...mapActions('moduleActivity', ['fetchActivities']),
		async getActivityData() {
			try {
				await this.fetchActivities();
				this.activeList = this.futureList;
			} catch (e) {
				console.error('接口获取失败', e);
			}
		},
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
		handleCalendarClose() {
			this.isShowCal = false;
		},
		handleSelectCal(res) {
			// this.isShowCal = false;
			this.$emit('select-cal', res);
			this.$emit('update:selectedCal', res);
		},
		handleDateSelected(payload) {
			this.$emit('date-selected', payload);
		},
		handleTimeSlotNumbers(numbers) {
			this.$emit('time-slot-numbers', numbers);
		},
		handleTimeSlotSelected(slot, index) {
			this.$emit('time-slot-selected', slot, index);
		}
	},
	mounted() {
		this.getActivityData();
	}
};
</script>

<style lang="scss" scoped>
.date-time-panel {
	width: 100%;
}

.date-title,
.time-title,
.morning-title {
	color: #2a2a2a;
}

.date-wrap {
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

.divider {
	height: 1px;
	margin: 30rpx 0;
	background-color: #eaeaea;
}

.theme-default {
	.date-title,
	.time-title {
		margin: 40rpx 0 20rpx;
		font-size: 38rpx;
	}

	.time-tip {
		margin: 20rpx 0 40rpx;
		color: #999;
		font-size: 24rpx;
	}

	.morning-title {
		font-size: 38rpx;
	}
}

.theme-activity {
	.date-title,
	.time-title,
	.morning-title {
		margin: 40rpx 0 20rpx;
		font-size: 32rpx;
		font-weight: 550;
	}

	.date-title {
		margin-top: 56rpx;
		margin-bottom: 6rpx;
	}

	.time-title {
		margin-top: 40rpx;
		margin-bottom: 16rpx;
	}

	.time-tip {
		margin: 0 0 40rpx;
		color: #32579c;
		font-size: 28rpx;
		line-height: 1.5;
	}
}
</style>
