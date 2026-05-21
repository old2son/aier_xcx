<template>
	<view class="credentials">
		<CustomNavInner title="入场凭证" />

		<view class="details-main" :style="{ top: menuInfo.menuHeight + menuInfo.menuHeightFromTop + 20 + 'px' }">
			<view class="details-content" :class="cardClass">
				<view class="details-tl">活动预约成功</view>

				<view class="qrcode-box">
					<view class="qrcode">
						<l-qrcode v-if="!!qrcodeData" :value="`https://www.example.com?data=${qrcodeData}`" />
					</view>
				</view>
				<view class="row" v-if="selectedReservation.activityName">
					<text class="row-title">活动名称：</text>
					<text class="row-cont">{{ selectedReservation.activityName }}</text>
				</view>
				<view class="row">
					<text class="row-title">活动日期：</text>
					<text class="row-cont">{{ selectedReservation.dateTime }}</text>
				</view>
				<view class="row">
					<text class="row-title">活动时段：</text>
					<text class="row-cont">{{ selectedReservation.timeSlot }}</text>
				</view>
				<view class="row">
					<text class="row-title">活动类型：</text>
					<text class="row-cont">{{ reservationType }}</text>
				</view>
				<view class="row">
					<text class="row-title">预约人：</text>
					<text class="row-cont">{{
						!selectedReservation.members.length
							? selectedReservation.name
							: getMember(selectedReservation).userName
					}}</text>
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
			qrcodeData: ''
		};
	},
	computed: {
		...mapState('moduleLayout', ['menuInfo']),
		selectedReservation() {
			return this.$store.getters['moduleAppointment/selectedAppointment'];
		},
		reservationType() {
			const item = this.selectedReservation || {};

			const isActivity = Number(item.activityId) !== 0;

			const isPersonal = Array.isArray(item.members) && item.members.length > 0;

			if (isActivity && isPersonal) {
				return '活动预约（个人）';
			}

			if (isActivity && !isPersonal) {
				return '活动预约（团队）';
			}

			if (!isActivity && isPersonal) {
				return '个人预约';
			}

			return '团队预约';
		},
		cardClass() {
			const type = this.reservationType;

			if (type.includes('活动')) {
				return 'activity-card';
			}

			if (type.includes('团队')) {
				return 'team-card';
			}

			return 'personal-card';
		}
	},
	methods: {
		getMember(item) {
			return item.members?.find((v) => v.idNumber) || item.members?.[0] || {};
		},
		saoma() {
			uni.scanCode({
				success(res) {
					console.log(res.result);
				}
			});
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

.qrcode-box {
	display: flex;
	justify-content: center;
	
	.qrcode {
		display: inline-flex;
		padding: 16rpx;
		margin: 0 auto 30rpx;
		border-radius: 24rpx;
		background-color: #fff;
	}
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
	border-radius: 24rpx;
	box-shadow: 0 0 20rpx rgba(0, 0, 0, 0.08);
	background-color: #fff;
	position: relative;
	overflow: hidden;
}

.personal-card {
	background: linear-gradient(to bottom, #fed3d4 0%, #ffffff 60%);

	.details-tl {
		color: #ff5959;
	}

	.row-cont {
		color: #ff5959;
	}
}

.team-card {
	background: linear-gradient(to bottom, #e7f2fe 0%, #ffffff 35%);

	.details-tl {
		color: #60a2fe;
	}

	.row-cont {
		color: #60a2fe;
	}
}

.activity-card {
	background: linear-gradient(to bottom, #fceabf 0%, #ffffff 35%);

	.details-tl {
		color: #ff9400;
	}

	.row-cont {
		color: #ff9400;
	}
}

.row {
	display: flex;
	gap: 0 20rpx;
	margin-bottom: 30rpx;
	color: #828282;
	font-size: 28rpx;
}

.row-title {
	color: #333333;
}
</style>
