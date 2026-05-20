<template>
	<view class="credentials">
		<CustomNavInner title="入场凭证" />

		<view class="details-main" :style="{ top: menuInfo.menuHeight + menuInfo.menuHeightFromTop + 20 + 'px' }">
			<view class="details-content">
				<view class="details-tl">活动预约成功</view>
				<view class="qrcode">
					<l-qrcode v-if="!!qrcodeData" :value="`https://www.example.com?data=${qrcodeData}`" />
				</view>
				<view class="col">
					<text>活动名称：</text>
					<text>活动名称</text>
				</view>
				<view class="col">
					<text>活动日期：</text>
					<text>{{ selectedReservation.dateTime }}</text>
				</view>
				<view class="col">
					<text>活动时段：</text>
					<text>{{ selectedReservation.timeSlot }}</text>
				</view>
				<view class="col">
					<text>活动类型：</text>
					<text>活动类型</text>
				</view>
				<view class="col">
					<text>预约人：</text>
					<text>{{ getMember(selectedReservation).userName }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { mapState } from 'vuex';

export default {
	data() {
		return {
			qrcodeData: '',
		};
	},
	computed: {
		...mapState('moduleLayout', ['menuInfo']),
		selectedReservation() {
			return this.$store.getters['moduleAppointment/selectedAppointment'];
		}
	},
	methods: {
		getMember(item) {
			return item.members?.find((v) => v.idNumber) || item.members?.[0] || {};
		},
		saoma() {
			uni.scanCode({
			  success(res) {
			    console.log(res.result)
			  }
			})
		}
	},
	mounted() {
		this.qrcodeData = JSON.stringify(this.selectedReservation);
	}
};
</script>
<style lang="scss" scoped>
.credentials {
	width: 100%;
	height: 100%;
	padding-bottom: 82.5px;
	overflow-y: auto;
	box-sizing: border-box;
}


.qrcode {
	width: 100%;
	display: flex;
	justify-content: center;
	margin-bottom: 30rpx;
}

.details-tl {
	color: #333333;
	font-size: 36rpx;
	font-weight: 550;
	margin-bottom: 30rpx;
}

.details-main {
	position: absolute;
	width: 100%;
	padding: 18px 20px;
	box-sizing: border-box;
}

.details-content {
	padding: 18px 20px;
	margin-bottom: 20px;
	box-sizing: border-box;
	border-radius: 12px;
	box-shadow: 0 0 10rpx #d8d8d8;
	background-color: #fff;
}

.col {
	display: flex;
	gap: 0 20rpx;
	margin-bottom: 30rpx;
	color: #828282;
	font-size: 28rpx;
}
</style>
