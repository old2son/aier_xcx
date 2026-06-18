<template>
	<view class="date-picker">
		<view class="weekdays">
			<view
				v-for="(day, index) in days"
				:key="index"
				:class="{
					disabled: day.disabled,
					'date-selected': selectedDayIndex === index,
					'activity-day': day.hasActivity && !day.disabled
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
import { getReservationTimeSlotNumbers, getActivityReservationTimeSlotNumbers } from '@/api';
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
			selectedDayIndex: 0, // 选中的日期
			showActivityPopup: false
		};
	},
	computed: {
		...mapState('moduleActivity', ['hasShownActivityPopup'])
	},
	watch: {
		selectedCal(newVal) {
			if (!newVal) return;
			const { index, ...day } = newVal;
			this.selectDay(day, index);
		}
	},
	methods: {
		...mapMutations('moduleActivity', ['setHasShownActivityPopup']),
		// 生成当天和接下来的六天的日期信息
		generateWeekDays() {
			const today = dayjs().startOf('day'); // 获取当前日期（精确到当天0点）
			const daysArray = [];
			const currentYear = today.year(); // 获取当前年份

			// 动态生成 5 天的日期信息
			for (let i = 0; i < 5; i++) {
				const currentDay = today.add(i, 'day'); // 从当天开始依次生成
				const dayOfWeek = currentDay.day(); // 获取星期几
				const dateString = currentDay.format('MM-DD'); // 格式化日期为 MM-DD
				const hasActivity = isInActivityRange(currentDay, this.activeList);
				const hasReservation = isReservationConfigRange(currentDay, this.reservationConfigList);

				daysArray.push({
					year: currentYear,
					date: dateString,
					week: this.getWeekDayName(dayOfWeek),
					disabled: this.disabledWeekdays.includes(dayOfWeek), // 如果是周一，则禁用
					hasActivity,
					hasReservation
				});
			}
			this.days = daysArray; // 更新日期数组
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
		selectDay(day, index) {
			if (day.disabled) return;
			this.selectedDayIndex = index;
			const fullDate = `${day.year}-${day.date}`;
			const currentDate = dayjs(fullDate, 'YYYY-MM-DD');
			const isInCurrentFiveDays =
				currentDate.isSame(dayjs(), 'day') || currentDate.isAfter(dayjs(), 'day')
					? currentDate.diff(dayjs().startOf('day'), 'day') <= 4
					: false;
			const formattedDate = dayjs(fullDate, 'YYYY-MM-DD').format('YYYY年MM月DD日');
			// console.log('formattedDate', formattedDate);
			// 给父组件传递数据（子组件触发父组件方法）
			this.$emit('date-selected', { date: formattedDate, week: day.week });
			// 四个时间段下的预约报名人数只有在选择了预约日子后才会查询，所以需要调用
			if (this.needTimeSlotRequest && !this.isActivity) {
				getReservationTimeSlotNumbers({ dateTime: formattedDate }).then((res) => {
					if (res.code === 200 && res.message === '查询成功') {
						this.$emit('time-slot-numbers', res.data[0]);
					}
				});
			} else if (this.needTimeSlotRequest && this.isActivity) {
				getActivityReservationTimeSlotNumbers({ dateTime: formattedDate }).then((res) => {
					if (res.code === 200 && res.message === '查询成功') {
						this.$emit('time-slot-numbers', res.data[0]);
					}
				});
			}

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
			uni.navigateTo({
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
	align-items: center;
	width: 100%;
	font-size: 28rpx;

	.weekdays {
		width: 100%;
		display: flex;
		justify-content: space-between;
		overflow-x: auto; // 允许横向滚动
		scroll-behavior: smooth; // 滚动顺滑
		padding-bottom: 20rpx; // 可以适当调整滚动条区域的高度
	}

	.day-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		position: relative;
		margin-right: 20rpx;
		background-color: #ebf1ff;
		text-align: center;
		border-radius: 16rpx;
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
		border-radius: 999rpx;
		transform: translateX(-50%);
		background-color: #ff4d4f;
	}

	.day-item:last-child {
		margin: 0;
	}

	.date-selected {
		background-color: #32579c;
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
