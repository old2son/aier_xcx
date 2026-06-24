<template>
	<view class="personal-appointment-container">
		<ReservationDateTimePanel
			:selected-cal="selectedCal"
			:need-time-slot-request="needTimeSlotRequest"
			:date="date"
			:timeSlotList="combinedTimeSlotList"
			:selected-time-slot-index="selectedTimeSlotIndex"
			time-tip="每时段报名满15人将自动成团，我馆提供科普讲解服务。"
			@date-selected="handleDateSelected"
			@time-slot-numbers="updateTimeSlotNumbers"
			@time-slot-selected="handleTimeSlotSelected"
			@select-cal="selectedCal = $event"
		/>

		<ReservationMemberPanel :member-list="memberList" :child-age-max="17" @change="memberList = $event" />

		<view class="explain-service-title">是否需要讲解服务</view>

		<van-radio-group :value="radio" @change="radio = $event.detail">
			<van-radio name="1" shape="square">
				<text>是</text>
				<text class="tip-txt">(已有{{ needExplainServiceNum }}人选择讲解)</text>
			</van-radio>
			<van-radio name="2" shape="square">
				<text>否</text>
			</van-radio>
		</van-radio-group>
		<view class="tip-title-2">提示：满15人将自动成团，我馆提供科普讲解服务</view>

		<view class="submit-btn">
			<van-button color="#32579c" round size="large" @click="submit">确认提交</van-button>
		</view>

		<ReservationPopup :type="0" :show="showReservationPopup" @close="handlePopupClose" />

		<van-dialog id="van-dialog" />
	</view>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import { requestSubscribe, handleReservationResult } from '@/utils/reservation';
import {
	getReservationTimeSlot,
	getReservationWeekNumbers,
	personalReservation
} from '@/api/index';

export default {
	data() {
		return {
			showReservationPopup: true, // 控制弹出层的显示状态

			date: null,
			week: null,
			selectedTimeSlot: null, // 当前选中的时段
			selectedTimeSlotIndex: 0, // 当前选中的时段索引
			timeSlotList: [], // 四个预约时间段
			timeSlotNumbers: null, // 子组件返回的预约人数数据
			needTimeSlotRequest: true, // 是否需要请求时间段信息

			radio: '0',
			needExplainServiceNum: 0, // 需要讲解服务的人数，后台获取

			memberList: [],

			selectedCal: null
		};
	},
	computed: {
		...mapState('moduleBooking', ['reservationConfigList']),
		// 合并时段数据和预约人数
		combinedTimeSlotList() {
			const currentDateConfig = this.getCurrentDateConfig();
			const currentTimeSlotList = currentDateConfig && Array.isArray(currentDateConfig.timeSlots) ? currentDateConfig.timeSlots : [];

			return this.timeSlotList.map((slot, index) => {
				const numbersKey = `numbers${index + 1}`;
				const reservationNumber = this.timeSlotNumbers ? this.timeSlotNumbers[numbersKey] || 0 : 0;
				const slotName = this.getTimeSlotName(slot);
				const matchedSlot = currentTimeSlotList.find((item) => this.getTimeSlotName(item) === slotName);

				return {
					...slot,
					name: slotName,
					configId: matchedSlot ? matchedSlot.configId : '',
					surplusNumber: matchedSlot ? matchedSlot.surplusNumber : 0,
					reservationNumber,
					disabled: !matchedSlot || Number(matchedSlot.surplusNumber) <= 0
				};
			});
		}
	},
	methods: {
		...mapActions('moduleBooking', ['getReservationConfigList']),
		...mapActions('moduleAudience', ['clearSelectedAudienceList']),
		formatSelectedDate(dateText) {
			if (!dateText) {
				return '';
			}

			return String(dateText)
				.replace('年', '-')
				.replace('月', '-')
				.replace('日', '');
		},
		getTimeSlotName(slot) {
			if (!slot) {
				return '';
			}

			if (slot.name) {
				return slot.name;
			}

			if (slot.label) {
				return slot.label;
			}

			if (slot.startTime && slot.endTime) {
				return `${slot.startTime}-${slot.endTime}`;
			}

			return '';
		},
		getCurrentDateConfig() {
			const currentDate = this.formatSelectedDate(this.date);
			if (!currentDate) {
				return null;
			}

			return this.reservationConfigList.find((item) => item.dateTime === currentDate) || null;
		},
		handlePopupClose() {
			this.showReservationPopup = false; // 监听子组件关闭事件
		},
		// 获取初始的时段数据
		getReservationTimeSlotData() {
			getReservationTimeSlot().then((res) => {
				this.timeSlotList = res.data;
			});
		},
		// 处理日期选择
		handleDateSelected({ date, week }) {
			this.date = date;
			this.week = week;
			this.selectedTimeSlot = null;
			this.selectedTimeSlotIndex = -1;
		},
		// 接收子组件返回的预约人数数据
		updateTimeSlotNumbers(numbers) {
			// console.log('预约人数', numbers);
			// this.timeSlotNumbers = numbers;
		},
		// 选择四个时间段
		handleTimeSlotSelected(slot, index) {
			this.selectedTimeSlot = slot;
			this.selectedTimeSlotIndex = index;
			if (this.date && this.selectedTimeSlot) {
				getReservationWeekNumbers({
					dateTime: this.date,
					timeSlot: this.selectedTimeSlot
				}).then((res) => {
					if (res.code === 200 && res.message === '查询成功') {
						this.needExplainServiceNum = res.data.numbers;
					}
				});
			}
		},
		async submit() {
			if (!this.date) {
				this.$toast({
					duration: 3000,
					message: '请选择预约日期'
				});
				return;
			}

			if (!this.selectedTimeSlot) {
				this.$toast({
					duration: 3000,
					message: '当前日期暂无可预约时段'
				});
				return;
			}

			const hasAdultMember = this.memberList.some((item) => !!item.userPhone);
			if (this.memberList.length === 0 || !hasAdultMember) {
				this.$toast({
					duration: 3000,
					message: '至少需要添加一位成年人'
				});
				return;
			}

			if (this.radio === '0') {
				this.$toast({
					duration: 3000,
					message: '请勾选您是否需要讲解服务'
				});
				return;
			}

			await requestSubscribe();

			uni.showLoading({
				title: '提交中...',
				mask: true
			});
			// 包装请求和定时器为一个 Promise
			const delayPromise = new Promise((resolve) => {
				setTimeout(resolve, 800); // 延迟 loading 展示时间
			});
			Promise.all([
				personalReservation({
					dateTime: this.date,
					week: this.week,
					timeSlot: this.selectedTimeSlot,
					members: this.memberList,
					expound: this.radio === '1' ? 0 : 1 // √ 是 传0，× 是 传 1
				}),
				delayPromise
			])
				.then(([res]) => {
					handleReservationResult(this, res);
				})
				.finally(() => {
					uni.hideLoading();
				});
		}
	},
	mounted() {
		this.getReservationTimeSlotData();
		this.getReservationConfigList();
	},
	destroyed() {
		this.clearSelectedAudienceList();
	}
};
</script>

