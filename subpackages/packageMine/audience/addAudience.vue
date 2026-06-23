<template>
	<view class="add-members-container">
		<CustomNavInner title="常用观众" />
		<view class="member-box" :style="{ top: menuInfo.menuHeight + menuInfo.menuHeightFromTop + 20 + 'px' }">
			<view class="col-1">
				<text>成员</text>
			</view>
			<view class="col-2">
				<text>姓名</text>
				<input
					:value="memberName"
					type="text"
					placeholder="请输入添加成员姓名"
					maxlength="10"
					class="name-input"
					@input="handleNameInput"
				/>
			</view>
			<view class="col-2">
				<text>年龄</text>
				<input
					:value="userAge"
					type="number"
					placeholder="请输入年龄"
					maxlength="3"
					class="name-input"
					@input="handleAgeInput"
				/>
			</view>
			<view class="col-2 contact-row" :class="{ 'contact-row-hide': isMinor }">
				<text>联系方式</text>
				<input
					:value="userPhone"
					type="number"
					placeholder="请输入联系方式"
					maxlength="11"
					class="name-input"
					@input="handlePhoneInput"
				/>
			</view>
			<view class="col-2">
				<text>证件类型</text>
				<view class="picker-value" @click="showDocumentTypePopup = true">
					<text>{{ currentDocumentTypeLabel }}</text>
					<text class="picker-arrow">></text>
				</view>
			</view>
			<view class="col-2">
				<text>证件号码</text>
				<input
					:value="idNumber"
					:type="certificateFieldType"
					:placeholder="certificatePlaceholder"
					maxlength="18"
					class="name-input"
					@input="handleCertificateInput"
				/>
			</view>
			<view class="btn-wrap">
				<button type="default" class="cancel-btn" @click="back()">返回</button>
				<button type="primary" class="confirm-btn" @click="confirm()">确认</button>
			</view>
		</view>
		<van-popup :show="showDocumentTypePopup" round position="bottom" @close="showDocumentTypePopup = false">
			<van-picker
				show-toolbar
				value-key="label"
				:columns="documentTypeOptions"
				@cancel="showDocumentTypePopup = false"
				@confirm="handleDocumentTypeConfirm"
			/>
		</van-popup>
	</view>
</template>

<script>
import { mapState } from 'vuex';
import { addMember } from '@/api/index';

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
			memberName: '',
			documentTypeIndex: 0,
			userPhone: '',
			userAge: '',
			idNumber: '',
			showDocumentTypePopup: false,
			isSubmitting: false
		};
	},
	computed: {
		...mapState('moduleLayout', ['menuInfo']),
		documentTypeOptions() {
			return certificateTypeSet;
		},
		currentDocumentType() {
			return this.documentTypeOptions[this.documentTypeIndex] || this.documentTypeOptions[0];
		},
		currentDocumentTypeLabel() {
			return this.currentDocumentType.label;
		},
		isMinor() {
			const ageNumber = Number(this.userAge);
			return this.userAge !== '' && !Number.isNaN(ageNumber) && ageNumber < 18;
		},
		certificatePlaceholder() {
			const placeholderMap = {
				idcard: '请输入身份证号',
				passport: '请输入护照号码',
				hkmo: '请输入港澳居民往来通行证号码',
				taiwan: '请输入台湾居民往来内地通行证号码',
				military: '请输入军官证号码'
			};
			return placeholderMap[this.currentDocumentType.value] || '请输入证件号码';
		},
		certificateFieldType() {
			return this.currentDocumentType.value === 'idcard' ? 'idcard' : 'text';
		}
	},
	onLoad() {
		this.$store.dispatch('moduleLayout/getNavigationBarStyle');
	},
	methods: {
		back() {
			const pages = getCurrentPages(); // 获取页面栈
			if (pages.length > 1) {
				// 有上一页，返回
				uni.navigateBack({
					delta: 1
				});
			} else {
				// 没有上一页，跳转到首页
				uni.reLaunch({
					url: '/pages/tabBar/home/home' // 根据你的首页路径修改
				});
			}
		},
		handleNameInput(event) {
			this.validateInput('memberName', event.detail.value || '');
		},
		handlePhoneInput(event) {
			this.userPhone = String(event.detail.value || '')
				.replace(/\D/g, '')
				.slice(0, 11);
		},
		handleAgeInput(event) {
			this.userAge = String(event.detail.value || '')
				.replace(/\D/g, '')
				.slice(0, 3);
			if (this.isMinor) {
				this.userPhone = '';
			}
		},
		handleCertificateInput(event) {
			this.idNumber = String(event.detail.value || '').trim();
		},
		handleDocumentTypeConfirm(event) {
			const pickedItem = Array.isArray(event.detail.value) ? event.detail.value[0] : event.detail.value;
			const pickedIndex = this.documentTypeOptions.findIndex((item) => item.value === pickedItem.value);
			this.documentTypeIndex = pickedIndex > -1 ? pickedIndex : 0;
			this.idNumber = '';
			this.showDocumentTypePopup = false;
		},
		validateCertificate(type, value) {
			switch (type) {
				case 'idcard':
					return /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(
						value
					);
				case 'passport':
					return /^(?![0-9]+$)(?![A-Za-z]+$)[0-9A-Za-z]{1,16}$/.test(value);
				case 'hkmo':
					return /^[HM]\d{8}$/.test(value);
				case 'taiwan':
					return /^[0-9]{8,10}$/.test(value);
				case 'military':
					return /^军\d+$/.test(value);
				default:
					return false;
			}
		},
		confirm() {
			if (this.isSubmitting) {
				return;
			}

			const phoneRegex = /^1[3-9]\d{9}$/;
			const ageNumber = Number(this.userAge);
			const certificateType = this.currentDocumentType.value;
			const certificateLabel = this.currentDocumentType.label;

			if (!this.memberName) {
				uni.showToast({
					title: '成员姓名不能为空',
					duration: 3000,
					icon: 'none'
				});
				return;
			}
			if (!/^[a-zA-Z\u4e00-\u9fa5\s]*$/.test(this.memberName)) {
				uni.showToast({
					title: '成员姓名只能输入英文或中文',
					duration: 3000,
					icon: 'none'
				});
				return;
			}
			if (this.userAge === '' || Number.isNaN(ageNumber)) {
				uni.showToast({
					title: '年龄不能为空',
					duration: 3000,
					icon: 'none'
				});
				return;
			}
			if (!/^\d{1,3}$/.test(String(this.userAge)) || ageNumber < 0 || ageNumber > 120) {
				uni.showToast({
					title: '年龄需在0-120之间',
					duration: 3000,
					icon: 'none'
				});
				return;
			}
			if (!this.isMinor && !this.userPhone) {
				uni.showToast({
					title: '联系方式不能为空',
					duration: 3000,
					icon: 'none'
				});
				return;
			}
			if (!this.isMinor && !phoneRegex.test(this.userPhone)) {
				uni.showToast({
					title: '联系方式格式错误',
					duration: 3000,
					icon: 'none'
				});
				return;
			}
			if (!this.idNumber) {
				uni.showToast({
					title: `请输入${certificateLabel}号码`,
					duration: 3000,
					icon: 'none'
				});
				return;
			}
			if (!this.validateCertificate(certificateType, this.idNumber)) {
				uni.showToast({
					title: `${certificateLabel}格式不正确`,
					duration: 3000,
					icon: 'none'
				});
				return;
			}

			this.isSubmitting = true;
			addMember({
				name: this.memberName,
				userPhone: this.userPhone,
				userAge: ageNumber,
				documentType: certificateLabel,
				idNumber: this.idNumber
			}).then((res) => {
				if (res.code === 200 && res.message === '添加成功') {
					uni.showToast({
						title: '添加成功',
						duration: 1500
					});

					setTimeout(() => {
						uni.navigateBack();
					}, 1600);
				}
			});
		},
		validateInput(fieldName, value) {
			const allowedRegex = /^[a-zA-Z\u4e00-\u9fa5\s]*$/;
			if (!allowedRegex.test(value)) {
				uni.showToast({
					title: '只能输入英文或中文，不允许特殊符号或数字',
					duration: 3000,
					icon: 'none'
				});
			}
			this[fieldName] = value;
		}
	}
};
</script>

