<template>
	<view class="member-panel">
		<view class="member-title">
			<view class="main-msg">成员信息</view>
			<view class="tips">最多可添加{{ maxMembers }}人</view>
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

					<view class="member-bottom" v-if="!!item.idNumber">
						{{ getMemberCertificateLabel(item) }}：{{ maskCertificate(item.idNumber) }}
					</view>
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
			>
				添加儿童
			</van-button>
			<van-button
				block
				round
				size="normal"
				icon="plus"
				color="#32579c"
				type="primary"
				@click="showAddMemberPopup(1)"
			>
				添加成人
			</van-button>
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

				<view class="age-title">年龄</view>
				<van-field
					custom-class="custom-field"
					input-class="custom-input"
					type="digit"
					maxlength="3"
					:value="age"
					:placeholder="memberType === 0 ? childAgePlaceholder : adultAgePlaceholder"
					:error-message="ageError"
					@input="age = $event.detail"
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
				</view>

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

				<view class="act-btns">
					<van-button block round size="normal" color="#32579c" plain @click="closeAddMemberPopup">
						返回
					</van-button>
					<van-button block round size="normal" color="#32579c" type="primary" @click="confirmAdd">
						确认
					</van-button>
				</view>
			</view>
		</van-popup>
	</view>
</template>

<script>
const certificateTypeSet = [
	{ label: '身份证', value: 'idcard' },
	{ label: '护照', value: 'passport' },
	{ label: '港澳居民往来通行证', value: 'hkmo' },
	{ label: '台湾居民往来内地通行证', value: 'taiwan' },
	{ label: '军官证', value: 'military' }
];

export default {
	name: 'ReservationMemberPanel',
	props: {
		memberList: {
			type: Array,
			default: () => []
		},
		maxMembers: {
			type: Number,
			default: 5
		},
		childAgeMin: {
			type: Number,
			default: 0
		},
		childAgeMax: {
			type: Number,
			default: 18
		},
		adultAgeMin: {
			type: Number,
			default: 18
		},
		adultAgeMax: {
			type: Number,
			default: 150
		}
	},
	data() {
		return {
			reservationName: '',
			age: '',
			phoneNumber: '',
			idCard: '',
			reservationNameError: '',
			ageError: '',
			phoneNumberError: '',
			idCardError: '',
			idTypeRadio: '1',
			isShowAdd: false,
			memberType: null
		};
	},
	computed: {
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
		certificateFieldType() {
			return this.certificateType === 'idcard' ? 'idcard' : 'text';
		},
		childAgePlaceholder() {
			return `请输入${this.childAgeMin}-${this.childAgeMax}岁`;
		},
		adultAgePlaceholder() {
			return `请输入${this.adultAgeMin}-${this.adultAgeMax}岁`;
		}
	},
	methods: {
		emitMemberList(list) {
			const nextList = list.map((item) => ({ ...item }));
			this.$emit('change', nextList);
			this.$emit('update:memberList', nextList);
		},
		showAddMemberPopup(type) {
			if (this.memberList.length >= this.maxMembers) {
				this.$toast({
					duration: 3000,
					message: `最多可添加 ${this.maxMembers} 人`
				});
				return;
			}

			if (this.memberList.length >= this.maxMembers - 1) {
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
			this.age = '';
			this.phoneNumber = '';
			this.idCard = '';
			this.reservationNameError = '';
			this.ageError = '';
			this.phoneNumberError = '';
			this.idCardError = '';
			this.idTypeRadio = '1';
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
					return /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(value);
				case 'passport':
					return /^(?![0-9]+$)(?![A-Za-z]+$)[0-9A-Za-z]{1,16}$/.test(value);
				case 'hkmo':
					return /^H[0-9]{8}$/.test(value);
				case 'taiwan':
					return /^[0-9]{8,10}$/.test(value);
				case 'military':
					return /^军\d+$/.test(value);
				default:
					return false;
			}
		},
		getCertificateLabel(type) {
			return certificateTypeSet.find((item) => item.value === type)?.label || '证件';
		},
		getMemberCertificateLabel(item) {
			if (item.documentType && certificateTypeSet.some((option) => option.label === item.documentType)) {
				return item.documentType;
			}
			return this.getCertificateLabel(item.documentType);
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

			const nameRegex = /^[a-zA-Z\u4e00-\u9fa5\s]{1,20}$/;
			const phoneRegex = /^1[3-9]\d{9}$/;
			const ageNumber = Number(this.age);

			if (!this.reservationName) {
				this.reservationNameError = '预约者姓名不能为空';
				return;
			}
			if (!nameRegex.test(this.reservationName)) {
				this.reservationNameError = '姓名只能包含中文或英文';
				return;
			}
			if (this.age === '' || this.age === null) {
				this.ageError = '年龄不能为空';
				return;
			}
			if (!/^\d{1,3}$/.test(String(this.age)) || Number.isNaN(ageNumber)) {
				this.ageError = '年龄格式不正确';
				return;
			}
			if (this.memberType === 0 && (ageNumber < this.childAgeMin || ageNumber > this.childAgeMax)) {
				this.ageError = `儿童年龄需在${this.childAgeMin}-${this.childAgeMax}岁之间`;
				return;
			}
			if (this.memberType !== 0 && (ageNumber < this.adultAgeMin || ageNumber > this.adultAgeMax)) {
				this.ageError = `成人年龄需在${this.adultAgeMin}-${this.adultAgeMax}岁之间`;
				return;
			}

			if (!this.phoneNumber && this.memberType !== 0) {
				this.phoneNumberError = '手机号不能为空';
				return;
			}
			if (!phoneRegex.test(this.phoneNumber) && this.memberType !== 0) {
				this.phoneNumberError = '手机号格式错误';
				return;
			}

			const certificateType = this.certificateType;
			const certificateLabel = this.getCertificateLabel(certificateType);
			if (!this.idCard) {
				this.idCardError = `请输入${certificateLabel}号码`;
				return;
			}
			if (!this.validateCertificate(certificateType, this.idCard.trim())) {
				this.idCardError = `${certificateLabel}格式不正确`;
				return;
			}

			this.emitMemberList([
				...this.memberList,
				{
					userName: this.reservationName,
					age: ageNumber,
					userPhone: this.memberType !== 0 ? '' : this.phoneNumber,
					idNumber: this.idCard,
					documentType: certificateLabel
				}
			]);
			this.closeAddMemberPopup();
		},
		deleteMember(index) {
			const nextList = this.memberList.filter((_, itemIndex) => itemIndex !== index);
			this.emitMemberList(nextList);
		}
	}
};
</script>

<style lang="scss" scoped>
.member-title,
.name-title,
.age-title,
.phone-title {
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

	.name-title,
	.age-title,
	.phone-title,
	.idtype-title,
	.id-title {
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

::v-deep .van-radio {
	margin-top: 24rpx;
}
</style>
