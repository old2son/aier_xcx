<template>
	<view class="online-ask-content">
		<view class="online-ask-wrap layout-center-92">
			<view class="introduce-1" :style="{ color: askInfo.spanColor }">{{ askInfo.introduce1 }}</view>
			<view class="introduce-2" :style="{ color: askInfo.spanColor }">{{ askInfo.introduce2 }}</view>
			<view class="qr-code-image" @click="previewQrCode">
				<image :src="askInfo.qrCode" mode="widthFix" />
			</view>
		</view>
	</view>
</template>

<script>
export default {
	name: 'OnlineAsk',
	props: {
		askInfo: {
			type: Object,
			required: true,
			default: () => ({
				introduce1: '',
				introduce2: '',
				qrCode: '',
				spanColor: '#000' // 添加默认颜色
			})
		}
	},
	methods: {
		previewQrCode() {
			wx.previewImage({
				urls: [this.askInfo.qrCode]
			})
		}
	}
};
</script>

<style lang="scss">
.online-ask-content {
	width: 100%;
	box-sizing: border-box;
	padding: 0 4%; /* 相当于原92%布局 */
}

.online-ask-wrap {
	margin-top: 60rpx; /* 0.8rem → 60rpx */
	background: #fff;
	border-radius: 24rpx; /* 0.32rem → 24rpx */
	box-sizing: border-box;
	padding: 56rpx 0; /* 0.746666rem → 56rpx */
}

.introduce-1,
.introduce-2 {
	text-align: center;
	font-weight: 550;
	font-size: 32rpx; /* 0.426666rem → 32rpx */
	line-height: 1.8;
	/* 微信小程序可能需要添加以下属性 */
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.qr-code-image {
	width: 60%;
	margin: 48rpx auto 0 auto; /* 0.64rem → 48rpx */
	image {
		width: 100%;
		display: block;
	}
}
</style>
