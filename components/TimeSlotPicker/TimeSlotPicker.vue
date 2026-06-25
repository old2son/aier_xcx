<template>
	<view class="time-slot-picker" :class="{ 'single-slot': isSingleSlot }">
		<view
			class="time-slot-item"
			:class="{ 'single-slot-item': isSingleSlot }"
			v-for="(item, index) in processedTimeSlotList"
			:key="index"
		>
			<view
				class="time-slot-wrap"
				:class="{
					disabled: item.disabled,
					'time-slot-selected': !isSingleSlot && selectedTimeSlotIndex === index && !item.disabled,
					'fixed-slot-wrap': isSingleSlot && !item.disabled
				}"
				@tap="selectTimeSlot(item, index)"
			>
				<view class="time-slot-part">{{ item.name }}</view>
				<view class="reservation-num" v-if="needTimeSlotRequest">剩余：{{ item.surplusNumber || 0 }}人</view>
			</view>
			<view
				:style="weight ? 'font-weight: bold; font-size: 32rpx;' : ''"
				class="afternoon-title"
				v-if="index === 1"
				>下午时段</view
			>
		</view>
	</view>
</template>

<script>
import dayjs from 'dayjs';

export default {
	name: 'TimeSlotPicker',
	props: {
		timeSlotList: {
			type: Array,
			required: true
		},
		timeSlotNumbers: {
			type: Object,
			default: () => ({})
		},
		selectedTimeSlotIndex: {
			type: Number,
			required: true
		},
		needTimeSlotRequest: {
			type: Boolean,
			required: true
		},
		weight: {
			type: Boolean,
			required: false
		},
		selectDay: {
			type: String,
			default: ''
		}
	},
	computed: {
		isSingleSlot() {
			return this.processedTimeSlotList.length === 1;
		},
		// 原始合并人数
		combinedTimeSlotList() {
			console.log('this.timeSlotList', this.timeSlotList);
			return this.timeSlotList.map((slot, index) => {
				return {
					...slot,
					numbers: this.timeSlotNumbers[`numbers${index + 1}`] || 0
				};
			});
		},
		// 处理禁用逻辑
		processedTimeSlotList() {
			const now = dayjs();
			const currentSelectDay = this.selectDay
				? this.selectDay.replace(/年/g, '-').replace(/月/g, '-').replace(/日/g, '')
				: '';

			const isToday = currentSelectDay ? dayjs(currentSelectDay).isSame(dayjs(), 'day') : false;

			return this.combinedTimeSlotList.map((slot) => {
				let disabled = !!slot.disabled;
				const slotName = slot.name || '';

				if (Number(slot.surplusNumber) <= 0) {
					disabled = true;
				}

				// 当前时间超过该时段的结束时间
				if (isToday && slotName.includes('-')) {
					const [start, end] = slotName.split('-');
					const endTimeToday = dayjs()
						.hour(Number(end.split(':')[0]))
						.minute(Number(end.split(':')[1]));
					if (now.isAfter(endTimeToday)) {
						disabled = true;
					}
				}

				return {
					...slot,
					disabled
				};
			});
		}
	},
	watch: {
		processedTimeSlotList: {
			immediate: true,
			handler(newVal) {
				if (Array.isArray(newVal) && newVal.length > 0) {
					this.$nextTick(() => {
						this.renderSlotTimeList(newVal);
					});
				}
			}
		}
	},
	methods: {
		selectTimeSlot(item, index) {
			if (!item || this.processedTimeSlotList[index].disabled) {
				return;
			}

			if (this.selectedTimeSlotIndex === index) {
				return;
			}

			if (item && !this.processedTimeSlotList[index].disabled) {
				// 禁用状态不能选择
				this.$emit('timeSlotSelected', item.name, index);
				this.$emit('timeSlotExpound', item.expound);
			}
		},
		renderSlotTimeList(slotList = this.processedTimeSlotList) {
			const currentSelectedSlot =
				this.selectedTimeSlotIndex > -1 ? slotList[this.selectedTimeSlotIndex] || null : null;

			if (currentSelectedSlot && !currentSelectedSlot.disabled) {
				return;
			}

			// 自动顺延到下一个未禁用的时段
			const availableIndex = slotList.findIndex((slot) => !slot.disabled);
			if (availableIndex !== -1) {
				this.selectTimeSlot(slotList[availableIndex], availableIndex);
			}
		}
	}
};
</script>

<style lang="scss" scoped>
.time-slot-picker {
	position: relative;
	width: 100%;
	display: flex;
	flex-wrap: wrap;
	margin: 42rpx auto 0 auto;

	.time-slot-item {
		width: 40%;
		border-radius: 25rpx;
		text-align: center;
		margin: 0 32rpx 140rpx 0;
	}

	.time-slot-item.single-slot-item {
		width: 100%;
		margin: 0;
	}
	.time-slot-item:nth-last-child(1),
	.time-slot-item:nth-last-child(2) {
		margin-bottom: 0;
	}

	.time-slot-wrap {
		width: 100%;
		color: #2a2a2a;
		font-size: 34rpx;
		padding: 32rpx 0;
		box-sizing: border-box;
		border-radius: 25rpx;
		background-color: #ebf1ff;
		.time-slot-part {
			white-space: nowrap;
		}
		.reservation-num {
			margin-top: 21rpx;
			font-size: 30rpx;
		}
	}

	&.single-slot {
		margin-top: 28rpx;

		.time-slot-wrap {
			padding: 36rpx 24rpx;
			border-radius: 20rpx;
			background-color: #f3f7ff;
			border: 2rpx solid #d7e5ff;
		}

		.time-slot-part {
			font-size: 32rpx;
			font-weight: 600;
		}

		.reservation-num {
			margin-top: 16rpx;
			font-size: 28rpx;
		}
	}

	.fixed-slot-wrap {
		color: #32579c;

		.reservation-num {
			color: #32579c;
		}
	}

	.time-slot-selected {
		background-color: #32579c;
		color: #fff;
		.reservation-num {
			color: #fff;
		}
	}
	.time-slot-wrap.disabled {
		background-color: #e7e7e7;
		color: #7f7f7f;
		.reservation-num {
			color: #7f7f7f;
		}
	}
	.afternoon-title {
		position: absolute;
		top: 50%;
		left: 0;
		transform: translateY(-50%);
		font-size: 38rpx;
		color: #2a2a2a;
	}
}
</style>
