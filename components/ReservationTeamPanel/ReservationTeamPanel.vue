<template>
	<view class="team-box" :class="[`theme-${theme}`]">
		<van-field
			label="领队姓名"
			type="text"
			maxlength="8"
			placeholder="请输入领队者姓名"
			:value="localFormData.leaderName"
			:error-message="errors.leaderNameError"
			@input="validateInput('leaderName', $event)"
		/>
		<van-field
			label="手机号码"
			type="tel"
			maxlength="11"
			placeholder="请输入联系手机号码"
			:value="localFormData.phoneNumber"
			:error-message="errors.phoneNumberError"
			@input="updateField('phoneNumber', $event.detail)"
		/>
		<van-field
			label="单位名称"
			type="text"
			maxlength="20"
			placeholder="请输入单位名称"
			:value="localFormData.unitName"
			:error-message="errors.unitNameError"
			@input="validateInput('unitName', $event)"
		/>
		<van-field
			label="参观人数"
			type="digit"
			maxlength="5"
			placeholder="参观人数宜在15-50之间"
			:value="localFormData.visitorsNumber"
			:error-message="errors.visitorsNumberError"
			@input="updateField('visitorsNumber', $event.detail)"
		/>
	</view>
</template>

<script>
export default {
	name: 'ReservationTeamPanel',
	props: {
		theme: {
			type: String,
			default: 'default'
		},
		formData: {
			type: Object,
			default: () => ({
				leaderName: '',
				phoneNumber: '',
				unitName: '',
				visitorsNumber: ''
			})
		},
		errors: {
			type: Object,
			default: () => ({
				leaderNameError: '',
				phoneNumberError: '',
				unitNameError: '',
				visitorsNumberError: ''
			})
		}
	},
	data() {
		return {
			localFormData: {
				leaderName: '',
				phoneNumber: '',
				unitName: '',
				visitorsNumber: ''
			}
		};
	},
	watch: {
		formData: {
			immediate: true,
			deep: true,
			handler(val) {
				this.localFormData = {
					leaderName: val && val.leaderName ? val.leaderName : '',
					phoneNumber: val && val.phoneNumber ? val.phoneNumber : '',
					unitName: val && val.unitName ? val.unitName : '',
					visitorsNumber: val && val.visitorsNumber ? val.visitorsNumber : ''
				};
			}
		}
	},
	methods: {
		emitClearError(field) {
			this.$emit('clear-error', `${field}Error`);
		},
		updateField(field, value) {
			this.localFormData = {
				...this.localFormData,
				[field]: value
			};
			this.$emit('change', { field, value });
			if (String(value || '').trim()) {
				this.emitClearError(field);
			}
		},
		validateInput(field, event) {
			const value = String(event.detail || '');
			const nextValue = String(value || '').replace(/[^a-zA-Z\u4e00-\u9fa5\s]/g, '');

			if (nextValue !== value) {
				uni.showToast({
					title: '只能输入英文或中文，不允许特殊符号或数字',
					icon: 'none',
					duration: 3000
				});
			}

			this.updateField(field, nextValue);
		}
	}
};
</script>

<style lang="scss" scoped>
.team-box {
	overflow: hidden;
	border-radius: 24rpx;
	box-sizing: border-box;
	background-color: #fff;
	padding: 30rpx;
}

.theme-default {
	width: 94%;
	margin: 40rpx auto;
}

.theme-activity {
	width: 100%;
	margin: 40rpx 0;
}
</style>
