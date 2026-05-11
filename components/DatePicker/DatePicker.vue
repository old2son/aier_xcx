<template>
	<view class="date-picker">
		<view class="weekdays">
			<view
				v-for="(day, index) in days"
				:key="index"
				:class="{ disabled: day.disabled, 'date-selected': selectedDayIndex === index }"
				class="day-item"
				@tap="selectDay(day, index)"
			>
				<text>{{ day.week }}</text>
				<text>{{ day.date }}</text>
			</view>
		</view>
	</view>
</template>

<script>
import dayjs from 'dayjs';
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
			require: true
		},
		isActivity: {
			type: Boolean,
			require: false
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
			require: false
		}
	},
	data() {
		return {
			days: [],
			midnightTimer: null, // 用于每天自动更新的计时器
			selectedDayIndex: 0 // 选中的日期
		};
	},
	mounted() {
		this.generateWeekDays();
		this.setMidnightUpdate();
		this.getDefaultReservationTimeSlotNumbers();
	},
	beforeDestroy() {
		this.clearMidnightTimer(); // 在组件销毁时清理定时器
	},
	watch: {
		selectedCal(newVal) {
			if (!newVal) return;
			const { index, ...day } = newVal;
			this.selectDay(day, index);
		}
	},
	methods: {
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
				daysArray.push({
					year: currentYear,
					date: dateString,
					week: this.getWeekDayName(dayOfWeek),
					disabled: this.disabledWeekdays.includes(dayOfWeek) // 如果是周一，则禁用
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
			console.log('凌晨', midnight.diff(now, 'millisecond'));
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
				console.log('定时器已清除');
			}
		},
		selectDay(day, index) {
			if (day.disabled) return;
			this.selectedDayIndex = index;
			const fullDate = `${day.year}-${day.date}`;
			const formattedDate = dayjs(fullDate, 'YYYY-MM-DD').format('YYYY年MM月DD日');
			console.log('formattedDate', formattedDate);
			// 给父组件传递数据（子组件触发父组件方法）
			this.$emit('date-selected', { date: formattedDate, week: day.week });
			// 四个时间段下的预约报名人数只有在选择了预约日子后才会查询，所以需要调用
			if (this.needTimeSlotRequest && !this.isActivity) {
				getReservationTimeSlotNumbers({ dateTime: formattedDate }).then((res) => {
					if (res.code === 200 && res.message === '查询成功') {
						console.log(`获取${formattedDate}的四个时间段下的预约报名人数`, res);
						this.$emit('time-slot-numbers', res.data[0]);
					}
				});
			} else if (this.needTimeSlotRequest && this.isActivity) {
				getActivityReservationTimeSlotNumbers({ dateTime: formattedDate }).then((res) => {
					if (res.code === 200 && res.message === '查询成功') {
						console.log(`获取${formattedDate}的四个时间段下的预约报名人数ZZZZZZZZZZZZ`, res);
						this.$emit('time-slot-numbers', res.data[0]);
					}
				});
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
		}
	}
};
</script>

<style lang="scss" scoped>
.date-picker {
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
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
</style>
