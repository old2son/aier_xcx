<template>
	<van-popup
		:show="showPopup"
		position="top"
		custom-style="display: flex; flex-direction: column; height: 90%; border-radius: 0 0 24rpx 24rpx; overflow: hidden;"
		@close="closePopup"
	>
		<view class="calendar-content">
			<van-calendar
				id="calendar"
				color="#32579c"
				:formatter="formatter"
				:default-date="defaultDate"
				:poppable="false"
				:show-confirm="false"
				:min-date="minDate"
				:max-date="maxDate"
				@select="onSelectDate"
			/>
		</view>

		<view class="calendar-footer">
			<!-- <van-button round size="large" color="#32579c" type="primary" @click="confirmDate">前往报名</van-button> -->
			<van-button round size="large" color="#32579c" plain @click="closePopup">返回</van-button>
			<!-- <van-button round size="large" color="#32579c" plain @click="resetDate">重置</van-button> -->
		</view>
	</van-popup>
</template>

<script>
import { mapState } from 'vuex';
import dayjs from 'dayjs';

let activeListCache = [];

export default {
	name: 'CalendarPick',
	options: {
		styleIsolation: 'shared'
	},
	props: {
		showPopup: {
			type: Boolean,
			default: false
		},
		whatADay: {
			type: String,
			required: false
		},
		activeList: {
			type: Array,
			required: true
		}
	},
	data() {
		return {
			minDate: '',
			maxDate: '',
			defaultDate: null
		};
	},
	computed: {
		...mapState('moduleActivity', ['futureList'])
	},
	watch: {
		whatADay(newval) {
			const timestamp = dayjs(newval.replace(/年/g, '-').replace(/月/g, '-').replace(/日/g, '')).valueOf();
			this.defaultDate = timestamp;
			this.$nextTick(() => {
				const calendar = this.selectComponent('#calendar');
				calendar.reset();
			});
		},
		activeList: {
			immediate: true,
			handler(val) {
				activeListCache = Array.isArray(val) ? val : [];
			}
		}
	},
	methods: {
		onSelectDate(event) {
			const current = dayjs(event.detail);

			const date = current.format('MM-DD');

			const year = current.year();

			const weekMap = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

			const week = weekMap[current.day()];

			const disabled = current.day() === 1;

			// 距离今天第几天
			const index = current.diff(dayjs().startOf('day'), 'day');

			const result = {
				date,
				disabled,
				week,
				year,
				index
			};

			this.$emit('selectCal', result);
		},
		closePopup() {
			this.$emit('closePopup', false);
		},
		resetDate() {
			// this.defaultDate = null;
			// this.$nextTick(() => {
			// 	const calendar = this.selectComponent('#calendar');
			// 	calendar.reset();
			// });
		},
		formatter(day) {
			const date = day.date;

			// 周一闭馆
			if (date.getDay() === 1) {
				day.type = 'disabled';
				day.bottomInfo = '闭馆';

				return day;
			}

			// 当前日期
			const current = dayjs(date);

			// 是否有活动
			const hasActivity = activeListCache.some((item) => {
				if (!item.startDate || !item.endDate) {
					return false;
				}

				const start = dayjs(item.startDate.replace(/年/g, '/').replace(/月/g, '/').replace(/日/g, ''));

				const end = dayjs(item.endDate.replace(/年/g, '/').replace(/月/g, '/').replace(/日/g, ''));

				return (
					current.isSame(start, 'day') ||
					current.isSame(end, 'day') ||
					(current.isAfter(start) && current.isBefore(end))
				);
			});

			if (hasActivity) {
				day.className = 'activity-day';
				day.bottomInfo = '活动';
					day.color = '#32579c';
			}

			return day;
		}
	},
	mounted() {
		const now = dayjs();
		this.minDate = now.valueOf();
		this.maxDate = now.add(30, 'day').valueOf();

		this.defaultDate = dayjs().startOf('day');
		this.$nextTick(() => {
			const calendar = this.selectComponent('#calendar');
			calendar.reset();
		});
	}
};
</script>

<style lang="scss" scoped>
.calendar-content {
	flex: 1;
	overflow: hidden;
}

.calendar-footer {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
	padding: 20rpx 30rpx;
}

// ::v-deep .van-calendar__day {
// 	color: #fff;
// 	background-color: #32579c !important;
// }

// .van-calendar__bottom-info {
// 	color: #32579c;
// }
</style>
