<template>
	<van-popup
		:show="showPopup"
		position="top"
		custom-style="display: flex; flex-direction: column; height: 90%; border-radius: 0 0 24rpx 24rpx; overflow: hidden;"
		@close="closePopup"
	>
		<view class="calendar-content">
			<van-calendar :poppable="false" color="#32579c" :show-confirm="false" :min-date="minDate" :max-date="maxDate" @select="onSelectDate" />
		</view>

		<view class="calendar-footer">
			<van-button round size="large" color="#32579c" type="primary" @click="confirmDate">确定报名</van-button>
			<van-button round size="large"  @click="closePopup">返回</van-button>
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
		}
	},
	data() {
		return {
			minDate: '',
			maxDate: ''
		};
	},
	methods: {
		closePopup() {
			this.$emit('closePopup', false);
		}
	},
	mounted() {
		const now = dayjs();
		this.minDate = now.valueOf();
		this.maxDate = now.add(300, 'day').valueOf();
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