<style lang="scss" scoped>
.add-members-container {
	position: absolute;
	width: 100%;
	height: 100vh;
	overflow-y: auto;
	padding-bottom: 20px;
	box-sizing: border-box;
}

.member-box {
	position: absolute;
	width: 92%;
	margin-left: 50%;
	transform: translateX(-50%);
	background: #fff;
	border-radius: 12px;
	padding: 0 24px 15px 24px;
	box-sizing: border-box;
	font-size: 28rpx;
}

.member-box .col-1 {
	padding-top: 22px;
	box-sizing: border-box;
	font-weight: 550;
}

.member-box .col-1 text {
	color: #32579c;
}

.boy-color {
	color: #4395ff;
}

.girl-color {
	color: #ff3ec9;
}

.boy-default-color,
.girl-default-color {
	color: #595757;
}

.member-box .col-2 {
	padding: 22px 0;
	box-sizing: border-box;
	border-bottom: 1px solid #bbbbbb;
	color: #333;
	font-weight: 550;
	display: flex;
	align-items: center;
}

.contact-row {
	overflow: hidden;
	max-height: 120rpx;
	opacity: 1;
	transition:
		max-height 0.25s ease,
		opacity 0.25s ease,
		padding 0.25s ease,
		border-color 0.25s ease;
}

.contact-row-hide {
	padding-top: 0 !important;
	padding-bottom: 0 !important;
	border-bottom-color: transparent !important;
	max-height: 0;
	opacity: 0;
	pointer-events: none;
}

.member-box .col-2 text:nth-child(1) {
	white-space: nowrap;
	margin-right: 30px;
}

.picker-value {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: space-between;
	color: #333;
}

.picker-arrow {
	margin-left: 20rpx;
	color: #999;
	font-size: 24rpx;
}

.member-box .col-2 .gender-value {
	display: flex;
	align-items: center;
}

.member-box .col-2 .gender-value .boy-box,
.member-box .col-2 .gender-value .girl-box {
	display: flex;
	align-items: center;
}

.member-box .col-2 .gender-value .boy-txt {
	margin-right: 25px;
}

.member-box .col-2 .gender-value image {
	display: inline-block;
	margin-right: 10px;
	width: 13px;
	height: 13px;
}

.name-input {
	flex: 1;
	font-size: 14px;
	padding: 0;
}

.btn-wrap {
	margin-top: 24px;
	display: flex;
	justify-content: space-between;
}

.btn-wrap button {
	width: 46%;
	height: 80rpx;
	line-height: 80rpx;
	font-size: 32rpx;
	border-radius: 50rpx;
}

.cancel-btn {
	background-color: #fff;
	color: #bbbbbb;
	border: 1px solid #bbbbbb;
}

.confirm-btn {
	background-color: #32579c;
	color: #fff;
}

::v-deep .van-picker__confirm {
	color: #21467f;
	font-weight: 600;
}

::v-deep .van-picker__cancel {
	color: #7c8aa5;
}
</style>
