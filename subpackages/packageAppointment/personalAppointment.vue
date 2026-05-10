<template>
	<view class="personal-appointment-container">
		<view class="date-picker-title">日期选择</view>

		<view>
			<view class="date-picker-wrap">
				<DatePicker
					:disabled-weekdays="[1]"
					:needTimeSlotRequest="needTimeSlotRequest"
					:selected-cal="selectedCal"
					@date-selected="handleDateSelected"
					@time-slot-numbers="updateTimeSlotNumbers"
				/>
				<view class="calendar-trigger" @click="isShowCal = true">
					<van-icon name="calendar-o" />
					<van-icon name="arrow-down" />
				</view>
			</view>

			<CalendarPick
				:show-popup="isShowCal"
				:what-a-day="date"
				@closePopup="handleCalendarClose"
				@selectCal="handleSelectCal"
			/>
		</view>

		<view class="divider" />
		<view class="time-slot-title">时段选择</view>
		<view class="tip-title-1">每时段报名满15人将自动成团，我馆提供科普讲解服务。</view>
		<view class="morning-title">上午时段</view>

		<TimeSlotPicker
			:timeSlotList="combinedTimeSlotList"
			:selectedTimeSlotIndex="selectedTimeSlotIndex"
			:needTimeSlotRequest="needTimeSlotRequest"
			:select-day="date"
			@timeSlotSelected="handleTimeSlotSelected"
		/>

		<view class="member-title">
			<view class="main-msg">成员信息</view>
			<view class="tips">最多可添加5人</view>
		</view>
		<view class="member-list" v-if="!!memberList.length">
			<view class="member-detail" v-for="(item, index) in memberList" :key="index">
				<view class="delete-btn" @click="deleteMember(index)">
					<van-icon name="cross" size="25rpx" color="#fff" />
				</view>

				<view class="member-info">
					<view class="member-top">
						<text class="member-name">{{ item.name }}</text>
						<text class="member-phone" v-if="!!item.phone">{{ item.phone }}</text>
					</view>

					<view class="member-bottom" v-if="!!item.idCard">身份证：{{ item.idCard }}</view>
				</view>
			</view>
		</view>
		<view class="add-member-btns">
			<van-button
				block
				round
				size="normal"
				icon="plus"
				color="#32579c"
				type="primary"
				@click="showAddMemberPopup(0)"
				>添加儿童</van-button
			>
			<van-button
				block
				round
				size="normal"
				icon="plus"
				color="#32579c"
				type="primary"
				@click="showAddMemberPopup(1)"
				>添加成人</van-button
			>
		</view>

		<van-popup class="add-popup" round position="bottom" :show="isShowAdd" @close="isShowAdd = false">
			<view class="add-detail-wrap">
				<view class="add-title">新增成员</view>

				<view class="name-title">姓名</view>
				<van-field
					custom-class="custom-field"
					input-class="custom-input"
					type="text"
					maxlength="8"
					:value="reservationName"
					placeholder="请输入您的姓名"
					:error-message="reservationNameError"
					@input="reservationName = $event.detail"
				/>

				<!-- <view class="age-title">年龄</view>
				<van-field
					custom-class="custom-field"
					input-class="custom-input"
					:value="age"
					type="digit"
					maxlength="4"
					placeholder="0-14 岁需填写陪同人员"
					:error-message="ageError"
					@input="age = $event.detail"
				/> -->

				<view v-if="memberType !== 0">
					<view class="phone-title">联系方式</view>
					<van-field
						custom-class="custom-field"
						input-class="custom-input"
						:value="phoneNumber"
						type="tel"
						maxlength="11"
						placeholder="请输入您的手机号码"
						:error-message="phoneNumberError"
						@input="phoneNumber = $event.detail"
					/>

					<view class="idtype-title">证件类型</view>
					<van-radio-group :value="idRadio" bind:change="onChange">
						<van-radio name="1">身份证 1</van-radio>
						<van-radio name="2">护照 2</van-radio>
					</van-radio-group>

					<view class="id-title">证件号码</view>
					<van-field
						custom-class="custom-field"
						input-class="custom-input"
						:value="idCard"
						type="idcard"
						maxlength="18"
						placeholder="请输入身份证号"
						@input="idCard = $event.detail"
					/>
				</view>

				<!-- <view class="partner-title">同行人员</view>
				<van-dropdown-menu>
					<van-dropdown-item :value="value" :options="partnerOption" @change="handleDropdownChange" />
				</van-dropdown-menu> -->

				<view class="act-btns">
					<van-button block round size="normal" color="#32579c" plain @click="isShowAdd = false"
						>返回</van-button
					>
					<van-button block round size="normal" color="#32579c" type="primary" @click="confirmAdd"
						>确认</van-button
					>
				</view>
			</view>
		</van-popup>

		<block v-for="(field, index) in companionFields" :key="index">
			<van-field
				custom-class="travel-field"
				:value="field.name"
				type="text"
				placeholder="请输入同行人员的姓名"
				maxlength="8"
				@input="validateField(index, $event)"
			/>
		</block>

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

		<!-- debug -->
		<!-- <ReservationPopup :show="showReservationPopup" @close="handlePopupClose" /> -->

		<van-dialog id="van-dialog" />
	</view>
</template>

