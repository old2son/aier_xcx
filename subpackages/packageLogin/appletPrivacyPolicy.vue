<template>
	<view class="applet-privacy-policy-container">
		<image :src="appletPrivacyPolicyImage" mode="widthFix"></image>
	</view>
</template>


<script>
	import loginData from '@/data/login.json'
	console.log('loginData', loginData.appletPrivacyPolicyImage)
	export default {
		data() {
			return {
				appletPrivacyPolicyImage: loginData.appletPrivacyPolicyImage,
			}
		}
	}
</script>

<style lang="scss" scoped>
	.applet-privacy-policy-container {
		width: 100%;

		image {
			width: 100%;
		}
	}
</style>