<style lang="scss" scoped>
.personal-appointment-container {
	padding: 40rpx 4% 100rpx 4%;
	box-sizing: border-box;
	background-color: #f8f9ff;
}

.explain-service-title {
	margin: 40rpx 0 20rpx 0;
	font-size: 38rpx;
}
.tip-title-1,
.tip-title-2 {
	margin: 20rpx 0 40rpx 0;
	color: #999;
	font-size: 24rpx;
}

.add-member-btns {
	display: flex;
	justify-content: space-between;
	gap: 20px;
	margin-top: 30rpx;

	van-button {
		flex: 1;
	}
}

.add-detail-wrap {
	padding: 30rpx;

	.add-title {
		font-size: 38rpx;
	}

	.time-slot-title,
	.member-title,
	.name-title,
	.age-title,
	.phone-title,
	.idtype-title,
	.id-title,
	.explain-service-title {
		margin: 50rpx 0 20rpx 0;
		font-size: 32rpx;
	}

	::v-deep .custom-field {
		padding: 8rpx 24rpx;
		border: 2rpx solid #dcdfe6;
		border-radius: 16rpx;
		background: #ebf1ff;
	}

	::v-deep .custom-input {
		color: #333;
		font-size: 28rpx;
	}

	::v-deep .act-btns {
		display: flex;
		justify-content: space-between;
		gap: 0 20rpx;
		padding: 50rpx 0 20rpx;

		van-button {
			flex: 1;
			width: 100%;
		}
	}
}

.member-list {
	display: flex;
	flex-direction: column;
	gap: 12rpx;

	.member-detail {
		display: flex;
		align-items: center;
		padding: 0 20rpx;
		overflow: hidden;
		border-bottom: 1px solid #eaeaea;
		// border-radius: 24rpx;
		// box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
		// background: #fff;
	}

	.delete-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 48rpx;
		height: 48rpx;
		border-radius: 50%;
		background-color: red;
	}

	.member-info {
		display: flex;
		flex-direction: column;
		justify-content: center;
		flex: 1;
		padding: 24rpx 30rpx;
		background: #f8f9fc;
	}

	.member-top {
		display: flex;
		align-items: center;
		gap: 0 20rpx;
	}

	.member-name {
		color: #333;
		font-size: 32rpx;
		font-weight: 600;
	}

	.member-phone {
		color: #666;
		font-size: 28rpx;
	}

	.member-bottom {
		margin-top: 16rpx;
		word-break: break-all;
		color: #999;
		font-size: 26rpx;
	}
}

.submit-btn {
	margin-top: 40rpx;
}

::v-deep .van-radio {
	margin-top: 24rpx;
}
::v-deep .van-cell {
	width: 58%;
	border-radius: 20rpx;
}
::v-deep .van-cell--clickable {
	width: 100%;
	border-radius: 20rpx;
}
::v-deep .van-dropdown-menu {
	width: 58%;
	border-radius: 20rpx;
	margin-bottom: 30rpx;
}
::v-deep .van-dropdown-item {
	width: 53%;
	margin-left: 3%;
	margin-top: 40rpx;
	border-radius: 20rpx;
	overflow: hidden;
	border: 1px solid #d1cece;
}
::v-deep .van-dropdown-item__option {
	box-shadow: none;
}
::v-deep .van-dropdown-menu__item {
	display: flex;
	justify-content: space-between;
}
::v-deep .van-dropdown-menu__title {
	width: 90%;
	padding-left: 12%;
	box-sizing: border-box;
}

::v-deep .van-dialog {
	color: #434343;
	font-size: 56rpx;
}
::v-deep .van-dialog__message-text {
	color: #434343;
	font-size: 45rpx;
}
::v-deep .van-dialog__message {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 90rpx;
	padding: 40rpx 0;
}
::v-deep .van-button--danger {
	background: #32579c;
	height: 90rpx;
	font-size: 18px;
	color: #fff !important;
}
</style>
