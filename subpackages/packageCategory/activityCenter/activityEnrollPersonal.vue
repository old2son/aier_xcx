<template>
	<view class="activity-enroll-container">
		<view class="txt-1">{{ requestResult.activityName }}</view>
		<view class="txt-2">
			<text class="txt-2-1">进行中</text>
			<text class="txt-2-2">{{ requestResult.endTime }} 结束</text>
		</view>
		<view class="date-picker-title">日期选择</view>

		<view class="date-picker-wrap">
			<DatePicker
				:isActivity="true"
				:disabled-weekdays="[1]"
				:selected-cal="selectedCal"
				:needTimeSlotRequest="needTimeSlotRequest"
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

		<view class="divider" />
		<view class="time-slot-title">时段选择</view>
		<view class="morning-title">上午时段</view>

		<TimeSlotPicker
			:weight="true"
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
		<view class="member-list" v-if="memberList.length">
			<view class="member-detail" v-for="(item, index) in memberList" :key="index">
				<view class="delete-btn" @click="deleteMember(index)">
					<van-icon name="cross" size="25rpx" color="#fff" />
				</view>
				<view class="member-info">
					<view class="member-top">
						<text class="member-name">{{ item.name }}</text>
						<text class="member-tag">{{ item.typeText }}</text>
					</view>
					<view class="member-phone" v-if="item.phone">{{ item.phone }}</view>
					<view class="member-bottom" v-if="item.idCard">证件号码：{{ item.idCard }}</view>
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

		<van-popup class="add-popup" round position="bottom" :show="isShowAdd" @close="closeAddMemberPopup">
			<view class="add-detail-wrap">
				<view class="add-title">新增成员</view>

				<view class="name-title">姓名</view>
				<van-field
					custom-class="custom-field"
					input-class="custom-input"
					type="text"
					maxlength="8"
					:value="memberName"
					placeholder="请输入成员姓名"
					:error-message="memberNameError"
					@input="memberName = $event.detail"
				/>

				<view v-if="memberType !== 0">
					<view class="phone-title">联系方式</view>
					<van-field
						custom-class="custom-field"
						input-class="custom-input"
						:value="memberPhone"
						type="tel"
						maxlength="11"
						placeholder="请输入成员手机号码"
						:error-message="memberPhoneError"
						@input="memberPhone = $event.detail"
					/>

					<view class="idtype-title">证件类型</view>
					<van-radio-group :value="idRadio" @change="idRadio = $event.detail">
						<van-radio name="1">身份证</van-radio>
						<van-radio name="2">护照</van-radio>
						<van-radio name="3">港澳居民往来通行证</van-radio>
						<van-radio name="4">台湾居民往来内地通行证</van-radio>
						<van-radio name="5">军官证</van-radio>
					</van-radio-group>

					<view class="id-title">证件号码</view>
					<van-field
						custom-class="custom-field"
						input-class="custom-input"
						:value="memberIdCard"
						type="idcard"
						maxlength="18"
						placeholder="请输入证件号码"
						:error-message="memberIdError"
						@input="memberIdCard = $event.detail"
					/>
				</view>

				<view class="act-btns">
					<van-button block round size="normal" color="#32579c" plain @click="closeAddMemberPopup"
						>返回</van-button
					>
					<van-button block round size="normal" color="#32579c" type="primary" @click="confirmAdd"
						>确认</van-button
					>
				</view>
			</view>
		</van-popup>

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
import { mapState } from 'vuex';
import Dialog from '@/wxcomponents/vant/dialog/dialog';
import { getReservationTimeSlot, getReservationWeekNumbers, personalActivityReservation } from '@/api';
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

			reservationNameError: '',
			ageError: '',
			phoneNumberError: '',

			idRadio: '1',

			isShowCal: false,
			isShowAdd: false,

			memberType: null,
			memberList: [],
			memberName: '',
			memberPhone: '',
			memberIdCard: '',
			memberNameError: '',
			memberPhoneError: '',
			memberIdError: '',

			selectedCal: null
		};
	},
	computed: {
		...mapState('moduleActivity', ['selectedActivity']),
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
		async getDetailData() {
			console.log('报名详情数据', this.selectedActivity);
			this.requestResult = this.selectedActivity;
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
					if (res.code === 200 && res.message === '查询成功') {
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
		handleDropdownChangeC(value) {
			console.log(this.partnerOptionC[value.detail].text);
			this.channel = this.partnerOptionC[value.detail].text;
		},
		handleCalendarClose() {
			this.isShowCal = false;
		},
		handleSelectCal(res) {
			this.selectedCal = res;
		},
		showAddMemberPopup(type) {
			this.memberType = type;
			this.resetMemberForm();
			this.isShowAdd = true;
		},
		closeAddMemberPopup() {
			this.isShowAdd = false;
			this.resetMemberForm();
		},
		resetMemberForm() {
			this.memberName = '';
			this.memberPhone = '';
			this.memberIdCard = '';
			this.memberNameError = '';
			this.memberPhoneError = '';
			this.memberIdError = '';
			this.idRadio = '1';
		},
		confirmAdd() {
			const nameRegex = /^[a-zA-Z\u4e00-\u9fa5\s]{1,20}$/;
			const phoneRegex = /^1[3-9]\d{9}$/;

			this.memberNameError = '';
			this.memberPhoneError = '';
			this.memberIdError = '';

			if (this.memberList.length >= 5) {
				this.$toast({
					duration: 3000,
					message: '最多可添加 5 人'
				});
				return;
			}
			if (!this.memberName) {
				this.memberNameError = '成员姓名不能为空';
				return;
			}
			if (!nameRegex.test(this.memberName)) {
				this.memberNameError = '姓名只能包含中文或英文';
				return;
			}
			if (this.memberType !== 0) {
				if (!this.memberPhone) {
					this.memberPhoneError = '手机号不能为空';
					return;
				}
				if (!phoneRegex.test(this.memberPhone)) {
					this.memberPhoneError = '手机号格式错误';
					return;
				}
				if (!this.memberIdCard) {
					this.memberIdError = '证件号码不能为空';
					return;
				}
			}

			this.memberList.push({
				type: this.memberType,
				typeText: this.memberType === 0 ? '儿童' : '成人',
				idType: this.idRadio,
				name: this.memberName.trim(),
				phone: this.memberType === 0 ? '' : this.memberPhone.trim(),
				idCard: this.memberType === 0 ? '' : this.memberIdCard.trim()
			});
			this.closeAddMemberPopup();
		},
		deleteMember(index) {
			this.memberList.splice(index, 1);
		},
		getMemberSubmitNames() {
			return this.memberList.map((item) => `${item.name}(${item.typeText})`).join(',');
		},
		// todo: 修改成个人活动的提交
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
			const memberNames = this.getMemberSubmitNames();
			const colleagues = this.memberList.length;
			console.log('提交的成员信息:', memberNames);
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
					colleagues: colleagues,
					colleagueName: memberNames,
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
	},
	onLoad() {
		this.getDetailData();
		this.getReservationTimeSlotData();
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
.member-title,
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

.member-title {
	display: flex;
	justify-content: space-between;
	align-items: center;

	.tips {
		color: #999;
		font-size: 30rpx;
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
		margin-top: 12rpx;
	}

	.member-tag {
		padding: 6rpx 16rpx;
		border-radius: 20rpx;
		background: #ebf1ff;
		color: #32579c;
		font-size: 22rpx;
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
