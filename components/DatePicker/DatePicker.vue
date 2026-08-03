<template>
	<view class="date-picker" :class="{ 'single-day': isSingleDayDisplay }">
		<view class="weekdays" :class="{ 'weekdays-single': isSingleDayDisplay }">
			<view
				v-for="(day, index) in days"
				:key="index"
				:class="{
					disabled: day.disabled,
					'date-selected': selectedDayIndex === index,
					'activity-day': day.hasActivity && !day.disabled,
					'reservation-day': day.hasReservation && !day.disabled && !isActivity
				}"
				class="day-item"
				@tap="selectDay(day, index)"
			>
				<text>{{ day.week }}</text>
				<text>{{ day.date }}</text>
			</view>
		</view>

		<van-popup
			:show="showActivityPopup"
			round
			position="center"
			custom-style="width: 620rpx; border-radius: 24rpx;"
			@close="showActivityPopup = false"
		>
			<view class="activity-popup">
				<view class="activity-popup-title"> 温馨提示·今日活动 </view>

				<view class="activity-popup-content">
					<view class="activity-popup-subtitle"> 专属活动火热报名中！ </view>
					<view class="activity-popup-desc">
						护眼科普、公益体验名额有限，先到先得，快来活动中心锁定名额~
					</view>
					<van-button round block color="#32579c" type="primary" @click="goActivity"> 立即报名 </van-button>
					<view class="activity-popup-close" @click="readedActTips"> 已知悉，不需要 </view>
				</view>
			</view>
		</van-popup>
	</view>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import dayjs from 'dayjs';