<script>
import Dialog from '@/wxcomponents/vant/dialog/dialog';
import { getReservationTimeSlot, getReservationWeekNumbers, personalReservation } from '@/api';
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
			needExplainServiceNum: 50, // 需要讲解服务的人数，后台获取
			reservationName: null,
			age: null,
			phoneNumber: null,
			idCard: null,
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
			isShaking: false, // 控制抖动动画的状态
			companionFields: [], // 动态生成的字段

			reservationNameError: '',
			ageError: '',
			phoneNumberError: '',

			idRadio: '1',

			isShowCal: false,
			isShowAdd: false,

			memberType: null,
			memberList: [
				{
					name: '彩页',
					phone: '136',
					idCard: '440'
				},
				{
					name: '碟吊灯',
					phone: '137',
					idCard: '441'
				}
			],

			selectedCal: null
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

	methods: {
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
			// if (this.date && this.selectedTimeSlot) {
			// 	getReservationWeekNumbers({
			// 		dateTime: this.date,
			// 		timeSlot: this.selectedTimeSlot
			// 	}).then((res) => {
			// 		console.log('DatePickerDatePickerDatePickerDatePickerDatePicker');
			// 		if (res.code === 200 && res.message == '查询成功') {
			// 			this.needExplainServiceNum = res.data.numbers;
			// 		}
			// 	});
			// }
		},
		// 接收子组件返回的预约人数数据
		updateTimeSlotNumbers(numbers) {
			console.log('预约人数', numbers);
			this.timeSlotNumbers = numbers;
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
					console.log('选择讲解服务的人数', res);
					if (res.code === 200 && res.message == '查询成功') {
						this.needExplainServiceNum = res.data.numbers;
					}
				});
			}
		},
		// 选择下拉框
		handleDropdownChange(value) {
			console.log('下拉框', value);
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
		handleCalendarClose() {
			this.isShowCal = false;
		},
		handleSelectCal(res) {
			this.selectedCal = res;
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
			this.ageError = '';
			this.phoneNumberError = '';
			const nameRegex = /^[a-zA-Z\u4e00-\u9fa5\s]{1,20}$/; // 中英文+空格
			const phoneRegex = /^1[3-9]\d{9}$/; // 手机号校验
			const ageNumber = Number(this.age);

			// debug
			console.log('提交预约时间', this.selectedTimeSlot);

			// 校验预约者姓名
			if (!this.reservationName) {
				this.reservationNameError = '预约者姓名不能为空';
				return;
			} else if (!nameRegex.test(this.reservationName)) {
				this.reservationNameError = '姓名只能包含中文或英文';
				return;
			}
			// 校验年龄
			if (!this.age) {
				this.ageError = '年龄不能为空';
				return;
			} else if (isNaN(ageNumber) || ageNumber < 0 || ageNumber > 150) {
				this.ageError = '请输入有效的年龄 (0-150)';
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
			if (this.age >= 0 && this.age <= 14 && this.colleagues === 0) {
				// 提示用户
				this.$toast({
					duration: 3000,
					message: '年龄在 0-14 岁，需至少选择一位同行人员'
				});
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
			if (this.radio === '0') {
				this.$toast({
					duration: 3000,
					message: '请勾选您是否需要讲解服务'
				});
				return;
			}
			const startTime = Date.now();
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
				personalReservation({
					dateTime: this.date,
					week: this.week,
					timeSlot: this.selectedTimeSlot,
					name: this.reservationName,
					age: this.age,
					phone: this.phoneNumber,
					colleagues: this.colleagues,
					colleagueName: this.companionNames,
					expound: this.radio === '1' ? 0 : 1 // √ 是 传0，× 是 传 1
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
										console.log('跳转至消息中心');
										uni.reLaunch({
											url: '/subpackages/packageMine/messageCenter/index'
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
		},
		showAddMemberPopup(type) {
			this.memberType = type;
			this.isShowAdd = true;
		},
		onSelectDate(event) {
			// debug
			console.log(event);
		},
		confirmDate() {
			// debug
			this.isShowCal = false;
		},
		confirmAdd() {
			if (this.memberList.length > 5) {
				this.$toast({
					duration: 3000,
					message: '最多可添加 5 人'
				});
				return;
			}

			this.memberList.push({
				name: this.reservationName,
				phone: this.phoneNumber,
				idCard: this.idCard
			});
		},
		deleteMember(index) {
			this.memberList.splice(index, 1);
		}
	},
	mounted() {
		this.getReservationTimeSlotData();
	}
};
</script>

<style lang="scss" scoped>
.personal-appointment-container {
	padding: 40rpx 4% 100rpx 4%;
	box-sizing: border-box;
	background-color: #f8f9ff;
}

.time-slot-title,
.member-title,
.name-title,
.age-title,
.phone-title,
.partner-title,
.explain-service-title {
	margin: 40rpx 0 20rpx 0;
	font-size: 38rpx;
}
.member-title {
	display: flex;
	justify-content: space-between;
	align-items: center;

	.tips {
		color: #999;
		font-size: 30rpx;
	}
}
.date-picker-title {
	margin-bottom: 20rpx;
	font-size: 38rpx;
}
.tip-title-1,
.tip-title-2 {
	margin: 20rpx 0 40rpx 0;
	color: #999;
	font-size: 24rpx;
}
.morning-title {
	color: #2a2a2a;
	font-size: 38rpx;
}

.divider {
	height: 1px;
	margin: 30rpx 0;
	background-color: #eaeaea;
}

.date-picker-wrap {
	display: flex;
	justify-content: space-between;
	align-items: center;
	width: 100%;
	gap: 20rpx;
}

.calendar-trigger {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
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
	.partner-title,
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

::v-deep .shake {
	animation: shake 0.5s;
}

@keyframes shake {
	0% {
		transform: translateX(0rpx);
	}
	25% {
		transform: translateX(-10rpx);
	}
	50% {
		transform: translateX(10rpx);
	}
	75% {
		transform: translateX(-10rpx);
	}
	100% {
		transform: translateX(0rpx);
	}
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
