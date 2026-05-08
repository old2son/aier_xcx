<template>
	<view class="activity-enroll-container">
		<view class="txt-1">{{ requestResult.activityName }}</view>
		<view class="txt-2">
			<text class="txt-2-1">进行中</text>
			<text class="txt-2-2">{{ requestResult.endTime }} 结束</text>
		</view>
		<view class="date-picker-title">日期选择</view>

		<DatePicker
			:isActivity="true"
			:disabled-weekdays="[1]"
			:needTimeSlotRequest="needTimeSlotRequest"
			@date-selected="handleDateSelected"
			@time-slot-numbers="updateTimeSlotNumbers"
		/>

		<view class="divider" />
		<view class="time-slot-title">时段选择</view>
		<view class="morning-title">上午时段</view>

		<TimeSlotPicker
			:weight="true"
			:timeSlotList="combinedTimeSlotList"
			:selectedTimeSlotIndex="selectedTimeSlotIndex"
			:needTimeSlotRequest="needTimeSlotRequest"
			@timeSlotSelected="handleTimeSlotSelected"
		/>

		<view class="name-title">姓名</view>
		<van-field type="text" maxlength="8" :value="reservationName" placeholder="请输入您的姓名" :error-message="reservationNameError" @input="reservationName = $event.detail" />

		<view class="phone-title">联系方式</view>
		<van-field :value="phoneNumber" type="tel" maxlength="11" placeholder="请输入您的手机号码" :error-message="phoneNumberError" @input="phoneNumber = $event.detail" />

		<view class="partner-title">同行人员</view>
		<van-dropdown-menu>
			<van-dropdown-item :value="value" :options="partnerOption" @change="handleDropdownChange" />
		</van-dropdown-menu>
		<block v-for="(field, index) in companionFields" :key="index">
			<van-field custom-class="travel-field" :value="field.name" type="text" placeholder="请输入同行人员的姓名" maxlength="8" @input="validateField(index, $event)" />
		</block>

		<view class="partner-title">您了解本次活动的渠道</view>
		<van-dropdown-menu>
			<van-dropdown-item :value="channelValue" :options="partnerOptionC" @change="handleDropdownChangeC" />
		</van-dropdown-menu>

		<view class="submit-btn">
			<van-button color="#32579c" round size="large" @click="submit">确认提交</van-button>
		</view>

		<ReservationPopup :show="showReservationPopup" @close="handlePopupClose" />
		<van-dialog id="van-dialog" />
	</view>
</template>