import { isInActivityRange, isReservationConfigRange } from '@/utils/dataRange';
// import { getReservationTimeSlotNumbers, getActivityReservationTimeSlotNumbers } from '@/api';
export default {
	name: 'DatePicker',
	props: {
		disabledWeekdays: {
			type: Array,
			default: () => [1] // 默认禁用周一
		},
		needTimeSlotRequest: {
			type: Boolean,
			required: true
		},
		isActivity: {
			type: Boolean,
			required: false
		},
		selectedCal: {
			type: Object,
			default: {
				date: String,
				disabled: Boolean,
				week: String,
				year: Number,
				index: Number
			},
			required: false
		},
		activeList: {
			type: Array,
			required: true
		},
		reservationConfigList: {
			type: Array,
			required: false
		}
	},
	data() {
		return {
			days: [],
			midnightTimer: null, // 用于每天自动更新的计时器
			selectedDayIndex: -1, // 选中的日期
			showActivityPopup: false
		};
	},
	computed: {
		...mapState('moduleActivity', ['hasShownActivityPopup', 'selectedActivity']),
		isSingleDayDisplay() {
			return Array.isArray(this.days) && this.days.length === 1;
		}
	},
	watch: {
		selectedActivity: {
			deep: true,
			handler() {
				if (!this.isActivity) {
					return;
				}

				this.generateWeekDays();
				if (this.selectedDayIndex < 0) {
					this.getDefaultReservationTimeSlotNumbers();
				}
			}
		},
		selectedCal(newVal) {
			if (!newVal) return;
			this.applySelectedCal(newVal);
		}
	},
	methods: {
		...mapMutations('moduleActivity', ['setHasShownActivityPopup']),
		getSelectedActivityList() {
			const sameNameActivityList = this.selectedActivity && this.selectedActivity.sameNameActivityList;
			if (Array.isArray(sameNameActivityList) && sameNameActivityList.length) {
				return sameNameActivityList;
			}

			return this.selectedActivity ? [this.selectedActivity] : [];
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
			return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
		},
		isInSelectedActivityRange(currentDay) {
			if (!this.isActivity) {
				return true;
			}

			return this.getSelectedActivityList().some((activity) => {
				const startDate = this.normalizeDateText(activity && activity.activityTime);
				const endDate = this.normalizeDateText((activity && activity.endDate) || (activity && activity.activityTime));
				if (!startDate || !endDate) {
					return false;
				}

				const start = dayjs(startDate);
				const end = dayjs(endDate);
				return (
					currentDay.isSame(start, 'day') ||
					currentDay.isSame(end, 'day') ||
					(currentDay.isAfter(start, 'day') && currentDay.isBefore(end, 'day'))
				);
			});
		},
		getDisplayDateList() {
			if (this.isActivity) {
				const dateMap = new Map();

				this.getSelectedActivityList().forEach((activity) => {
					const startDate = this.normalizeDateText(activity && activity.activityTime);
					const endDate = this.normalizeDateText((activity && activity.endDate) || (activity && activity.activityTime));
					if (!startDate || !endDate) {
						return;
					}

					const start = dayjs(startDate).startOf('day');
					const end = dayjs(endDate).startOf('day');
					if (!start.isValid() || !end.isValid() || start.isAfter(end)) {
						return;
					}

					const totalDays = end.diff(start, 'day');
					for (let i = 0; i <= totalDays; i++) {
						const current = start.add(i, 'day');
						dateMap.set(current.format('YYYY-MM-DD'), current);
					}
				});

				const activityDateList = Array.from(dateMap.values()).sort((prev, next) => prev.valueOf() - next.valueOf());
				if (activityDateList.length) {
					return activityDateList;
				}
			}

			const today = dayjs().startOf('day');
			return Array.from({ length: 5 }, (_, index) => today.add(index, 'day'));
		},
		// 生成展示日期信息
		generateWeekDays() {
			const currentSelectedDay = this.days[this.selectedDayIndex] || null;
			const currentSelectedKey = currentSelectedDay ? `${currentSelectedDay.year}-${currentSelectedDay.date}` : '';

			const dateList = this.getDisplayDateList();
			const daysArray = [];

			dateList.forEach((currentDay) => {
				const dayOfWeek = currentDay.day(); // 获取星期几
				const dateString = currentDay.format('MM-DD'); // 格式化日期为 MM-DD
				const hasActivity =
					isInActivityRange(currentDay, this.activeList) &&
					(!this.isActivity || this.isInSelectedActivityRange(currentDay));
				const hasReservation = isReservationConfigRange(currentDay, this.reservationConfigList);

				/**
				 * todo: 周一闭馆逻辑不清晰
				 * 有活动是否禁用
				 * 节假日是否禁用
				 */
				daysArray.push({
					year: currentDay.year(),
					date: dateString,
					week: this.getWeekDayName(dayOfWeek),
					// disabled: this.disabledWeekdays.includes(dayOfWeek), // 如果是周一，则禁用
					hasActivity,
					hasReservation
				});
			});

			this.days = daysArray; // 更新日期数组

			if (!currentSelectedKey) {
				return;
			}

			const nextIndex = this.days.findIndex((day) => `${day.year}-${day.date}` === currentSelectedKey);
			this.selectedDayIndex = nextIndex;
		},
		// 获取星期几的中文名称
		getWeekDayName(day) {
			const weekNames = ['日', '一', '二', '三', '四', '五', '六'];
			return `周${weekNames[day]}`;
		},
		// 设置每天凌晨更新日期的定时器
		setMidnightUpdate() {
			const now = dayjs(); // 当前时间
			const midnight = now.add(1, 'day').startOf('day'); // 第二天的凌晨时间
			const timeUntilMidnight = midnight.diff(now, 'millisecond'); // 距离凌晨的时间差
			// console.log('凌晨', midnight.diff(now, 'millisecond'));
			// const timeUntilMidnight = 10000 // 可供测试
			// 设置定时器，在凌晨触发
			this.midnightTimer = setTimeout(() => {
				this.generateWeekDays(); // 更新日期
				// console.log('页面已更新', new Date())
				this.setMidnightUpdate(); // 继续设置下一个定时器
			}, timeUntilMidnight);
		},
		// 清理定时器
		clearMidnightTimer() {
			if (this.midnightTimer) {
				clearTimeout(this.midnightTimer);
				this.midnightTimer = null;
				// console.log('定时器已清除');
			}
		},
		buildDayFromCalendarResult(payload) {
			if (!payload) {
				return null;
			}

			const year = Number(payload.year);
			const date = payload.date || '';
			const week = payload.week || '';
			const disabled = !!payload.disabled;

			const fullDate = `${year}-${date}`;
			const currentDay = dayjs(fullDate, 'YYYY-MM-DD');
			const hasActivity =
				isInActivityRange(currentDay, this.activeList) &&
				(!this.isActivity || this.isInSelectedActivityRange(currentDay));
			const hasReservation = isReservationConfigRange(currentDay, this.reservationConfigList);

			return {
				year,
				date,
				week,
				disabled,
				hasActivity,
				hasReservation
			};
		},
		applySelectedCal(payload) {
			const dayFromCal = this.buildDayFromCalendarResult(payload);
			if (!dayFromCal) {
				return;
			}

			if (this.isActivity) {
				const currentDate = dayjs(`${dayFromCal.year}-${dayFromCal.date}`, 'YYYY-MM-DD');
				const inRange = this.isInSelectedActivityRange(currentDate);

				if (!inRange) {
					this.days = [dayFromCal];
					this.selectedDayIndex = -1;
					this.$nextTick(() => {
						this.selectDay(dayFromCal, 0);
					});
					return;
				}

				this.generateWeekDays();
				const existingIndex = this.days.findIndex((day) => day.year === dayFromCal.year && day.date === dayFromCal.date);
				if (existingIndex > -1) {
					this.selectedDayIndex = -1;
					this.selectDay(this.days[existingIndex], existingIndex);
					return;
				}

				this.selectedDayIndex = -1;
				this.getDefaultReservationTimeSlotNumbers();
				return;
			}

			const selectedIndex = Number(payload.index);
			const isInCurrentFiveDays = !Number.isNaN(selectedIndex) && selectedIndex >= 0 && selectedIndex <= 4;

			if (isInCurrentFiveDays) {
				if (this.days.length !== 5) {
					this.generateWeekDays();
				}

				const existingIndex = this.days.findIndex((day) => day.year === dayFromCal.year && day.date === dayFromCal.date);
				const nextIndex = existingIndex > -1 ? existingIndex : Math.min(Math.max(selectedIndex, 0), this.days.length - 1);

				this.selectedDayIndex = -1;
				this.selectDay(this.days[nextIndex], nextIndex);
				return;
			}

			this.days = [dayFromCal];
			this.selectedDayIndex = -1;
			this.$nextTick(() => {
				this.selectDay(dayFromCal, 0);
			});
		},
		selectDay(day, index) {
			if (day.disabled) return;
			if (this.selectedDayIndex === index) return;
			this.selectedDayIndex = index;
			const fullDate = `${day.year}-${day.date}`;
			const currentDate = dayjs(fullDate, 'YYYY-MM-DD');
			const isInCurrentFiveDays =
				currentDate.isSame(dayjs(), 'day') || currentDate.isAfter(dayjs(), 'day')
					? currentDate.diff(dayjs().startOf('day'), 'day') <= 4
					: false;
			const formattedDate = dayjs(fullDate, 'YYYY-MM-DD').format('YYYY年MM月DD日');
			const isInSelectedActivityRange = this.isInSelectedActivityRange(currentDate);
			// console.log('formattedDate', formattedDate);
			// 给父组件传递数据（子组件触发父组件方法）
			this.$emit('date-selected', { date: formattedDate, week: day.week, isInSelectedActivityRange });
			// 四个时间段下的预约报名人数只有在选择了预约日子后才会查询，所以需要调用
			if (this.needTimeSlotRequest && !this.isActivity) {
				// getReservationTimeSlotNumbers({ dateTime: formattedDate }).then((res) => {
				// 	if (res.code === 200 && res.message === '查询成功') {
				// 		this.$emit('time-slot-numbers', res.data[0]);
				// 	}
				// });
			}
			// 活动改成自定义时间
			// else if (this.needTimeSlotRequest && this.isActivity) {
			// 	getActivityReservationTimeSlotNumbers({ dateTime: formattedDate }).then((res) => {
			// 		if (res.code === 200 && res.message === '查询成功') {
			// 			this.$emit('time-slot-numbers', res.data[0]);
			// 		}
			// 	});
			// }

			this.isActivityDay = isInActivityRange(currentDate, this.activeList);
			if (this.isActivityDay && isInCurrentFiveDays && !this.hasShownActivityPopup) {
				const pages = getCurrentPages();
				const currentPage = pages[pages.length - 1];

				if (currentPage.route.includes('activityCenter')) {
					this.showActivityPopup = false;
					return;
				}

				this.showActivityPopup = true;
			}
		},
		getDefaultReservationTimeSlotNumbers() {
			// 找到第一个没有禁用的日期
			const availableDay = this.days.find((day) => !day.disabled);
			if (availableDay) {
				// 如果找到了可用日期，选择它
				const index = this.days.indexOf(availableDay);
				this.selectDay(availableDay, index);
			} else {
				// 如果没有可用的日期，处理这种情况
				console.log('没有可用的日期！'); // 你可以选择触发一个事件或者显示提示消息给用户
			}
		},
		goActivity() {
			uni.redirectTo({
				url: '/subpackages/packageCategory/activityCenter/index'
			});
		},
		readedActTips() {
			this.showActivityPopup = false;
			this.setHasShownActivityPopup(true);
		}
	},
	mounted() {
		this.generateWeekDays();
		this.setMidnightUpdate();
		this.getDefaultReservationTimeSlotNumbers();
	},
	beforeDestroy() {
		this.clearMidnightTimer(); // 在组件销毁时清理定时器
	}
};
</script>

