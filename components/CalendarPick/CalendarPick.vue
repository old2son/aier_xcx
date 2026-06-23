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
			<view class="submit-tips" v-show="isActivityDay">当日有活动，报名参加请前往【活动中心】</view>

			<view class="submit-btn-wrap">
				<van-button v-show="isActivityDay" round size="large" type="primary" @click="goActivity">
					前往报名
				</van-button>

				<!-- todo：尝试分开确认、返回、选择日期逻辑 -->
				<van-button v-show="!isActivityDay" round size="large" type="primary" @click="closePopup">
					确认
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
import { isInActivityRange, isReservationConfigRange } from '@/utils/dataRange';

let activeListCache = [];
let reservationConfigCache = [];
let isActivityCache = false;

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
		},
		isActivity: {
			type: Boolean,
			required: false
		},
		reservationConfigList: {
			type: Array,
			required: false
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
		},
		reservationConfigList: {
			immediate: true,
			handler(val) {
				reservationConfigCache = Array.isArray(val) ? val : [];
			}
		},
		isActivity: {
			immediate: true,
			handler(val) {
				isActivityCache = !!val;
			}
		}
	},
	methods: {
		onSelectDate(event) {
			const current = dayjs(event.detail);
			const pages = getCurrentPages();
			const currentPage = pages[pages.length - 1];

			if (currentPage.route.includes('activityCenter')) {
				this.isActivityDay = false;
			} else {
				this.isActivityDay = isInActivityRange(current, activeListCache);
			}

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

			// 只允许未来30天
			const today = dayjs().startOf('day');

			const maxDay = today.add(30, 'day');

			const isWithin30Days =
				current.isSame(today, 'day') ||
				(current.isAfter(today) && current.isBefore(maxDay)) ||
				current.isSame(maxDay, 'day');

			const hasActivity = isWithin30Days && isInActivityRange(current, activeListCache);

			const isReservationConfig = isWithin30Days && isReservationConfigRange(current, reservationConfigCache);

			const classNames = [];
			if (hasActivity) {
				classNames.push('activity-day');
			}

			if (isReservationConfig && !isActivityCache) {
				classNames.push('reservation-day');
			}

			if (classNames.length) {
				day.className = classNames.join(' ');
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

.submit-tips {
	text-align: center;
	color: #ff4d4f;
	font-weight: 600;
	font-size: 32rpx;
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

::v-deep .reservation-day {
	color: #fff;
	background-image: radial-gradient(circle, #32579c 0 25rpx, transparent 28rpx);
	background-position: center calc(100% + 1rpx);
	background-repeat: no-repeat;
}
</style>
