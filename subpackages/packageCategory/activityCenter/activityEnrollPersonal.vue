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
						<text class="member-name">{{ item.userName }}</text>
						<text class="member-phone" v-if="!!item.userPhone">{{ maskPhone(item.userPhone) }}</text>
					</view>

					<view class="member-bottom" v-if="!!item.idNumber"
						>{{ getCertificateLabel(item.documentType) }}：{{ item.documentType
						}}{{ maskCertificate(item.idNumber) }}</view
					>
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
					:value="reservationName"
					placeholder="请输入您的姓名"
					:error-message="reservationNameError"
					@input="reservationName = $event.detail"
				/>

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
					<van-radio-group :value="idTypeRadio" @change="handleIdRadioChange">
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
						:value="idCard"
						:type="certificateFieldType"
						maxlength="18"
						:placeholder="certificatePlaceholder"
						:error-message="idCardError"
						@input="idCard = $event.detail"
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
import { getReservationTimeSlot, getReservationWeekNumbers, personalActivityReservation } from '@/api/index';

const certificateTypeSet = [
	{ label: '身份证', value: 'idcard' },
	{ label: '护照', value: 'passport' },
	{ label: '港澳居民往来通行证', value: 'hkmo' },
	{ label: '台湾居民往来内地通行证', value: 'taiwan' },
	{ label: '军官证', value: 'military' }
];

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
			idCardError: '',

			idTypeRadio: '1',

			isShowCal: false,
			isShowAdd: false,

			memberType: null,
			memberList: [],

			selectedCal: null
		};
	},
	computed: {
		...mapState('moduleActivity', ['selectedActivity']),
		certificateType() {
			const idTypeMap = {
				1: 'idcard',
				2: 'passport',
				3: 'hkmo',
				4: 'taiwan',
				5: 'military'
			};
			return idTypeMap[this.idTypeRadio] || 'idcard';
		},
		certificatePlaceholder() {
			const placeholderMap = {
				idcard: '请输入身份证号',
				passport: '请输入护照号码',
				hkmo: '请输入港澳居民往来通行证号码',
				taiwan: '请输入台湾居民往来内地通行证号码',
				military: '请输入军官证号码'
			};
			return placeholderMap[this.certificateType] || '请输入证件号码';
		},
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
			this.requestResult = this.selectedActivity;
		},
		handlePopupClose() {
			this.showReservationPopup = false; // 监听子组件关闭事件
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
			// 		if (res.code === 200 && res.message === '查询成功') {
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
			if (this.memberList.length >= 5) {
				this.$toast({
					duration: 3000,
					message: '最多可添加 5 人'
				});
				return;
			}

			if (this.memberList.length >= 4) {
				// 判断前4人是否全部是儿童，是的话提示用户至少需要添加一位成年人
				const hasAdultMember = this.memberList.some((item) => !!item.idNumber);
				if (!hasAdultMember && type === 0) {
					this.$toast({
						duration: 3000,
						message: '至少需要添加一位成年人'
					});
					return;
				}
			}

			this.memberType = type;
			this.isShowAdd = true;
		},
		closeAddMemberPopup() {
			this.isShowAdd = false;
			this.resetMemberForm();
		},
		resetMemberForm() {
			this.reservationName = '';
			this.reservationNameError = '';
			this.phoneNumber = '';
			this.phoneNumberError = '';
			this.idCard = '';
			this.idCardError = '';
			this.idTypeRadio = '1';
			this.idType = '身份证';
			this.memberType = null;
		},
		handleIdRadioChange(event) {
			this.idTypeRadio = event.detail;
			this.idCard = '';
			this.idCardError = '';
		},
		validateCertificate(type, value) {
			switch (type) {
				case 'idcard':
					return /^[1-9]\d{16}[\dXx]$/.test(value);
				case 'passport':
					return /^[a-zA-Z0-9]{5,17}$/.test(value);
				case 'hkmo':
					return /^[A-Z]\d{6,10}$/.test(value);
				case 'taiwan':
					return /^\d{8}$|^[A-Z][0-9]{9}$/.test(value);
				case 'military':
					return /^[\u4e00-\u9fa5A-Za-z0-9]+$/.test(value);
				default:
					return false;
			}
		},
		getCertificateLabel(type) {
			return certificateTypeSet.find((item) => item.value === type)?.label || '证件';
		},
		maskPhone(value) {
			if (!value) return '';
			const phone = String(value);
			if (phone.length <= 7) {
				return phone;
			}
			return `${phone.slice(0, 3)}****${phone.slice(-4)}`;
		},
		maskCertificate(value) {
			if (!value) return '';
			const text = String(value);
			if (text.length <= 4) {
				return text;
			}
			if (text.length <= 8) {
				return `${text.slice(0, 2)}***${text.slice(-2)}`;
			}
			return `${text.slice(0, 3)}********${text.slice(-4)}`;
		},
		confirmAdd() {
			this.reservationNameError = '';
			this.ageError = '';
			this.phoneNumberError = '';
			this.idCardError = '';
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
			// 校验儿童
			console.log(this.memberType);
			if (this.memberType === 0) {
				this.memberList.push({
					userName: this.reservationName
				});
				this.closeAddMemberPopup();
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
			// 校验证件号
			if (this.memberType !== 0) {
				const certificateType = this.certificateType;
				const certificateLabel =
					certificateTypeSet.find((item) => item.value === certificateType)?.label || '证件';
				if (!this.idCard) {
					this.idCardError = `请输入${certificateLabel}号码`;
					return;
				}
				if (!this.validateCertificate(certificateType, this.idCard.trim())) {
					this.idCardError = `${certificateLabel}格式不正确`;
					return;
				}
			}

			this.memberList.push({
				userName: this.reservationName,
				userPhone: this.phoneNumber,
				idNumber: this.idCard,
				documentType: this.getCertificateLabel(this.certificateType)
			});
			this.closeAddMemberPopup();
		},
		deleteMember(index) {
			this.memberList.splice(index, 1);
		},
		submit() {
			if (this.memberList.length === 0) {
				this.$toast({
					duration: 3000,
					message: '至少需要添加一位成年人'
				});
				return;
			}

			const hasAdultMember = this.memberList.some((item) => !!item.idNumber);
			if (!hasAdultMember) {
				this.$toast({
					duration: 3000,
					message: '至少需要添加一位成年人'
				});
				return;
			}

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
					activityId: this.requestResult.activityId,
					channel: this.channel,
					dateTime: this.date,
					timeSlot: this.selectedTimeSlot,
					week: this.week,
					members: this.memberList
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
										uni.reLaunch({
											url: `/subpackages/packageMine/points/index?remind=true`
										});
									}
									resolve(true); // 无论是否跳转都允许关闭
								})
						});
					} else {
						uni.hideLoading();
						setTimeout(() => {
							this.$toast({
								duration: 3000,
								message: res.message
							});
						}, 50);
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