<style lang="scss" scoped>
.date-picker {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	width: 650rpx;
	font-size: 28rpx;

	.weekdays {
		width: 100%;
		display: flex;
		justify-content: flex-start;
		overflow-x: auto; // 允许横向滚动
		scroll-behavior: smooth; // 滚动顺滑
		padding-bottom: 20rpx; // 可以适当调整滚动条区域的高度
	}

	.weekdays-single {
		justify-content: flex-start;
		overflow-x: hidden;
		padding-bottom: 0;
	}

	.day-item {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		position: relative;
		margin-right: 0rpx;
		background-color: #ebf1ff;
		text-align: center;
		border-radius: 12rpx;
		padding: 20rpx;
		box-sizing: border-box;
		transition: background-color 0.3s ease;

		text {
			color: #2a2a2a;
			white-space: nowrap;
		}

		text:last-child {
			display: inline-block;
			margin-top: 20rpx;
		}
	}

	.day-item {
		margin-right: 20rpx;
	}

	.day-item.activity-day::after {
		position: absolute;
		top: 10rpx;
		right: 12rpx;
		content: '*';
		line-height: 1;
		color: #ff4d4f;
		font-size: 30rpx;
		font-weight: bold;
	}

	.day-item.activity-day::before {
		position: absolute;
		left: 50%;
		bottom: 10rpx;
		content: '';
		width: 32rpx;
		height: 6rpx;
		border-radius: 3rpx;
		transform: translateX(-50%);
		background-color: #ff4d4f;
	}

	.day-item.reservation-day {
		box-shadow: inset 0 0 0 2rpx #8fb8ff;
	}

	.day-item:last-child {
		margin: 0;
	}

	&.single-day {
		.day-item {
			margin-right: 0;
			padding: 26rpx 40rpx;
			border-radius: 16rpx;
			box-shadow: 0 10rpx 24rpx rgba(50, 87, 156, 0.08);
		}

		.day-item.activity-day::after {
			right: 18rpx;
		}
	}

	.date-selected {
		background-color: #32579c;

		&.reservation-day {
			box-shadow: inset 0 0 0 2rpx #32579c;
		}

		text {
			color: #fff;
		}
	}

	.day-item.disabled {
		background-color: #e7e7e7;
		text {
			color: #7f7f7f;
		}
	}
}

.activity-popup {
	overflow: hidden;
	box-sizing: border-box;
	text-align: center;
}

.activity-popup-title {
	padding: 40rpx;
	color: #fff;
	font-size: 36rpx;
	font-weight: 600;
	background-color: #32579c;
}

.activity-popup-content {
	padding: 10rpx 40rpx 10rpx;
}

.activity-popup-subtitle {
	margin: 24rpx;
	color: #222;
	font-size: 30rpx;
	font-weight: 600;
}

.activity-popup-desc {
	padding: 0 40rpx;
	margin: 24rpx 0 40rpx;
	line-height: 1.7;
	color: #666;
	font-size: 28rpx;
}

.activity-popup-close {
	padding: 32rpx 0;
	color: #999;
	font-size: 28rpx;
}
</style>
