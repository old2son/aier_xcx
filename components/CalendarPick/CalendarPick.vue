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
			<view class="submit-btn-wrap">
				<van-button
					v-show="isActivityDay"
					round
					size="large"
					type="primary"
					@click="goActivity"
				>
					前往活动中心
				</van-button>
			</view>
			<view class="cancel-btn-wrap">
				<van-button round size="large" plain @click="closePopup">返回</van-button>
			</view>
			<!-- <van-button round size="large" color="#32579c" plain @click="resetDate">重置</van-button> -->
		</view>
	</van-popup>
</template>

<script>
import dayjs from 'dayjs';

let activeListCache = [];
const isInActivityRange = (date) => {
	return activeListCache.some((item) => {
		if (!item.startDate || !item.endDate) {
			return false;
		}

		const start = dayjs(item.startDate.replace(/年/g, '/').replace(/月/g, '/').replace(/日/g, ''));

		const end = dayjs(item.endDate.replace(/年/g, '/').replace(/月/g, '/').replace(/日/g, ''));

		return date.isSame(start, 'day') || date.isSame(end, 'day') || (date.isAfter(start) && date.isBefore(end));
	});
};

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
			defaultDate: null,
			isActivityDay: false
		};
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

			this.isActivityDay = isInActivityRange(current);

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

			const current = dayjs(date);

			const hasActivity = isInActivityRange(current);

			if (hasActivity) {
				day.className = 'activity-day';
				// day.bottomInfo = '活动';
			}

			return day;
		},
		goActivity() {
			uni.navigateTo({
				url: '/subpackages/packageCategory/activityCenter/index'
			});
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

.submit-btn-wrap,
.cancel-btn-wrap {
	height: 100rpx;
	text-align: center;

	::v-deep .van-button {
		width: 70%;
	}
}

.submit-btn-wrap {
	::v-deep .van-button {
		border-color: #32579c;
		color: #fff;
		background-color: #32579c;
	}
}

.cancel-btn-wrap {
	::v-deep .van-button {
		width: 70%;
		color: #80aae6;
		border-color: #c5deff;
		background-color: #dcebff;
	}
}

::v-deep .activity-day {
	position: relative;
}

::v-deep .activity-day::before {
	position: absolute;
	left: 50%;
	bottom: 20rpx;
	content: '';
	width: 24rpx;
	height: 4rpx;
	border-radius: 999rpx;
	transform: translateX(-50%);
	background-color: #ff4d4f;
}

::v-deep .activity-day::after {
	position: absolute;
	top: 20rpx;
	right: 15rpx;
	content: '*';
	line-height: 1;
	color: #ff4d4f;
	font-size: 30rpx;
	font-weight: bold;
}
</style>
