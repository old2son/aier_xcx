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
			<van-button round size="large" color="#32579c" plain @click="resetDate">重置</van-button>
		</view>
	</van-popup>
</template>

<script>
import dayjs from 'dayjs';

export default {
	name: 'CalendarPick',
	props: {
		showPopup: {
			type: Boolean,
			default: false
		},
		whatADay: {
			type: String,
			require: false
		}
	},
	data() {
		return {
			minDate: '',
			maxDate: '',
			defaultDate: null
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
		}
	},
	methods: {
		onSelectDate(event) {
			const current = dayjs(event.detail);
		
			const date = current.format('MM-DD');
		
			const year = current.year();
		
			const weekMap = [
				'周日',
				'周一',
				'周二',
				'周三',
				'周四',
				'周五',
				'周六'
			];
		
			const week = weekMap[current.day()];
		
			const disabled = current.day() === 1;
		
			// 距离今天第几天
			const index = current.diff(
				dayjs().startOf('day'),
				'day'
			);
		
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

			if (date.getDay() === 1) {
				day.type = 'disabled';
				day.bottomInfo = '闭馆';
			}

			return day;
		}
	},
	mounted() {
		const now = dayjs();
		this.minDate = now.valueOf();
		this.maxDate = now.add(30, 'day').valueOf();

		console.log(7777);
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
</style>
