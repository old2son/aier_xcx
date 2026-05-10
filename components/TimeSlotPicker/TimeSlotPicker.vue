<template>
	<view class="time-slot-picker">
		<view class="time-slot-item" v-for="(item, index) in processedTimeSlotList" :key="index">
			<view
				class="time-slot-wrap"
				:class="{
					disabled: item.disabled,
					'time-slot-selected': selectedTimeSlotIndex === index && !item.disabled
				}"
				@tap="selectTimeSlot(item.name, index)"
			>
				<view class="time-slot-part">{{ item.name }}</view>
				<view class="reservation-num" v-if="needTimeSlotRequest">已报名：{{ item.reservationNumber }}人</view>
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
			require: true
		},
		timeSlotNumbers: {
			type: Object,
			default: () => ({})
		},
		selectedTimeSlotIndex: {
			type: Number,
			require: true
		},
		needTimeSlotRequest: {
			type: Boolean,
			require: true
		},
		weight: {
			type: Boolean,
			require: false
		},
		selectDay: {
			type: String,
			require: true
		}
	},
	data() {
		return {
			hasInit: false
		}
	},
	computed: {
		// 原始合并人数
		combinedTimeSlotList() {
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

			const isToday = dayjs(this.selectDay.replace(/年/g, '-').replace(/月/g, '-').replace(/日/g, '')).isSame(
				dayjs(),
				'day'
			);

			return this.combinedTimeSlotList.map((slot) => {
				let disabled = false;

				// 条件1: 人数 >= 40
				if (slot.numbers >= 40) {
					disabled = true;
				}

				// 条件2: 当前时间超过该时段的结束时间
				if (isToday) {
					const [start, end] = slot.name.split('-');
					const endTimeToday = dayjs()
						.hour(Number(end.split(':')[0]))
						.minute(Number(end.split(':')[1]));
					if (now.isAfter(endTimeToday)) {
						disabled = true;
					}
				}

				// 增加测试，无需判断isToday
				// const [start, end] = slot.name.split('-');
				// const endTimeToday = dayjs()
				// 	.hour(Number(end.split(':')[0]))
				// 	.minute(Number(end.split(':')[1]));
				// if (now.isAfter(endTimeToday)) {
				// 	disabled = true;
				// }

				return {
					...slot,
					disabled
				};
			});
		}
	},
	watch: {
		// 初始化
		timeSlotList: {
			immediate: true,
			handler(newVal) {
				if (this.hasInit) return

				if (newVal && newVal.length > 0) {
					this.renderSlotTimeList();
					this.hasInit = true
				}
			}
		},
		selectDay: {
			handler(newVal) {
				if (newVal && newVal.length > 0) {
					this.renderSlotTimeList();
				}
			}
		}
	},
	mounted() {
		this.$nextTick(() => {
			if (this.processedTimeSlotList.length > 0) {
				this.renderSlotTimeList();
			}
		});
	},
	methods: {
		selectTimeSlot(name, index) {
			if (!this.processedTimeSlotList[index].disabled) {
				// 禁用状态不能选择
				this.$emit('timeSlotSelected', name, index);
			}
		},
		renderSlotTimeList() {
			// 自动顺延到下一个未禁用的时段
			const availableIndex = this.processedTimeSlotList.findIndex((slot) => !slot.disabled);
			if (availableIndex !== -1) {
				this.selectTimeSlot(this.processedTimeSlotList[availableIndex].name, availableIndex);
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