<script>
import Dialog from '@/wxcomponents/vant/dialog/dialog';
import { getScienceActivityInProgress, getScienceActivityEvents, getReservationTimeSlot, getReservationWeekNumbers, personalActivityReservation } from '@/api';
export default {
	data() {
		return {
			title: '',
			requestResult: {},

			showReservationPopup: false, // 控制弹出层的显示状态

			date: null,
			week: null,
			selectedTimeSlot: null, // 当前选中的时段
			selectedTimeSlotIndex: 0, // 当前选中的时段索引
			timeSlotList: [], // 四个预约时间段
			timeSlotNumbers: null, // 子组件返回的预约人数数据
			needTimeSlotRequest: true, // 是否需要请求时间段信息

			radio: '0',
			needExplainServiceNum: 50, // 需要讲解服务的人数，后台获取
			reservationName: null,
			phoneNumber: null,
			colleagues: 0, // 同行人员
			companionNames: '', // 收集的同行人员姓名字符串
			// 下拉框
			value: 0,
			partnerOption: [
				{ text: '0', value: 0 },
				{ text: '1', value: 1 },
				{ text: '2', value: 2 },
				{ text: '3', value: 3 },
				{ text: '4', value: 4 },
				{ text: '5', value: 5 }
			],
			channelValue: 1,
			partnerOptionC: [
				{ text: '公众号/抖音推送', value: 0 },
				{ text: '人人通', value: 1 },
				{ text: '科普馆社群', value: 2 },
				{ text: '患者社群', value: 3 },
				{ text: '朋友/家人推荐', value: 4 },
				{ text: '其他', value: 5 }
			],
			channel: '人人通',
			companionFields: [], // 动态生成的字段

			reservationNameError: '',
			ageError: '',
			phoneNumberError: ''
		};
	},
	computed: {
		// 合并时段数据和预约人数
		combinedTimeSlotList() {
			if (this.timeSlotNumbers) {
				return this.timeSlotList.map((slot, index) => {
					const numbersKey = `numbers${index + 1}`;
					// 获取对应的预约人数，默认为 0
					const reservationNumber = this.timeSlotNumbers[numbersKey] || 0;
					console.log('预约人数：：', reservationNumber);
					return {
						...slot, // 保留原有时段对象的所有属性
						reservationNumber // 添加 reservationNumber 字段
					};
				});
			}
			// 如果没有 timeSlotNumbers 数据，直接返回 timeSlotList
			return this.timeSlotList;
		}
	},
	onLoad(options) {
		console.log('接收到的参数：', options);
		this.getDetailData(options);
		this.getReservationTimeSlotData();
	},
	methods: {
		async getDetailData(options) {
			const title = decodeURIComponent(options.title);
			this.title = title;
			console.log('标题：：', this.title);
			let requestResult;
			if (this.title === '进行中') {
				requestResult = await getScienceActivityInProgress();
			} else {
				requestResult = await getScienceActivityEvents();
			}
			this.requestResult = requestResult.data[0];
		},

		handlePopupClose() {
			this.showReservationPopup = false; // 监听子组件关闭事件
			console.log('触发', this.showReservationPopup);
		},
		// 获取初始的时段数据
		getReservationTimeSlotData() {
			getReservationTimeSlot().then((res) => {
				this.timeSlotList = res.data;
				console.log('四个时间段的时间数据', this.timeSlotList);
			});
		},
		// 处理日期选择
		handleDateSelected({ date, week }) {
			this.date = date;
			this.week = week;
			if (this.date && this.selectedTimeSlot) {
				getReservationWeekNumbers({
					dateTime: this.date,
					timeSlot: this.selectedTimeSlot
				}).then((res) => {
					if (res.code === 200 && res.message == '查询成功') {
						this.needExplainServiceNum = res.data.numbers;
					}
				});
			}
		},
		// 接收子组件返回的预约人数数据
		updateTimeSlotNumbers(numbers) {
			console.log('预约人数', numbers);
			this.timeSlotNumbers = numbers;
		},
		// 选择四个时间段
		handleTimeSlotSelected(slot, index) {
			console.log('触发了吗??????????????????????', slot, index);
			this.selectedTimeSlot = slot;
			this.selectedTimeSlotIndex = index;
			if (this.date && this.selectedTimeSlot) {
				getReservationWeekNumbers({
					dateTime: this.date,
					timeSlot: this.selectedTimeSlot
				}).then((res) => {
					console.log('选择讲解服务的人数', res);
					if (res.code === 200 && res.message == '查询成功') {
						this.needExplainServiceNum = res.data.numbers;
					}
				});
			}
		},
		// 选择下拉框
		handleDropdownChange(value) {
			console.log('下拉框1', value);
			this.colleagues = value.detail; // 同行人员
			const numFields = Number(value.detail); // 根据下拉框的值动态更新 companionFields
			if (numFields === 0) {
				this.companionFields = []; // 清空字段
			} else if (numFields > this.companionFields.length) {
				// 增加字段
				for (let i = this.companionFields.length; i < numFields; i++) {
					this.companionFields.push({ name: '' });
				}
			} else if (numFields < this.companionFields.length) {
				// 减少字段
				this.companionFields.splice(numFields);
			}
		},
		handleDropdownChangeC(value) {
			console.log(this.partnerOptionC[value.detail].text);
			this.channel = this.partnerOptionC[value.detail].text;
		},
		validateField(index, value) {
			const regex = /^[a-zA-Z\u4e00-\u9fa5\s]*$/; // 正则匹配中文英文空格
			let inputValue = value.detail; // 获取 van-field 组件的输入值

			if (!regex.test(inputValue)) {
				inputValue = inputValue.replace(/[^a-zA-Z\u4e00-\u9fa5\s]/g, '');
				this.$toast({
					duration: 3000,
					message: '只能输入英文或中文，不允许特殊符号或数字'
				});
			}
			this.$set(this.companionFields, index, { name: inputValue }); // 更新对应项
		},
		submit() {
			this.reservationNameError = '';
			this.phoneNumberError = '';
			const nameRegex = /^[a-zA-Z\u4e00-\u9fa5\s]{1,20}$/; // 中英文+空格
			const phoneRegex = /^1[3-9]\d{9}$/; // 手机号校验

			// 校验预约者姓名
			if (!this.reservationName) {
				this.reservationNameError = '预约者姓名不能为空';
				return;
			} else if (!nameRegex.test(this.reservationName)) {
				this.reservationNameError = '姓名只能包含中文或英文';
				return;
			}
			// 校验手机号
			if (!this.phoneNumber) {
				this.phoneNumberError = '手机号不能为空';
				return;
			} else if (!phoneRegex.test(this.phoneNumber)) {
				this.phoneNumberError = '手机号格式错误';
				return;
			}
			// 校验动态生成的 van-field 是否填写
			const emptyFields = this.companionFields.some((field) => !field.name.trim());
			if (emptyFields) {
				this.$toast({
					duration: 3000,
					message: '请填写所有同行人员的姓名'
				});
				return;
			}
			// 将输入值处理为逗号分隔的字符串
			this.companionNames = this.companionFields.map((field) => field.name.trim()).join(',');
			console.log('提交的同行人员姓名:', this.companionNames);
			uni.showLoading({
				title: '提交中...',
				mask: true
			});
			// 包装请求和定时器为一个 Promise
			const delayPromise = new Promise((resolve) => {
				setTimeout(resolve, 1500); // 至少展示 1500 毫秒
			});

			Promise.all([
				personalActivityReservation({
					name: this.reservationName,
					phone: this.phoneNumber,
					colleagues: this.colleagues,
					colleagueName: this.companionNames,
					activityId: this.requestResult.activityId,
					channel: this.channel,
					dateTime: this.date,
					timeSlot: this.selectedTimeSlot,
					week: this.week
				}),
				delayPromise
			])
				.then(([res]) => {
					if (res.code === 200 && res.message === '您已成功预约') {
						Dialog.alert({
							message: '您已成功预约',
							theme: 'round-button',
							confirmButtonText: '我知道了',
							beforeClose: (action) =>
								new Promise((resolve) => {
									if (action === 'confirm') {
										console.log('跳转至积分');
										uni.reLaunch({
											url: `/subpackages/packageMine/points/index?remind=true`
										});
									}
									resolve(true); // 无论是否跳转都允许关闭
								})
						});
					} else {
						this.$toast({
							duration: 3000,
							message: res.message
						});
					}
				})
				.finally(() => {
					uni.hideLoading();
				});
		}
	}
};
</script>

