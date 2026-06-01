<template>
	<view class="team-box" :class="[`theme-${theme}`]">
		<van-field
			label="领队姓名"
			type="text"
			maxlength="8"
			placeholder="请输入领队者姓名"
			:value="formData.leaderName"
			:error-message="errors.leaderNameError"
			@input="validateInput('leaderName', $event)"
		/>
		<van-field
			label="手机号码"
			type="tel"
			maxlength="11"
			placeholder="请输入联系手机号码"
			:value="formData.phoneNumber"
			:error-message="errors.phoneNumberError"
			@input="updateField('phoneNumber', $event.detail)"
		/>
		<van-field
			label="单位名称"
			type="text"
			maxlength="20"
			placeholder="请输入单位名称"
			:value="formData.unitName"
			:error-message="errors.unitNameError"
			@input="validateInput('unitName', $event)"
		/>
		<van-field
			label="参观人数"
			type="digit"
			maxlength="5"
			placeholder="参观人数宜在15-50之间"
			:value="formData.visitorsNumber"
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
	methods: {
		updateField(field, value) {
			this.$emit('change', { field, value });
		},
		validateInput(field, event) {
			const value = event.detail;
			const allowedRegex = /^[a-zA-Z\u4e00-\u9fa5\s]*$/;
			if (!allowedRegex.test(value)) {
				this.updateField(field, value.replace(/[^a-zA-Z\u4e00-\u9fa5\s]/g, ''));
				uni.showToast({
					title: '只能输入英文或中文，不允许特殊符号或数字',
					icon: 'none',
					duration: 3000
				});
				return;
			}
			this.updateField(field, value);
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