<style lang="scss" scoped>
.activity-enroll-container {
	width: 100%;
	height: 100vh;
	box-sizing: border-box;
	background-color: #fff;
	overflow-y: auto;
	padding: 32rpx 32rpx 80px 32rpx;
	.txt-1 {
		color: #333;
		font-size: 32rpx;
		font-weight: 550;
		margin-top: 20rpx;
	}
	.txt-2 {
		display: flex;
		align-items: center;
		white-space: nowrap;
		font-size: 20rpx;
		margin-top: 8rpx;
		.txt-2-1 {
			color: #02c6a2;
		}
		.txt-2-2 {
			color: #7c7e80;
			margin-left: 16rpx;
			display: inline-block;
		}
	}
	.date-picker-title {
		color: #2a2a2a;
		font-size: 32rpx;
		font-weight: 550;
		margin: 56rpx auto 6rpx auto;
	}
	.divider {
		height: 1px;
		background-color: #eaeaea;
		margin: 30rpx 0;
	}
	.morning-title {
		color: #2a2a2a;
		font-weight: 550;
		font-size: 32rpx;
	}
}

.time-slot-title,
.name-title,
.age-title,
.phone-title,
.partner-title {
	font-weight: 550;
	font-size: 32rpx;
	margin: 40rpx 0 20rpx 0;
}
.date-picker-title {
	font-size: 32rpx;
	margin-bottom: 20rpx;
}

.morning-title {
	font-size: 32rpx;
	color: #2a2a2a;
}

.divider {
	height: 1px;
	background-color: #eaeaea;
	margin: 30rpx 0;
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
	background-color: #ebf1ff;
	border: 1px solid #d0d7f6;
}
::v-deep .van-dropdown-item__option .van-cell {
	border: none;
	background-color: transparent;
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
::v-deep .travel-field {
	margin-top: 14rpx;
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
	top: 83% !important;
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
